import { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import API from '../services/api';

// Set base URL for API requests
axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
// Allow cookies to be sent with requests
axios.defaults.withCredentials = true;

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Set up axios interceptor for token refresh
  useEffect(() => {
    const setupInterceptors = () => {
      // Response interceptor to handle token expiration
      axios.interceptors.response.use(
        (response) => response,
        async (error) => {
          const originalRequest = error.config;
          
          // If error is 401 Unauthorized and not a retry
          if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            
            try {
              // Try to refresh the token
              const { data } = await axios.post('/auth/refresh-token');
              
              // Update the token in localStorage
              localStorage.setItem('token', data.token);
              
              // Set new token in headers
              axios.defaults.headers.common['x-auth-token'] = data.token;
              
              // Retry the original request
              return axios(originalRequest);
            } catch (refreshError) {
              // If refresh fails, log out the user
              localStorage.removeItem('token');
              setUser(null);
              return Promise.reject(refreshError);
            }
          }
          
          return Promise.reject(error);
        }
      );
    };
    
    setupInterceptors();
  }, []);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (token) {
      console.log('AuthContext: Found token in localStorage, setting headers');
      // Set auth token header
      axios.defaults.headers.common['x-auth-token'] = token;
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // If we have a saved user, use it immediately to prevent flicker
      if (savedUser) {
        try {
          console.log('AuthContext: Using saved user from localStorage');
          setUser(JSON.parse(savedUser));
        } catch (e) {
          console.error('Error parsing saved user:', e);
        }
      }
      
      // Load fresh user data from server
      loadUser();
    } else {
      console.log('AuthContext: No token found in localStorage');
      setLoading(false);
    }
  }, []);

  const loadUser = async () => {
    try {
      console.log('AuthContext: Loading user data from server');
      const res = await API.get('/auth/me');
      console.log('AuthContext: User data loaded:', res.data);
      
      // Update user state with fresh data
      setUser(res.data);
      
      // Update saved user in localStorage
      localStorage.setItem('user', JSON.stringify(res.data));
    } catch (err) {
      console.error('AuthContext: Failed to load user:', err);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      delete axios.defaults.headers.common['x-auth-token'];
      delete axios.defaults.headers.common['Authorization'];
      setUser(null);
      setError(err.response?.data?.msg || 'Authentication error');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('AuthContext: Attempting login...');
      
      // Use the API service instead of direct axios call
      const res = await API.post('/auth/login', { email, password });
      
      console.log('AuthContext: Login response received:', res.data);
      
      // Set token in local storage
      localStorage.setItem('token', res.data.token);
      
      // Set auth token header for all axios requests
      axios.defaults.headers.common['x-auth-token'] = res.data.token;
      axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
      
      console.log('AuthContext: Token set in headers and localStorage');
      
      // Set user state
      setUser(res.data.user);
      
      console.log('AuthContext: User state updated:', res.data.user);
      
      return res.data.user;
    } catch (err) {
      console.error('Login failed:', err);
      setError(err.response?.data?.msg || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('AuthContext: Attempting registration...', userData);
      
      // Use the API service instead of direct axios call
      const res = await API.post('/auth/register', userData);
      
      console.log('AuthContext: Registration response received:', res.data);
      
      // Set token in local storage
      localStorage.setItem('token', res.data.token);
      
      // Set auth token header for all axios requests
      axios.defaults.headers.common['x-auth-token'] = res.data.token;
      axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
      
      console.log('AuthContext: Token set in headers and localStorage');
      
      // Set user state
      setUser(res.data.user);
      
      console.log('AuthContext: User state updated:', res.data.user);
      
      return res.data.user;
    } catch (err) {
      console.error('Registration failed:', err);
      setError(err.response?.data?.msg || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Call logout endpoint to clear cookie
      await axios.post('/auth/logout');
      
      // Remove token from local storage
      localStorage.removeItem('token');
      
      // Remove auth header
      delete axios.defaults.headers.common['x-auth-token'];
      
      // Clear user state
      setUser(null);
    } catch (err) {
      console.error('Logout error:', err);
      
      // Even if server logout fails, clear local state
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['x-auth-token'];
      setUser(null);
    }
  };

  const updateWallet = async (amount) => {
    try {
      const res = await axios.post('/auth/wallet', { amount });
      
      // Update user wallet balance
      setUser({ ...user, walletBalance: res.data.walletBalance });
      
      return res.data.walletBalance;
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to update wallet');
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
        updateWallet
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext; 