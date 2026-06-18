import { validationResult } from 'express-validator';
import ApiError from '../utils/ApiError.js';

/**
 * Collects express-validator results and throws a 400 if any check failed.
 * Place after the validation chain on a route.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const message = errors
      .array()
      .map((e) => e.msg)
      .join(', ');
    throw new ApiError(400, message);
  }
  next();
};

export default validate;
