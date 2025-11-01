import { validationResult } from "express-validator";

export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formatted = errors.array().map(err => ({ field: err.path, message: err.msg }));
    return res.status(400).json({ errors: formatted });
  }
  next();
};
