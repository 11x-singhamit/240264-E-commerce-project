import api from './api';

export const productService = {
    getProducts: async (params = {}) => {
        try {
            const queryString = new URLSearchParams(params).toString();
            const response = await api.get(`/products${queryString ? `?${queryString}` : ''}`);
            // Backend returns { data: [...] }, so extract the data
            return { data: response.data.data || response.data };
        } catch (error) {
            console.error('Error fetching products:', error);
            throw error;
        }
    },

    getProductById: async (id) => {
        try {
            const response = await api.get(`/products/${id}`);
            return { data: response.data.data || response.data };
        } catch (error) {
            console.error('Error fetching product:', error);
            throw error;
        }
    },

    getFeaturedProducts: async () => {
        try {
            // Get first 6 products as featured
            const response = await api.get('/products?limit=6');
            return { data: response.data.data || response.data };
        } catch (error) {
            console.error('Error fetching featured products:', error);
            throw error;
        }
    }
};
