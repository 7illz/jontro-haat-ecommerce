const mongoose = require('mongoose');
const Order = require('../models/orderModel');
const Product = require('../models/productModel');
const Coupon = require('../models/couponModel');
const AppError = require('../utils/AppError');
const { pricing } = require('../config/env');
const { sendOrderConfirmation } = require('./orderNotificationService');

const roundMoney = (value) => Math.round((value + Number.EPSILON) * 100) / 100;

const combineQuantities = (orderItems) => {
  const quantities = new Map();
  for (const item of orderItems) {
    const productId = item.product.toString();
    const combinedQuantity = (quantities.get(productId) || 0) + item.qty;
    if (combinedQuantity > 100) throw new AppError('A product quantity cannot exceed 100.', 400);
    quantities.set(productId, combinedQuantity);
  }
  return quantities;
};

const placeOrder = async ({ orderItems, shippingAddress, paymentMethod, couponCode, user }) => {
  const quantities = combineQuantities(orderItems);
  const session = await mongoose.startSession();
  let createdOrder;

  try {
    await session.withTransaction(async () => {
      const productIds = [...quantities.keys()];
      const products = await Product.find({ _id: { $in: productIds } }).session(session);
      if (products.length !== productIds.length) throw new AppError('One or more products no longer exist.', 400);

      const coupon = couponCode
        ? await Coupon.findOne({ code: couponCode, isActive: true, expiryDate: { $gte: new Date() } }).session(session)
        : null;
      if (couponCode && !coupon) throw new AppError('Coupon is invalid, inactive, or expired.', 400);

      const trustedItems = products.map((product) => {
        const qty = quantities.get(product._id.toString());
        if (qty > product.countInStock) {
          throw new AppError(`${product.name} only has ${product.countInStock} item(s) available.`, 409);
        }
        return { name: product.name, qty, image: product.image, price: product.price, product: product._id };
      });

      const itemsPrice = roundMoney(trustedItems.reduce((sum, item) => sum + item.price * item.qty, 0));
      const discountPrice = roundMoney(itemsPrice * ((coupon?.discountPercentage || 0) / 100));
      const discountedSubtotal = roundMoney(itemsPrice - discountPrice);
      const taxPrice = roundMoney(discountedSubtotal * pricing.taxRate);
      const totalPrice = roundMoney(discountedSubtotal + pricing.flatShippingPrice + taxPrice);

      for (const item of trustedItems) {
        const result = await Product.updateOne(
          { _id: item.product, countInStock: { $gte: item.qty } },
          { $inc: { countInStock: -item.qty } },
          { session }
        );
        if (result.modifiedCount !== 1) throw new AppError(`${item.name} went out of stock during checkout.`, 409);
      }

      [createdOrder] = await Order.create([{
        orderItems: trustedItems,
        user: user._id,
        shippingAddress,
        paymentMethod,
        itemsPrice,
        discountPrice,
        couponCode: coupon?.code || null,
        taxPrice,
        shippingPrice: pricing.flatShippingPrice,
        totalPrice,
        isPaid: false,
      }], { session });
    });
  } finally {
    await session.endSession();
  }

  try {
    await sendOrderConfirmation(createdOrder, user.email);
  } catch (error) {
    console.error('Failed to send confirmation email', error);
  }

  return createdOrder;
};

const getOrdersForUser = (userId) => Order.find({ user: userId }).sort({ createdAt: -1 });
const getAllOrders = () => Order.find({}).populate('user', 'id name').sort({ createdAt: -1 });

const markDelivered = async (orderId) => {
  const order = await Order.findById(orderId);
  if (!order) throw new AppError('Order not found', 404);
  order.isDelivered = true;
  order.deliveredAt = Date.now();
  return order.save();
};

module.exports = { placeOrder, getOrdersForUser, getAllOrders, markDelivered };
