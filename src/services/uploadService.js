// backend/src/services/uploadService.js
const cloudinary = require('../config/cloudinary');
const path = require('path');
const fs = require('fs');

// Upload file to Cloudinary
const uploadToCloudinary = async (filePath, folder = 'violations') => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder,
    });
    // Delete local file after upload
    fs.unlinkSync(filePath);
    return result.secure_url;
  } catch (error) {
    throw new Error('File upload failed');
  }
};

// Example for local file upload (if not using Cloudinary)
const saveFileLocally = (file, folderPath) => {
  const filename = Date.now() + path.extname(file.originalname);
  const filePath = path.join(folderPath, filename);
  fs.writeFileSync(filePath, file.buffer); // For buffer storage
  return filePath;
};

module.exports = { uploadToCloudinary, saveFileLocally };
