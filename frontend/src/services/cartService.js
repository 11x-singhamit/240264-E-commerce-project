const API_BASE_URL = 'http://localhost:5000/api';

// Get authentication token
const getAuthToken = () => {
    const token = localStorage.getItem('token');
    console.log('🔑 Token check:', {
        exists: !!token,
        preview: token ? token.substring(0, 20) + '...' : 'null'
    });
    
    if (!token) {
        throw new Error('Please log in to access cart');
    }
    return token;
};

// Get cart items
export const getCart = async () => {
    try {
        console.log('🛒 Starting getCart...');
        
        const token = getAuthToken();
        const url = `${API_BASE_URL}/cart`;
        
        console.log('🌐 Making request to:', url);
        console.log('🔑 Using token:', token.substring(0, 20) + '...');
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        console.log('📡 Response received:', {
            status: response.status,
            statusText: response.statusText,
            ok: response.ok,
            headers: Object.fromEntries(response.headers.entries())
        });

        let data;
        try {
            data = await response.json();
            console.log('📦 Response data:', data);
        } catch (parseError) {
            console.error('❌ Failed to parse JSON response:', parseError);
            throw new Error('Invalid response from server');
        }
        
        if (!response.ok) {
            console.error('❌ HTTP Error:', {
                status: response.status,
                message: data.message || 'Unknown error'
            });
            throw new Error(data.message || `HTTP error! status: ${response.status}`);
        }

        // Handle different response structures
        let cartItems = [];
        let total = 0;
        let itemCount = 0;

        if (data.success) {
            if (data.data && Array.isArray(data.data.cartItems)) {
                // Structure: { success: true, data: { cartItems: [], total: 0, itemCount: 0 } }
                cartItems = data.data.cartItems;
                total = data.data.total || 0;
                itemCount = data.data.itemCount || 0;
            } else if (Array.isArray(data.data)) {
                // Structure: { success: true, data: [] }
                cartItems = data.data;
                total = cartItems.reduce((sum, item) => sum + (item.subtotal || item.quantity * item.price), 0);
                itemCount = cartItems.length;
            } else {
                console.warn('⚠️ Unexpected data structure:', data);
                cartItems = [];
            }
        } else {
            console.error('❌ API returned success: false:', data);
            throw new Error(data.message || 'Failed to retrieve cart');
        }

        console.log('✅ Final processed data:', { cartItems, total, itemCount });
        
        return {
            success: true,
            cartItems,
            total,
            itemCount
        };
        
    } catch (error) {
        console.error('❌ getCart error details:', {
            name: error.name,
            message: error.message,
            stack: error.stack
        });
        
        // Re-throw with more specific error message
        if (error.message.includes('Failed to fetch')) {
            throw new Error('Cannot connect to server. Please check if the backend is running.');
        } else if (error.message.includes('401') || error.message.includes('403')) {
            throw new Error('Please log in again. Your session may have expired.');
        } else {
            throw error;
        }
    }
};

// Add item to cart
export const addToCart = async (productId, quantity = 1) => {
    try {
        const token = getAuthToken();
        
        console.log('➕ Adding to cart:', { productId, quantity });
        
        const response = await fetch(`${API_BASE_URL}/cart`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                productId: productId,
                quantity: parseInt(quantity) 
            }),
        });

        const data = await response.json();
        console.log('📦 Add to cart response:', data);
        
        if (!response.ok) {
            throw new Error(data.message || `HTTP error! status: ${response.status}`);
        }

        return data;
    } catch (error) {
        console.error('❌ Error adding to cart:', error);
        throw error;
    }
};

// Update cart item quantity
export const updateCartItem = async (cartId, quantity) => {
    try {
        const token = getAuthToken();
        
        const response = await fetch(`${API_BASE_URL}/cart/${cartId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ quantity: parseInt(quantity) }),
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || `HTTP error! status: ${response.status}`);
        }

        return data;
    } catch (error) {
        console.error('❌ Error updating cart:', error);
        throw error;
    }
};

// Remove item from cart
export const removeFromCart = async (cartId) => {
    try {
        const token = getAuthToken();
        
        const response = await fetch(`${API_BASE_URL}/cart/${cartId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || `HTTP error! status: ${response.status}`);
        }

        return data;
    } catch (error) {
        console.error('❌ Error removing from cart:', error);
        throw error;
    }
};

// Clear entire cart
export const clearCart = async () => {
    try {
        const token = getAuthToken();
        
        const response = await fetch(`${API_BASE_URL}/cart`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || `HTTP error! status: ${response.status}`);
        }

        return data;
    } catch (error) {
        console.error('❌ Error clearing cart:', error);
        throw error;
    }
};
