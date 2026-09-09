const express = require('express');
const router = express.Router();
const { 
  getProducts, 
  getProductById, 
  createProductReview,
  createProduct,
  deleteProduct,
  updateProduct // 👇 1. Import it
} = require('../controllers/productController');
const { protect, protectOwner } = require('../middleware/authMiddleware');
const { validateObjectId, validateProduct, validateReview } = require('../middleware/validationMiddleware');
const upload = require('../middleware/upload'); 

router.route('/')
  .get(getProducts)
  .post(protect, protectOwner, upload.single('imageFile'), validateProduct(false), createProduct);

// 👇 2. Chain the .delete() method to this route
router.route('/:id')
  .get(validateObjectId(), getProductById)
  .delete(protect, protectOwner, validateObjectId(), deleteProduct)
  .put(protect, protectOwner, validateObjectId(), upload.single('imageFile'), validateProduct(true), updateProduct);

router.route('/:id/reviews').post(protect, validateObjectId(), validateReview, createProductReview);

module.exports = router;
