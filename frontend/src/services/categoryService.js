import api from './api';

export const categoryService = {
    getCategories: async () => {
        try {
            const response = await api.get('/categories');
            // Backend returns { data: [...] }, so extract the data
            return { data: response.data.data || response.data };
        } catch (error) {
            console.error('Error fetching categories:', error);
            throw error;
        }
    },

    getCategoryById: async (id) => {
        try {
            const response = await api.get(`/categories/${id}`);
            return { data: response.data.data || response.data };
        } catch (error) {
            console.error('Error fetching category:', error);
            throw error;
        }
    }
};
