import express from 'express';
import cors from 'cors';

import authRoutes from './routes/authRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import reservationRoutes from './routes/reservationRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

const app = express();

// --- Global middleware ---
app.use(
  cors({
    // Use the configured client origin when set. Fall back to reflecting the
    // request origin (`true`) rather than '*', because '*' is invalid when
    // combined with credentials.
    origin: process.env.CLIENT_URL || true,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Health check ---
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'API is running' });
});

// --- Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
// Reservation routes define their own full sub-paths (/reserve, /reservations/:id).
app.use('/api', reservationRoutes);
app.use('/api/bookings', bookingRoutes);

// --- Error handling (must be last) ---
app.use(notFound);
app.use(errorHandler);

export default app;
