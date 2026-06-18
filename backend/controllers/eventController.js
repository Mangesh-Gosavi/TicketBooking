import Event from '../models/Event.js';
import Seat from '../models/Seat.js';
import { createEventWithSeats } from '../services/eventService.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';

/**
 * @desc    Get all events
 * @route   GET /api/events
 * @access  Public
 */
export const getEvents = asyncHandler(async (req, res) => {
  const events = await Event.find().sort({ dateTime: 1 });

  res.status(200).json({
    success: true,
    count: events.length,
    events,
  });
});

/**
 * @desc    Get a single event with its seat information
 * @route   GET /api/events/:id
 * @access  Public
 */
export const getEventById = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) {
    throw new ApiError(404, 'Event not found');
  }

  // Sort seats by row letter then numeric part so the grid renders A1..A10, B1..
  const seats = await Seat.find({ eventId: event._id }).lean();
  seats.sort((a, b) => {
    const rowA = a.seatNumber[0];
    const rowB = b.seatNumber[0];
    if (rowA !== rowB) return rowA.localeCompare(rowB);
    return Number(a.seatNumber.slice(1)) - Number(b.seatNumber.slice(1));
  });

  res.status(200).json({
    success: true,
    event,
    seats,
  });
});

/**
 * @desc    Create an event; seats are auto-generated from totalSeats
 * @route   POST /api/events
 * @access  Private
 */
export const createEvent = asyncHandler(async (req, res) => {
  const { name, dateTime, venue, totalSeats } = req.body;

  const { event, seatCount } = await createEventWithSeats({
    name,
    dateTime,
    venue,
    totalSeats,
  });

  res.status(201).json({
    success: true,
    message: `Event created with ${seatCount} seats generated`,
    event,
  });
});
