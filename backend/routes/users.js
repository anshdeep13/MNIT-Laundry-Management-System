const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const User = require('../models/User');

// Get all users (for admin)
router.get('/admin/users', auth, authorize('admin'), async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get users for staff
router.get('/staff/users', auth, authorize(['staff', 'admin']), async (req, res) => {
  try {
    const users = await User.find({ role: { $in: ['student', 'staff'] } }).select('-password');
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get users for students
router.get('/users', auth, authorize('student'), async (req, res) => {
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