const errorMiddleware = (err, req, res, next) => {
  const statusCode = err.statusCode || (res.statusCode !== 200 ? res.statusCode : 500);
  const isProduction = process.env.NODE_ENV === 'production';

  res.status(statusCode).json({
    status: 'error',
    message: isProduction && statusCode === 500 ? 'Internal server error' : (err.message || 'Internal server error'),
  });
};

module.exports = errorMiddleware;
