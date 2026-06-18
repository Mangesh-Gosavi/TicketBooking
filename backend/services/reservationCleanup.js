import mongoose from 'mongoose';
import Reservation from '../models/Reservation.js';
import Seat, { SEAT_STATUS } from '../models/Seat.js';

const CLEANUP_INTERVAL_MS = 60 * 1000; // run every 60 seconds

/**
 * Release the seats held by a list of expired reservations and delete those
 * reservations — atomically, one reservation at a time.
 */
const releaseExpiredReservations = async () => {
  const now = new Date();
  const expired = await Reservation.find({ expiresAt: { $lte: now } })
    .select('_id eventId seatNumbers')
    .lean();

  let released = 0;

  for (const reservation of expired) {
    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
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
      });
      released += 1;
    } catch (err) {
      console.error(`Cleanup: failed to release reservation ${reservation._id}: ${err.message}`);
    } finally {
      await session.endSession();
    }
  }

  return released;
};

/**
 * Self-heal orphaned seats: seats still flagged `reserved` whose reservation no
 * longer exists (e.g. a legacy TTL index deleted the reservation in an older
 * deployment). These can never be released by the loop above because there is no
 * reservation document left, so we detect and free them directly.
 */
const releaseOrphanedSeats = async () => {
  const referencedIds = await Seat.find({
    status: SEAT_STATUS.RESERVED,
    reservationId: { $ne: null },
  }).distinct('reservationId');

  if (referencedIds.length === 0) return 0;

  const existing = await Reservation.find({ _id: { $in: referencedIds } }).distinct('_id');
  const existingSet = new Set(existing.map((id) => id.toString()));

  const orphanIds = referencedIds.filter((id) => !existingSet.has(id.toString()));
  if (orphanIds.length === 0) return 0;

  const result = await Seat.updateMany(
    { status: SEAT_STATUS.RESERVED, reservationId: { $in: orphanIds } },
    { $set: { status: SEAT_STATUS.AVAILABLE, reservationId: null } }
  );

  return result.modifiedCount;
};

/**
 * Run a single cleanup pass. Exported so it can also be triggered manually
 * (e.g. from a test or an admin route).
 */
export const runReservationCleanup = async () => {
  try {
    const releasedFromExpired = await releaseExpiredReservations();
    const releasedFromOrphans = await releaseOrphanedSeats();
    if (releasedFromExpired || releasedFromOrphans) {
      console.log(
        `🧹 Reservation cleanup: ${releasedFromExpired} expired reservation(s) released, ` +
          `${releasedFromOrphans} orphaned seat(s) freed.`
      );
    }
  } catch (err) {
    console.error(`Reservation cleanup pass failed: ${err.message}`);
  }
};

/**
 * Start the periodic cleanup sweeper. Runs once immediately, then on an
 * interval. Returns the interval handle so the caller can stop it if needed.
 */
export const startReservationCleanup = () => {
  runReservationCleanup(); // run once at startup
  const handle = setInterval(runReservationCleanup, CLEANUP_INTERVAL_MS);
  handle.unref?.(); // don't keep the process alive solely for this timer
  console.log(`🧹 Reservation cleanup sweeper started (every ${CLEANUP_INTERVAL_MS / 1000}s)`);
  return handle;
};
