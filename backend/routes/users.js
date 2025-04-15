const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

// Get all users (for admin)
router.get('/admin/users', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Access denied. Admin privileges required.' });
    }
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get users for staff
router.get('/staff/users', auth, async (req, res) => {
  try {
    if (req.user.role !== 'staff' && req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Access denied. Staff privileges required.' });
    }
    const users = await User.find({ role: { $in: ['student', 'staff'] } }).select('-password');
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get users for students
router.get('/users', auth, async (req, res) => {
  try {
    // Students can see staff members and other students
    const users = await User.find({
      $or: [
        { role: 'staff' },
        { role: 'student', hostel: req.user.hostel } // Only students from the same hostel
      ]
    }).select('-password');
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router; 