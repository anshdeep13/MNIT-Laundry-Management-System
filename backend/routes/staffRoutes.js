const express = require('express');
const router = express.Router();
const { 
  getMachines, 
  getMachinesByHostel,
  getBookings, 
  getBookingsByHostel,
  updateMachineStatus, 
  getHostels,
  getProfile,
  updateProfile,
  changePassword
} = require('../controllers/staffController');
const { auth, authorize } = require('../middleware/auth');

// Apply authentication and authorization middleware to all routes
router.use(auth);
router.use(authorize(['staff', 'admin']));  // Pass roles as an array

// Profile management
router.get('/profile', getProfile);
router.patch('/profile', updateProfile);
router.patch('/change-password', changePassword);

// Machine management
router.get('/machines', getMachines);
router.get('/machines/by-hostel', getMachinesByHostel);
router.patch('/machines/:machineId/status', updateMachineStatus);

// Booking management
router.get('/bookings', getBookings);
router.get('/bookings/by-hostel', getBookingsByHostel);

// Hostel management
router.get('/hostels', getHostels);

module.exports = router; 