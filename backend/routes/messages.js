const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Message = require('../models/Message');
const User = require('../models/User');

// Get all messages for the current user
router.get('/', auth, async (req, res) => {
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
    console.error('Error fetching messages:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get direct messages between two users
router.get('/direct/:userId', auth, async (req, res) => {
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
    console.error('Error fetching direct messages:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Send a direct message
router.post('/direct', auth, async (req, res) => {
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
    console.error('Error sending message:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Mark messages as read
router.put('/read/:senderId', auth, async (req, res) => {
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
    console.error('Error marking messages as read:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get unread message count
router.get('/unread/count', auth, async (req, res) => {
  try {
    const count = await Message.countDocuments({
      receiver: req.user._id,
      status: 'unread'
    });

    res.json({ count });
  } catch (err) {
    console.error('Error getting unread count:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router; 