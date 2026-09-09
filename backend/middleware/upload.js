const multer = require('multer');

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: (req, file, callback) => {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
    callback(allowedMimeTypes.includes(file.mimetype) ? null : new Error('Only JPG, PNG, and WebP images are allowed.'), allowedMimeTypes.includes(file.mimetype));
  },
});

module.exports = upload;
