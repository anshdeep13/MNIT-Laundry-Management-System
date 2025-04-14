const express = require('express');
const router = express.Router();
const { 
  getAllHostels, 
  getHostelById, 
  createHostel, 
  updateHostel, 
  deleteHostel 
} = require('../controllers/hostel');
const { auth, authorize } = require('../middleware/auth');

// Get all hostels (all authenticated users)
router.get('/', auth, getAllHostels);

// Get hostel by ID (all authenticated users)
router.get('/:id', auth, getHostelById);

// Create a hostel (admin only)
router.post('/', [auth, authorize(['admin'])], createHostel);

// Update a hostel (admin only)
router.put('/:id', [auth, authorize(['admin'])], updateHostel);

// Delete a hostel (admin only)
router.delete('/:id', [auth, authorize(['admin'])], deleteHostel);

module.exports = router; 