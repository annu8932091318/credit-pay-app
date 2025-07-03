import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

// Customers
export const fetchCustomers = () => axios.get(`${API_BASE}/customers`);
export const fetchCustomer = (id) => axios.get(`${API_BASE}/customers/${id}`);
export const createCustomer = (data) => axios.post(`${API_BASE}/customers`, data);
export const updateCustomer = (id, data) => axios.put(`${API_BASE}/customers/${id}`, data);
export const deleteCustomer = (id) => axios.delete(`${API_BASE}/customers/${id}`);

// Sales
export const fetchSales = () => axios.get(`${API_BASE}/sales`);
export const fetchSale = (id) => axios.get(`${API_BASE}/sales/${id}`);
export const createSale = (data) => axios.post(`${API_BASE}/sales`, data);
export const updateSale = (id, data) => axios.put(`${API_BASE}/sales/${id}`, data);
export const deleteSale = (id) => axios.delete(`${API_BASE}/sales/${id}`);

// Notifications
export const fetchNotifications = () => axios.get(`${API_BASE}/notifications`);
export const createNotification = (data) => axios.post(`${API_BASE}/notifications`, data);
export const updateNotification = (id, data) => axios.put(`${API_BASE}/notifications/${id}`, data);
export const deleteNotification = (id) => axios.delete(`${API_BASE}/notifications/${id}`);

// OTP related functions
export const sendOTP = (phone) => axios.post(`${API_BASE}/notifications/send-otp`, { phone });
export const verifyOTP = (phone, otp) => axios.post(`${API_BASE}/notifications/verify-otp`, { phone, otp });

// Shopkeepers
export const fetchShopkeepers = () => axios.get(`${API_BASE}/shopkeepers`);
export const fetchShopkeeper = (id) => axios.get(`${API_BASE}/shopkeepers/${id}`);
export const createShopkeeper = (data) => axios.post(`${API_BASE}/shopkeepers`, data);
export const updateShopkeeper = (id, data) => axios.put(`${API_BASE}/shopkeepers/${id}`, data);
export const deleteShopkeeper = (id) => axios.delete(`${API_BASE}/shopkeepers/${id}`); 