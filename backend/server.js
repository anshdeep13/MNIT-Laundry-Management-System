const express = require('express');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const hostelRoutes = require('./routes/hostel');
const machineRoutes = require('./routes/machines');
const bookingRoutes = require('./routes/booking');
const adminRoutes = require('./routes/admin');
const staffRoutes = require('./routes/staffRoutes.js');
const messageRoutes = require('./routes/messages');
const userRoutes = require('./routes/users');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const app = express();

// Connect to MongoDB
connectDB();

// Set up detailed CORS options
const corsOptions = {
  origin: [
    'http://localhost:3000', 
    'http://127.0.0.1:3000',
    'https://mnit-laundry-management-system.onrender.com',
    'https://mnit-laundry-management-system-frontend.onrender.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token']
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Parse JSON request bodies
app.use(express.json());

// Parse cookies
app.use(cookieParser());

// Detailed logging middleware for debugging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  
  if (['POST', 'PUT'].includes(req.method)) {
    console.log('Body:', JSON.stringify(req.body, null, 2));
  }
  
  // Log the response
  const originalSend = res.send;
  res.send = function(body) {
    console.log(`Response status: ${res.statusCode}`);
    return originalSend.call(this, body);
  };
  
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/hostels', hostelRoutes);
app.use('/api/machines', machineRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api', userRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  res.status(500).json({ message: 'Internal server error', error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));