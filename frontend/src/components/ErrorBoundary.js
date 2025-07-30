import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Cart Error Boundary caught an error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    padding: '40px',
                    textAlign: 'center',
                    background: '#0a0a0a',
                    color: '#FFD700',
                    minHeight: '50vh',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}>
                    <h2>🛒 Cart Error</h2>
                    <p>Something went wrong with the shopping cart.</p>
                    <button 
                        onClick={() => {
                            this.setState({ hasError: false, error: null });
                            window.location.reload();
                        }}
                        style={{
                            padding: '12px 24px',
                            background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                            border: 'none',
                            borderRadius: '8px',
                            color: '#0a0a0a',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            marginTop: '20px'
                        }}
                    >
                        Refresh Cart
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
