const fs = require('fs-extra');
const path = require('path');
const sharp = require('sharp');

// Delete file helper
const deleteFile = async (filePath) => {
    try {
        if (filePath && await fs.pathExists(filePath)) {
            await fs.unlink(filePath);
            console.log('File deleted:', filePath);
        }
    } catch (error) {
        console.error('Error deleting file:', error);
    }
};

// Resize and optimize image
const optimizeImage = async (inputPath, outputPath, options = {}) => {
    try {
        const {
            width = 800,
            height = 600,
            quality = 80
        } = options;

        await sharp(inputPath)
            .resize(width, height, {
                fit: 'inside',
                withoutEnlargement: true
            })
            .jpeg({ quality })
            .toFile(outputPath);

        // Delete original if different from output
        if (inputPath !== outputPath) {
            await deleteFile(inputPath);
        }

        return outputPath;
    } catch (error) {
        console.error('Error optimizing image:', error);
        throw error;
    }
};

// Generate image URL for frontend
const generateImageUrl = (filename, req) => {
    if (!filename) return null;
    return `${req.protocol}://${req.get('host')}/uploads/products/${filename}`;
};

// Extract filename from URL
const extractFilenameFromUrl = (imageUrl) => {
    if (!imageUrl) return null;
    return path.basename(imageUrl);
};

module.exports = {
    deleteFile,
    optimizeImage,
    generateImageUrl,
    extractFilenameFromUrl
};
