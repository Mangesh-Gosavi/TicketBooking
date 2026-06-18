import mongoose from 'mongoose';
import Reservation from '../models/Reservation.js';
import Seat from '../models/Seat.js';
import { SEAT_STATUS } from '../models/Seat.js';
import Booking from '../models/Booking.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';

/**
 * @desc    Confirm a reservation into a booking
 * @route   POST /api/bookings
 * @access  Private
 *
 * Steps (inside a transaction):
 *   1. Validate the reservation exists and belongs to the user.
 *   2. Validate it has not expired (current time < expiresAt).
 *   3. Mark the held seats as booked.
 *   4. Create a persistent Booking record for the user.
 *   5. Delete the reservation record.
 */
export const createBooking = asyncHandler(async (req, res) => {
  const { reservationId } = req.body;
  const userId = req.user._id;

  if (!mongoose.Types.ObjectId.isValid(reservationId)) {
    throw new ApiError(400, 'Invalid reservation id');
  }

  const session = await mongoose.startSession();

  try {
    let booking;

    await session.withTransaction(async () => {
      const reservation = await Reservation.findById(reservationId).session(session);

      if (!reservation) {
        // TTL may have already deleted it, or it was never valid.
        throw new ApiError(
          410,
          'Reservation not found or already expired. Please reserve seats again.'
        );
      }

      if (reservation.userId.toString() !== userId.toString()) {
        throw new ApiError(403, 'This reservation does not belong to you');
      }

      // Explicit expiry check — TTL deletion is eventual, so never trust it alone.
      if (reservation.expiresAt.getTime() <= Date.now()) {
        // Release the seats we were holding before bailing out.
        await Seat.updateMany(
          { eventId: reservation.eventId, seatNumber: { $in: reservation.seatNumbers } },
          { $set: { status: SEAT_STATUS.AVAILABLE, reservationId: null } },
          { session }
        );
        await Reservation.deleteOne({ _id: reservation._id }).session(session);

        throw new ApiError(410, 'Reservation has expired. Please reserve seats again.');
      }

      // Confirm: reserved -> booked for exactly the held seats.
      const result = await Seat.updateMany(
        {
          eventId: reservation.eventId,
          seatNumber: { $in: reservation.seatNumbers },
          status: SEAT_STATUS.RESERVED,
          reservationId: reservation._id,
        },
        { $set: { status: SEAT_STATUS.BOOKED, reservationId: null } },
        { session }
      );

      if (result.modifiedCount !== reservation.seatNumbers.length) {
        throw new ApiError(
          409,
          'Seat state changed unexpectedly. Booking could not be completed.'
        );
      }

      // Persist a per-user booking record before removing the reservation.
      const created = await Booking.create(
        [
          {
            userId,
            eventId: reservation.eventId,
            seatNumbers: reservation.seatNumbers,
            bookedAt: new Date(),
          },
        ],
        { session }
      );
      booking = created[0];

      await Reservation.deleteOne({ _id: reservation._id }).session(session);
    });

    res.status(201).json({
      success: true,
      message: 'Booking confirmed successfully',
      booking: {
        id: booking._id,
        eventId: booking.eventId,
        seatNumbers: booking.seatNumbers,
        bookedAt: booking.bookedAt,
      },
    });
  } finally {
    await session.endSession();
  }
});

/**
 * @desc    Get the logged-in user's bookings (most recent first)
 * @route   GET /api/bookings
 * @access  Private
 */
export const getMyBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ userId: req.user._id })
    .sort({ bookedAt: -1 })
    .populate('eventId', 'name venue dateTime')
    .lean();

  res.status(200).json({
    success: true,
    count: bookings.length,
    bookings,
  });
});
