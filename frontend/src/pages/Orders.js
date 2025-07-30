import React, { useState, useEffect } from 'react';
import '../styles/Orders.css';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedOrder, setSelectedOrder] = useState(null);

    // Mock orders data - replace with actual API call
    const mockOrders = [
        {
            id: 'ORD-1732892847123',
            date: '2024-01-15',
            status: 'delivered',
            paymentMethod: 'card',
            total: 299.99,
            items: [
                {
                    id: 1,
                    name: 'Premium Wireless Headphones',
                    price: 199.99,
                    quantity: 1,
                    image: '/api/placeholder/100/100'
                },
                {
                    id: 2,
                    name: 'Smart Watch Pro',
                    price: 100.00,
                    quantity: 1,
                    image: '/api/placeholder/100/100'
                }
            ],
            shipping: {
                firstName: 'John',
                lastName: 'DOG',
                address: '123 Main Street',
                city: 'New York',
                state: 'NY',
                zipCode: '10001'
            },
            tracking: 'TRK123456789',
            estimatedDelivery: '2024-01-18'
        },
        {
            id: 'ORD-1732892847124',
            date: '2024-01-10',
            status: 'shipped',
            paymentMethod: 'cod',
            total: 159.99,
            items: [
                {
                    id: 3,
                    name: 'Gaming Mouse RGB',
                    price: 79.99,
                    quantity: 1,
                    image: '/api/placeholder/100/100'
                },
                {
                    id: 4,
                    name: 'Mechanical Keyboard',
                    price: 80.00,
                    quantity: 1,
                    image: '/api/placeholder/100/100'
                }
            ],
            shipping: {
                firstName: 'John',
                lastName: 'DOG',
                address: '123 Main Street',
                city: 'New York',
                state: 'NY',
                zipCode: '10001'
            },
            tracking: 'TRK123456790',
            estimatedDelivery: '2024-01-12'
        },
        {
            id: 'ORD-1732892847125',
            date: '2024-01-05',
            status: 'processing',
            paymentMethod: 'card',
            total: 89.99,
            items: [
                {
                    id: 5,
                    name: 'Bluetooth Speaker',
                    price: 89.99,
                    quantity: 1,
                    image: '/api/placeholder/100/100'
                }
            ],
            shipping: {
                firstName: 'John',
                lastName: 'DOG',
                address: '123 Main Street',
                city: 'New York',
                state: 'NY',
                zipCode: '10001'
            },
            tracking: null,
            estimatedDelivery: '2024-01-08'
        }
    ];

    useEffect(() => {
        // Simulate API call
        const fetchOrders = async () => {
            try {
                setLoading(true);
                // Simulate network delay
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                // In real app, this would be:
                // const response = await fetch('/api/orders');
                // const data = await response.json();
                
                setOrders(mockOrders);
            } catch (err) {
                setError('Failed to load orders');
                console.error('Error fetching orders:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    const getStatusColor = (status) => {
        switch (status) {
            case 'delivered': return '#4CAF50';
            case 'shipped': return '#2196F3';
            case 'processing': return '#FF9800';
            case 'cancelled': return '#f44336';
            default: return '#666';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'delivered': return '✅';
            case 'shipped': return '🚚';
            case 'processing': return '⏳';
            case 'cancelled': return '❌';
            default: return '📦';
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const handleViewDetails = (order) => {
        setSelectedOrder(order);
    };

    const closeOrderDetails = () => {
        setSelectedOrder(null);
    };

    // Loading state
    if (loading) {
        return (
            <div className="orders-container">
                <div className="orders-loading">
                    <div className="spinner"></div>
                    <h2>Loading your orders...</h2>
                    <p>Please wait while we fetch your order history.</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="orders-container">
                <div className="orders-error">
                    <h2>Oops! Something went wrong</h2>
                    <p>{error}</p>
                    <button 
                        className="btn btn-primary"
                        onClick={() => window.location.reload()}
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    // Empty orders state
    if (orders.length === 0) {
        return (
            <div className="orders-container">
                <div className="orders-empty">
                    <div className="empty-icon">📦</div>
                    <h2>No orders yet</h2>
                    <p>You haven't placed any orders yet. Start shopping to see your orders here!</p>
                    <a href="/products" className="btn btn-primary btn-lg">
                        Start Shopping
                    </a>
                </div>
            </div>
        );
    }

    // Order details modal
    if (selectedOrder) {
        return (
            <div className="orders-container">
                <div className="order-details-modal">
                    <div className="modal-overlay" onClick={closeOrderDetails}></div>
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>Order Details</h2>
                            <button className="close-btn" onClick={closeOrderDetails}>×</button>
                        </div>
                        
                        <div className="modal-body">
                            <div className="order-summary">
                                <div className="order-info-grid">
                                    <div className="info-item">
                                        <label>Order ID:</label>
                                        <span>{selectedOrder.id}</span>
                                    </div>
                                    <div className="info-item">
                                        <label>Date:</label>
                                        <span>{formatDate(selectedOrder.date)}</span>
                                    </div>
                                    <div className="info-item">
                                        <label>Status:</label>
                                        <span className="status-badge" style={{ backgroundColor: getStatusColor(selectedOrder.status) }}>
                                            {getStatusIcon(selectedOrder.status)} {selectedOrder.status.toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="info-item">
                                        <label>Payment:</label>
                                        <span>{selectedOrder.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Card Payment'}</span>
                                    </div>
                                    <div className="info-item">
                                        <label>Total:</label>
                                        <span className="total-amount">${selectedOrder.total.toFixed(2)}</span>
                                    </div>
                                    {selectedOrder.tracking && (
                                        <div className="info-item">
                                            <label>Tracking:</label>
                                            <span className="tracking-number">{selectedOrder.tracking}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="order-items-section">
                                <h3>Items Ordered</h3>
                                <div className="order-items-list">
                                    {selectedOrder.items.map(item => (
                                        <div key={item.id} className="order-item-detail">
                                            <img 
                                                src={item.image} 
                                                alt={item.name}
                                                onError={(e) => {
                                                    e.target.src = '/placeholder-image.jpg';
                                                }}
                                            />
                                            <div className="item-info">
                                                <h4>{item.name}</h4>
                                                <p>Quantity: {item.quantity}</p>
                                                <p className="item-price">${item.price.toFixed(2)}</p>
                                            </div>
                                            <div className="item-total">
                                                ${(item.price * item.quantity).toFixed(2)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="shipping-info-section">
                                <h3>Shipping Address</h3>
                                <div className="shipping-address">
                                    <p>{selectedOrder.shipping.firstName} {selectedOrder.shipping.lastName}</p>
                                    <p>{selectedOrder.shipping.address}</p>
                                    <p>{selectedOrder.shipping.city}, {selectedOrder.shipping.state} {selectedOrder.shipping.zipCode}</p>
                                </div>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button className="btn btn-outline" onClick={closeOrderDetails}>
                                Close
                            </button>
                            {selectedOrder.tracking && (
                                <button className="btn btn-primary">
                                    Track Package
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Main orders list
    return (
        <div className="orders-container fade-in">
            <div className="orders-header">
                <h1>My Orders</h1>
                <p>Track and manage your orders</p>
            </div>

            <div className="orders-stats">
                <div className="stat-card">
                    <div className="stat-number">{orders.length}</div>
                    <div className="stat-label">Total Orders</div>
                </div>
                <div className="stat-card">
                    <div className="stat-number">{orders.filter(o => o.status === 'delivered').length}</div>
                    <div className="stat-label">Delivered</div>
                </div>
                <div className="stat-card">
                    <div className="stat-number">{orders.filter(o => o.status === 'shipped').length}</div>
                    <div className="stat-label">Shipped</div>
                </div>
                <div className="stat-card">
                    <div className="stat-number">{orders.filter(o => o.status === 'processing').length}</div>
                    <div className="stat-label">Processing</div>
                </div>
            </div>

            <div className="orders-list">
                {orders.map(order => (
                    <div key={order.id} className="order-card">
                        <div className="order-header">
                            <div className="order-id">
                                <h3>Order #{order.id}</h3>
                                <p>Placed on {formatDate(order.date)}</p>
                            </div>
                            <div className="order-status">
                                <span 
                                    className="status-badge"
                                    style={{ backgroundColor: getStatusColor(order.status) }}
                                >
                                    {getStatusIcon(order.status)} {order.status.toUpperCase()}
                                </span>
                            </div>
                        </div>

                        <div className="order-items-preview">
                            <div className="items-grid">
                                {order.items.slice(0, 3).map(item => (
                                    <div key={item.id} className="item-preview">
                                        <img 
                                            src={item.image} 
                                            alt={item.name}
                                            onError={(e) => {
                                                e.target.src = '/placeholder-image.jpg';
                                            }}
                                        />
                                        <div className="item-details">
                                            <h4>{item.name}</h4>
                                            <p>Qty: {item.quantity}</p>
                                        </div>
                                    </div>
                                ))}
                                {order.items.length > 3 && (
                                    <div className="more-items">
                                        +{order.items.length - 3} more
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="order-footer">
                            <div className="order-total">
                                <span className="total-label">Total: </span>
                                <span className="total-amount">${order.total.toFixed(2)}</span>
                            </div>
                            <div className="order-actions">
                                <button 
                                    className="btn btn-outline"
                                    onClick={() => handleViewDetails(order)}
                                >
                                    View Details
                                </button>
                                {order.tracking && (
                                    <button className="btn btn-primary">
                                        Track Order
                                    </button>
                                )}
                                {order.status === 'delivered' && (
                                    <button className="btn btn-secondary">
                                        Reorder
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Orders;
