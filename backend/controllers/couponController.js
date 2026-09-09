const asyncHandler = require('../middleware/asyncHandler');
const couponService = require('../services/couponService');

const applyCoupon = asyncHandler(async (req, res) => {
  res.json(await couponService.validateCoupon(req.body.code));
});

module.exports = { applyCoupon };
