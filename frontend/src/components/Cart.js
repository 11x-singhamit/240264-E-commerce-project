import React, { useState, useEffect } from 'react';
import { getCart } from '../services/cartService';

const Cart = () => {
    const [cartData, setCartData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        console.log('🛒 Cart component mounted');
        testAuthentication();
        fetchCart();
    }, []);

    const testAuthentication = async () => {
        try {
            const token = localStorage.getItem('token');
            const user = JSON.parse(localStorage.getItem('user') || 'null');
            
            console.log('🔍 Auth Status:', {
                hasToken: !!token,
                hasUser: !!user,
                tokenLength: token?.length,
                userInfo: user
            });

            // Test auth endpoint
            const response = await fetch('http://localhost:5000/api/cart/test-auth', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            const data = await response.json();
            console.log('🧪 Auth test result:', data);
            
        } catch (error) {
            console.error('❌ Auth test failed:', error);
        }
    };

    const fetchCart = async () => {
        try {
            setLoading(true);
            setError(null);
            
            console.log('🛒 Fetching cart...');
            const result = await getCart();
            console.log('✅ Cart fetched successfully:', result);
            
            setCartData(result);
        } catch (error) {
            console.error('❌ Failed to fetch cart:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const clearAuthAndReload = () => {
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = '/login';
    };

    if (loading) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
                <h2>Loading Cart...</h2>
                <p>Check browser console for debug info</p>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
                <h2 style={{ color: 'red' }}>Cart Error</h2>
                <p style={{ color: 'red' }}>{error}</p>
                <div style={{ marginTop: '1rem' }}>
                    <button onClick={fetchCart} style={{ marginRight: '1rem' }}>
                        Retry
                    </button>
                    <button onClick={clearAuthAndReload}>
                        Clear Session & Login
                    </button>
                </div>
                <div style={{ marginTop: '2rem', textAlign: 'left', backgroundColor: '#f5f5f5', padding: '1rem' }}>
                    <h3>Debug Info:</h3>
                    <pre>{JSON.stringify({
                        hasToken: !!localStorage.getItem('token'),
                        hasUser: !!localStorage.getItem('user'),
                        error: error
                    }, null, 2)}</pre>
                </div>
            </div>
        );
    }

    return (
        <div style={{ padding: '2rem' }}>
            <h1>Shopping Cart</h1>
            {cartData && cartData.cartItems && cartData.cartItems.length > 0 ? (
                <div>
                    <p>Items: {cartData.itemCount}</p>
                    <p>Total: ${cartData.total}</p>
                    <ul>
                        {cartData.cartItems.map((item, index) => (
                            <li key={index}>
                                {item.name} - Qty: {item.quantity} - ${item.price}
                            </li>
                        ))}
                    </ul>
                </div>
            ) : (
                <div>
                    <p>Your cart is empty</p>
                    <button onClick={fetchCart}>Refresh Cart</button>
                </div>
            )}
        </div>
    );
};

export default Cart;
