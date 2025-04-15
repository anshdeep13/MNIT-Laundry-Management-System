import axios from 'axios';

// Create axios instance with consistent configuration
const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'https://mnit-laundry-management-system-backend.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true // Enable sending cookies with requests
});

// Add auth token to requests
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    // Use x-auth-token header as expected by backend
    config.headers['x-auth-token'] = token;
    // Also add Authorization header with Bearer token format
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  console.log('API Request:', {
    url: config.url,
    method: config.method,
    headers: config.headers,
    data: config.data
  });
  return config;
}, (error) => {
  console.error('API Request Error:', error);
  return Promise.reject(error);
});

// Intercept responses to handle errors
API.interceptors.response.use(
  (response) => {
    console.log('API Response:', {
      url: response.config.url,
      status: response.status,
      statusText: response.statusText,
      data: response.data,
      headers: response.headers
    });
    return response;
  },
  async (error) => {
    console.error('API Error:', {
      message: error.message,
      config: error.config,
      response: error.response ? {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        headers: error.response.headers
      } : 'No response',
      request: error.request ? {
        responseURL: error.request.responseURL,
        status: error.request.status,
        statusText: error.request.statusText,
        response: error.request.response
      } : 'Request not sent'
    });

    // Handle 401 Unauthorized errors
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }

    // Return a more detailed error message
    return Promise.reject({
      message: error.response?.data?.message || error.message || 'Unknown error',
      status: error.response?.status,
      data: error.response?.data
    });
  }
);

// Staff API functions
export const staffAPI = {
  // Get all bookings
  getBookings: (params) => API.get('/staff/bookings', { params }),
  
  // Get bookings grouped by hostel
  getBookingsByHostel: () => API.get('/staff/bookings/by-hostel'),
  
  // Get all machines
  getMachines: (params) => API.get('/staff/machines', { params }),
  
  // Get machines grouped by hostel
  getMachinesByHostel: () => API.get('/staff/machines/by-hostel'),
  
  // Update machine status
  updateMachineStatus: (machineId, data) => API.patch(`/staff/machines/${machineId}/status`, data),
  
  // Get all hostels
  getHostels: () => API.get('/staff/hostels'),
  
  // Get staff profile
  getProfile: () => API.get('/staff/profile'),
  
  // Update staff profile
  updateProfile: (data) => API.patch('/staff/profile', data),
  
  // Change password
  changePassword: (data) => API.patch('/staff/change-password', data)
};

// Auth API functions
export const authAPI = {
  // Register a new user
  register: (data) => API.post('/auth/register', data),
  
  // Login user
  login: (data) => API.post('/auth/login', data),
  
  // Get current user
  getCurrentUser: () => API.get('/auth/me'),
  
  // Update wallet balance
  updateWallet: (data) => API.post('/auth/wallet', data),
  
  // Refresh token
  refreshToken: () => API.post('/auth/refresh-token'),
  
  // Logout user
  logout: () => API.post('/auth/logout'),
};

export default API;