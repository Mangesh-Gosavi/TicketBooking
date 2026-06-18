import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import connectDB from './config/db.js';
import { startReservationCleanup } from './services/reservationCleanup.js';

const PORT = process.env.PORT || 5000;

const start = async () => {
  await connectDB();

  // Periodically release seats from expired reservations (replaces the TTL index).
  startReservationCleanup();

  const server = app.listen(PORT, () => {
    console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });

  // Graceful shutdown on unhandled rejections.
  process.on('unhandledRejection', (err) => {
    console.error(`Unhandled Rejection: ${err.message}`);
    server.close(() => process.exit(1));
  });
};

start();
