import express from 'express';
import { body } from 'express-validator';
import { reserveSeats, cancelReservation } from '../controllers/reservationController.js';
import verifyToken from '../middleware/authMiddleware.js';
import validate from '../middleware/validate.js';

const router = express.Router();

// This router is mounted at '/api' (see app.js), so the full paths below are:
//   POST   /api/reserve
//   DELETE /api/reservations/:reservationId
// Using explicit sub-paths (instead of mounting the same router twice) avoids
// accidental aliases like DELETE /api/reserve/:id or POST /api/reservations.

router.post(
  '/reserve',
  verifyToken,
  [
    body('eventId').notEmpty().withMessage('eventId is required'),
    body('seatNumbers')
      .isArray({ min: 1 })
      .withMessage('seatNumbers must be a non-empty array'),
  ],
  validate,
  reserveSeats
);

// Cancel a reservation and release its seats.
router.delete('/reservations/:reservationId', verifyToken, cancelReservation);

export default router;
