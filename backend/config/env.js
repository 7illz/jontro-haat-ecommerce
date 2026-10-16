const dotenv = require('dotenv');

dotenv.config({ quiet: process.env.NODE_ENV === 'test' });

const numberFromEnv = (name, fallback, minimum = 0) => {
  const value = Number(process.env[name]);
  return Number.isFinite(value) && value >= minimum ? value : fallback;
};

const currencyCode = /^[A-Z]{3}$/.test(process.env.CURRENCY_CODE || '')
  ? process.env.CURRENCY_CODE
  : 'BDT';
const configuredSymbol = process.env.CURRENCY_SYMBOL;
const currencySymbol = configuredSymbol && configuredSymbol.length <= 4 ? configuredSymbol : '৳';
const isTest = process.env.NODE_ENV === 'test';
const mongoUri = (isTest && process.env.MONGO_URI_TEST)
  || process.env.MONGO_URI
  || (isTest
    ? 'mongodb://127.0.0.1:27017/jontro_haat_test?replicaSet=rs0'
    : 'mongodb://localhost:27017/ecommerce');
const databaseName = mongoUri.match(/\/([^/?]+)(?:\?|$)/)?.[1] || '';
if (isTest && !/(^|[_-])test($|[_-])/i.test(databaseName)) {
  throw new Error(`NODE_ENV=test requires a test-named MongoDB database, received: ${databaseName || 'unknown'}`);
}

const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

module.exports = {
  port: numberFromEnv('PORT', 5000, 1),
  mongoUri,
  jwtSecret: process.env.JWT_SECRET || (process.env.NODE_ENV === 'test' ? 'jontro-haat-local-test-secret-only' : undefined),
  allowedOrigins,
  pricing: {
    flatShippingPrice: numberFromEnv('FLAT_SHIPPING_PRICE', 10),
    taxRate: numberFromEnv('TAX_RATE', 0.08),
    currencyCode,
    currencySymbol,
  },
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
    folder: process.env.CLOUDINARY_FOLDER || 'jontro_haat',
  },
};
