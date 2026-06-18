import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';

/**
 * verifyToken middleware.
 * Expects an `Authorization: Bearer <token>` header. Verifies the JWT,
 * loads the user, and attaches it to `req.user`.
 */
const verifyToken = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization || '';

  if (!authHeader.startsWith('Bearer ')) {
    throw new ApiError(401, 'Not authorized: missing or malformed token');
  }

  const token = authHeader.split(' ')[1];

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    throw new ApiError(401, 'Not authorized: invalid or expired token');
  }

  const user = await User.findById(decoded.id).select('-password');
  if (!user) {
    throw new ApiError(401, 'Not authorized: user no longer exists');
  }

  req.user = user;
  next();
});

/**
 * requireAdmin middleware.
 * Must run after verifyToken. Rejects any user whose role is not 'admin'.
 */
export const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    throw new ApiError(403, 'Admin access required');
  }
  next();
};

export default verifyToken;
