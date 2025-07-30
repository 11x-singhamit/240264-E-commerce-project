const db = require('../config/database');

// Get user's cart
const getCart = async (req, res) => {
    try {
        console.log('📦 GET /api/cart - User ID:', req.user.id);
        
        const query = `
            SELECT 
                c.id as cart_id,
                c.quantity,
                c.created_at,
                p.id,
                p.name,
                p.description,
                p.price,
                p.image_url,
                p.stock_quantity,
                (c.quantity * p.price) as subtotal
            FROM cart c
            JOIN products p ON c.product_id = p.id
            WHERE c.user_id = ?
            ORDER BY c.created_at DESC
        `;
        
        const [cartItems] = await db.execute(query, [req.user.id]);
        
        console.log('📦 Cart items found:', cartItems.length);
        
        // Calculate total
        const total = cartItems.reduce((sum, item) => sum + parseFloat(item.subtotal), 0);
        
        res.json({
            success: true,
            data: {
                cartItems,
                total: parseFloat(total.toFixed(2)),
                itemCount: cartItems.length
            },
            message: 'Cart retrieved successfully'
        });
        
    } catch (error) {
        console.error('❌ Get cart error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve cart',
            error: error.message
        });
    }
};

// Add item to cart - ✅ FIXED: Accept both productId and product_id
const addToCart = async (req, res) => {
    try {
        // Accept both naming conventions
        const { product_id, productId, quantity = 1 } = req.body;
        const actualProductId = product_id || productId;
        const user_id = req.user.id;
        
        console.log('🛒 POST /api/cart - Adding:', { user_id, product_id: actualProductId, quantity });
        
        // Validate input
        if (!actualProductId) {
            return res.status(400).json({
                success: false,
                message: 'Product ID is required'
            });
        }
        
        // Check if product exists
        const [products] = await db.execute(
            'SELECT id, name, price, stock_quantity FROM products WHERE id = ?',
            [actualProductId]
        );
        
        if (products.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }
        
        const product = products[0];
        
        // Check stock
        if (product.stock_quantity < quantity) {
            return res.status(400).json({
                success: false,
                message: 'Insufficient stock'
            });
        }
        
        // Check if item already exists in cart
        const [existingItems] = await db.execute(
            'SELECT id, quantity FROM cart WHERE user_id = ? AND product_id = ?',
            [user_id, actualProductId]
        );
        
        if (existingItems.length > 0) {
            // Update existing item
            const newQuantity = existingItems[0].quantity + parseInt(quantity);
            
            if (newQuantity > product.stock_quantity) {
                return res.status(400).json({
                    success: false,
                    message: 'Cannot add more items than available in stock'
                });
            }
            
            await db.execute(
                'UPDATE cart SET quantity = ?, updated_at = NOW() WHERE id = ?',
                [newQuantity, existingItems[0].id]
            );
            
            console.log('🔄 Updated cart item quantity:', newQuantity);
            
        } else {
            // Add new item
            await db.execute(
                'INSERT INTO cart (user_id, product_id, quantity, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())',
                [user_id, actualProductId, quantity]
            );
            
            console.log('✅ Added new item to cart');
        }
        
        res.json({
            success: true,
            message: `${product.name} added to cart successfully`
        });
        
    } catch (error) {
        console.error('❌ Add to cart error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add item to cart',
            error: error.message
        });
    }
};

// Update cart item quantity
const updateCartItem = async (req, res) => {
    try {
        const { cartId } = req.params;
        const { quantity } = req.body;
        const user_id = req.user.id;
        
        console.log('🔄 PUT /api/cart/:cartId - Updating:', { cartId, quantity, user_id });
        
        if (!quantity || quantity < 1) {
            return res.status(400).json({
                success: false,
                message: 'Valid quantity is required'
            });
        }
        
        // Check if cart item belongs to user
        const [cartItems] = await db.execute(
            `SELECT c.id, c.product_id, p.stock_quantity, p.name 
             FROM cart c 
             JOIN products p ON c.product_id = p.id 
             WHERE c.id = ? AND c.user_id = ?`,
            [cartId, user_id]
        );
        
        if (cartItems.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Cart item not found'
            });
        }
        
        const cartItem = cartItems[0];
        
        // Check stock
        if (quantity > cartItem.stock_quantity) {
            return res.status(400).json({
                success: false,
                message: 'Insufficient stock'
            });
        }
        
        // Update quantity
        await db.execute(
            'UPDATE cart SET quantity = ?, updated_at = NOW() WHERE id = ?',
            [quantity, cartId]
        );
        
        res.json({
            success: true,
            message: 'Cart updated successfully'
        });
        
    } catch (error) {
        console.error('❌ Update cart error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update cart',
            error: error.message
        });
    }
};

// Remove item from cart
const removeFromCart = async (req, res) => {
    try {
        const { cartId } = req.params;
        const user_id = req.user.id;
        
        console.log('🗑️ DELETE /api/cart/:cartId - Removing:', { cartId, user_id });
        
        // Check if cart item belongs to user
        const [cartItems] = await db.execute(
            'SELECT id FROM cart WHERE id = ? AND user_id = ?',
            [cartId, user_id]
        );
        
        if (cartItems.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Cart item not found'
            });
        }
        
        // Remove item
        await db.execute('DELETE FROM cart WHERE id = ?', [cartId]);
        
        res.json({
            success: true,
            message: 'Item removed from cart successfully'
        });
        
    } catch (error) {
        console.error('❌ Remove cart item error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to remove item from cart',
            error: error.message
        });
    }
};

// Clear entire cart
const clearCart = async (req, res) => {
    try {
        const user_id = req.user.id;
        
        console.log('🧹 DELETE /api/cart - Clearing cart for user:', user_id);
        
        await db.execute('DELETE FROM cart WHERE user_id = ?', [user_id]);
        
        res.json({
            success: true,
            message: 'Cart cleared successfully'
        });
        
    } catch (error) {
        console.error('❌ Clear cart error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to clear cart',
            error: error.message
        });
    }
};

module.exports = {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart
};
