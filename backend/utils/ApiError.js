/**
 * A small operational error class carrying an HTTP status code.
 * Throwing this from controllers lets the central error middleware respond
 * with the right status and a clean message.
 */
class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export default ApiError;
