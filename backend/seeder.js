const mongoose = require('mongoose');
const { mongoUri } = require('./config/env');
const User = require('./models/userModel');
const Product = require('./models/productModel');
const products = require('./data/products');

const validateProducts = (items) => {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('backend/data/products.js must export at least one product.');
  }

  for (const [index, product] of items.entries()) {
    const requiredFields = ['name', 'image', 'description', 'brand', 'category'];
    for (const field of requiredFields) {
      if (typeof product[field] !== 'string' || !product[field].trim()) {
        throw new Error(`Product ${index + 1} is missing ${field}.`);
      }
    }
    if (!/^https?:\/\//i.test(product.image)) {
      throw new Error(`Product "${product.name}" must use an HTTP(S) image link.`);
    }
    if (!Number.isFinite(product.price) || product.price < 0) {
      throw new Error(`Product "${product.name}" has an invalid price.`);
    }
    if (!Number.isInteger(product.countInStock) || product.countInStock < 0) {
      throw new Error(`Product "${product.name}" has an invalid stock count.`);
    }
  }
};

const seedProducts = async () => {
  try {
    validateProducts(products);
    await mongoose.connect(mongoUri);

    const owner = await User.findOne({ role: 'owner' });

    const operations = products.map(({ rating = 0, numReviews = 0, ...product }) => ({
      updateOne: {
        filter: { name: product.name },
        update: {
          $set: { ...product, ...(owner ? { user: owner._id } : {}) },
          $setOnInsert: { rating, numReviews },
        },
        upsert: true,
      },
    }));

    const result = await Product.bulkWrite(operations);
    console.log(`Catalog imported: ${result.upsertedCount} added, ${result.modifiedCount} updated.`);
  } finally {
    await mongoose.disconnect();
  }
};

seedProducts().catch((error) => {
  console.error(`Product import failed: ${error.message}`);
  process.exitCode = 1;
});
