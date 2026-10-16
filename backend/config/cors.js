const { allowedOrigins } = require('./env');

const origin = (requestOrigin, callback) => {
  if (!requestOrigin || allowedOrigins.includes(requestOrigin)) return callback(null, true);
  const error = new Error('Origin not allowed by CORS');
  error.statusCode = 403;
  return callback(error);
};

module.exports = {
  httpCorsOptions: {
    origin,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
  socketCorsOptions: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
  },
};
