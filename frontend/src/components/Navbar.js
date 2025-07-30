import React, { useContext, useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleLogout = () => {
        logout();
        setShowDropdown(false);
        navigate('/');
    };

    const toggleDropdown = () => {
        setShowDropdown(!showDropdown);
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link to="/" className="navbar-brand">
                    ✨ LuxeShop
                </Link>
                
                <div className="navbar-menu">
                    <Link to="/" className="navbar-link">Home</Link>
                    <Link to="/products" className="navbar-link">Products</Link>
                    
                    {user ? (
                        // User is logged in - show profile dropdown
                        <div className="profile-dropdown" ref={dropdownRef}>
                            <button 
                                className="profile-button"
                                onClick={toggleDropdown}
                            >
                                <div className="profile-avatar">
                                    {user.firstName ? user.firstName.charAt(0).toUpperCase() : user.username.charAt(0).toUpperCase()}
                                </div>
                                <span className="profile-name">
                                    {user.firstName ? `${user.firstName} ${user.lastName}` : user.username}
                                </span>
                                <svg 
                                    className={`dropdown-arrow ${showDropdown ? 'rotated' : ''}`}
                                    width="12" 
                                    height="12" 
                                    viewBox="0 0 12 12"
                                >
                                    <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="2" fill="none"/>
                                </svg>
                            </button>
                            
                            {showDropdown && (
                                <div className="dropdown-menu">
                                    <div className="dropdown-header">
                                        <div className="dropdown-avatar">
                                            {user.firstName ? user.firstName.charAt(0).toUpperCase() : user.username.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="dropdown-info">
                                            <div className="dropdown-name">
                                                {user.firstName ? `${user.firstName} ${user.lastName}` : user.username}
                                            </div>
                                            <div className="dropdown-email">{user.email}</div>
                                        </div>
                                    </div>
                                    
                                    <div className="dropdown-divider"></div>
                                    
                                    <Link 
                                        to="/profile" 
                                        className="dropdown-item"
                                        onClick={() => setShowDropdown(false)}
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                                        </svg>
                                        My Profile
                                    </Link>
                                    
                                    <Link 
                                        to="/orders" 
                                        className="dropdown-item"
                                        onClick={() => setShowDropdown(false)}
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M7 4V2C7 1.45 7.45 1 8 1H16C16.55 1 17 1.45 17 2V4H20C20.55 4 21 4.45 21 5S20.55 6 20 6H19V19C19 20.1 18.1 21 17 21H7C5.9 21 5 20.1 5 19V6H4C3.45 6 3 5.55 3 5S3.45 4 4 4H7ZM9 3V4H15V3H9ZM7 6V19H17V6H7Z"/>
                                        </svg>
                                        My Orders
                                    </Link>
                                    
                                    <Link 
                                        to="/cart" 
                                        className="dropdown-item"
                                        onClick={() => setShowDropdown(false)}
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M7 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12L8.1 13h7.45c.75 0 1.41-.41 1.75-1.03L21.7 4H5.21l-.94-2H1zm16 16c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                                        </svg>
                                        Shopping Cart
                                    </Link>
                                    
                                    {user.role === 'admin' && (
                                        <>
                                            <div className="dropdown-divider"></div>
                                            <Link 
                                                to="/admin" 
                                                className="dropdown-item admin-item"
                                                onClick={() => setShowDropdown(false)}
                                            >
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                                    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
                                                </svg>
                                                Admin Panel
                                            </Link>
                                        </>
                                    )}
                                    
                                    <div className="dropdown-divider"></div>
                                    
                                    <button 
                                        className="dropdown-item logout-item"
                                        onClick={handleLogout}
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.59L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
                                        </svg>
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        // User is not logged in - show login/register buttons
                        <div className="auth-buttons">
                            <Link to="/login" className="login-btn">Login</Link>
                            <Link to="/register" className="register-btn">Register</Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
