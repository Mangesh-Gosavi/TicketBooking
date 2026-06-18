import mongoose from 'mongoose';
import Event from '../models/Event.js';
import Seat, { SEAT_STATUS } from '../models/Seat.js';
import { generateSeatNumbers } from '../utils/seatGenerator.js';

/**
 * Create an event and automatically generate its seat documents.
 *
 * Seats are derived from `totalSeats` (no seed files, no static seat data).
 * The event and all seats are written inside a single MongoDB transaction so
 * an event never exists without its seats, and vice versa.
 *
 * @param {{ name: string, dateTime: Date|string, venue: string, totalSeats: number }} data
 * @returns {Promise<{ event: object, seatCount: number }>}
 */
export const createEventWithSeats = async ({ name, dateTime, venue, totalSeats }) => {
  // Compute seat numbers up front so an invalid totalSeats fails before any write.
  const seatNumbers = generateSeatNumbers(totalSeats);

  const session = await mongoose.startSession();
  try {
    let event;

    await session.withTransaction(async () => {
      const created = await Event.create([{ name, dateTime, venue, totalSeats }], { session });
      event = created[0];

      const seatDocs = seatNumbers.map((seatNumber) => ({
        eventId: event._id,
        seatNumber,
        status: SEAT_STATUS.AVAILABLE,
      }));

      await Seat.insertMany(seatDocs, { session });
    });

    return { event, seatCount: seatNumbers.length };
  } finally {
    await session.endSession();
  }
};
