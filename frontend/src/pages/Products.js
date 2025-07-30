import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { toast } from 'react-toastify';
import '../styles/Products.css';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('name');
    const [sortOrder, setSortOrder] = useState('asc');

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await api.get('/api/products');
            console.log('Products response:', response.data);
            
            if (Array.isArray(response.data)) {
                setProducts(response.data);
            } else if (response.data.success && Array.isArray(response.data.data)) {
                setProducts(response.data.data);
            } else {
                setProducts([]);
            }
        } catch (error) {
            console.error('Fetch products error:', error);
            toast.error('Failed to load products');
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await api.get('/api/categories');
            if (Array.isArray(response.data)) {
                setCategories(response.data);
            } else if (response.data.success && Array.isArray(response.data.data)) {
                setCategories(response.data.data);
            } else {
                setCategories([]);
            }
        } catch (error) {
            console.error('Fetch categories error:', error);
            setCategories([]);
        }
    };

    // Filter and sort products
    const filteredProducts = products
        .filter(product => {
            const matchesCategory = !selectedCategory || product.category_id === parseInt(selectedCategory);
            const matchesSearch = !searchTerm || 
                product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.description.toLowerCase().includes(searchTerm.toLowerCase());
            const inStock = product.stock_quantity > 0;
            return matchesCategory && matchesSearch && inStock;
        })
        .sort((a, b) => {
            let aValue = a[sortBy];
            let bValue = b[sortBy];
            
            if (sortBy === 'price') {
                aValue = parseFloat(aValue) || 0;
                bValue = parseFloat(bValue) || 0;
            } else if (typeof aValue === 'string') {
                aValue = aValue.toLowerCase();
                bValue = bValue.toLowerCase();
            }
            
            if (sortOrder === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });

    const addToCart = async (productId) => {
        try {
            const response = await api.post('/api/cart', {
                product_id: productId,
                quantity: 1
            });
            
            if (response.data.success) {
                toast.success('Product added to cart!');
            }
        } catch (error) {
            console.error('Add to cart error:', error);
            if (error.response?.status === 401) {
                toast.error('Please login to add items to cart');
            } else {
                toast.error('Failed to add product to cart');
            }
        }
    };

    const getCategoryName = (categoryId) => {
        const category = categories.find(cat => cat.id === categoryId);
        return category ? category.name : 'Uncategorized';
    };

    if (loading) {
        return (
            <div className="products-page">
                <div className="container">
                    <div className="loading-spinner">
                        <div className="spinner"></div>
                        <p>Loading products...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="products-page fade-in">
            {/* Header */}
            <div className="products-header">
                <div className="container">
                    <h1 className="products-title">Our Products</h1>
                    <p className="products-subtitle">
                        Discover our amazing collection of premium products
                    </p>
                </div>
            </div>

            <div className="container">
                {/* Filters & Search */}
                <div className="products-filters">
                    <div className="filters-row">
                        <div className="search-box">
                            <input
                                type="text"
                                placeholder="Search products..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="search-input"
                            />
                        </div>

                        <div className="filter-group">
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="filter-select"
                            >
                                <option value="">All Categories</option>
                                {categories.map(category => (
                                    <option key={category.id} value={category.id}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="sort-group">
                            <select
                                value={`${sortBy}-${sortOrder}`}
                                onChange={(e) => {
                                    const [field, order] = e.target.value.split('-');
                                    setSortBy(field);
                                    setSortOrder(order);
                                }}
                                className="sort-select"
                            >
                                <option value="name-asc">Name (A-Z)</option>
                                <option value="name-desc">Name (Z-A)</option>
                                <option value="price-asc">Price (Low to High)</option>
                                <option value="price-desc">Price (High to Low)</option>
                            </select>
                        </div>
                    </div>

                    <div className="results-info">
                        <span>{filteredProducts.length} products found</span>
                    </div>
                </div>

                {/* Products Grid */}
                {filteredProducts.length === 0 ? (
                    <div className="no-products">
                        <div className="no-products-content">
                            <h3>No Products Found</h3>
                            <p>Try adjusting your search criteria or browse all categories.</p>
                            <button 
                                onClick={() => {
                                    setSearchTerm('');
                                    setSelectedCategory('');
                                }}
                                className="btn btn-primary"
                            >
                                Clear Filters
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="products-grid">
                        {filteredProducts.map(product => (
                            <div key={product.id} className="product-card">
                                <div className="product-image">
                                    <img
                                        src={product.image_url || '/placeholder-image.jpg'}
                                        alt={product.name}
                                        onError={(e) => {
                                            e.target.src = '/placeholder-image.jpg';
                                        }}
                                    />
                                    <div className="product-overlay">
                                        <Link 
                                            to={`/product/${product.id}`}
                                            className="btn btn-secondary btn-sm"
                                        >
                                            View Details
                                        </Link>
                                    </div>
                                </div>

                                <div className="product-info">
                                    <div className="product-category">
                                        {getCategoryName(product.category_id)}
                                    </div>
                                    <h3 className="product-name">
                                        <Link to={`/product/${product.id}`}>
                                            {product.name}
                                        </Link>
                                    </h3>
                                    <p className="product-description">
                                        {product.description?.substring(0, 100)}...
                                    </p>
                                    <div className="product-footer">
                                        <div className="product-price">
                                            ${parseFloat(product.price || 0).toFixed(2)}
                                        </div>
                                        <div className="product-stock">
                                            {product.stock_quantity} in stock
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => addToCart(product.id)}
                                        className="btn btn-primary btn-block add-to-cart-btn"
                                    >
                                        Add to Cart
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Products;
