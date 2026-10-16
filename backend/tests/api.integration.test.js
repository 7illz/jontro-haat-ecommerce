const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../app');
const { jwtSecret, pricing } = require('../config/env');
const { seedTestData, credentials } = require('../scripts/seedTestData');
const User = require('../models/userModel');
const Product = require('../models/productModel');
const Order = require('../models/orderModel');

const shippingAddress = { address: '12 Test Road', city: 'Dhaka', postalCode: '1200', country: 'Bangladesh' };
const login = async (email, password) => {
  const response = await request(app).post('/api/auth/login').send({ email, password });
  expect(response.status).toBe(200);
  return response.body;
};
const orderPayload = (product, overrides = {}) => ({
  orderItems: [{ product: product._id.toString(), qty: 1 }],
  shippingAddress,
  paymentMethod: 'Cash on Delivery',
  ...overrides,
});

beforeEach(async () => seedTestData());

describe('authentication and authorization', () => {
  test('registers a normalized user and rejects duplicate email', async () => {
    const created = await request(app).post('/api/auth/register').send({ name: 'New User', email: '  NEW@Example.COM ', password: 'StrongPass123!', role: 'owner' });
    expect(created.status).toBe(201);
    expect(created.body.email).toBe('new@example.com');
    expect(created.body.role).toBe('user');
    const duplicate = await request(app).post('/api/auth/register').send({ name: 'Other User', email: 'new@example.com', password: 'StrongPass123!' });
    expect(duplicate.status).toBe(400);
  });

  test.each([
    [{ name: 'Test', email: 'invalid', password: 'StrongPass123!' }, 'email'],
    [{ name: 'Test', email: 'valid@example.com', password: 'short' }, 'Password'],
  ])('validates registration input', async (body, message) => {
    const response = await request(app).post('/api/auth/register').send(body);
    expect(response.status).toBe(400);
    expect(JSON.stringify(response.body)).toContain(message);
  });

  test('logs in valid credentials and rejects invalid credentials', async () => {
    expect((await login(credentials.userEmail, credentials.userPassword)).role).toBe('user');
    const rejected = await request(app).post('/api/auth/login').send({ email: credentials.userEmail, password: 'WrongPass123!' });
    expect(rejected.status).toBe(401);
  });

  test('rejects missing, invalid, and expired tokens', async () => {
    expect((await request(app).get('/api/orders/myorders')).status).toBe(401);
    expect((await request(app).get('/api/orders/myorders').set('Authorization', 'Bearer invalid')).status).toBe(401);
    const user = await User.findOne({ email: credentials.userEmail });
    const expired = jwt.sign({ id: user._id }, jwtSecret, { expiresIn: -1 });
    expect((await request(app).get('/api/orders/myorders').set('Authorization', `Bearer ${expired}`)).status).toBe(401);
  });

  test('enforces owner-only product, order, and chat routes', async () => {
    const user = await login(credentials.userEmail, credentials.userPassword);
    const owner = await login(credentials.adminEmail, credentials.adminPassword);
    for (const path of ['/api/orders', '/api/chat/sessions']) {
      expect((await request(app).get(path).set('Authorization', `Bearer ${user.token}`)).status).toBe(403);
      expect((await request(app).get(path).set('Authorization', `Bearer ${owner.token}`)).status).toBe(200);
    }
    const data = { name: 'Owner Product', brand: 'JontroHaat', category: 'Test', description: 'Owner only', price: 5, countInStock: 1, image: 'https://example.com/item.jpg' };
    expect((await request(app).post('/api/products').set('Authorization', `Bearer ${user.token}`).send(data)).status).toBe(403);
    expect((await request(app).post('/api/products').set('Authorization', `Bearer ${owner.token}`).send(data)).status).toBe(201);
  });
});

describe('coupons and public pricing', () => {
  test.each([
    ['save10', 200, 10],
    ['EXPIRED20', 400, null],
    ['INACTIVE15', 400, null],
    ['UNKNOWN', 404, null],
  ])('handles coupon %s', async (code, status, discount) => {
    const response = await request(app).post('/api/coupons/apply').send({ code });
    expect(response.status).toBe(status);
    if (discount) expect(response.body.discountPercentage).toBe(discount);
  });

  test('exposes safe environment-backed pricing', async () => {
    const original = { ...pricing };
    Object.assign(pricing, { flatShippingPrice: 17.5, taxRate: 0.125, currencyCode: 'USD', currencySymbol: '$' });
    try {
      const response = await request(app).get('/api/config/pricing');
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ flatShippingPrice: 17.5, taxRate: 0.125, currencyCode: 'USD', currencySymbol: '$' });
    } finally {
      Object.assign(pricing, original);
    }
  });
});

describe('checkout', () => {
  test('uses server prices, applies coupon, and decrements inventory', async () => {
    const auth = await login(credentials.userEmail, credentials.userPassword);
    const product = await Product.findOne({ name: 'Fixture Laptop' });
    const response = await request(app).post('/api/orders').set('Authorization', `Bearer ${auth.token}`).send({
      ...orderPayload(product, { couponCode: 'save10' }),
      itemsPrice: 0.01,
      totalPrice: 0.01,
    });
    expect(response.status).toBe(201);
    expect(response.body.itemsPrice).toBe(1000);
    expect(response.body.discountPrice).toBe(100);
    expect(response.body.taxPrice).toBe(72);
    expect(response.body.shippingPrice).toBe(pricing.flatShippingPrice);
    const expectedTax = Math.round((900 * pricing.taxRate + Number.EPSILON) * 100) / 100;
    expect(response.body.totalPrice).toBe(900 + expectedTax + pricing.flatShippingPrice);
    expect((await Product.findById(product._id)).countInStock).toBe(9);
  });

  test('combines duplicate product quantities', async () => {
    const auth = await login(credentials.userEmail, credentials.userPassword);
    const product = await Product.findOne({ name: 'Fixture Laptop' });
    const response = await request(app).post('/api/orders').set('Authorization', `Bearer ${auth.token}`).send(orderPayload(product, {
      orderItems: [{ product: product._id, qty: 2 }, { product: product._id, qty: 3 }],
    }));
    expect(response.status).toBe(201);
    expect(response.body.orderItems).toHaveLength(1);
    expect(response.body.orderItems[0].qty).toBe(5);
  });

  test('rejects missing products, insufficient stock, and invalid coupons', async () => {
    const auth = await login(credentials.userEmail, credentials.userPassword);
    const product = await Product.findOne({ name: 'Fixture Headphones' });
    const missing = new (require('mongoose').Types.ObjectId)();
    expect((await request(app).post('/api/orders').set('Authorization', `Bearer ${auth.token}`).send(orderPayload({ _id: missing }))).status).toBe(400);
    expect((await request(app).post('/api/orders').set('Authorization', `Bearer ${auth.token}`).send(orderPayload(product, { orderItems: [{ product: product._id, qty: 3 }] }))).status).toBe(409);
    expect((await request(app).post('/api/orders').set('Authorization', `Bearer ${auth.token}`).send(orderPayload(product, { couponCode: 'EXPIRED20' }))).status).toBe(400);
  });

  test('rolls back earlier inventory updates when checkout fails', async () => {
    const auth = await login(credentials.userEmail, credentials.userPassword);
    const laptop = await Product.findOne({ name: 'Fixture Laptop' });
    const createSpy = vi.spyOn(Order, 'create').mockRejectedValueOnce(new Error('simulated persistence failure'));
    const response = await request(app).post('/api/orders').set('Authorization', `Bearer ${auth.token}`).send(orderPayload(laptop));
    createSpy.mockRestore();
    expect(response.status).toBe(500);
    expect((await Product.findById(laptop._id)).countInStock).toBe(10);
    expect(await Order.countDocuments()).toBe(0);
  });

  test('prevents concurrent overselling', async () => {
    const auth = await login(credentials.userEmail, credentials.userPassword);
    const product = await Product.findOne({ name: 'Fixture Headphones' });
    const submit = () => request(app).post('/api/orders').set('Authorization', `Bearer ${auth.token}`).send(orderPayload(product, { orderItems: [{ product: product._id, qty: 2 }] }));
    const responses = await Promise.all([submit(), submit()]);
    expect(responses.map((response) => response.status).sort()).toEqual([201, 409]);
    expect((await Product.findById(product._id)).countInStock).toBe(0);
  });

  test('returns only the authenticated user orders', async () => {
    const user = await login(credentials.userEmail, credentials.userPassword);
    const owner = await login(credentials.adminEmail, credentials.adminPassword);
    const product = await Product.findOne({ name: 'Fixture Laptop' });
    await request(app).post('/api/orders').set('Authorization', `Bearer ${user.token}`).send(orderPayload(product));
    await request(app).post('/api/orders').set('Authorization', `Bearer ${owner.token}`).send(orderPayload(product));
    const response = await request(app).get('/api/orders/myorders').set('Authorization', `Bearer ${user.token}`);
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
  });
});
