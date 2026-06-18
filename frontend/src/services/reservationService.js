import { apiRequest } from './api.js';

export const reserveSeatsRequest = ({ eventId, seatNumbers }) =>
  apiRequest('/reserve', {
    method: 'POST',
    auth: true,
    body: { eventId, seatNumbers },
  });

export const createBookingRequest = (reservationId) =>
  apiRequest('/bookings', {
    method: 'POST',
    auth: true,
    body: { reservationId },
  });

export const cancelReservationRequest = (reservationId) =>
  apiRequest(`/reservations/${reservationId}`, { method: 'DELETE', auth: true });

export const getMyBookingsRequest = () => apiRequest('/bookings', { auth: true });
