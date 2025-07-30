import React, { useState } from 'react';
import './Orders.css';

const Orders = () => {
    const [selectedOrder, setSelectedOrder] = useState(null);

    // Sample orders data - available immediately
    const orders = [
        {
            id: 'ORD-2024-001',
            date: '2024-01-15',
            status: 'delivered',
            total: 299.99,
            trackingNumber: 'TRK123456789',
            shippingAddress: {
                name: 'John Doe',
                street: '123 Main Street',
                city: 'New York',
                state: 'NY',
                zip: '10001',
                country: 'USA'
            },
            items: [
                {
                    id: 1,
                    name: 'Premium Wireless Headphones',
                    price: 199.99,
                    quantity: 1,
                    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop'
                },
                {
                    id: 2,
                    name: 'Phone Case',
                    price: 29.99,
                    quantity: 2,
                    image: 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=400&h=400&fit=crop'
                }
            ]
        },
        {
            id: 'ORD-2024-002',
            date: '2024-01-20',
            status: 'shipped',
            total: 149.99,
            trackingNumber: 'TRK987654321',
            shippingAddress: {
                name: 'John Doe',
                street: '123 Main Street',
                city: 'New York',
                state: 'NY',
                zip: '10001',
                country: 'USA'
            },
            items: [
                {
                    id: 3,
                    name: 'Smart Watch',
                    price: 149.99,
                    quantity: 1,
                    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop'
                }
            ]
        },
        {
            id: 'ORD-2024-003',
            date: '2024-01-25',
            status: 'processing',
            total: 89.97,
            trackingNumber: null,
            shippingAddress: {
                name: 'John Doe',
                street: '123 Main Street',
                city: 'New York',
                state: 'NY',
                zip: '10001',
                country: 'USA'
            },
            items: [
                {
                    id: 4,
                    name: 'Bluetooth Speaker',
                    price: 79.99,
                    quantity: 1,
                    image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=400&fit=crop'
                },
                {
                    id: 5,
                    name: 'USB Cable',
                    price: 9.99,
                    quantity: 1,
                    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop'
                }
            ]
        },
        {
            id: 'ORD-2024-004',
            date: '2024-01-28',
            status: 'pending',
            total: 449.99,
            trackingNumber: null,
            shippingAddress: {
                name: 'John Doe',
                street: '123 Main Street',
                city: 'New York',
                state: 'NY',
                zip: '10001',
                country: 'USA'
            },
            items: [
                {
                    id: 6,
                    name: 'Gaming Laptop',
                    price: 449.99,
                    quantity: 1,
                    image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=400&fit=crop'
                }
            ]
        }
    ];

    // Get status badge color
    const getStatusColor = (status) => {
        const colors = {
            pending: '#ffc107',
            processing: '#17a2b8',
            shipped: '#007bff',
            delivered: '#28a745',
            cancelled: '#dc3545'
        };
        return { backgroundColor: colors[status] || '#6c757d' };
    };

    // Calculate order statistics
    const getOrderStats = () => {
        return {
            total: orders.length,
            pending: orders.filter(order => order.status === 'pending').length,
            processing: orders.filter(order => order.status === 'processing').length,
            shipped: orders.filter(order => order.status === 'shipped').length,
            delivered: orders.filter(order => order.status === 'delivered').length
        };
    };

    const stats = getOrderStats();

    return (
        <div className="orders-container fade-in">
            {/* Header */}
            <div className="orders-header">
                <h1>My Orders</h1>
                <p>Track and manage all your orders in one place</p>
            </div>

            {/* Statistics */}
            <div className="orders-stats">
                <div className="stat-card">
                    <div className="stat-number">{stats.total}</div>
                    <div className="stat-label">Total Orders</div>
                </div>
                <div className="stat-card">
                    <div className="stat-number">{stats.pending}</div>
                    <div className="stat-label">Pending</div>
                </div>
                <div className="stat-card">
                    <div className="stat-number">{stats.processing}</div>
                    <div className="stat-label">Processing</div>
                </div>
                <div className="stat-card">
                    <div className="stat-number">{stats.shipped}</div>
                    <div className="stat-label">Shipped</div>
                </div>
                <div className="stat-card">
                    <div className="stat-number">{stats.delivered}</div>
                    <div className="stat-label">Delivered</div>
                </div>
            </div>

            {/* Orders List */}
            <div className="orders-list">
                {orders.map(order => (
                    <div key={order.id} className="order-card">
                        {/* Order Header */}
                        <div className="order-header">
                            <div className="order-id">
                                <h3>Order #{order.id}</h3>
                                <p>Placed on {new Date(order.date).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}</p>
                            </div>
                            <div className="status-badge" style={getStatusColor(order.status)}>
                                {order.status.toUpperCase()}
                            </div>
                        </div>

                        {/* Order Items Preview */}
                        <div className="order-items-preview">
                            <div className="items-grid">
                                {order.items.slice(0, 3).map(item => (
                                    <div key={item.id} className="item-preview">
                                        <img src={item.image} alt={item.name} />
                                        <div className="item-details">
                                            <h4>{item.name}</h4>
                                            <p>Qty: {item.quantity} × ${item.price}</p>
                                        </div>
                                    </div>
                                ))}
                                {order.items.length > 3 && (
                                    <div className="more-items">
                                        +{order.items.length - 3} more items
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Order Footer */}
                        <div className="order-footer">
                            <div className="order-total">
                                <span className="total-label">Total: </span>
                                <span className="total-amount">${order.total}</span>
                            </div>
                            <div className="order-actions">
                                <button 
                                    className="btn btn-primary"
                                    onClick={() => setSelectedOrder(order)}
                                >
                                    View Details
                                </button>
                                {order.trackingNumber && (
                                    <button className="btn btn-secondary">
                                        Track Order
                                    </button>
                                )}
                                <button className="btn btn-outline">
                                    Reorder
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Order Details Modal */}
            {selectedOrder && (
                <div className="order-details-modal">
                    <div className="modal-overlay" onClick={() => setSelectedOrder(null)}></div>
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>Order Details - #{selectedOrder.id}</h2>
                            <button 
                                className="close-btn"
                                onClick={() => setSelectedOrder(null)}
                            >
                                ×
                            </button>
                        </div>
                        
                        <div className="modal-body">
                            {/* Order Information */}
                            <div className="order-info-grid">
                                <div className="info-item">
                                    <label>Order Date</label>
                                    <span>{new Date(selectedOrder.date).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}</span>
                                </div>
                                <div className="info-item">
                                    <label>Status</label>
                                    <span className="status-badge" style={getStatusColor(selectedOrder.status)}>
                                        {selectedOrder.status.toUpperCase()}
                                    </span>
                                </div>
                                <div className="info-item">
                                    <label>Total Amount</label>
                                    <span>${selectedOrder.total}</span>
                                </div>
                                {selectedOrder.trackingNumber && (
                                    <div className="info-item">
                                        <label>Tracking Number</label>
                                        <span className="tracking-number">{selectedOrder.trackingNumber}</span>
                                    </div>
                                )}
                            </div>

                            {/* Order Items */}
                            <div className="order-items-section">
                                <h3>Items Ordered ({selectedOrder.items.length})</h3>
                                <div className="order-items-list">
                                    {selectedOrder.items.map(item => (
                                        <div key={item.id} className="order-item-detail">
                                            <img src={item.image} alt={item.name} />
                                            <div className="item-info">
                                                <h4>{item.name}</h4>
                                                <p className="item-price">Price: ${item.price}</p>
                                                <p>Quantity: {item.quantity}</p>
                                                <p className="item-total">Subtotal: ${(item.price * item.quantity).toFixed(2)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Shipping Information */}
                            <div className="shipping-info-section">
                                <h3>Shipping Address</h3>
                                <div className="shipping-address">
                                    <p><strong>{selectedOrder.shippingAddress.name}</strong></p>
                                    <p>{selectedOrder.shippingAddress.street}</p>
                                    <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.zip}</p>
                                    <p>{selectedOrder.shippingAddress.country}</p>
                                </div>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button className="btn btn-outline" onClick={() => setSelectedOrder(null)}>
                                Close
                            </button>
                            {selectedOrder.trackingNumber && (
                                <button className="btn btn-secondary">
                                    Track Package
                                </button>
                            )}
                            <button className="btn btn-primary">
                                Reorder Items
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Orders;
