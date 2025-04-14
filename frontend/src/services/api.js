import axios from 'axios';

// Create axios instance with consistent configuration
const API = axios.create({
  baseURL: 'http://localhost:5000/api',
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
    headers: config.headers
  });
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Intercept responses to handle errors
API.interceptors.response.use(
  (response) => {
    console.log('API Response:', {
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('API Error:', {
      message: error.message,
      response: error.response ? {
        status: error.response.status,
        data: error.response.data
      } : 'No response',
      request: error.request ? 'Request was made but no response received' : 'Request not sent'
    });
    return Promise.reject(error);
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

export default API;