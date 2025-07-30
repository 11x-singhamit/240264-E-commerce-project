const express = require('express');
const {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart
} = require('../controllers/cartController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// All cart routes require authentication
router.use(authenticateToken);

// ✅ ADD THESE DEBUG ROUTES
router.get('/test-auth', (req, res) => {
    console.log('🧪 Test auth route - User:', req.user);
    res.json({
        success: true,
        message: 'Authentication working!',
        user: {
            id: req.user.id,
            username: req.user.username,
            email: req.user.email
        },
        timestamp: new Date().toISOString()
    });
});

router.get('/debug', async (req, res) => {
    try {
        const db = require('../config/database');
        
        console.log('🔍 Debug route called by user:', req.user.id);
        
        // Get raw cart data
        const [cartItems] = await db.execute(
            'SELECT * FROM cart WHERE user_id = ?',
            [req.user.id]
        );
        
        // Get cart with product details
        const [cartWithProducts] = await db.execute(`
            SELECT c.*, p.name, p.price 
            FROM cart c 
            JOIN products p ON c.product_id = p.id 
            WHERE c.user_id = ?
        `, [req.user.id]);
        
        res.json({
            success: true,
            debug: {
                userId: req.user.id,
                username: req.user.username,
                rawCartItems: cartItems,
                cartWithProducts: cartWithProducts,
                timestamp: new Date().toISOString()
            }
        });
        
    } catch (error) {
        console.error('❌ Debug route error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get cart items
router.get('/', getCart);

// Add to cart - support both POST / and POST /add
router.post('/', addToCart);      // 👈 Frontend uses this
router.post('/add', addToCart);   // 👈 Keep this for compatibility

// Update cart item
router.put('/:cartId', updateCartItem);

// Remove cart item
router.delete('/:cartId', removeFromCart);

// Clear entire cart
router.delete('/', clearCart);

// Get cart count
router.get('/count', async (req, res) => {
    try {
        const db = require('../config/database');
        const [result] = await db.execute(
            'SELECT SUM(quantity) as total_items FROM cart WHERE user_id = ?',
            [req.user.id]
        );
        
        const count = result[0].total_items || 0;
        
        res.json({
            success: true,
            data: { count: parseInt(count) }
        });
        
    } catch (error) {
        console.error('❌ Get cart count error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get cart count',
            error: error.message
        });
    }
});

module.exports = router;
