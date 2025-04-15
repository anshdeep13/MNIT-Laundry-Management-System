import API from './api';

// Register a new user
export const register = (userData) => {
  console.log('Auth service: Registering user with data:', userData);
  return API.post('/auth/register', userData)
    .then(response => {
      console.log('Auth service: Registration successful:', response.data);
      return response.data;
    })
    .catch(error => {
      console.error('Auth service: Registration failed:', error);
      throw error;
    });
};

// Login user
export const login = (credentials) => {
  console.log('Auth service: Logging in user with email:', credentials.email);
  return API.post('/auth/login', credentials)
    .then(response => {
      console.log('Auth service: Login successful:', response.data);
      return response.data;
    })
    .catch(error => {
      console.error('Auth service: Login failed:', error);
      throw error;
    });
};

// Get current user
export const getCurrentUser = () => API.get('/auth/me');

// Logout user
export const logout = () => API.post('/auth/logout');