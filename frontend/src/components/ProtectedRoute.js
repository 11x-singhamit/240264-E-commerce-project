import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();
    
    console.log('🔒 ProtectedRoute - loading:', loading);
    console.log('🔒 ProtectedRoute - isAuthenticated:', isAuthenticated);
    console.log('🔒 ProtectedRoute - type:', typeof isAuthenticated);

    if (loading) {
        return (
            <div className="loading">
                <div className="spinner"></div>
                <p>Loading...</p>
            </div>
        );
    }

    // Handle both boolean and function cases
    const authenticated = typeof isAuthenticated === 'function' 
        ? isAuthenticated() 
        : isAuthenticated;
    
    console.log('🔒 Final authenticated value:', authenticated);

    return authenticated ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
