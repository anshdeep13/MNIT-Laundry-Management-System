require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

async function createStaffUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Check if staff user already exists
    const existingUser = await User.findOne({ email: 'staff@example.com' });
    if (existingUser) {
      console.log('Staff user already exists');
      process.exit(0);
    }
    
    // Create staff user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);
    
    const staffUser = new User({
      name: 'Staff User',
      email: 'staff@example.com',
      password: hashedPassword,
      role: 'staff',
      contactNumber: '1234567890'
    });
    
    await staffUser.save();
    console.log('Staff user created successfully');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

createStaffUser(); 