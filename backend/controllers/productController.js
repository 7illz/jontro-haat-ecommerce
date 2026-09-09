const asyncHandler = require('../middleware/asyncHandler');
const productService = require('../services/productService');

const getProducts = asyncHandler(async (req, res) => {
  res.json(await productService.listProducts(req.query));
});

const getProductById = asyncHandler(async (req, res) => {
  res.json(await productService.getProduct(req.params.id));
});

const createProductReview = asyncHandler(async (req, res) => {
  await productService.addReview({ productId: req.params.id, user: req.user, ...req.body });
  res.status(201).json({ message: 'Review added successfully' });
});

const createProduct = asyncHandler(async (req, res) => {
  const product = await productService.createProduct({ data: req.body, file: req.file, ownerId: req.user._id });
  res.status(201).json(product);
});

const updateProduct = asyncHandler(async (req, res) => {
  res.json(await productService.updateProduct({ productId: req.params.id, data: req.body, file: req.file }));
});

const deleteProduct = asyncHandler(async (req, res) => {
  await productService.deleteProduct(req.params.id);
  res.json({ message: 'Product removed successfully' });
});

module.exports = { getProducts, getProductById, createProductReview, createProduct, deleteProduct, updateProduct };
