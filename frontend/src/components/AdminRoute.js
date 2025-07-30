import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminRoute = ({ children }) => {
    const { user, isAuthenticated, isAdmin } = useAuth();

    if (!isAuthenticated()) {
        return <Navigate to="/login" replace />;
    }

    if (!isAdmin()) {
        return (
            <div className="access-denied">
                <div className="container" style={{ 
                    textAlign: 'center', 
                    padding: '4rem 2rem',
                    minHeight: '60vh',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center'
                }}>
                    <h2 style={{ color: 'var(--primary-gold)', marginBottom: '1rem' }}>
                        Access Denied
                    </h2>
                    <p style={{ color: 'var(--secondary-white)', marginBottom: '2rem' }}>
                        You don't have permission to access this page.
                    </p>
                    <button 
                        onClick={() => window.history.back()}
                        className="btn btn-primary"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return children;
};

export default AdminRoute;
