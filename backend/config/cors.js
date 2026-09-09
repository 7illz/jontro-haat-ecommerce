const { allowedOrigins } = require('./env');

const origin = (requestOrigin, callback) => {
  if (!requestOrigin || allowedOrigins.includes(requestOrigin)) return callback(null, true);
  return callback(new Error('Origin not allowed by CORS'));
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
