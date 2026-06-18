import { apiRequest } from './api.js';

export const registerRequest = (payload) =>
  apiRequest('/auth/register', { method: 'POST', body: payload });

export const loginRequest = (payload) =>
  apiRequest('/auth/login', { method: 'POST', body: payload });

export const getMeRequest = () => apiRequest('/auth/me', { auth: true });
