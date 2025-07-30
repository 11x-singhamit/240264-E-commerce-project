import React, { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
    const { user, isAdmin } = useAuth();
    const [activeTab, setActiveTab] = useState('products');
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [formData, setFormData] = useState({});

    // Memoize the fetch functions to prevent unnecessary re-renders
    const fetchProducts = useCallback(async () => {
        try {
            setLoading(true);
            console.log('Fetching products...');
            
            const response = await api.get('/api/products');
            console.log('Products response:', response.data);
            
            if (Array.isArray(response.data)) {
                setProducts(response.data);
            } else if (response.data.success && Array.isArray(response.data.data)) {
                setProducts(response.data.data);
            } else {
                setProducts([]);
                console.warn('Unexpected products response format:', response.data);
            }
        } catch (error) {
            console.error('Fetch products error:', error);
            toast.error('Failed to fetch products: ' + (error.response?.data?.message || error.message));
            setProducts([]);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchCategories = useCallback(async () => {
        try {
            setLoading(true);
            console.log('Fetching categories...');
            
            const response = await api.get('/api/categories');
            console.log('Categories response:', response.data);
            
            if (Array.isArray(response.data)) {
                setCategories(response.data);
            } else if (response.data.success && Array.isArray(response.data.data)) {
                setCategories(response.data.data);
            } else {
                setCategories([]);
                console.warn('Unexpected categories response format:', response.data);
            }
        } catch (error) {
            console.error('Fetch categories error:', error);
            toast.error('Failed to fetch categories: ' + (error.response?.data?.message || error.message));
            setCategories([]);
        } finally {
            setLoading(false);
        }
    }, []);

    // Fixed useEffect with proper dependencies
    useEffect(() => {
        if (isAdmin()) {
            fetchProducts();
            fetchCategories();
        }
    }, [isAdmin, fetchProducts, fetchCategories]);

    // Rest of your component remains the same...
    const handleAddProduct = () => {
        setEditingItem(null);
        setFormData({
            name: '',
            description: '',
            price: '',
            stock_quantity: '',
            category_id: '',
            image_url: ''
        });
        setShowModal(true);
    };

    const handleEditProduct = (product) => {
        setEditingItem(product);
        setFormData({
            name: product.name,
            description: product.description,
            price: product.price,
            stock_quantity: product.stock_quantity,
            category_id: product.category_id,
            image_url: product.image_url
        });
        setShowModal(true);
    };

    const handleDeleteProduct = async (productId) => {
        if (!window.confirm('Are you sure you want to delete this product?')) return;

        try {
            console.log('Deleting product:', productId);
            const response = await api.delete(`/api/products/${productId}`);
            console.log('Delete response:', response.data);
            
            toast.success('Product deleted successfully');
            fetchProducts();
        } catch (error) {
            console.error('Delete product error:', error);
            toast.error('Failed to delete product: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleSubmitProduct = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            console.log('Submitting product:', formData);
            let response;
            
            if (editingItem) {
                response = await api.put(`/api/products/${editingItem.id}`, formData);
                toast.success('Product updated successfully');
            } else {
                response = await api.post('/api/products', formData);
                toast.success('Product created successfully');
            }

            console.log('Submit response:', response.data);
            setShowModal(false);
            fetchProducts();
        } catch (error) {
            console.error('Submit product error:', error);
            toast.error('Operation failed: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    const handleAddCategory = () => {
        setEditingItem(null);
        setFormData({
            name: '',
            description: ''
        });
        setShowModal(true);
    };

    const handleEditCategory = (category) => {
        setEditingItem(category);
        setFormData({
            name: category.name,
            description: category.description
        });
        setShowModal(true);
    };

    const handleDeleteCategory = async (categoryId) => {
        if (!window.confirm('Are you sure you want to delete this category?')) return;

        try {
            console.log('Deleting category:', categoryId);
            const response = await api.delete(`/api/categories/${categoryId}`);
            console.log('Delete response:', response.data);
            
            toast.success('Category deleted successfully');
            fetchCategories();
        } catch (error) {
            console.error('Delete category error:', error);
            toast.error('Failed to delete category: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleSubmitCategory = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            console.log('Submitting category:', formData);
            let response;
            
            if (editingItem) {
                response = await api.put(`/api/categories/${editingItem.id}`, formData);
                toast.success('Category updated successfully');
            } else {
                response = await api.post('/api/categories', formData);
                toast.success('Category created successfully');
            }

            console.log('Submit response:', response.data);
            setShowModal(false);
            fetchCategories();
        } catch (error) {
            console.error('Submit category error:', error);
            toast.error('Operation failed: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    const handleFormChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingItem(null);
        setFormData({});
    };

    // Check if user is admin
    if (!isAdmin()) {
        return (
            <div className="admin-dashboard fade-in">
                <div className="container" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                    <h2 style={{ color: 'var(--primary-gold)', marginBottom: '1rem' }}>Access Denied</h2>
                    <p style={{ color: 'var(--secondary-white)' }}>
                        You don't have permission to access this page.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-dashboard fade-in">
            {/* Header */}
            <div className="admin-header">
                <div className="container">
                    <h1 className="admin-title">Admin Dashboard</h1>
                    <p style={{ color: 'var(--secondary-white)', margin: 0 }}>
                        Welcome back, {user?.username || 'admin'}! Manage your e-commerce store
                    </p>
                </div>
            </div>

            <div className="container">
                {/* Stats */}
                <div className="admin-stats">
                    <div className="stat-card">
                        <div className="stat-number">{products.length}</div>
                        <div className="stat-label">Total Products</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-number">{categories.length}</div>
                        <div className="stat-label">Categories</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-number">
                            {products.reduce((sum, product) => sum + (product.stock_quantity || 0), 0)}
                        </div>
                        <div className="stat-label">Total Stock</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-number">
                            ${products.reduce((sum, product) => {
                                const price = parseFloat(product.price) || 0;
                                const stock = product.stock_quantity || 0;
                                return sum + (price * stock);
                            }, 0).toFixed(2)}
                        </div>
                        <div className="stat-label">Inventory Value</div>
                    </div>
                </div>

                {/* Debug Info */}
                {process.env.NODE_ENV === 'development' && (
                    <div style={{ 
                        background: '#333', 
                        padding: '1rem', 
                        margin: '1rem 0', 
                        borderRadius: '5px',
                        fontSize: '0.8rem',
                        color: '#ccc'
                    }}>
                        <strong>Debug Info:</strong><br/>
                        Products: {products.length} | Categories: {categories.length} | Loading: {loading.toString()}
                    </div>
                )}

                {/* Tabs */}
                <div className="admin-tabs mb-4">
                    <button 
                        className={`btn ${activeTab === 'products' ? 'btn-primary' : 'btn-secondary'} mr-2`}
                        onClick={() => setActiveTab('products')}
                    >
                        Products ({products.length})
                    </button>
                    <button 
                        className={`btn ${activeTab === 'categories' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setActiveTab('categories')}
                    >
                        Categories ({categories.length})
                    </button>
                </div>

                {/* Products Tab */}
                {activeTab === 'products' && (
                    <div className="products-section">
                        <div className="d-flex justify-space-between align-center mb-4">
                            <h2 className="text-gold">Products Management</h2>
                            <button onClick={handleAddProduct} className="btn btn-primary">
                                Add New Product
                            </button>
                        </div>

                        {loading ? (
                            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--primary-gold)' }}>
                                Loading products...
                            </div>
                        ) : products.length === 0 ? (
                            <div style={{ 
                                textAlign: 'center', 
                                padding: '3rem', 
                                color: 'var(--secondary-white)',
                                background: 'var(--secondary-black)',
                                borderRadius: '10px',
                                border: '1px solid rgba(255, 215, 0, 0.2)'
                            }}>
                                <h3 style={{ color: 'var(--primary-gold)', marginBottom: '1rem' }}>No Products Found</h3>
                                <p>Start by adding your first product to the inventory.</p>
                                <button onClick={handleAddProduct} className="btn btn-primary" style={{ marginTop: '1rem' }}>
                                    Add First Product
                                </button>
                            </div>
                        ) : (
                            <div className="products-table">
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>Image</th>
                                            <th>Name</th>
                                            <th>Category</th>
                                            <th>Price</th>
                                            <th>Stock</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {products.map(product => (
                                            <tr key={product.id}>
                                                <td>
                                                    <img 
                                                        src={product.image_url || '/placeholder-image.jpg'} 
                                                        alt={product.name}
                                                        style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '5px' }}
                                                        onError={(e) => {
                                                            e.target.src = '/placeholder-image.jpg';
                                                        }}
                                                    />
                                                </td>
                                                <td>
                                                    <strong>{product.name}</strong>
                                                    <br />
                                                    <small style={{ color: '#ccc' }}>
                                                        {product.description?.substring(0, 50)}...
                                                    </small>
                                                </td>
                                                <td>
                                                    {categories.find(cat => cat.id === product.category_id)?.name || 'N/A'}
                                                </td>
                                                <td>${parseFloat(product.price || 0).toFixed(2)}</td>
                                                <td>
                                                    <span className={product.stock_quantity < 10 ? 'text-danger' : 'text-success'}>
                                                        {product.stock_quantity || 0}
                                                    </span>
                                                </td>
                                                <td>
                                                    <button 
                                                        onClick={() => handleEditProduct(product)}
                                                        className="btn btn-sm btn-secondary mr-2"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDeleteProduct(product.id)}
                                                        className="btn btn-sm btn-danger"
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* Categories Tab */}
                {activeTab === 'categories' && (
                    <div className="categories-section">
                        <div className="d-flex justify-space-between align-center mb-4">
                            <h2 className="text-gold">Categories Management</h2>
                            <button onClick={handleAddCategory} className="btn btn-primary">
                                Add New Category
                            </button>
                        </div>

                        {loading ? (
                            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--primary-gold)' }}>
                                Loading categories...
                            </div>
                        ) : categories.length === 0 ? (
                            <div style={{ 
                                textAlign: 'center', 
                                padding: '3rem', 
                                color: 'var(--secondary-white)',
                                background: 'var(--secondary-black)',
                                borderRadius: '10px',
                                border: '1px solid rgba(255, 215, 0, 0.2)'
                            }}>
                                <h3 style={{ color: 'var(--primary-gold)', marginBottom: '1rem' }}>No Categories Found</h3>
                                <p>Create categories to organize your products better.</p>
                                <button onClick={handleAddCategory} className="btn btn-primary" style={{ marginTop: '1rem' }}>
                                    Add First Category
                                </button>
                            </div>
                        ) : (
                            <div className="categories-grid">
                                {categories.map(category => (
                                    <div key={category.id} className="category-card">
                                        <h3>{category.name}</h3>
                                        <p>{category.description}</p>
                                        <div className="category-actions">
                                            <button 
                                                onClick={() => handleEditCategory(category)}
                                                className="btn btn-sm btn-secondary mr-2"
                                            >
                                                Edit
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteCategory(category.id)}
                                                className="btn btn-sm btn-danger"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>
                                {editingItem ? 'Edit' : 'Add'} {activeTab === 'products' ? 'Product' : 'Category'}
                            </h3>
                            <button onClick={closeModal} className="modal-close">&times;</button>
                        </div>
                        
                        <form onSubmit={activeTab === 'products' ? handleSubmitProduct : handleSubmitCategory}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label>Name *</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name || ''}
                                        onChange={handleFormChange}
                                        required
                                        className="form-control"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Description</label>
                                    <textarea
                                        name="description"
                                        value={formData.description || ''}
                                        onChange={handleFormChange}
                                        className="form-control"
                                        rows="3"
                                    />
                                </div>

                                {activeTab === 'products' && (
                                    <>
                                        <div className="form-group">
                                            <label>Price *</label>
                                            <input
                                                type="number"
                                                name="price"
                                                value={formData.price || ''}
                                                onChange={handleFormChange}
                                                step="0.01"
                                                min="0"
                                                required
                                                className="form-control"
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>Stock Quantity *</label>
                                            <input
                                                type="number"
                                                name="stock_quantity"
                                                value={formData.stock_quantity || ''}
                                                onChange={handleFormChange}
                                                min="0"
                                                required
                                                className="form-control"
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>Category</label>
                                            <select
                                                name="category_id"
                                                value={formData.category_id || ''}
                                                onChange={handleFormChange}
                                                className="form-control"
                                            >
                                                <option value="">Select Category</option>
                                                {categories.map(category => (
                                                    <option key={category.id} value={category.id}>
                                                        {category.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="form-group">
                                            <label>Image URL</label>
                                            <input
                                                type="url"
                                                name="image_url"
                                                value={formData.image_url || ''}
                                                onChange={handleFormChange}
                                                className="form-control"
                                                placeholder="https://example.com/image.jpg"
                                            />
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="modal-footer">
                                <button type="button" onClick={closeModal} className="btn btn-secondary">
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={loading}>
                                    {loading ? 'Saving...' : (editingItem ? 'Update' : 'Create')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
