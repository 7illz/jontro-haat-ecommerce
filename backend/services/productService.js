const Order = require('../models/orderModel');
const Product = require('../models/productModel');
const AppError = require('../utils/AppError');
const { uploadProductImage } = require('./imageService');

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const listProducts = async ({ keyword, category, sort }) => {
  const safeKeyword = typeof keyword === 'string' ? keyword.trim().slice(0, 100) : '';
  const safeCategory = typeof category === 'string' ? category.trim().slice(0, 120) : '';
  const query = {
    ...(safeKeyword ? { name: { $regex: escapeRegExp(safeKeyword), $options: 'i' } } : {}),
    ...(safeCategory ? { category: safeCategory } : {}),
  };
  const sortQuery = sort === 'lowest' ? { price: 1 } : sort === 'highest' ? { price: -1 } : { createdAt: -1 };
  const [products, categories] = await Promise.all([
    Product.find(query).sort(sortQuery),
    Product.distinct('category'),
  ]);
  return { products, categories };
};

const getProduct = async (productId) => {
  const product = await Product.findById(productId);
  if (!product) throw new AppError('Product not found', 404);
  return product;
};

const addReview = async ({ productId, user, rating, comment }) => {
  const product = await getProduct(productId);
  const deliveredOrder = await Order.exists({
    user: user._id,
    isDelivered: true,
    'orderItems.product': product._id,
  });
  if (!deliveredOrder) throw new AppError('You can only review products that have been delivered to you.', 403);
  if (product.reviews.some((review) => review.user.toString() === user._id.toString())) {
    throw new AppError('You have already reviewed this product', 400);
  }

  product.reviews.push({ name: user.name, rating, comment, user: user._id });
  product.numReviews = product.reviews.length;
  product.rating = product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length;
  await product.save();
};

const resolveImage = async (file, image, fallback) => {
  if (file?.buffer) return uploadProductImage(file.buffer);
  return image || fallback;
};

const createProduct = async ({ data, file, ownerId }) => {
  const image = await resolveImage(file, data.image, 'https://via.placeholder.com/400');
  return Product.create({ ...data, image, user: ownerId });
};

const updateProduct = async ({ productId, data, file }) => {
  const product = await getProduct(productId);
  for (const field of ['name', 'brand', 'category', 'price', 'countInStock', 'description']) {
    if (data[field] !== undefined) product[field] = data[field];
  }
  product.image = await resolveImage(file, data.image, product.image);
  return product.save();
};

const deleteProduct = async (productId) => {
  const product = await getProduct(productId);
  await Product.deleteOne({ _id: product._id });
};

module.exports = { listProducts, getProduct, addReview, createProduct, updateProduct, deleteProduct };
