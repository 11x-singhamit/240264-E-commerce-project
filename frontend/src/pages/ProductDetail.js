import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useCart } from '../context/CartContext';
import { toast } from 'react-toastify';
import '../styles/ProductDetail.css';

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const [product, setProduct] = useState(null);
    const [category, setCategory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [addingToCart, setAddingToCart] = useState(false);

    useEffect(() => {
        console.log('📱 ProductDetail mounted');
        console.log('🆔 Product ID from params:', id);
        console.log('🔗 Current URL:', window.location.href);
        
        if (!id) {
            console.error('❌ No product ID found in URL params');
            toast.error('Product ID is required');
            navigate('/products');
            return;
        }
        
        fetchProduct();
    }, [id, navigate]);

    const fetchProduct = async () => {
        try {
            console.log('🔄 Fetching product with ID:', id);
            setLoading(true);
            
            const response = await api.get(`/api/products/${id}`);
            console.log('📦 Product detail response:', response.data);

            if (response.data.success && response.data.data) {
                setProduct(response.data.data);
                console.log('✅ Product loaded successfully:', response.data.data);
                
                // Fetch category info if product has category_id
                if (response.data.data.category_id) {
                    fetchCategory(response.data.data.category_id);
                }
            } else {
                console.error('❌ Product not found in response');
                toast.error('Product not found');
                navigate('/products');
            }
        } catch (error) {
            console.error('❌ Fetch product error:', error);
            console.error('❌ Error details:', {
                status: error.response?.status,
                message: error.response?.data?.message,
                url: error.config?.url
            });
            
            if (error.response?.status === 404) {
                toast.error('Product not found');
            } else {
                toast.error('Failed to load product');
            }
            navigate('/products');
        } finally {
            setLoading(false);
        }
    };

    const fetchCategory = async (categoryId) => {
        try {
            console.log('🔄 Fetching category:', categoryId);
            const response = await api.get(`/api/categories/${categoryId}`);
            if (response.data.success) {
                setCategory(response.data.data);
                console.log('✅ Category loaded:', response.data.data);
            }
        } catch (error) {
            console.error('❌ Fetch category error:', error);
        }
    };

    const handleAddToCart = async () => {
        console.log('🛒 Add to cart clicked');
        console.log('📦 Product:', product);
        console.log('🔢 Quantity:', quantity);
        
        if (!product || !product.id) {
            console.error('❌ No product or product ID');
            toast.error('Product information is missing');
            return;
        }

        if (quantity > product.stock_quantity) {
            toast.error('Not enough stock available');
            return;
        }

        console.log('➕ Adding to cart:', { productId: product.id, quantity });
        setAddingToCart(true);
        
        const success = await addToCart(product.id, quantity);
        console.log('🛒 Add to cart result:', success);
        
        if (success) {
            setQuantity(1); // Reset quantity after successful add
        }
        setAddingToCart(false);
    };

    const handleQuantityChange = (newQuantity) => {
        console.log('🔢 Quantity change:', { from: quantity, to: newQuantity });
        if (newQuantity >= 1 && newQuantity <= product.stock_quantity) {
            setQuantity(newQuantity);
        }
    };

    if (loading) {
        return (
            <div className="product-detail-page">
                <div className="container">
                    <div className="loading-spinner" style={{ textAlign: 'center', padding: '2rem' }}>
                        <div className="spinner-border text-warning" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="text-gold mt-2">Loading product...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="product-detail-page">
                <div className="container">
                    <div className="product-not-found" style={{ textAlign: 'center', padding: '2rem' }}>
                        <h2 className="text-gold">Product Not Found</h2>
                        <p className="text-light">The product you're looking for doesn't exist.</p>
                        <button onClick={() => navigate('/products')} className="btn btn-primary">
                            Back to Products
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="product-detail-page fade-in">
            <div className="container">
                {/* Debug Info (remove in production) */}
                <div style={{ 
                    background: 'rgba(255,255,0,0.1)', 
                    padding: '0.5rem', 
                    margin: '1rem 0', 
                    borderRadius: '4px',
                    fontSize: '0.8rem',
                    color: 'yellow'
                }}>
                    <strong>Debug:</strong> ID={id}, Product ID={product?.id}, Name={product?.name}
                </div>

                {/* Breadcrumb */}
                <div className="breadcrumb">
                    <button onClick={() => navigate('/products')} className="breadcrumb-link">
                        Products
                    </button>
                    <span className="breadcrumb-separator">›</span>
                    {category && (
                        <>
                            <span className="breadcrumb-item">{category.name}</span>
                            <span className="breadcrumb-separator">›</span>
                        </>
                    )}
                    <span className="breadcrumb-current">{product.name}</span>
                </div>

                <div className="product-detail-content">
                    {/* Product Image */}
                    <div className="product-image-section">
                        <div className="product-image-main">
                            <img
                                src={product.image_url || '/placeholder-image.jpg'}
                                alt={product.name}
                                onError={(e) => {
                                    e.target.src = '/placeholder-image.jpg';
                                }}
                            />
                        </div>
                    </div>

                    {/* Product Info */}
                    <div className="product-info-section">
                        {category && (
                            <div className="product-category">
                                {category.name}
                            </div>
                        )}
                        
                        <h1 className="product-title">{product.name}</h1>
                        
                        <div className="product-price">
                            ${parseFloat(product.price || 0).toFixed(2)}
                        </div>

                        <div className="product-stock">
                            {product.stock_quantity > 0 ? (
                                <span className="in-stock">
                                    ✓ {product.stock_quantity} in stock
                                </span>
                            ) : (
                                <span className="out-of-stock">
                                    ✗ Out of stock
                                </span>
                            )}
                        </div>

                        <div className="product-description">
                            <h3>Description</h3>
                            <p>{product.description || 'No description available.'}</p>
                        </div>

                        {product.stock_quantity > 0 && (
                            <div className="product-actions">
                                <div className="quantity-selector">
                                    <label>Quantity:</label>
                                    <div className="quantity-controls">
                                        <button
                                            onClick={() => handleQuantityChange(quantity - 1)}
                                            disabled={quantity <= 1}
                                            className="quantity-btn"
                                        >
                                            -
                                        </button>
                                        <span className="quantity-display">{quantity}</span>
                                        <button
                                            onClick={() => handleQuantityChange(quantity + 1)}
                                            disabled={quantity >= product.stock_quantity}
                                            className="quantity-btn"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>

                                <button
                                    onClick={handleAddToCart}
                                    disabled={addingToCart}
                                    className="btn btn-primary btn-large add-to-cart-btn"
                                >
                                    {addingToCart ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2"></span>
                                            Adding...
                                        </>
                                    ) : (
                                        'Add to Cart'
                                    )}
                                </button>
                            </div>
                        )}

                        <div className="product-meta">
                            <div className="meta-item">
                                <strong>Product ID:</strong> {product.id}
                            </div>
                            {category && (
                                <div className="meta-item">
                                    <strong>Category:</strong> {category.name}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;
