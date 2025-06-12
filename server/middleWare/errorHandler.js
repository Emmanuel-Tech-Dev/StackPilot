const handleErrorResponse = (res, statusCode, message, status, errMessage) => {
  return res.status(statusCode).json({ message, status, errMessage });
};

// Middleware for handling errors
const errorHandler = (err, req, res, next) => {
  console.error(err.stack); // Log error details to the console

  // Default to 500 if no specific status code is provided
  const status = "ok" || "error";
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  return handleErrorResponse(res, statusCode, status, message);
};

module.exports = { handleErrorResponse, errorHandler };
