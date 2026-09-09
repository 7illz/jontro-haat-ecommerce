const express = require('express');
const router = express.Router();
const { applyCoupon } = require('../controllers/couponController');
const { validateCoupon } = require('../middleware/validationMiddleware');

router.post('/apply', validateCoupon, applyCoupon);

module.exports = router;
