// controllers/productController.js
const { validationResult } = require('express-validator');
const db = require('../config/database');

// Get all products
const getAllProducts = async (req, res) => {
    try {
        const { limit = 20, page = 1, category, search } = req.query;
        
        // ✅ Convert to integers and validate
        const limitNum = Math.min(parseInt(limit) || 20, 100); // Max 100 items
        const offset = (parseInt(page) - 1) * limitNum;

        console.log('Query params:', { limitNum, offset, category, search });

        // Build dynamic query
        let query = `
            SELECT p.*, c.name as category_name 
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE p.stock_quantity > 0
        `;
        
        let params = [];

        // Add category filter
        if (category && !isNaN(category)) {
            query += ` AND p.category_id = ?`;
            params.push(parseInt(category));
        }

        // Add search filter
        if (search) {
            query += ` AND (p.name LIKE ? OR p.description LIKE ?)`;
            params.push(`%${search}%`, `%${search}%`);
        }

        // ✅ Use string concatenation instead of parameter for LIMIT
        query += ` ORDER BY p.name ASC LIMIT ${limitNum} OFFSET ${offset}`;

        console.log('Executing query:', query);
        console.log('With params:', params);

        const [rows] = await db.execute(query, params);

        // Get total count for pagination
        let countQuery = `
            SELECT COUNT(*) as total 
            FROM products p 
            WHERE p.stock_quantity > 0
        `;
        let countParams = [];

        if (category && !isNaN(category)) {
            countQuery += ` AND p.category_id = ?`;
            countParams.push(parseInt(category));
        }

        if (search) {
            countQuery += ` AND (p.name LIKE ? OR p.description LIKE ?)`;
            countParams.push(`%${search}%`, `%${search}%`);
        }

        const [countResult] = await db.execute(countQuery, countParams);
        const total = countResult[0].total;

        res.json({
            success: true,
            data: rows,
            pagination: {
                current_page: parseInt(page),
                per_page: limitNum,
                total: total,
                total_pages: Math.ceil(total / limitNum)
            }
        });
    } catch (error) {
        console.error('Get all products error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch products',
            error: error.message
        });
    }
};

// Get product by ID
const getProductById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id || isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: 'Valid product ID is required'
            });
        }

        const [rows] = await db.execute(`
            SELECT p.*, c.name as category_name 
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE p.id = ?
        `, [parseInt(id)]);

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.json({
            success: true,
            data: rows[0]
        });
    } catch (error) {
        console.error('Get product by ID error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch product',
            error: error.message
        });
    }
};

// Create new product
const createProduct = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { name, description, price, category_id, stock_quantity } = req.body;

        // Validate required fields
        if (!name || !price || !category_id) {
            return res.status(400).json({
                success: false,
                message: 'Name, price, and category_id are required'
            });
        }

        // Check if category exists
        const [categoryCheck] = await db.execute(
            'SELECT id FROM categories WHERE id = ?',
            [parseInt(category_id)]
        );

        if (categoryCheck.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid category ID'
            });
        }

        const [result] = await db.execute(`
            INSERT INTO products (name, description, price, category_id, stock_quantity, image_url, created_at)
            VALUES (?, ?, ?, ?, ?, ?, NOW())
        `, [
            name.trim(),
            description?.trim() || null,
            parseFloat(price),
            parseInt(category_id),
            parseInt(stock_quantity) || 0,
            req.file ? `/uploads/${req.file.filename}` : null
        ]);

        // Fetch the created product
        const [newProduct] = await db.execute(`
            SELECT p.*, c.name as category_name 
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE p.id = ?
        `, [result.insertId]);

        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            data: newProduct[0]
        });
    } catch (error) {
        console.error('Create product error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create product',
            error: error.message
        });
    }
};

// Update product
const updateProduct = async (req, res) => {
    try {
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
                message: 'Valid product ID is required'
            });
        }

        // Check if product exists
        const [existingProduct] = await db.execute(
            'SELECT * FROM products WHERE id = ?',
            [parseInt(id)]
        );

        if (existingProduct.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Check if category exists (if category_id is being updated)
        if (updateData.category_id) {
            const [categoryCheck] = await db.execute(
                'SELECT id FROM categories WHERE id = ?',
                [parseInt(updateData.category_id)]
            );

            if (categoryCheck.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid category ID'
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

        if (updateData.price) {
            updateFields.push('price = ?');
            updateValues.push(parseFloat(updateData.price));
        }

        if (updateData.category_id) {
            updateFields.push('category_id = ?');
            updateValues.push(parseInt(updateData.category_id));
        }

        if (updateData.hasOwnProperty('stock_quantity')) {
            updateFields.push('stock_quantity = ?');
            updateValues.push(parseInt(updateData.stock_quantity) || 0);
        }

        if (req.file) {
            updateFields.push('image_url = ?');
            updateValues.push(`/uploads/${req.file.filename}`);
        }

        if (updateFields.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No valid fields to update'
            });
        }

        updateValues.push(parseInt(id));

        const updateQuery = `UPDATE products SET ${updateFields.join(', ')} WHERE id = ?`;
        await db.execute(updateQuery, updateValues);

        // Fetch the updated product
        const [updatedProduct] = await db.execute(`
            SELECT p.*, c.name as category_name 
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE p.id = ?
        `, [parseInt(id)]);

        res.json({
            success: true,
            message: 'Product updated successfully',
            data: updatedProduct[0]
        });
    } catch (error) {
        console.error('Update product error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update product',
            error: error.message
        });
    }
};

// Delete product
const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id || isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: 'Valid product ID is required'
            });
        }

        // Check if product exists
        const [existingProduct] = await db.execute(
            'SELECT * FROM products WHERE id = ?',
            [parseInt(id)]
        );

        if (existingProduct.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Delete the product
        await db.execute('DELETE FROM products WHERE id = ?', [parseInt(id)]);

        res.json({
            success: true,
            message: 'Product deleted successfully'
        });
    } catch (error) {
        console.error('Delete product error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete product',
            error: error.message
        });
    }
};

module.exports = {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
};
