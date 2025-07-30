const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateAdmin } = require('../middleware/adminAuth');

// Get all products (admin only)
router.get('/products', authenticateAdmin, async (req, res) => {
  try {
    const [products] = await db.execute(`
      SELECT p.*, c.name as category_name 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id
    `);
    res.json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update product (admin only)
router.put('/products/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, stock_quantity, category_id, image_url } = req.body;
    
    await db.execute(
      'UPDATE products SET name = ?, description = ?, price = ?, stock_quantity = ?, category_id = ?, image_url = ? WHERE id = ?',
      [name, description, price, stock_quantity, category_id, image_url, id]
    );
    
    res.json({ success: true, message: 'Product updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Delete product (admin only)
router.delete('/products/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await db.execute('DELETE FROM products WHERE id = ?', [id]);
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get dashboard stats
router.get('/dashboard', authenticateAdmin, async (req, res) => {
  try {
    const [productCount] = await db.execute('SELECT COUNT(*) as count FROM products');
    const [categoryCount] = await db.execute('SELECT COUNT(*) as count FROM categories');
    const [totalValue] = await db.execute('SELECT SUM(price * stock_quantity) as total FROM products');
    
    res.json({
      success: true,
      data: {
        totalProducts: productCount[0].count,
        totalCategories: categoryCount[0].count,
        inventoryValue: totalValue[0].total || 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
