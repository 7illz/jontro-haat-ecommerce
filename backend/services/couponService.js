const Coupon = require('../models/couponModel');
const AppError = require('../utils/AppError');

const validateCoupon = async (code) => {
  const coupon = await Coupon.findOne({ code });
  if (!coupon) throw new AppError('Invalid coupon code', 404);
  if (!coupon.isActive) throw new AppError('This coupon is no longer active', 400);
  if (coupon.expiryDate < new Date()) throw new AppError('This coupon has expired', 400);
  return { code: coupon.code, discountPercentage: coupon.discountPercentage };
};

module.exports = { validateCoupon };
