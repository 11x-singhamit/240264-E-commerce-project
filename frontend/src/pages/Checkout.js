import React, { useState, useContext } from 'react';
import { CartContext } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import '../styles/Checkout.css';

const Checkout = () => {
    const { cartItems, getCartTotal, clearCart } = useContext(CartContext);
    const navigate = useNavigate();
    
    const [formData, setFormData] = useState({
        // Shipping Info
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        
        // Payment Info
        cardNumber: '',
        expiryDate: '',
        cvv: '',
        nameOnCard: ''
    });
    
    const [loading, setLoading] = useState(false);
    const [orderComplete, setOrderComplete] = useState(false);
    const [orderId, setOrderId] = useState('');

    // Calculate totals
    const subtotal = Array.isArray(cartItems) ? cartItems.reduce((total, item) => {
        const price = parseFloat(item.price || 0);
        const quantity = parseInt(item.quantity || 0);
        return total + (price * quantity);
    }, 0) : 0;

    const tax = subtotal * 0.1;
    const shipping = subtotal > 100 ? 0 : 10;
    const total = subtotal + tax + shipping;

    // Handle input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        let formattedValue = value;

        // Format card number
        if (name === 'cardNumber') {
            formattedValue = value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
            if (formattedValue.length > 19) formattedValue = formattedValue.substring(0, 19);
        }

        // Format expiry date
        if (name === 'expiryDate') {
            formattedValue = value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2');
            if (formattedValue.length > 5) formattedValue = formattedValue.substring(0, 5);
        }

        // Format CVV
        if (name === 'cvv') {
            formattedValue = value.replace(/\D/g, '');
            if (formattedValue.length > 4) formattedValue = formattedValue.substring(0, 4);
        }

        setFormData(prev => ({
            ...prev,
            [name]: formattedValue
        }));
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Generate order ID
            const newOrderId = `ORD-${Date.now()}`;
            setOrderId(newOrderId);
            
            // Clear cart and show success
            clearCart();
            setOrderComplete(true);
            
        } catch (error) {
            console.error('Order failed:', error);
            alert('Order failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Order confirmation view
    if (orderComplete) {
        return (
            <div className="checkout-container">
                <div className="order-confirmation">
                    <div className="success-icon">✅</div>
                    <h1>Order Confirmed!</h1>
                    <p>Thank you for your purchase</p>
                    <div className="order-details">
                        <p><strong>Order ID:</strong> {orderId}</p>
                        <p><strong>Total:</strong> ${total.toFixed(2)}</p>
                        <p><strong>Estimated Delivery:</strong> 5-7 business days</p>
                    </div>
                    <div className="confirmation-actions">
                        <button 
                            className="btn btn-primary"
                            onClick={() => navigate('/')}
                        >
                            Continue Shopping
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="checkout-container">
            <div className="checkout-header">
                <h1>Checkout</h1>
                <p>Complete your purchase</p>
            </div>

            <div className="checkout-content">
                {/* Order Summary */}
                <div className="order-summary">
                    <h3>Order Summary</h3>
                    
                    <div className="order-items">
                        {Array.isArray(cartItems) && cartItems.map(item => (
                            <div key={item.id} className="order-item">
                                <div className="item-info">
                                    <h4>{item.name || item.title}</h4>
                                    <p>Qty: {item.quantity}</p>
                                </div>
                                <div className="item-price">
                                    ${(parseFloat(item.price || 0) * parseInt(item.quantity || 0)).toFixed(2)}
                                </div>
                            </div>
                        ))}
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
                            <span>{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
                        </div>
                        <div className="total-row final-total">
                            <span>Total:</span>
                            <span>${total.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                {/* Checkout Form */}
                <div className="checkout-form">
                    <form onSubmit={handleSubmit}>
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
                                    <label>State *</label>
                                    <select
                                        name="state"
                                        value={formData.state}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        <option value="">Select State</option>
                                        <option value="AL">Alabama</option>
                                        <option value="CA">California</option>
                                        <option value="FL">Florida</option>
                                        <option value="NY">New York</option>
                                        <option value="TX">Texas</option>
                                    </select>
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

                        {/* Payment Information */}
                        <div className="form-section">
                            <h3>💳 Payment Information</h3>
                            
                            <div className="form-group">
                                <label>Card Number *</label>
                                <input
                                    type="text"
                                    name="cardNumber"
                                    value={formData.cardNumber}
                                    onChange={handleInputChange}
                                    required
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
                                        required
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
                                        required
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
                                    required
                                    placeholder="Enter name as on card"
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="form-actions">
                            <button
                                type="button"
                                className="btn btn-outline"
                                onClick={() => navigate('/cart')}
                                disabled={loading}
                            >
                                ← Back to Cart
                            </button>
                            
                            <button
                                type="submit"
                                className="btn btn-primary btn-lg"
                                disabled={loading || cartItems.length === 0}
                            >
                                {loading ? (
                                    <>
                                        <span className="spinner"></span>
                                        Processing...
                                    </>
                                ) : (
                                    `Place Order - $${total.toFixed(2)}`
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
