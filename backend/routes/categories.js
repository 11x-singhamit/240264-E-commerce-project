const express = require('express');
const { body } = require('express-validator');
const {
    getAllCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory
} = require('../controllers/categoryController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Validation rules for creating categories
const categoryValidation = [
    body('name')
        .notEmpty()
        .withMessage('Category name is required')
        .isLength({ min: 2, max: 100 })
        .withMessage('Category name must be between 2 and 100 characters')
        .trim(),
    body('description')
        .optional()
        .isLength({ max: 500 })
        .withMessage('Description must not exceed 500 characters')
        .trim()
];

// Validation rules for updating categories (optional fields)
const categoryUpdateValidation = [
    body('name')
        .optional()
        .notEmpty()
        .withMessage('Category name cannot be empty')
        .isLength({ min: 2, max: 100 })
        .withMessage('Category name must be between 2 and 100 characters')
        .trim(),
    body('description')
        .optional()
        .isLength({ max: 500 })
        .withMessage('Description must not exceed 500 characters')
        .trim()
];

// Public Routes (no authentication required)
router.get('/', getAllCategories);
router.get('/:id', getCategoryById);

// Admin Routes (authentication + admin role required)
router.post('/', authenticateToken, requireAdmin, categoryValidation, createCategory);
router.put('/:id', authenticateToken, requireAdmin, categoryUpdateValidation, updateCategory);
router.delete('/:id', authenticateToken, requireAdmin, deleteCategory);

module.exports = router;
