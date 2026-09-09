const express = require('express');
const router = express.Router();
const { registerUser, loginUser, googleLogin, registerOwner } = require('../controllers/authController');
const { protect, protectOwner } = require('../middleware/authMiddleware');
const { validateAuth, validateGoogleLogin } = require('../middleware/validationMiddleware');

router.post('/register', validateAuth('register'), registerUser);
router.post('/login', validateAuth('login'), loginUser);
router.post('/google', validateGoogleLogin, googleLogin);
router.post('/register-owner', protect, protectOwner, validateAuth('register'), registerOwner);

module.exports = router;
