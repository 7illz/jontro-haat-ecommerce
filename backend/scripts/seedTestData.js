const mongoose = require('mongoose');
const { mongoUri } = require('../config/env');
const User = require('../models/userModel');
const Product = require('../models/productModel');
const Coupon = require('../models/couponModel');
const Order = require('../models/orderModel');
const Chat = require('../models/chatModel');

const credentials = {
  userEmail: process.env.TEST_USER_EMAIL || 'test@example.com',
  userPassword: process.env.TEST_USER_PASSWORD || 'TestPass123!',
  adminEmail: process.env.TEST_ADMIN_EMAIL || 'admin@example.com',
  adminPassword: process.env.TEST_ADMIN_PASSWORD || 'AdminPass123!',
};

const assertSafeTarget = () => {
  if (process.env.NODE_ENV !== 'test') throw new Error('Test fixtures require NODE_ENV=test.');
  const databaseName = mongoose.connection.name;
  if (!/(^|[_-])test($|[_-])/i.test(databaseName)) {
    throw new Error(`Refusing to seed non-test database: ${databaseName}`);
  }
};

const upsertUser = async ({ email, password, name, role }) => {
  let user = await User.findOne({ email });
  if (!user) user = new User({ email, password, name, role });
  else Object.assign(user, { password, name, role });
  await user.save();
  return user;
};

const seedTestData = async () => {
  await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
  assertSafeTarget();
  await Promise.all([Order.deleteMany({}), Product.deleteMany({}), Coupon.deleteMany({}), Chat.deleteMany({}), User.deleteMany({})]);

  const [user, owner] = await Promise.all([
    upsertUser({ email: credentials.userEmail, password: credentials.userPassword, name: 'Test User', role: 'user' }),
    upsertUser({ email: credentials.adminEmail, password: credentials.adminPassword, name: 'Test Owner', role: 'owner' }),
  ]);
  await Product.create([
    { user: owner._id, name: 'Fixture Laptop', image: 'https://example.com/laptop.jpg', description: 'Deterministic test laptop', brand: 'JontroHaat', category: 'Computers', price: 1000, countInStock: 10 },
    { user: owner._id, name: 'Fixture Headphones', image: 'https://example.com/headphones.jpg', description: 'Deterministic test headphones', brand: 'JontroHaat', category: 'Audio', price: 250, countInStock: 2 },
  ]);
  await Coupon.create([
    { code: 'SAVE10', discountPercentage: 10, expiryDate: new Date('2099-12-31T00:00:00Z'), isActive: true },
    { code: 'EXPIRED20', discountPercentage: 20, expiryDate: new Date('2020-01-01T00:00:00Z'), isActive: true },
    { code: 'INACTIVE15', discountPercentage: 15, expiryDate: new Date('2099-12-31T00:00:00Z'), isActive: false },
  ]);
  return { user, owner };
};

if (require.main === module) {
  seedTestData()
    .then(() => console.log('Deterministic test fixtures seeded.'))
    .catch((error) => { console.error(error.message); process.exitCode = 1; })
    .finally(() => mongoose.disconnect());
}

module.exports = { seedTestData, credentials, assertSafeTarget };
