const mongoose = require('mongoose');

const text = (value) => (typeof value === 'string' ? value.trim() : '');
const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const validationError = (res, errors) => res.status(400).json({
  message: 'Validation failed',
  errors,
});

const validateAuth = (mode) => (req, res, next) => {
  const errors = [];
  const email = text(req.body.email).toLowerCase();
  const password = typeof req.body.password === 'string' ? req.body.password : '';

  if (!isEmail(email)) errors.push('A valid email address is required.');
  if (password.length < 8 || password.length > 128) {
    errors.push('Password must be between 8 and 128 characters.');
  }
  if (mode === 'register') {
    const name = text(req.body.name);
    if (name.length < 2 || name.length > 80) errors.push('Name must be between 2 and 80 characters.');
    req.body.name = name;
  }

  if (errors.length) return validationError(res, errors);
  req.body.email = email;
  next();
};

const validateGoogleLogin = (req, res, next) => {
  const accessToken = text(req.body.accessToken);
  if (!accessToken || accessToken.length > 4096) {
    return validationError(res, ['A valid Google access token is required.']);
  }
  req.body.accessToken = accessToken;
  next();
};

const validateObjectId = (param = 'id') => (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params[param])) {
    return validationError(res, [`Invalid ${param}.`]);
  }
  next();
};

const validateProduct = (isUpdate = false) => (req, res, next) => {
  const errors = [];
  const requiredTextFields = ['name', 'brand', 'category', 'description'];

  for (const field of requiredTextFields) {
    if (!isUpdate || req.body[field] !== undefined) {
      const value = text(req.body[field]);
      const max = field === 'description' ? 5000 : 120;
      if (!value || value.length > max) errors.push(`${field} is required and must be at most ${max} characters.`);
      req.body[field] = value;
    }
  }

  for (const field of ['price', 'countInStock']) {
    if (!isUpdate || req.body[field] !== undefined) {
      const value = Number(req.body[field]);
      if (!Number.isFinite(value) || value < 0 || (field === 'countInStock' && !Number.isInteger(value))) {
        errors.push(`${field} must be a non-negative ${field === 'countInStock' ? 'integer' : 'number'}.`);
      }
      req.body[field] = value;
    }
  }

  if (req.body.image !== undefined) {
    const image = text(req.body.image);
    if (image && !/^https?:\/\//i.test(image)) errors.push('Image must be an HTTP(S) URL.');
    if (image.length > 2048) errors.push('Image URL is too long.');
    req.body.image = image;
  }

  if (!isUpdate && !req.file && !req.body.image) errors.push('An image file or image URL is required.');
  if (errors.length) return validationError(res, errors);
  next();
};

const validateReview = (req, res, next) => {
  const rating = Number(req.body.rating);
  const comment = text(req.body.comment);
  const errors = [];
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) errors.push('Rating must be an integer from 1 to 5.');
  if (comment.length < 2 || comment.length > 2000) errors.push('Comment must be between 2 and 2000 characters.');
  if (errors.length) return validationError(res, errors);
  req.body.rating = rating;
  req.body.comment = comment;
  next();
};

const validateOrder = (req, res, next) => {
  const errors = [];
  const items = req.body.orderItems;
  if (!Array.isArray(items) || items.length === 0 || items.length > 100) {
    errors.push('Order must contain between 1 and 100 items.');
  } else {
    for (const item of items) {
      if (!mongoose.isValidObjectId(item?.product)) errors.push('Every order item must contain a valid product ID.');
      if (!Number.isInteger(Number(item?.qty)) || Number(item.qty) < 1 || Number(item.qty) > 100) {
        errors.push('Every order quantity must be an integer from 1 to 100.');
      }
    }
  }

  const address = req.body.shippingAddress || {};
  for (const field of ['address', 'city', 'postalCode', 'country']) {
    const value = text(address[field]);
    if (value.length < 2 || value.length > 200) errors.push(`Shipping ${field} must be between 2 and 200 characters.`);
    address[field] = value;
  }

  const paymentMethod = text(req.body.paymentMethod);
  if (!['Cash on Delivery', 'Online Payment'].includes(paymentMethod)) errors.push('Unsupported payment method.');
  const couponCode = text(req.body.couponCode).toUpperCase();
  if (couponCode.length > 40) errors.push('Coupon code is too long.');

  if (errors.length) return validationError(res, [...new Set(errors)]);
  req.body.orderItems = items.map((item) => ({ product: item.product, qty: Number(item.qty) }));
  req.body.shippingAddress = address;
  req.body.paymentMethod = paymentMethod;
  req.body.couponCode = couponCode || undefined;
  next();
};

const validateCoupon = (req, res, next) => {
  const code = text(req.body.code).toUpperCase();
  if (!code || code.length > 40) return validationError(res, ['A valid coupon code is required.']);
  req.body.code = code;
  next();
};

module.exports = {
  validateAuth,
  validateGoogleLogin,
  validateObjectId,
  validateProduct,
  validateReview,
  validateOrder,
  validateCoupon,
};
