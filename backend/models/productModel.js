// backend/models/productModel.js
const mongoose = require('mongoose');

// 1. Create the Review Schema first
const reviewSchema = mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 80 },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true, trim: true, maxlength: 2000 },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
}, { timestamps: true });

// 2. Add it into your existing Product Schema
const productSchema = mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, required: false, ref: 'User' },
  name: { type: String, required: true, trim: true, maxlength: 120 },
  image: { type: String, required: true, maxlength: 2048 },
  brand: { type: String, required: true, trim: true, maxlength: 120 },
  category: { type: String, required: true, trim: true, maxlength: 120 },
  description: { type: String, required: true, trim: true, maxlength: 5000 },
  price: { type: Number, required: true, default: 0, min: 0 },
  countInStock: { type: Number, required: true, default: 0, min: 0, validate: Number.isInteger },
  
  // NEW FIELDS FOR REVIEWS:
  reviews: [reviewSchema],
  rating: { type: Number, required: true, default: 0 },
  numReviews: { type: Number, required: true, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
