const Machine = require('../models/Machine');
const Booking = require('../models/Booking');
const Hostel = require('../models/Hostel');
const User = require('../models/User');
const bcrypt = require('bcrypt');

// Get all machines
const getMachines = async (req, res) => {
  try {
    const { hostelId, status, type } = req.query;
    
    // Build filter object based on query parameters
    const filter = {};
    
    if (hostelId) {
      filter.hostel = hostelId;
    }
    
    if (status) {
      filter.status = status;
    }
    
    if (type) {
      filter.type = type;
    }
    
    const machines = await Machine.find(filter)
      .populate('hostel', 'name location')
      .sort({ createdAt: -1 });
    res.json(machines);
  } catch (err) {
    console.error('Error fetching machines:', err.message);
    res.status(500).json({ message: 'Error fetching machines', error: err.message });
  }
};

// Get machines grouped by hostel
const getMachinesByHostel = async (req, res) => {
  try {
    // First get all hostels
    const hostels = await Hostel.find().sort({ name: 1 });
    
    // Then get machines for each hostel
    const machinesByHostel = await Promise.all(
      hostels.map(async (hostel) => {
        const machines = await Machine.find({ hostel: hostel._id })
          .sort({ name: 1 });
          
        return {
          hostel: {
            _id: hostel._id,
            name: hostel.name,
            location: hostel.location
          },
          machines
        };
      })
    );
    
    res.json(machinesByHostel);
  } catch (err) {
    console.error('Error fetching machines by hostel:', err.message);
    res.status(500).json({ message: 'Error fetching machines by hostel', error: err.message });
  }
};

// Get all bookings
const getBookings = async (req, res) => {
  try {
    const { hostelId, status, startDate, endDate } = req.query;
    
    // Build filter object based on query parameters
    const filter = {};
    
    if (hostelId) {
      filter.hostel = hostelId;
    }
    
    if (status) {
      filter.status = status;
    }
    
    if (startDate || endDate) {
      filter.startTime = {};
      if (startDate) {
        filter.startTime.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.startTime.$lte = new Date(endDate);
      }
    }
    
    const bookings = await Booking.find(filter)
      .populate('user', 'name roomNumber')
      .populate('machine', 'name')
      .populate('hostel', 'name')
      .sort({ startTime: -1 });
      
    res.json(bookings);
  } catch (err) {
    console.error('Error fetching bookings:', err.message);
    res.status(500).json({ message: 'Error fetching bookings', error: err.message });
  }
};

// Get bookings grouped by hostel
const getBookingsByHostel = async (req, res) => {
  try {
    // First get all hostels
    const hostels = await Hostel.find().sort({ name: 1 });
    
    // Then get bookings for each hostel
    const bookingsByHostel = await Promise.all(
      hostels.map(async (hostel) => {
        const bookings = await Booking.find({ hostel: hostel._id })
          .populate('user', 'name roomNumber')
          .populate('machine', 'name')
          .sort({ startTime: -1 });
          
        return {
          hostel: {
            _id: hostel._id,
            name: hostel.name,
            location: hostel.location
          },
          bookings
        };
      })
    );
    
    res.json(bookingsByHostel);
  } catch (err) {
    console.error('Error fetching bookings by hostel:', err.message);
    res.status(500).json({ message: 'Error fetching bookings by hostel', error: err.message });
  }
};

// Update machine status
const updateMachineStatus = async (req, res) => {
  try {
    const { machineId } = req.params;
    const { status, maintenanceNote } = req.body;

    const machine = await Machine.findById(machineId);
    if (!machine) {
      return res.status(404).json({ message: 'Machine not found' });
    }

    machine.status = status;
    
    if (status === 'maintenance' && maintenanceNote) {
      machine.maintenanceHistory.push({
        date: new Date(),
        description: maintenanceNote,
        technician: req.user.name
      });
      machine.lastMaintenance = new Date();
    }

    await machine.save();
    res.json(machine);
  } catch (err) {
    console.error('Error updating machine status:', err.message);
    res.status(500).json({ message: 'Error updating machine status', error: err.message });
  }
};

// Get all hostels
const getHostels = async (req, res) => {
  try {
    const hostels = await Hostel.find().sort({ name: 1 });
    res.json(hostels);
  } catch (err) {
    console.error('Error fetching hostels:', err.message);
    res.status(500).json({ message: 'Error fetching hostels', error: err.message });
  }
};

// Get staff profile
const getProfile = async (req, res) => {
  try {
    const staff = await User.findById(req.user._id).select('-password');
    res.json(staff);
  } catch (err) {
    console.error('Error fetching profile:', err.message);
    res.status(500).json({ message: 'Error fetching profile', error: err.message });
  }
};

// Update staff profile
const updateProfile = async (req, res) => {
  try {
    const { name, email, contactNumber } = req.body;
    const staff = await User.findById(req.user._id);
    
    if (name) staff.name = name;
    if (email) staff.email = email;
    if (contactNumber) staff.contactNumber = contactNumber;
    
    await staff.save();
    res.json(staff);
  } catch (err) {
    console.error('Error updating profile:', err.message);
    res.status(500).json({ message: 'Error updating profile', error: err.message });
  }
};

// Change password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const staff = await User.findById(req.user._id);
    
    const isMatch = await bcrypt.compare(currentPassword, staff.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }
    
    const salt = await bcrypt.genSalt(10);
    staff.password = await bcrypt.hash(newPassword, salt);
    await staff.save();
    
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('Error changing password:', err.message);
    res.status(500).json({ message: 'Error changing password', error: err.message });
  }
};

module.exports = {
  getMachines,
  getMachinesByHostel,
  getBookings,
  getBookingsByHostel,
  updateMachineStatus,
  getHostels,
  getProfile,
  updateProfile,
  changePassword
}; 