import React, { createContext, useContext, useReducer, useState } from 'react';
import { CartContext } from './CartContext';

const CheckoutContext = createContext();

// Checkout reducer for state management
const checkoutReducer = (state, action) => {
    switch (action.type) {
        case 'SET_STEP':
            return { ...state, currentStep: action.payload };
        case 'SET_SHIPPING':
            return { ...state, shipping: action.payload };
        case 'SET_PAYMENT':
            return { ...state, payment: action.payload };
        case 'SET_ORDER_DETAILS':
            return { ...state, orderDetails: action.payload };
        case 'SET_LOADING':
            return { ...state, loading: action.payload };
        case 'SET_ERROR':
            return { ...state, error: action.payload };
        case 'RESET_CHECKOUT':
            return initialState;
        default:
            return state;
    }
};

const initialState = {
    currentStep: 1,
    shipping: {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'US'
    },
    payment: {
        method: 'card',
        cardNumber: '',
        expiryDate: '',
        cvv: '',
        nameOnCard: '',
        billingAddress: {
            sameAsShipping: true,
            address: '',
            city: '',
            state: '',
            zipCode: ''
        }
    },
    orderDetails: null,
    loading: false,
    error: null
};

export const CheckoutProvider = ({ children }) => {
    const [state, dispatch] = useReducer(checkoutReducer, initialState);
    const { cartItems, getCartTotal, clearCart } = useContext(CartContext);
    const [orderHistory, setOrderHistory] = useState([]);

    // Calculate totals
    const calculateTotals = () => {
        const subtotal = Array.isArray(cartItems) ? cartItems.reduce((total, item) => {
            const price = parseFloat(item.price || item.product?.price || 0);
            const quantity = parseInt(item.quantity || 0);
            return total + (price * quantity);
        }, 0) : 0;

        const tax = subtotal * 0.1;
        const shipping = subtotal > 100 ? 0 : 10;
        const total = subtotal + tax + shipping;

        return { subtotal, tax, shipping, total };
    };

    // Move to next step
    const nextStep = () => {
        if (state.currentStep < 4) {
            dispatch({ type: 'SET_STEP', payload: state.currentStep + 1 });
        }
    };

    // Move to previous step
    const prevStep = () => {
        if (state.currentStep > 1) {
            dispatch({ type: 'SET_STEP', payload: state.currentStep - 1 });
        }
    };

    // Update shipping info
    const updateShipping = (shippingData) => {
        dispatch({ type: 'SET_SHIPPING', payload: shippingData });
    };

    // Update payment info
    const updatePayment = (paymentData) => {
        dispatch({ type: 'SET_PAYMENT', payload: paymentData });
    };

    // Process order
    const processOrder = async () => {
        try {
            dispatch({ type: 'SET_LOADING', payload: true });
            dispatch({ type: 'SET_ERROR', payload: null });

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000));

            const orderData = {
                id: `ORD-${Date.now()}`,
                items: cartItems,
                shipping: state.shipping,
                payment: { ...state.payment, cardNumber: '****' + state.payment.cardNumber.slice(-4) },
                totals: calculateTotals(),
                status: 'confirmed',
                orderDate: new Date().toISOString(),
                estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
            };

            dispatch({ type: 'SET_ORDER_DETAILS', payload: orderData });
            setOrderHistory(prev => [orderData, ...prev]);
            
            // Clear cart after successful order
            if (clearCart) {
                clearCart();
            }

            // Move to confirmation step
            dispatch({ type: 'SET_STEP', payload: 4 });

        } catch (error) {
            dispatch({ type: 'SET_ERROR', payload: error.message });
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    };

    // Validate current step
    const validateStep = (step) => {
        switch (step) {
            case 1: // Shipping
                const { firstName, lastName, email, address, city, state, zipCode } = state.shipping;
                return firstName && lastName && email && address && city && state && zipCode;
            case 2: // Payment
                const { cardNumber, expiryDate, cvv, nameOnCard } = state.payment;
                return cardNumber && expiryDate && cvv && nameOnCard;
            case 3: // Review
                return true;
            default:
                return false;
        }
    };

    const value = {
        ...state,
        cartItems,
        calculateTotals,
        nextStep,
        prevStep,
        updateShipping,
        updatePayment,
        processOrder,
        validateStep,
        orderHistory,
        dispatch
    };

    return (
        <CheckoutContext.Provider value={value}>
            {children}
        </CheckoutContext.Provider>
    );
};

export const useCheckout = () => {
    const context = useContext(CheckoutContext);
    if (!context) {
        throw new Error('useCheckout must be used within a CheckoutProvider');
    }
    return context;
};

export { CheckoutContext };
