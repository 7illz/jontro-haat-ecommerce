const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    // Which user placed this order?
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    
    // What did they buy?
    orderItems: [
      {
        name: { type: String, required: true },
        qty: { type: Number, required: true, min: 1, max: 100, validate: Number.isInteger },
        image: { type: String, required: true },
        price: { type: Number, required: true, min: 0 },
        product: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: 'Product',
        },
      },
    ],
    
    // Where is it going?
    shippingAddress: {
      address: { type: String, required: true, trim: true, maxlength: 200 },
      city: { type: String, required: true, trim: true, maxlength: 200 },
      postalCode: { type: String, required: true, trim: true, maxlength: 200 },
      country: { type: String, required: true, trim: true, maxlength: 200 },
    },
    
    // Payment and Pricing Details
    paymentMethod: { type: String, required: true, enum: ['Cash on Delivery', 'Online Payment'] },
    itemsPrice: { type: Number, required: true, default: 0.0, min: 0 },
    discountPrice: { type: Number, required: true, default: 0.0, min: 0 },
    couponCode: { type: String, default: null },
    taxPrice: { type: Number, required: true, default: 0.0, min: 0 },
    shippingPrice: { type: Number, required: true, default: 0.0, min: 0 },
    totalPrice: { type: Number, required: true, default: 0.0, min: 0 },
    
    // Status tracking
    isPaid: { type: Boolean, required: true, default: false },
    paidAt: { type: Date },
    isDelivered: { type: Boolean, required: true, default: false },
    deliveredAt: { type: Date },
  },
  { timestamps: true }
);

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
