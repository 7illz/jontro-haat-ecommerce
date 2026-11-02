const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const { jwtSecret } = require('../config/env');

const protect = async (req, res, next) => {
  let token;

  // Check if the request has an Authorization header with a Bearer token
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    try {
      // Get token from header
      token = req.headers.authorization.slice(7).trim();

      if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token', code: 'TOKEN_MISSING' });
      }

      // Signing and verification must use the same centralized configuration.
      const decoded = jwt.verify(token, jwtSecret);

      // Get user from the token payload (excluding the password)
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized, user no longer exists', code: 'USER_NOT_FOUND' });
      }

      return next(); // Move on to the next piece of middleware or controller
    } catch (error) {
      const expired = error?.name === 'TokenExpiredError';
      return res.status(401).json({
        message: expired ? 'Your session expired. Please sign in again.' : 'Not authorized, token failed',
        code: expired ? 'TOKEN_EXPIRED' : 'TOKEN_INVALID',
      });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token', code: 'TOKEN_MISSING' });
  }
};

const protectOwner = (req, res, next) => {
  if (req.user && req.user.role === 'owner') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as an owner' });
  }
};

module.exports = { protect, protectOwner };
