import { apiRequest } from './api.js';

export const getEventsRequest = () => apiRequest('/events');

export const getEventByIdRequest = (id) => apiRequest(`/events/${id}`);

export const createEventRequest = (payload) =>
  apiRequest('/events', { method: 'POST', auth: true, body: payload });
