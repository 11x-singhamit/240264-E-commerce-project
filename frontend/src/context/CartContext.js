import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

export const CartProvider = ({ children }) => {
    console.log('🚀 CartProvider initialized');
    
    // Always call useAuth - no conditional calls
    const { user, isAuthenticated } = useAuth();
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(false);

    console.log('🔍 CartProvider state:', { cartItems, loading, user });

    // Load cart when user changes
    useEffect(() => {
        console.log('🔄 Cart useEffect triggered:', { user, hasUser: !!user });
        
        // Safe check for isAuthenticated function
        const isUserAuthenticated = typeof isAuthenticated === 'function' ? isAuthenticated() : false;
        
        if (isUserAuthenticated) {
            console.log('👤 User authenticated, fetching from backend');
            fetchCartFromBackend();
        } else {
            console.log('👤 User not authenticated, loading from localStorage');
            loadCartFromLocalStorage();
        }
    }, [user, isAuthenticated]);

    // Save to localStorage when cart changes (for non-authenticated users)
    useEffect(() => {
        const isUserAuthenticated = typeof isAuthenticated === 'function' ? isAuthenticated() : false;
        
        if (!isUserAuthenticated) {
            try {
                console.log('💾 Saving cart to localStorage:', cartItems);
                localStorage.setItem('luxe_cart', JSON.stringify(cartItems));
            } catch (error) {
                console.error('❌ Error saving cart to localStorage:', error);
            }
        }
    }, [cartItems, isAuthenticated]);

    const loadCartFromLocalStorage = () => {
        try {
            const savedCart = localStorage.getItem('luxe_cart');
            console.log('📦 Loading from localStorage:', savedCart);
            
            if (savedCart) {
                const parsedCart = JSON.parse(savedCart);
                console.log('📦 Parsed cart:', parsedCart);
                setCartItems(parsedCart || []);
            } else {
                console.log('📦 No saved cart found');
                setCartItems([]);
            }
        } catch (error) {
            console.error('❌ Error loading cart from localStorage:', error);
            setCartItems([]);
            localStorage.removeItem('luxe_cart');
        }
    };

    // ✅ UPDATED FUNCTION - Replace your existing fetchCartFromBackend with this:
    const fetchCartFromBackend = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            console.log('🌐 Fetching cart from backend with token:', !!token);
            
            const response = await axios.get('http://localhost:5000/api/cart', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            console.log('🌐 Backend response:', response.data);
            
            if (response.data.success) {
                const responseData = response.data.data;
                console.log('🔍 Raw cart data type:', typeof responseData, responseData);
                
                // ✅ Handle different response formats from backend
                let cartItemsArray = [];
                
                if (Array.isArray(responseData)) {
                    // If data is already an array
                    cartItemsArray = responseData;
                    console.log('✅ Data is array:', cartItemsArray);
                } else if (responseData && typeof responseData === 'object') {
                    // If data is an object, extract the items array
                    if (Array.isArray(responseData.items)) {
                        cartItemsArray = responseData.items;
                        console.log('✅ Extracted items array:', cartItemsArray);
                    } else if (Array.isArray(responseData.cartItems)) {
                        cartItemsArray = responseData.cartItems;
                        console.log('✅ Extracted cartItems array:', cartItemsArray);
                    } else if (responseData.cart && Array.isArray(responseData.cart)) {
                        cartItemsArray = responseData.cart;
                        console.log('✅ Extracted cart array:', cartItemsArray);
                    } else {
                        // Handle single cart object or unexpected format
                        console.warn('⚠️ Unexpected cart data structure:', responseData);
                        cartItemsArray = [];
                    }
                } else {
                    console.warn('⚠️ Invalid cart data format:', responseData);
                    cartItemsArray = [];
                }
                
                console.log('🎯 Final cart items to set:', cartItemsArray);
                setCartItems(cartItemsArray);
            } else {
                console.log('❌ Backend response not successful');
                setCartItems([]);
            }
        } catch (error) {
            console.error('❌ Fetch cart error:', error);
            setCartItems([]);
            
            // If token is invalid, fall back to localStorage
            if (error.response?.status === 401) {
                console.log('🔄 Token invalid, falling back to localStorage');
                loadCartFromLocalStorage();
            }
        } finally {
            setLoading(false);
        }
    };

    // Keep all your existing functions: addToCart, updateQuantity, removeFromCart, etc.
    const addToCart = async (product, quantity = 1) => {
        try {
            setLoading(true);
            console.log('🛒 Adding to cart:', { product, quantity });

            const isUserAuthenticated = typeof isAuthenticated === 'function' ? isAuthenticated() : false;

            if (isUserAuthenticated) {
                // Add to backend
                const token = localStorage.getItem('token');
                const response = await axios.post('http://localhost:5000/api/cart', {
                    product_id: product.id,
                    quantity: quantity
                }, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.data.success) {
                    toast.success(`${product.name} added to cart!`);
                    await fetchCartFromBackend();
                    return true;
                } else {
                    toast.error(response.data.message || 'Failed to add to cart');
                    return false;
                }
            } else {
                // Add to localStorage
                const existingItemIndex = cartItems.findIndex(item => item.id === product.id);
                
                if (existingItemIndex >= 0) {
                    const updatedItems = [...cartItems];
                    updatedItems[existingItemIndex] = {
                        ...updatedItems[existingItemIndex],
                        quantity: updatedItems[existingItemIndex].quantity + quantity
                    };
                    setCartItems(updatedItems);
                } else {
                    setCartItems([...cartItems, { ...product, quantity }]);
                }
                
                toast.success(`${product.name} added to cart!`);
                return true;
            }
        } catch (error) {
            console.error('❌ Add to cart error:', error);
            toast.error(error.response?.data?.message || 'Failed to add to cart');
            return false;
        } finally {
            setLoading(false);
        }
    };

    const updateQuantity = async (itemId, quantity) => {
        if (quantity <= 0) {
            return removeFromCart(itemId);
        }

        try {
            setLoading(true);
            const isUserAuthenticated = typeof isAuthenticated === 'function' ? isAuthenticated() : false;

            if (isUserAuthenticated) {
                const token = localStorage.getItem('token');
                const response = await axios.put(`http://localhost:5000/api/cart/${itemId}`, 
                    { quantity },
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    }
                );

                if (response.data.success) {
                    await fetchCartFromBackend();
                    return true;
                } else {
                    toast.error(response.data.message || 'Failed to update cart');
                    return false;
                }
            } else {
                const updatedItems = cartItems.map(item =>
                    item.id === itemId ? { ...item, quantity } : item
                );
                setCartItems(updatedItems);
                return true;
            }
        } catch (error) {
            console.error('❌ Update quantity error:', error);
            toast.error('Failed to update quantity');
            return false;
        } finally {
            setLoading(false);
        }
    };

    const removeFromCart = async (itemId) => {
        try {
            setLoading(true);
            const isUserAuthenticated = typeof isAuthenticated === 'function' ? isAuthenticated() : false;

            if (isUserAuthenticated) {
                const token = localStorage.getItem('token');
                const response = await axios.delete(`http://localhost:5000/api/cart/${itemId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.data.success) {
                    toast.info('Item removed from cart');
                    await fetchCartFromBackend();
                    return true;
                } else {
                    toast.error(response.data.message || 'Failed to remove item');
                    return false;
                }
            } else {
                const updatedItems = cartItems.filter(item => item.id !== itemId);
                setCartItems(updatedItems);
                toast.info('Item removed from cart');
                return true;
            }
        } catch (error) {
            console.error('❌ Remove from cart error:', error);
            toast.error('Failed to remove item');
            return false;
        } finally {
            setLoading(false);
        }
    };

    const clearCart = async () => {
        try {
            setLoading(true);
            const isUserAuthenticated = typeof isAuthenticated === 'function' ? isAuthenticated() : false;

            if (isUserAuthenticated) {
                const token = localStorage.getItem('token');
                const response = await axios.delete('http://localhost:5000/api/cart', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.data.success) {
                    setCartItems([]);
                    toast.info('Cart cleared');
                    return true;
                } else {
                    toast.error(response.data.message || 'Failed to clear cart');
                    return false;
                }
            } else {
                setCartItems([]);
                localStorage.removeItem('luxe_cart');
                toast.info('Cart cleared');
                return true;
            }
        } catch (error) {
            console.error('❌ Clear cart error:', error);
            toast.error('Failed to clear cart');
            return false;
        } finally {
            setLoading(false);
        }
    };

    const getCartTotal = () => {
        const total = cartItems.reduce((total, item) => {
            const price = parseFloat(item.price || item.product?.price || 0);
            const quantity = parseInt(item.quantity || 0);
            return total + (price * quantity);
        }, 0);
        return total;
    };

    const getCartCount = () => {
        const count = cartItems.reduce((count, item) => {
            const quantity = parseInt(item.quantity || 0);
            return count + quantity;
        }, 0);
        return count;
    };

    const isInCart = (productId) => {
        return cartItems.some(item => 
            item.id === productId || 
            item.product_id === productId || 
            item.product?.id === productId
        );
    };

    const value = {
        items: cartItems,
        cartItems, // For backward compatibility
        loading,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        getCartTotal,
        getCartCount,
        isInCart,
        fetchCartItems: loadCartFromLocalStorage
    };

    console.log('🎯 CartProvider providing value:', value);

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};

// ✅ Export the context for direct usage
export { CartContext };

// ✅ Also export as default for flexibility
export default CartContext;
