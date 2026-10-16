const mongoose = require('mongoose');
const { mongoUri } = require('../config/env');

beforeAll(async () => {
  await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
  if (!/(^|[_-])test($|[_-])/i.test(mongoose.connection.name)) {
    throw new Error(`Refusing to run tests against non-test database: ${mongoose.connection.name}`);
  }
});

afterAll(async () => mongoose.disconnect());
