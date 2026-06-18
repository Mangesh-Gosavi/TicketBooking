import mongoose from 'mongoose';

const reservationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
      index: true,
    },
    seatNumbers: {
      type: [String],
      required: true,
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length > 0,
        message: 'A reservation must include at least one seat',
      },
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

/**
 * Expiry is handled by TWO cooperating mechanisms:
 *
 * 1. TTL index (`expireAfterSeconds: 0`): MongoDB automatically deletes a
 *    reservation document once the clock passes `expiresAt`. This satisfies the
 *    "TTL index" requirement and guarantees stale reservation documents never
 *    accumulate — even if the app process is down.
 *
 * 2. Cleanup sweeper (services/reservationCleanup.js): because a TTL index can
 *    ONLY delete the reservation document — it can never flip the linked Seat
 *    documents from `reserved` back to `available` — the sweeper does that part.
 *    It releases seats for expired reservations, and also self-heals any
 *    "orphaned" seats whose reservation was already removed by TTL.
 *
 * Together: TTL guarantees document cleanup; the sweeper guarantees seat release.
 *
 * NOTE: if a plain (non-TTL) `expiresAt_1` index already exists in the database
 * from a previous version, drop it once so Mongoose can recreate it as TTL:
 *   db.reservations.dropIndex("expiresAt_1")
 */
reservationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Reservation = mongoose.model('Reservation', reservationSchema);

export default Reservation;
