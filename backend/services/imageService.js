const cloudinary = require('cloudinary').v2;
const { cloudinary: settings } = require('../config/env');

cloudinary.config({
  cloud_name: settings.cloudName,
  api_key: settings.apiKey,
  api_secret: settings.apiSecret,
});

const uploadProductImage = (buffer) => new Promise((resolve, reject) => {
  const stream = cloudinary.uploader.upload_stream(
    { folder: settings.folder, resource_type: 'image' },
    (error, result) => (error ? reject(error) : resolve(result.secure_url))
  );
  stream.end(buffer);
});

module.exports = { uploadProductImage };
