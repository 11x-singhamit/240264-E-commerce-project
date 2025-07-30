import React, { useContext, useState } from 'react';
import { CartContext } from '../context/CartContext';
import '../styles/Cart.css';

const Cart = () => {
    const cartContext = useContext(CartContext);
    
    // ✅ Safely extract data with better error handling
    const { 
        cartItems: rawCartItems = [], 
        loading = false, 
        error = null, 
        updateQuantity, 
        removeFromCart, 
        clearCart,
        getCartTotal 
    } = cartContext || {};

    const [isProcessing, setIsProcessing] = useState(false);
    const [showCheckout, setShowCheckout] = useState(false);
    const [checkoutLoading, setCheckoutLoading] = useState(false);
    const [orderComplete, setOrderComplete] = useState(false);
    const [orderId, setOrderId] = useState('');

    // Checkout form data
    const [formData, setFormData] = useState({
        // Shipping Info
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '', // Now user input instead of dropdown
        zipCode: '',
        
        // Payment Info
        paymentMethod: 'cod', // Default to Cash on Delivery
        cardNumber: '',
        expiryDate: '',
        cvv: '',
        nameOnCard: ''
    });

    // ✅ Ensure cartItems is always an array
    const cartItems = React.useMemo(() => {
        console.log('🔍 Processing cartItems:', rawCartItems, 'Type:', typeof rawCartItems);
        
        if (Array.isArray(rawCartItems)) {
            return rawCartItems;
        } else if (rawCartItems && typeof rawCartItems === 'object') {
            // Try to extract array from object
            if (Array.isArray(rawCartItems.items)) {
                console.log('✅ Extracted items from object');
                return rawCartItems.items;
            } else if (Array.isArray(rawCartItems.cartItems)) {
                console.log('✅ Extracted cartItems from object');
                return rawCartItems.cartItems;
            } else {
                console.warn('⚠️ CartItems object has no array property:', rawCartItems);
                return [];
            }
        } else {
            console.warn('⚠️ CartItems is not an array or object:', rawCartItems);
            return [];
        }
    }, [rawCartItems]);

    console.log('🛒 Final cartItems for rendering:', cartItems, 'Length:', cartItems.length);

    // Safe calculation of totals
    const calculateSubtotal = () => {
        try {
            if (!Array.isArray(cartItems)) {
                console.warn('⚠️ cartItems is not an array in calculateSubtotal');
                return 0;
            }
            
            return cartItems.reduce((total, item) => {
                // Handle different data structures
                const price = parseFloat(
                    item.price || 
                    item.product?.price || 
                    0
                );
                const quantity = parseInt(item.quantity || 0);
                return total + (price * quantity);
            }, 0);
        } catch (err) {
            console.error('Error calculating subtotal:', err);
            return 0;
        }
    };

    const subtotal = calculateSubtotal();
    const tax = subtotal * 0.1;
    // COD has extra charge, card payment is free shipping over $100
    const shipping = formData.paymentMethod === 'cod' ? 15 : (subtotal > 100 ? 0 : 10);
    const total = subtotal + tax + shipping;

    // Handle quantity change
    const handleQuantityChange = async (productId, newQuantity) => {
        try {
            setIsProcessing(true);
            if (updateQuantity) {
                await updateQuantity(productId, parseInt(newQuantity));
            }
        } catch (err) {
            console.error('Error updating quantity:', err);
        } finally {
            setIsProcessing(false);
        }
    };

    // Handle remove item
    const handleRemoveItem = async (productId) => {
        try {
            setIsProcessing(true);
            if (removeFromCart) {
                await removeFromCart(productId);
            }
        } catch (err) {
            console.error('Error removing item:', err);
        } finally {
            setIsProcessing(false);
        }
    };

    // Handle checkout button click
    const handleCheckout = () => {
        setShowCheckout(true);
    };

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        let formattedValue = value;

        // Format card number (only if card payment is selected)
        if (name === 'cardNumber' && formData.paymentMethod === 'card') {
            formattedValue = value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
            if (formattedValue.length > 19) formattedValue = formattedValue.substring(0, 19);
        }

        // Format expiry date (only if card payment is selected)
        if (name === 'expiryDate' && formData.paymentMethod === 'card') {
            formattedValue = value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2');
            if (formattedValue.length > 5) formattedValue = formattedValue.substring(0, 5);
        }

        // Format CVV (only if card payment is selected)
        if (name === 'cvv' && formData.paymentMethod === 'card') {
            formattedValue = value.replace(/\D/g, '');
            if (formattedValue.length > 4) formattedValue = formattedValue.substring(0, 4);
        }

        setFormData(prev => ({
            ...prev,
            [name]: formattedValue
        }));
    };

    // Handle payment method change
    const handlePaymentMethodChange = (method) => {
        setFormData(prev => ({
            ...prev,
            paymentMethod: method,
            // Clear card details if switching to COD
            ...(method === 'cod' ? {
                cardNumber: '',
                expiryDate: '',
                cvv: '',
                nameOnCard: ''
            } : {})
        }));
    };

    // Handle checkout form submission
    const handleCheckoutSubmit = async (e) => {
        e.preventDefault();
        setCheckoutLoading(true);

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Generate order ID
            const newOrderId = `ORD-${Date.now()}`;
            setOrderId(newOrderId);
            
            // Clear cart and show success
            if (clearCart) {
                clearCart();
            }
            setOrderComplete(true);
            
        } catch (error) {
            console.error('Order failed:', error);
            alert('Order failed. Please try again.');
        } finally {
            setCheckoutLoading(false);
        }
    };

    // Back to cart from checkout
    const backToCart = () => {
        setShowCheckout(false);
    };

    // Loading state
    if (loading) {
        return (
            <div className="cart-container">
                <div className="cart-loading">
                    <div className="spinner"></div>
                    <h2>Loading your cart...</h2>
                    <p>Please wait while we fetch your items.</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="cart-container">
                <div className="cart-error">
                    <h2>Oops! Something went wrong</h2>
                    <p>{error.message || 'Unable to load your cart. Please try again.'}</p>
                    <button 
                        className="btn btn-primary"
                        onClick={() => window.location.reload()}
                    >
                        Refresh Page
                    </button>
                </div>
            </div>
        );
    }

    // Empty cart state
    if (!Array.isArray(cartItems) || cartItems.length === 0) {
        return (
            <div className="cart-container">
                <div className="cart-empty">
                    <div className="empty-icon">🛒</div>
                    <h2>Your cart is empty</h2>
                    <p>Looks like you haven't added any items to your cart yet.</p>
                    <a href="/products" className="btn btn-primary btn-lg">
                        Continue Shopping
                    </a>
                </div>
            </div>
        );
    }

    // Order confirmation view
    if (orderComplete) {
        return (
            <div className="cart-container">
                <div className="order-confirmation">
                    <div className="success-icon">✅</div>
                    <h1>Order Confirmed!</h1>
                    <p>Thank you for your purchase</p>
                    <div className="order-details">
                        <p><strong>Order ID:</strong> {orderId}</p>
                        <p><strong>Payment Method:</strong> {formData.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Card Payment'}</p>
                        <p><strong>Total:</strong> ${total.toFixed(2)}</p>
                        <p><strong>Estimated Delivery:</strong> {formData.paymentMethod === 'cod' ? '3-5 business days' : '5-7 business days'}</p>
                    </div>
                    <div className="confirmation-actions">
                        <button 
                            className="btn btn-primary"
                            onClick={() => {
                                setOrderComplete(false);
                                setShowCheckout(false);
                                setFormData({
                                    firstName: '', lastName: '', email: '', phone: '',
                                    address: '', city: '', state: '', zipCode: '',
                                    paymentMethod: 'cod', cardNumber: '', expiryDate: '', cvv: '', nameOnCard: ''
                                });
                            }}
                        >
                            Continue Shopping
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Checkout view
    if (showCheckout) {
        return (
            <div className="cart-container fade-in">
                <div className="checkout-header">
                    <h1>Checkout</h1>
                    <p>Complete your purchase</p>
                </div>

                <div className="checkout-content">
                    {/* Order Summary */}
                    <div className="order-summary">
                        <h3>Order Summary</h3>
                        
                        <div className="order-items">
                            {cartItems.map((item, index) => {
                                const itemId = item._id || item.id || item.product_id || `item-${index}`;
                                const itemName = item.name || item.product?.name || item.title || 'Unknown Product';
                                const itemPrice = parseFloat(item.price || item.product?.price || 0);
                                const itemQuantity = parseInt(item.quantity || 1);
                                const itemTotal = itemPrice * itemQuantity;

                                return (
                                    <div key={itemId} className="order-item">
                                        <div className="item-info">
                                            <h4>{itemName}</h4>
                                            <p>Qty: {itemQuantity}</p>
                                        </div>
                                        <div className="item-price">
                                            ${itemTotal.toFixed(2)}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="order-totals">
                            <div className="total-row">
                                <span>Subtotal:</span>
                                <span>${subtotal.toFixed(2)}</span>
                            </div>
                            <div className="total-row">
                                <span>Tax (10%):</span>
                                <span>${tax.toFixed(2)}</span>
                            </div>
                            <div className="total-row">
                                <span>Shipping:</span>
                                <span>
                                    {formData.paymentMethod === 'cod' ? `$${shipping.toFixed(2)} (COD Fee)` : 
                                     shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
                                </span>
                            </div>
                            <div className="total-row final-total">
                                <span>Total:</span>
                                <span>${total.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Checkout Form */}
                    <div className="checkout-form">
                        <form onSubmit={handleCheckoutSubmit}>
                            {/* Shipping Information */}
                            <div className="form-section">
                                <h3>🚚 Shipping Information</h3>
                                
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>First Name *</label>
                                        <input
                                            type="text"
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleInputChange}
                                            required
                                            placeholder="Enter first name"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Last Name *</label>
                                        <input
                                            type="text"
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={handleInputChange}
                                            required
                                            placeholder="Enter last name"
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Email *</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            required
                                            placeholder="Enter email"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Phone *</label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            required
                                            placeholder="Enter phone"
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Address *</label>
                                    <input
                                        type="text"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="Enter street address"
                                    />
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>City *</label>
                                        <input
                                            type="text"
                                            name="city"
                                            value={formData.city}
                                            onChange={handleInputChange}
                                            required
                                            placeholder="Enter city"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>State/Province *</label>
                                        <input
                                            type="text"
                                            name="state"
                                            value={formData.state}
                                            onChange={handleInputChange}
                                            required
                                            placeholder="Enter state or province"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>ZIP Code *</label>
                                        <input
                                            type="text"
                                            name="zipCode"
                                            value={formData.zipCode}
                                            onChange={handleInputChange}
                                            required
                                            placeholder="12345"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Payment Method Selection */}
                            <div className="form-section">
                                <h3>💳 Payment Method</h3>
                                
                                <div className="payment-methods">
                                    <div className="payment-options">
                                        <label className={`payment-option ${formData.paymentMethod === 'cod' ? 'selected' : ''}`}>
                                            <input
                                                type="radio"
                                                name="paymentMethod"
                                                value="cod"
                                                checked={formData.paymentMethod === 'cod'}
                                                onChange={(e) => handlePaymentMethodChange(e.target.value)}
                                            />
                                            <div className="payment-option-content">
                                                <div className="payment-icon">💵</div>
                                                <div className="payment-info">
                                                    <h4>Cash on Delivery</h4>
                                                    <p>Pay when your order arrives</p>
                                                    <small>Additional $15 COD fee applies</small>
                                                </div>
                                            </div>
                                        </label>
                                        
                                        <label className={`payment-option ${formData.paymentMethod === 'card' ? 'selected' : ''}`}>
                                            <input
                                                type="radio"
                                                name="paymentMethod"
                                                value="card"
                                                checked={formData.paymentMethod === 'card'}
                                                onChange={(e) => handlePaymentMethodChange(e.target.value)}
                                            />
                                            <div className="payment-option-content">
                                                <div className="payment-icon">💳</div>
                                                <div className="payment-info">
                                                    <h4>Card Payment</h4>
                                                    <p>Pay securely with your card</p>
                                                    <small>Free shipping on orders over $100</small>
                                                </div>
                                            </div>
                                        </label>
                                    </div>
                                </div>

                                {/* Card Details (only show if card payment selected) */}
                                {formData.paymentMethod === 'card' && (
                                    <div className="card-details">
                                        <h4>Card Details</h4>
                                        
                                        <div className="form-group">
                                            <label>Card Number *</label>
                                            <input
                                                type="text"
                                                name="cardNumber"
                                                value={formData.cardNumber}
                                                onChange={handleInputChange}
                                                required={formData.paymentMethod === 'card'}
                                                placeholder="1234 5678 9012 3456"
                                            />
                                        </div>

                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>Expiry Date *</label>
                                                <input
                                                    type="text"
                                                    name="expiryDate"
                                                    value={formData.expiryDate}
                                                    onChange={handleInputChange}
                                                    required={formData.paymentMethod === 'card'}
                                                    placeholder="MM/YY"
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>CVV *</label>
                                                <input
                                                    type="text"
                                                    name="cvv"
                                                    value={formData.cvv}
                                                    onChange={handleInputChange}
                                                    required={formData.paymentMethod === 'card'}
                                                    placeholder="123"
                                                />
                                            </div>
                                        </div>

                                        <div className="form-group">
                                            <label>Name on Card *</label>
                                            <input
                                                type="text"
                                                name="nameOnCard"
                                                value={formData.nameOnCard}
                                                onChange={handleInputChange}
                                                required={formData.paymentMethod === 'card'}
                                                placeholder="Enter name as on card"
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* COD Information */}
                                {formData.paymentMethod === 'cod' && (
                                    <div className="cod-info">
                                        <div className="info-box">
                                            <h4>💵 Cash on Delivery Information</h4>
                                            <ul>
                                                <li>✅ Pay in cash when your order is delivered</li>
                                                <li>✅ No need to enter card details</li>
                                                <li>✅ Secure and convenient</li>
                                                <li>⚠️ Additional $15 COD processing fee applies</li>
                                                <li>📦 Delivery within 3-5 business days</li>
                                            </ul>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Submit Button */}
                            <div className="form-actions">
                                <button
                                    type="button"
                                    className="btn btn-outline"
                                    onClick={backToCart}
                                    disabled={checkoutLoading}
                                >
                                    ← Back to Cart
                                </button>
                                
                                <button
                                    type="submit"
                                    className="btn btn-primary btn-lg"
                                    disabled={checkoutLoading}
                                >
                                    {checkoutLoading ? (
                                        <>
                                            <span className="spinner"></span>
                                            Processing...
                                        </>
                                    ) : (
                                        `${formData.paymentMethod === 'cod' ? 'Place COD Order' : 'Pay Now'} - $${total.toFixed(2)}`
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        );
    }

    // Main cart render (same as before)
    return (
        <div className="cart-container fade-in">
            {/* Cart Header */}
            <div className="cart-header">
                <div>
                    <h1>Shopping Cart</h1>
                    <p>{cartItems.length} item{cartItems.length !== 1 ? 's' : ''} in your cart</p>
                </div>
                <button 
                    className="btn btn-outline-danger"
                    onClick={() => {
                        if (window.confirm('Are you sure you want to clear your cart?')) {
                            clearCart && clearCart();
                        }
                    }}
                    disabled={isProcessing}
                >
                    Clear Cart
                </button>
            </div>

            {/* Cart Content */}
            <div className="cart-content">
                {/* Cart Items */}
                <div className="cart-items">
                    {cartItems.map((item, index) => {
                        // ✅ Safe item data extraction with multiple fallbacks
                        const itemId = item._id || item.id || item.product_id || `item-${index}`;
                        const itemName = item.name || item.product?.name || item.title || 'Unknown Product';
                        const itemPrice = parseFloat(item.price || item.product?.price || 0);
                        const itemQuantity = parseInt(item.quantity || 1);
                        const itemImage = item.image || item.product?.image || item.imageUrl || '/placeholder-image.jpg';
                        const itemTotal = itemPrice * itemQuantity;

                        console.log(`🛍️ Rendering item ${index}:`, {
                            itemId, itemName, itemPrice, itemQuantity, itemImage
                        });

                        return (
                            <div key={itemId} className="cart-item">
                                {/* Item Image */}
                                <div className="item-image">
                                    <img 
                                        src={itemImage} 
                                        alt={itemName}
                                        onError={(e) => {
                                            e.target.src = '/placeholder-image.jpg';
                                        }}
                                    />
                                </div>

                                {/* Item Details */}
                                <div className="item-details">
                                    <h3>{itemName}</h3>
                                    <p className="item-price">${itemPrice.toFixed(2)}</p>
                                    {item.product?.description && (
                                        <p className="item-description">
                                            {item.product.description.substring(0, 100)}...
                                        </p>
                                    )}
                                </div>

                                {/* Quantity Selector */}
                                <div className="item-quantity">
                                    <label htmlFor={`quantity-${itemId}`}>Quantity:</label>
                                    <select
                                        id={`quantity-${itemId}`}
                                        className="quantity-select"
                                        value={itemQuantity}
                                        onChange={(e) => handleQuantityChange(itemId, e.target.value)}
                                        disabled={isProcessing}
                                    >
                                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                                            <option key={num} value={num}>{num}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Item Total */}
                                <div className="item-total">
                                    <p>${itemTotal.toFixed(2)}</p>
                                </div>

                                {/* Remove Button */}
                                <div className="item-actions">
                                    <button
                                        className="btn btn-danger btn-sm"
                                        onClick={() => {
                                            if (window.confirm('Remove this item from cart?')) {
                                                handleRemoveItem(itemId);
                                            }
                                        }}
                                        disabled={isProcessing}
                                    >
                                        {isProcessing ? 'Removing...' : 'Remove'}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Cart Summary */}
                <div className="cart-summary">
                    <div className="summary-card">
                        <h3>Order Summary</h3>
                        
                        <div className="summary-row">
                            <span>Subtotal:</span>
                            <span>${subtotal.toFixed(2)}</span>
                        </div>
                        
                        <div className="summary-row">
                            <span>Tax (10%):</span>
                            <span>${tax.toFixed(2)}</span>
                        </div>
                        
                        <div className="summary-row">
                            <span>Shipping:</span>
                            <span>{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
                        </div>
                        
                        <hr />
                        
                        <div className="summary-row total">
                            <span><strong>Total:</strong></span>
                            <span><strong>${total.toFixed(2)}</strong></span>
                        </div>

                        <button 
                            className="checkout-btn"
                            onClick={handleCheckout}
                            disabled={isProcessing || cartItems.length === 0}
                        >
                            {isProcessing ? 'Processing...' : 'Proceed to Checkout'}
                        </button>

                        <div style={{ marginTop: '20px', textAlign: 'center' }}>
                            <a href="/products" className="btn btn-outline-primary">
                                Continue Shopping
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;
