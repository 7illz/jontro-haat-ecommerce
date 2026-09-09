const asyncHandler = require('../middleware/asyncHandler');
const orderService = require('../services/orderService');

const addOrderItems = asyncHandler(async (req, res) => {
  const order = await orderService.placeOrder({ ...req.body, user: req.user });
  res.status(201).json(order);
});

const getMyOrders = asyncHandler(async (req, res) => {
  res.json(await orderService.getOrdersForUser(req.user._id));
});

const getAllOrders = asyncHandler(async (req, res) => {
  res.json(await orderService.getAllOrders());
});

const updateOrderToDelivered = asyncHandler(async (req, res) => {
  res.json(await orderService.markDelivered(req.params.id));
});

module.exports = { addOrderItems, getMyOrders, getAllOrders, updateOrderToDelivered };
