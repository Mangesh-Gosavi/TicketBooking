import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Event name is required'],
      trim: true,
    },
    dateTime: {
      type: Date,
      required: [true, 'Event date/time is required'],
    },
    venue: {
      type: String,
      required: [true, 'Venue is required'],
      trim: true,
    },
    totalSeats: {
      type: Number,
      required: [true, 'Total seats is required'],
      min: [1, 'An event must have at least one seat'],
    },
  },
  { timestamps: true }
);

const Event = mongoose.model('Event', eventSchema);

export default Event;
