import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Home = () => {
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchFeaturedProducts();
    }, []);

    const fetchFeaturedProducts = async () => {
        try {
            // 🔥 FIXED: Use full URL instead of relative path
            const response = await axios.get('http://localhost:5000/api/products?limit=6');
            
            // 🔥 FIXED: Handle response data format properly
            console.log('Featured products response:', response.data);
            const products = response.data.data || response.data || [];
            setFeaturedProducts(products.slice(0, 6));
        } catch (error) {
            console.error('Error fetching featured products:', error);
            setFeaturedProducts([]); // Set empty array on error
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="home fade-in">
            {/* Hero Section */}
            <section className="hero">
                <div className="container">
                    <h1 className="hero-title">Welcome to LuxeShop</h1>
                    <p className="hero-subtitle">
                        Discover premium products with unmatched quality and style. 
                        Your luxury shopping destination awaits.
                    </p>
                    <Link to="/products" className="btn btn-primary">
                        Shop Now
                    </Link>
                </div>
            </section>

            {/* Featured Products */}
            <section className="featured-products" style={{ padding: '4rem 2rem' }}>
                <div className="container">
                    <h2 className="text-center text-gold mb-4" style={{ fontSize: '2.5rem' }}>
                        Featured Products
                    </h2>
                    
                    {loading ? (
                        <div className="loading">
                            <div className="spinner"></div>
                        </div>
                    ) : featuredProducts.length === 0 ? (
                        // 🔥 ADDED: Handle empty products case
                        <div className="text-center">
                            <p className="text-white mb-4">No featured products available at the moment.</p>
                            <Link to="/products" className="btn btn-primary">
                                Browse All Products
                            </Link>
                        </div>
                    ) : (
                        <div className="products-grid">
                            {featuredProducts.map(product => (
                                <div key={product.id} className="product-card slide-in">
                                    <img 
                                        src={product.image_url || 'https://via.placeholder.com/300x250'} 
                                        alt={product.name}
                                        className="product-image"
                                        onError={(e) => {
                                            e.target.src = 'https://via.placeholder.com/300x250?text=No+Image';
                                        }}
                                    />
                                    <div className="product-info">
                                        <h3 className="product-title">{product.name}</h3>
                                        <p className="product-description">
                                            {product.description?.substring(0, 100)}
                                            {product.description?.length > 100 ? '...' : ''}
                                        </p>
                                        <div className="product-price">
                                            ${parseFloat(product.price).toFixed(2)}
                                        </div>
                                        {/* 🔥 ADDED: Stock info */}
                                        <div className="mb-2">
                                            <small className="text-white">
                                                Stock: {product.stock_quantity} | 
                                                Category: {product.category_name || 'Uncategorized'}
                                            </small>
                                        </div>
                                        <Link 
                                            to={`/products/${product.id}`} 
                                            className="btn btn-primary w-100"
                                        >
                                            View Details
                                        </Link>
                                        {/* 🔥 ADDED: Out of stock indicator */}
                                        {product.stock_quantity === 0 && (
                                            <div className="text-center mt-2">
                                                <span style={{ color: '#dc3545', fontWeight: 'bold' }}>
                                                    Out of Stock
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    
                    <div className="text-center mt-4">
                        <Link to="/products" className="btn btn-secondary">
                            View All Products
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="features" style={{ 
                background: 'var(--secondary-black)', 
                padding: '4rem 2rem',
                borderTop: '2px solid var(--primary-gold)'
            }}>
                <div className="container">
                    <div className="admin-grid">
                        <div className="card text-center">
                            <h3 className="text-gold mb-2">🚚 Free Shipping</h3>
                            <p>Free shipping on orders over $50</p>
                        </div>
                        <div className="card text-center">
                            <h3 className="text-gold mb-2">🔒 Secure Payment</h3>
                            <p>Your payment information is safe with us</p>
                        </div>
                        <div className="card text-center">
                            <h3 className="text-gold mb-2">⭐ Premium Quality</h3>
                            <p>Only the finest products make it to our store</p>
                        </div>
                        <div className="card text-center">
                            <h3 className="text-gold mb-2">📞 24/7 Support</h3>
                            <p>Customer support available around the clock</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
