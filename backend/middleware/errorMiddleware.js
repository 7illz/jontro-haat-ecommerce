const notFound = (req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
};

const errorHandler = (error, req, res, next) => {
  if (res.headersSent) return next(error);

  let statusCode = error.statusCode || 500;
  let message = error.message || 'Internal server error';
  let details = error.details;

  if (error.name === 'MulterError' || /images are allowed/i.test(message)) statusCode = 400;
  if (error.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed';
    details = Object.values(error.errors).map((item) => item.message);
  }
  if (error.code === 11000) {
    statusCode = 409;
    message = 'A record with that value already exists';
  }

  if (statusCode >= 500) {
    console.error(error);
    message = 'Internal server error';
  }

  return res.status(statusCode).json({
    message,
    ...(details ? { errors: details } : {}),
  });
};

module.exports = { notFound, errorHandler };
