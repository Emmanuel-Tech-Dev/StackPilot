const AppError = require("../helpers/appError");

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

const errorHandler = (err, req, res, next) => {
  if (!(err instanceof AppError)) {
    err = new AppError(err.message || "Internal Server Error", 500);
  }

  res.status(err.statusCode).json(err.toJSON());
};

module.exports = {
  errorHandler,
  asyncHandler,
};
