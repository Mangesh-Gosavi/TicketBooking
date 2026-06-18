import express from 'express';
import { body } from 'express-validator';
import { createBooking, getMyBookings } from '../controllers/bookingController.js';
import verifyToken from '../middleware/authMiddleware.js';
import validate from '../middleware/validate.js';

const router = express.Router();

router.get('/', verifyToken, getMyBookings);

router.post(
  '/',
  verifyToken,
  [body('reservationId').notEmpty().withMessage('reservationId is required')],
  validate,
  createBooking
);

export default router;
