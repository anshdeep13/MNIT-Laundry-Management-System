const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { verifyToken } = require('../utils/jwtGenerator');

// Authentication middleware
const auth = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.header('Authorization');
    const xAuthToken = req.header('x-auth-token');
    
    console.log('Auth headers:', { authHeader, xAuthToken });
    
    let token = authHeader?.replace('Bearer ', '') || xAuthToken;
    
    if (!token) {
      console.error('No token provided in request');
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    try {
      // Verify token using the utility function
      const decoded = verifyToken(token);
      
      if (!decoded) {
        console.error('Token verification failed');
        return res.status(401).json({ message: 'Token is not valid' });
      }
      
      console.log('Token decoded:', decoded);
      
      // Get user from database using the id from token
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        console.error('User not found for token:', decoded);
        return res.status(401).json({ message: 'User not found' });
      }

      // Add user to request object
      req.user = user;
      req.token = token;
      next();
    } catch (err) {
      console.error('Token verification error:', err.message);
      return res.status(401).json({ message: 'Token is not valid' });
    }
  } catch (err) {
    console.error('Auth middleware error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Role-based authorization middleware
const authorize = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      console.error('No user found in request');
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Convert roles to array if it's not already
    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    
    console.log('User role:', req.user.role, 'Required roles:', allowedRoles);
    
    if (!allowedRoles.includes(req.user.role)) {
      console.error('User role not authorized:', req.user.role);
      return res.status(403).json({ 
        message: `User role ${req.user.role} is not authorized to access this route` 
      });
    }
    next();
  };
};

module.exports = { auth, authorize };
