import apiClient from './apiClient';

export const getAllOrders = () => {
    return apiClient.get('/orders/');
};

export const getOrderById = (orderId) => {
    return apiClient.get(`/orders/${orderId}/`);
};

export const createOrder = (orderData) => {
    return apiClient.post('/orders/', orderData);
};

export const updateOrder = (orderId, orderData) => {
    return apiClient.put(`/orders/${orderId}/`, orderData);
};

export const deleteOrder = (orderId) => {
    return apiClient.delete(`/orders/${orderId}/`);
};

export const updateOrderStatus = (orderId, newStatus) => {
    return apiClient.patch(`/orders/${orderId}/`, { status: newStatus });
};


//ORDERITEM


export const addOrderItem = (itemData) => {
    return apiClient.post('/order-items/', itemData);
};

export const updateOrderItem = (itemId, itemData) => {
    return apiClient.patch(`/order-items/${itemId}/`, itemData);
};

export const deleteOrderItem = (itemId) => {
    return apiClient.delete(`/order-items/${itemId}/`);
};