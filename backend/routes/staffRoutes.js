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
const {
  getStaffMessages,
  getStaffDirectMessages,
  sendStaffDirectMessage,
  markStaffMessagesAsRead,
  getStaffUnreadCount,
  getStudentsForStaff
} = require('../controllers/staffMessageController');
const { completeBooking } = require('../controllers/booking');
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
router.put('/bookings/complete', completeBooking);

// Hostel management
router.get('/hostels', getHostels);

// Messaging functionality
router.get('/messages', getStaffMessages);
router.get('/messages/direct/:userId', getStaffDirectMessages);
router.post('/messages/direct', sendStaffDirectMessage);
router.put('/messages/read/:senderId', markStaffMessagesAsRead);
router.get('/messages/unread/count', getStaffUnreadCount);
router.get('/students', getStudentsForStaff);

module.exports = router; 