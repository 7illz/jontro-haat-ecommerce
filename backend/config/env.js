const dotenv = require('dotenv');

dotenv.config({ quiet: process.env.NODE_ENV === 'test' });

const numberFromEnv = (name, fallback, minimum = 0) => {
  const value = Number(process.env[name]);
  return Number.isFinite(value) && value >= minimum ? value : fallback;
};

const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

module.exports = {
  port: numberFromEnv('PORT', 5000, 1),
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/ecommerce',
  jwtSecret: process.env.JWT_SECRET,
  allowedOrigins,
  pricing: {
    flatShippingPrice: numberFromEnv('FLAT_SHIPPING_PRICE', 10),
    taxRate: numberFromEnv('TAX_RATE', 0.08),
  },
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
    folder: process.env.CLOUDINARY_FOLDER || 'nexus_store',
  },
};
