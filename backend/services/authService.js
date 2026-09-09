const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const AppError = require('../utils/AppError');
const { jwtSecret } = require('../config/env');

const generateToken = (id) => jwt.sign({ id }, jwtSecret, { expiresIn: '30d' });
const toAuthResponse = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  token: generateToken(user._id),
});

const ensureEmailAvailable = async (email) => {
  if (await User.exists({ email })) throw new AppError('User already exists', 400);
};

const register = async ({ name, email, password, role = 'user' }) => {
  await ensureEmailAvailable(email);
  return toAuthResponse(await User.create({ name, email, password, role }));
};

const login = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user || !(await user.matchPassword(password))) throw new AppError('Invalid email or password', 401);
  return toAuthResponse(user);
};

const loginWithGoogle = async (accessToken) => {
  const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) throw new AppError('Google token validation failed', 401);

  const profile = await response.json();
  if (!profile.email) throw new AppError('Failed to retrieve email from Google', 400);
  const email = profile.email.toLowerCase();
  let user = await User.findOne({ email });
  if (!user) {
    user = await User.create({
      name: profile.name,
      email,
      password: crypto.randomBytes(16).toString('hex'),
    });
  }
  return toAuthResponse(user);
};

const getSocketUserFromToken = async (token) => {
  if (!token) throw new AppError('Authentication required', 401);
  const decoded = jwt.verify(token, jwtSecret);
  const user = await User.findById(decoded.id).select('_id name email role');
  if (!user) throw new AppError('User no longer exists', 401);
  return user;
};

module.exports = { register, login, loginWithGoogle, getSocketUserFromToken };
