import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.email || !formData.password) {
            toast.error('Please fill in all fields');
            return;
        }

        setLoading(true);
        
        try {
            // Pass the entire formData object instead of separate parameters
            const result = await login(formData);
            
            if (result.success) {
                toast.success('Login successful!');
                navigate('/');
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            console.error('Login error:', error);
            toast.error('Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page fade-in">
            <div className="form-container">
                <h2 className="text-center text-gold mb-4" style={{ fontSize: '2rem' }}>
                    Welcome Back
                </h2>
                <p className="text-center mb-4" style={{ color: 'var(--secondary-white)' }}>
                    Sign in to your account to continue shopping
                </p>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="email" className="form-label">Email Address</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="form-input"
                            placeholder="Enter your email"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password" className="form-label">Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="form-input"
                            placeholder="Enter your password"
                            required
                        />
                    </div>

                    <button 
                        type="submit" 
                        className="btn btn-primary w-100 mb-3"
                        disabled={loading}
                        style={{ fontSize: '1.1rem', padding: '0.75rem' }}
                    >
                        {loading ? 'Signing In...' : 'Sign In'}
                    </button>
                </form>

                <div className="text-center">
                    <p style={{ color: 'var(--secondary-white)' }}>
                        Don't have an account?{' '}
                        <Link to="/register" className="text-gold" style={{ textDecoration: 'none' }}>
                            Create Account
                        </Link>
                    </p>
                </div>

                {/* Demo Credentials */}
                <div className="mt-4 p-3" style={{ 
                    background: 'rgba(255, 215, 0, 0.1)', 
                    borderRadius: '10px',
                    border: '1px solid rgba(255, 215, 0, 0.3)'
                }}>
                    <h4 className="text-gold mb-2">Demo Credentials:</h4>
                    <p className="mb-1"><strong>Admin:</strong> admin@example.com / admin123</p>
                    <p className="mb-0"><strong>User:</strong> john@example.com / user123</p>
                </div>
            </div>
        </div>
    );
};

export default Login;
