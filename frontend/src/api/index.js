import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

// Simple cache implementation
const cache = {
  data: new Map(),
  timestamp: new Map(),
  maxAge: 30000, // 30 seconds cache
  
  get(key) {
    if (!this.data.has(key)) return null;
    
    const timestamp = this.timestamp.get(key);
    if (Date.now() - timestamp > this.maxAge) {
      // Cache expired
      this.data.delete(key);
      this.timestamp.delete(key);
      return null;
    }
    
    return this.data.get(key);
  },
  
  set(key, value) {
    this.data.set(key, value);
    this.timestamp.set(key, Date.now());
  },
  
  clear() {
    this.data.clear();
    this.timestamp.clear();
  }
};

// Create an axios instance with default headers
const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Track in-flight requests to prevent duplicates
const pendingRequests = new Map();

// Add a request interceptor to include the token and prevent duplicate requests
api.interceptors.request.use(
  config => {
    // Attach JWT token from localStorage if present
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    // For GET requests, check if identical request is already pending
    if (config.method === 'get') {
      const requestKey = `${config.method}:${config.url}`;
      if (pendingRequests.has(requestKey)) {
        // Return the existing promise to avoid duplicate request
        console.log(`Preventing duplicate request: ${requestKey}`);
        return Promise.reject({
          pendingRequest: pendingRequests.get(requestKey),
          config
        });
      }
      // Store the request promise
      const requestPromise = new Promise((resolve) => {
        config.requestPromiseResolve = resolve;
      });
      pendingRequests.set(requestKey, requestPromise);
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to resolve pending requests
api.interceptors.response.use(
  response => {
    if (response.config.method === 'get') {
      const requestKey = `${response.config.method}:${response.config.url}`;
      
      // Resolve and remove the pending request
      if (pendingRequests.has(requestKey)) {
        if (response.config.requestPromiseResolve) {
          response.config.requestPromiseResolve(response);
        }
        pendingRequests.delete(requestKey);
      }
    }
    return response;
  },
  error => {
    if (error.pendingRequest && error.config) {
      // Return the existing request promise
      return error.pendingRequest;
    }
    
    if (error.config && error.config.method === 'get') {
      const requestKey = `${error.config.method}:${error.config.url}`;
      pendingRequests.delete(requestKey);
    }
    
    return Promise.reject(error);
  }
);

// --- Authentication ---
// --- Shopkeeper Authentication ---
export const registerShopkeeper = async (shopkeeperData) => {
  try {
    const response = await api.post('/shopkeepers/register', shopkeeperData);
    return response.data;
  } catch (error) {
    console.error('Shopkeeper Registration API Error:', error.response?.data || error);
    throw error.response?.data || { error: 'Registration failed. Please try again later.' };
  }
};

export const loginShopkeeper = async (credentials) => {
  try {
    const response = await api.post('/shopkeepers/login', credentials);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Customers
export const fetchCustomers = async (noCache = false) => {
  const cacheKey = 'customers';
  if (!noCache) {
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      console.log('Using cached customers data');
      return cachedData;
    }
  }
  
  const response = await api.get('/customers');
  cache.set(cacheKey, response);
  return response;
};

export const fetchCustomer = (id) => api.get(`/customers/${id}`);

export const createCustomer = (data) => {
  // Clear cache when creating new data
  cache.clear();
  return api.post('/customers', data);
};

export const updateCustomer = (id, data) => {
  // Clear cache when updating data
  cache.clear();
  return api.put(`/customers/${id}`, data);
};

export const deleteCustomer = (id) => {
  // Clear cache when deleting data
  cache.clear();
  return api.delete(`/customers/${id}`);
};

// Sales
export const fetchSales = async (noCache = false) => {
  const cacheKey = 'sales';
  if (!noCache) {
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      console.log('Using cached sales data');
      return cachedData;
    }
  }
  
  const response = await api.get('/sales');
  cache.set(cacheKey, response);
  return response;
};

export const fetchSale = (id) => api.get(`/sales/${id}`);

export const createSale = (data) => {
  // Clear cache when creating new data
  cache.clear();
  return api.post('/sales', data);
};

export const updateSale = (id, data) => {
  // Clear cache when updating data
  cache.clear();
  return api.put(`/sales/${id}`, data);
};

export const deleteSale = (id) => {
  // Clear cache when deleting data
  cache.clear();
  return api.delete(`/sales/${id}`);
};

// Notifications
export const fetchNotifications = () => api.get('/notifications');
export const createNotification = (data) => api.post('/notifications', data);
export const updateNotification = (id, data) => api.put(`/notifications/${id}`, data);
export const deleteNotification = (id) => api.delete(`/notifications/${id}`);
export const triggerReminders = () => api.post('/notifications/trigger-reminders');

// OTP related functions
export const sendOTP = (phone) => api.post('/notifications/send-otp', { phone });
export const verifyOTP = (phone, otp) => api.post('/notifications/verify-otp', { phone, otp });

// Shopkeeper OTP login (for dev mode, accepts any OTP)
export const otpLoginShopkeeper = (phone, otp) => api.post('/shopkeepers/otp-login', { phone, otp });

// Shopkeepers
export const fetchShopkeepers = () => api.get('/shopkeepers');

// Payments
export const createPaymentOrder = (saleId, amount) => 
  api.post('/payments/create-order', { saleId, amount });

export const verifyPayment = (paymentData) => 
  api.post('/payments/verify', paymentData);

export const processManualPayment = (paymentData) => 
  api.post('/payments/manual', paymentData);

export const getPaymentMethods = () => 
  api.get('/payments/methods');

// Analytics and Dashboard
export const getDashboardData = () => api.get('/sales/dashboard');
export const getCustomerAnalytics = (customerId) => api.get(`/customers/${customerId}/analytics`);

export default api;
export const fetchShopkeeper = (id) => axios.get(`${API_BASE}/shopkeepers/${id}`);
export const createShopkeeper = (data) => axios.post(`${API_BASE}/shopkeepers`, data);
export const updateShopkeeper = (id, data) => axios.put(`${API_BASE}/shopkeepers/${id}`, data);
export const deleteShopkeeper = (id) => axios.delete(`${API_BASE}/shopkeepers/${id}`);