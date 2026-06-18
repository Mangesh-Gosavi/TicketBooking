import mongoose from 'mongoose';

export const SEAT_STATUS = Object.freeze({
  AVAILABLE: 'available',
  RESERVED: 'reserved',
  BOOKED: 'booked',
});

const seatSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
      index: true,
    },
    seatNumber: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: Object.values(SEAT_STATUS),
      default: SEAT_STATUS.AVAILABLE,
    },
    // Link a seat to the reservation currently holding it (if any).
    reservationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Reservation',
      default: null,
    },
  },
  { timestamps: true }
);

// A seat number must be unique within a given event.
seatSchema.index({ eventId: 1, seatNumber: 1 }, { unique: true });

const Seat = mongoose.model('Seat', seatSchema);

export default Seat;
