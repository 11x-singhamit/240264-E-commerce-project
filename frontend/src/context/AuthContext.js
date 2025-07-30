import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Check if user is logged in on app start
    useEffect(() => {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        
        if (token && userData) {
            try {
                const parsedUser = JSON.parse(userData);
                setUser(parsedUser);
                // Set default authorization header
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            } catch (error) {
                console.error('Error parsing user data:', error);
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                delete axios.defaults.headers.common['Authorization'];
            }
        }
        setLoading(false);
    }, []);

    const register = async (userData) => {
        try {
            const response = await axios.post('http://localhost:5000/api/auth/register', userData);
            return { success: true, data: response.data };
        } catch (error) {
            return { 
                success: false, 
                message: error.response?.data?.message || 'Registration failed' 
            };
        }
    };

    const login = async (credentials) => {
        try {
            const response = await axios.post('http://localhost:5000/api/auth/login', credentials);
            const { token, user: userData } = response.data;
            
            // Store token and user data
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(userData));
            
            // Set user state
            setUser(userData);
            
            // Set default authorization header
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            
            return { success: true, data: response.data };
        } catch (error) {
            return { 
                success: false, 
                message: error.response?.data?.message || 'Login failed' 
            };
        }
    };

    // Update Profile function
    const updateProfile = async (profileData) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                return { success: false, message: 'Not authenticated' };
            }

            const response = await axios.put(
                'http://localhost:5000/api/auth/profile', 
                profileData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            // Update user state with new data
            const updatedUser = response.data.user;
            setUser(updatedUser);
            
            // Update localStorage
            localStorage.setItem('user', JSON.stringify(updatedUser));

            return { success: true, data: response.data };
        } catch (error) {
            return { 
                success: false, 
                message: error.response?.data?.message || 'Profile update failed' 
            };
        }
    };

    // Check if user is authenticated
    const isAuthenticated = () => {
        const token = localStorage.getItem('token');
        return !!(token && user);
    };

    // Get current user's role
    const getUserRole = () => {
        return user?.role || null;
    };

    // Check if user is admin
    const isAdmin = () => {
        return user?.role === 'admin';
    };

    // Refresh user data from server
    const refreshUser = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                return { success: false, message: 'Not authenticated' };
            }

            const response = await axios.get(
                'http://localhost:5000/api/auth/me',
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            const userData = response.data.user;
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));

            return { success: true, data: userData };
        } catch (error) {
            // If token is invalid, logout user
            if (error.response?.status === 401 || error.response?.status === 403) {
                logout();
            }
            return { 
                success: false, 
                message: error.response?.data?.message || 'Failed to refresh user data' 
            };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        delete axios.defaults.headers.common['Authorization'];
    };

    // Manual user update (for components that update user data directly)
    const updateUser = (updatedUserData) => {
        setUser(updatedUserData);
        localStorage.setItem('user', JSON.stringify(updatedUserData));
    };

    const value = {
        user,
        loading,
        register,
        login,
        logout,
        updateProfile,
        updateUser,
        isAuthenticated,
        getUserRole,
        isAdmin,
        refreshUser
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

// Export the context itself for backward compatibility
export { AuthContext };
