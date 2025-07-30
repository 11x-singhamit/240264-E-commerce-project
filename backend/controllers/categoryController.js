const { validationResult } = require('express-validator');
const db = require('../config/database');

// Get all categories with product count
const getAllCategories = async (req, res) => {
    try {
        const { include_products } = req.query;
        
        // ✅ Removed c.updated_at from GROUP BY and SELECT
        let query = `
            SELECT c.*, COUNT(p.id) as product_count
            FROM categories c
            LEFT JOIN products p ON c.id = p.category_id AND p.stock_quantity > 0
            GROUP BY c.id, c.name, c.description, c.created_at
            ORDER BY c.name ASC
        `;

        console.log('Executing categories query:', query);
        const [rows] = await db.execute(query);

        // If include_products is requested, fetch products for each category
        if (include_products === 'true') {
            for (let category of rows) {
                const [products] = await db.execute(`
                    SELECT id, name, price, image_url, stock_quantity
                    FROM products 
                    WHERE category_id = ? AND stock_quantity > 0
                    ORDER BY name ASC
                    LIMIT 10
                `, [category.id]);
                
                category.products = products;
            }
        }

        res.json({
            success: true,
            data: rows
        });
    } catch (error) {
        console.error('Get all categories error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch categories',
            error: error.message
        });
    }
};

// Get single category by ID
const getCategoryById = async (req, res) => {
    try {
        const { id } = req.params;
        const { include_products } = req.query;

        if (!id || isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: 'Valid category ID is required'
            });
        }

        // ✅ Removed c.updated_at from GROUP BY and SELECT
        const [rows] = await db.execute(`
            SELECT c.*, COUNT(p.id) as product_count
            FROM categories c
            LEFT JOIN products p ON c.id = p.category_id AND p.stock_quantity > 0
            WHERE c.id = ?
            GROUP BY c.id, c.name, c.description, c.created_at
        `, [id]);

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        const category = rows[0];

        // If include_products is requested, fetch products for this category
        if (include_products === 'true') {
            const [products] = await db.execute(`
                SELECT id, name, description, price, image_url, stock_quantity, created_at
                FROM products 
                WHERE category_id = ? AND stock_quantity > 0
                ORDER BY name ASC
            `, [id]);
            
            category.products = products;
        }

        res.json({
            success: true,
            data: category
        });
    } catch (error) {
        console.error('Get category by ID error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch category',
            error: error.message
        });
    }
};

// Create new category
const createCategory = async (req, res) => {
    try {
        // Check validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { name, description } = req.body;

        // Check if category name already exists
        const [existingCategory] = await db.execute(
            'SELECT id FROM categories WHERE name = ?',
            [name.trim()]
        );

        if (existingCategory.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Category name already exists'
            });
        }

        // ✅ Removed updated_at from INSERT (since column doesn't exist)
        const [result] = await db.execute(`
            INSERT INTO categories (name, description, created_at)
            VALUES (?, ?, NOW())
        `, [name.trim(), description?.trim() || null]);

        // Fetch the created category
        const [newCategory] = await db.execute(`
            SELECT *, 0 as product_count
            FROM categories 
            WHERE id = ?
        `, [result.insertId]);

        res.status(201).json({
            success: true,
            message: 'Category created successfully',
            data: newCategory[0]
        });
    } catch (error) {
        console.error('Create category error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create category',
            error: error.message
        });
    }
};

// Update category
const updateCategory = async (req, res) => {
    try {
        // Check validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { id } = req.params;
        const updateData = req.body;

        if (!id || isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: 'Valid category ID is required'
            });
        }

        // Check if category exists
        const [existingCategory] = await db.execute(
            'SELECT * FROM categories WHERE id = ?',
            [id]
        );

        if (existingCategory.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        // Check if category name already exists (if name is being updated)
        if (updateData.name && updateData.name.trim() !== existingCategory[0].name) {
            const [nameCheck] = await db.execute(
                'SELECT id FROM categories WHERE name = ? AND id != ?',
                [updateData.name.trim(), id]
            );

            if (nameCheck.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Category name already exists'
                });
            }
        }

        // Build update query dynamically
        const updateFields = [];
        const updateValues = [];

        if (updateData.name) {
            updateFields.push('name = ?');
            updateValues.push(updateData.name.trim());
        }

        if (updateData.hasOwnProperty('description')) {
            updateFields.push('description = ?');
            updateValues.push(updateData.description?.trim() || null);
        }

        if (updateFields.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No valid fields to update'
            });
        }

        // ✅ Removed updated_at = NOW() since column doesn't exist
        updateValues.push(id);

        const updateQuery = `UPDATE categories SET ${updateFields.join(', ')} WHERE id = ?`;
        await db.execute(updateQuery, updateValues);

        // ✅ Fetch the updated category without updated_at in GROUP BY
        const [updatedCategory] = await db.execute(`
            SELECT c.*, COUNT(p.id) as product_count
            FROM categories c
            LEFT JOIN products p ON c.id = p.category_id AND p.stock_quantity > 0
            WHERE c.id = ?
            GROUP BY c.id, c.name, c.description, c.created_at
        `, [id]);

        res.json({
            success: true,
            message: 'Category updated successfully',
            data: updatedCategory[0]
        });
    } catch (error) {
        console.error('Update category error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update category',
            error: error.message
        });
    }
};

// Delete category
const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id || isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: 'Valid category ID is required'
            });
        }

        // Check if category exists
        const [existingCategory] = await db.execute(
            'SELECT * FROM categories WHERE id = ?',
            [id]
        );

        if (existingCategory.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        // Check if category has products
        const [products] = await db.execute(
            'SELECT id FROM products WHERE category_id = ?',
            [id]
        );

        if (products.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete category. It contains ${products.length} product(s). Please move or delete the products first.`
            });
        }

        // Delete the category
        await db.execute('DELETE FROM categories WHERE id = ?', [id]);

        res.json({
            success: true,
            message: 'Category deleted successfully'
        });
    } catch (error) {
        console.error('Delete category error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete category',
            error: error.message
        });
    }
};

module.exports = {
    getAllCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory
};
