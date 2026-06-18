const BASE_URL = 'https://ticketbooking-vms4.onrender.com' || '';

const TOKEN_KEY = 'ett_token';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

/**
 * Thin fetch wrapper that:
 *  - prefixes the API base url
 *  - attaches the JWT Authorization header when available
 *  - parses JSON and throws a normalised Error on non-2xx responses
 */
export const apiRequest = async (path, { method = 'GET', body, auth = false } = {}) => {
  const headers = { 'Content-Type': 'application/json' };

  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(`${BASE_URL}/api${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (networkErr) {
    // fetch only rejects on network failure
    throw new Error('Network error. Please check your connection and try again.');
  }

  let data = null;
  const text = await response.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text };
    }
  }

  if (!response.ok) {
    // If a token-protected request comes back 401, the session is no longer
    // valid (expired/invalid token). Clear it and notify the app so it can log
    // the user out; route guards then redirect to /login. We scope this to
    // `auth` requests so a failed login (also 401) doesn't trigger a logout.
    if (response.status === 401 && auth) {
      clearToken();
      window.dispatchEvent(new Event('auth:unauthorized'));
    }

    const error = new Error(data?.message || `Request failed (${response.status})`);
    error.status = response.status;
    throw error;
  }

  return data;
};
