const express = require('express');
const { body } = require('express-validator');
const {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
} = require('../controllers/productController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { uploadSingle, handleUploadError } = require('../middleware/upload'); // ✅ Add upload middleware

const router = express.Router();

// Validation rules
const productValidation = [
    body('name')
        .notEmpty()
        .withMessage('Product name is required')
        .isLength({ min: 2, max: 255 })
        .withMessage('Product name must be between 2 and 255 characters'),
    body('description')
        .optional()
        .isLength({ max: 1000 })
        .withMessage('Description must not exceed 1000 characters'),
    body('price')
        .isFloat({ min: 0 })
        .withMessage('Price must be a positive number')
        .custom(value => {
            // Ensure price has at most 2 decimal places
            if (!/^\d+(\.\d{1,2})?$/.test(value.toString())) {
                throw new Error('Price must have at most 2 decimal places');
            }
            return true;
        }),
    body('stock_quantity')
        .isInt({ min: 0 })
        .withMessage('Stock quantity must be a non-negative integer'),
    body('category_id')
        .isInt({ min: 1 })
        .withMessage('Category ID must be a positive integer'),
    body('image_url')
        .optional()
        .isURL()
        .withMessage('Image URL must be a valid URL')
];

// Validation rules for partial updates (PUT requests)
const productUpdateValidation = [
    body('name')
        .optional()
        .notEmpty()
        .withMessage('Product name cannot be empty')
        .isLength({ min: 2, max: 255 })
        .withMessage('Product name must be between 2 and 255 characters'),
    body('description')
        .optional()
        .isLength({ max: 1000 })
        .withMessage('Description must not exceed 1000 characters'),
    body('price')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Price must be a positive number')
        .custom(value => {
            if (value !== undefined && !/^\d+(\.\d{1,2})?$/.test(value.toString())) {
                throw new Error('Price must have at most 2 decimal places');
            }
            return true;
        }),
    body('stock_quantity')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Stock quantity must be a non-negative integer'),
    body('category_id')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Category ID must be a positive integer'),
    body('image_url')
        .optional()
        .isURL()
        .withMessage('Image URL must be a valid URL')
];

// Public Routes (no authentication required)
router.get('/', getAllProducts);
router.get('/:id', getProductById);

// ✅ Admin Routes with image upload support
router.post('/', 
    authenticateToken, 
    requireAdmin, 
    uploadSingle,           // Handle file upload
    handleUploadError,      // Handle upload errors
    productValidation, 
    createProduct
);

router.put('/:id', 
    authenticateToken, 
    requireAdmin, 
    uploadSingle,           // Handle file upload
    handleUploadError,      // Handle upload errors
    productUpdateValidation, 
    updateProduct
);

router.delete('/:id', authenticateToken, requireAdmin, deleteProduct);

module.exports = router;
