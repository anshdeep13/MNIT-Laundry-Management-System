const Message = require('../models/Message');
const User = require('../models/User');

// Get all messages for the current staff member
const getStaffMessages = async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user._id },
        { receiver: req.user._id }
      ]
    })
    .populate('sender', 'name email role')
    .populate('receiver', 'name email role')
    .sort({ createdAt: -1 });

    res.json(messages);
  } catch (err) {
    console.error('Error fetching staff messages:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Get direct messages between staff and a specific user
const getStaffDirectMessages = async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user._id, receiver: req.params.userId },
        { sender: req.params.userId, receiver: req.user._id }
      ]
    })
    .populate('sender', 'name email role')
    .populate('receiver', 'name email role')
    .sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    console.error('Error fetching staff direct messages:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Send a direct message from staff to a user
const sendStaffDirectMessage = async (req, res) => {
  try {
    const { recipientId, content, subject } = req.body;

    // Validate recipient exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ msg: 'Recipient not found' });
    }

    // Create new message
    const message = new Message({
      sender: req.user._id,
      receiver: recipientId,
      content,
      subject,
      type: 'direct'
    });

    await message.save();

    // Populate sender and receiver details
    await message.populate('sender', 'name email role');
    await message.populate('receiver', 'name email role');

    res.status(201).json(message);
  } catch (err) {
    console.error('Error sending staff message:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Mark messages as read
const markStaffMessagesAsRead = async (req, res) => {
  try {
    await Message.updateMany(
      {
        sender: req.params.senderId,
        receiver: req.user._id,
        status: 'unread'
      },
      {
        $set: { status: 'read' }
      }
    );

    res.json({ msg: 'Messages marked as read' });
  } catch (err) {
    console.error('Error marking staff messages as read:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Get unread message count for staff
const getStaffUnreadCount = async (req, res) => {
  try {
    const count = await Message.countDocuments({
      receiver: req.user._id,
      status: 'unread'
    });

    res.json({ count });
  } catch (err) {
    console.error('Error getting staff unread count:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Get all students for staff to message
const getStudentsForStaff = async (req, res) => {
  try {
    const students = await User.find({ role: 'student' })
      .select('name email role hostel roomNumber')
      .sort({ name: 1 });
    
    res.json(students);
  } catch (err) {
    console.error('Error fetching students for staff:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

module.exports = {
  getStaffMessages,
  getStaffDirectMessages,
  sendStaffDirectMessage,
  markStaffMessagesAsRead,
  getStaffUnreadCount,
  getStudentsForStaff
}; 