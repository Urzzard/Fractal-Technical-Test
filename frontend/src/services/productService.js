import apiClient from './apiClient';

export const getAllProducts = () => {
    return apiClient.get('/products/');
};

export const getProductById = (productId) => {
    return apiClient.get(`/products/${productId}/`);
};

export const createProduct = (productData) => {
    return apiClient.post('/products/', productData, {
        headers: {
            'Content-Type': 'multipart/form-data',
          }
    });
};

export const updateProduct = (productId, productData) => {
    return apiClient.put(`/products/${productId}/`, productData, {
        headers: {
            'Content-Type': 'multipart/form-data',
          }
    });
};

export const deleteProduct = (productId) => {
    return apiClient.delete(`/products/${productId}/`);
};