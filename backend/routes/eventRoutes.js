import express from 'express';
import { body } from 'express-validator';
import { getEvents, getEventById, createEvent } from '../controllers/eventController.js';
import verifyToken, { requireAdmin } from '../middleware/authMiddleware.js';
import validate from '../middleware/validate.js';

const router = express.Router();

router.get('/', getEvents);
router.get('/:id', getEventById);

router.post(
  '/',
  verifyToken,
  requireAdmin,
  [
    body('name').trim().notEmpty().withMessage('Event name is required'),
    body('dateTime')
      .isISO8601()
      .withMessage('dateTime must be a valid date/time')
      .toDate(),
    body('venue').trim().notEmpty().withMessage('Venue is required'),
    body('totalSeats')
      .isInt({ min: 1, max: 260 })
      .withMessage('totalSeats must be an integer between 1 and 260'),
  ],
  validate,
  createEvent
);

export default router;
