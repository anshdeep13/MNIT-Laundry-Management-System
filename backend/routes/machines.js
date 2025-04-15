const express = require('express');
const router = express.Router();
const { 
  getAllMachines, 
  getMachinesByHostel,
  getMachineById, 
  createMachine, 
  updateMachineStatus, 
  deleteMachine,
  getMachineMaintenanceHistory
} = require('../controllers/machine');
const { auth, authorize } = require('../middleware/auth');

// Get all machines (all authenticated users)
router.get('/', auth, getAllMachines);

// Get machines by hostel (all authenticated users)
router.get('/hostel/:hostelId', auth, getMachinesByHostel);

// Get machine by ID (all authenticated users)
router.get('/:id', auth, getMachineById);

// Create a machine (admin only)
router.post('/', [auth, authorize(['admin'])], createMachine);

// Update machine status (staff and admin)
router.put('/:id/status', [auth, authorize(['staff', 'admin'])], updateMachineStatus);

// Delete a machine (admin only)
router.delete('/:id', [auth, authorize(['admin'])], deleteMachine);

// Get machine maintenance history (staff and admin)
router.get('/:id/maintenance', [auth, authorize(['staff', 'admin'])], getMachineMaintenanceHistory);

module.exports = router; 