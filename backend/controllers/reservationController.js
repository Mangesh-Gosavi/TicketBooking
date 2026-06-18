import mongoose from 'mongoose';
import Reservation from '../models/Reservation.js';
import Seat from '../models/Seat.js';
import Event from '../models/Event.js';
import { SEAT_STATUS } from '../models/Seat.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';

const RESERVATION_TTL_MINUTES = Number(process.env.RESERVATION_TTL_MINUTES) || 10;

/**
 * @desc    Reserve one or more seats for an event
 * @route   POST /api/reserve
 * @access  Private
 *
 * Concurrency safety:
 *   The whole operation runs inside a MongoDB transaction. Each seat is moved
 *   from `available` -> `reserved` with a conditional update that only matches
 *   when the seat is still available. If the matched count is less than the
 *   number of requested seats, another transaction grabbed a seat first, so we
 *   abort and nobody double-books.
 */
export const reserveSeats = asyncHandler(async (req, res) => {
  const { eventId, seatNumbers } = req.body;
  const userId = req.user._id;

  if (!mongoose.Types.ObjectId.isValid(eventId)) {
    throw new ApiError(400, 'Invalid event id');
  }
  if (!Array.isArray(seatNumbers) || seatNumbers.length === 0) {
    throw new ApiError(400, 'seatNumbers must be a non-empty array');
  }

  // De-duplicate requested seats defensively.
  const requestedSeats = [...new Set(seatNumbers)];

  const expiresAt = new Date(Date.now() + RESERVATION_TTL_MINUTES * 60 * 1000);

  const session = await mongoose.startSession();

  try {
    let reservation;

    await session.withTransaction(async () => {
      const event = await Event.findById(eventId).session(session);
      if (!event) {
        throw new ApiError(404, 'Event not found');
      }

      // Atomically flip every requested seat from available -> reserved.
      // updateMany with the available filter ensures we never overwrite a
      // seat that is already reserved or booked.
      const result = await Seat.updateMany(
        {
          eventId,
          seatNumber: { $in: requestedSeats },
          status: SEAT_STATUS.AVAILABLE,
        },
        { $set: { status: SEAT_STATUS.RESERVED } },
        { session }
      );

      if (result.modifiedCount !== requestedSeats.length) {
        // At least one seat was not available — abort the whole transaction.
        throw new ApiError(
          409,
          'One or more selected seats are no longer available. Please refresh and try again.'
        );
      }

      // Create the reservation record inside the same transaction.
      const created = await Reservation.create(
        [
          {
            userId,
            eventId,
            seatNumbers: requestedSeats,
            expiresAt,
          },
        ],
        { session }
      );
      reservation = created[0];

      // Link seats to this reservation so we can release/confirm them later.
      await Seat.updateMany(
        { eventId, seatNumber: { $in: requestedSeats } },
        { $set: { reservationId: reservation._id } },
        { session }
      );
    });

    res.status(201).json({
      success: true,
      reservationId: reservation._id,
      eventId: reservation.eventId,
      seatNumbers: reservation.seatNumbers,
      expiresAt: reservation.expiresAt,
    });
  } finally {
    await session.endSession();
  }
});

/**
 * @desc    Cancel a reservation and release its seats
 * @route   DELETE /api/reservations/:reservationId
 * @access  Private
 *
 * Runs inside a transaction so releasing the seats (reserved -> available) and
 * deleting the reservation happen atomically — seats can never be left stuck.
 */
export const cancelReservation = asyncHandler(async (req, res) => {
  const { reservationId } = req.params;
  const userId = req.user._id;

  if (!mongoose.Types.ObjectId.isValid(reservationId)) {
    throw new ApiError(400, 'Invalid reservation id');
  }

  const session = await mongoose.startSession();

  try {
    let releasedSeatNumbers = [];

    await session.withTransaction(async () => {
      const reservation = await Reservation.findById(reservationId).session(session);

      if (!reservation) {
        // Already gone (e.g. swept after expiry). Nothing to release.
        throw new ApiError(404, 'Reservation not found or already released');
      }

      if (reservation.userId.toString() !== userId.toString()) {
        throw new ApiError(403, 'This reservation does not belong to you');
      }

      // Release only the seats still held by THIS reservation.
      await Seat.updateMany(
        {
          eventId: reservation.eventId,
          seatNumber: { $in: reservation.seatNumbers },
          status: SEAT_STATUS.RESERVED,
          reservationId: reservation._id,
        },
        { $set: { status: SEAT_STATUS.AVAILABLE, reservationId: null } },
        { session }
      );

      await Reservation.deleteOne({ _id: reservation._id }).session(session);
      releasedSeatNumbers = reservation.seatNumbers;
    });

    res.status(200).json({
      success: true,
      message: 'Reservation cancelled and seats released',
      seatNumbers: releasedSeatNumbers,
    });
  } finally {
    await session.endSession();
  }
});
