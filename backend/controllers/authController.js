const asyncHandler = require('../middleware/asyncHandler');
const authService = require('../services/authService');

const registerUser = asyncHandler(async (req, res) => {
  res.status(201).json(await authService.register(req.body));
});

const loginUser = asyncHandler(async (req, res) => {
  res.json(await authService.login(req.body));
});

const registerOwner = asyncHandler(async (req, res) => {
  res.status(201).json(await authService.register({ ...req.body, role: 'owner' }));
});

const googleLogin = asyncHandler(async (req, res) => {
  res.json(await authService.loginWithGoogle(req.body.accessToken));
});

module.exports = { registerUser, loginUser, registerOwner, googleLogin };
