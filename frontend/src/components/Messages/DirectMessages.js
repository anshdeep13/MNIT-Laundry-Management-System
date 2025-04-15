import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  CircularProgress,
  IconButton,
  Badge,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Send as SendIcon,
  Person as PersonIcon,
  AttachFile as AttachFileIcon,
} from '@mui/icons-material';
import API from '../../services/api';

const DirectMessages = () => {
  const { user } = useAuth();
  const theme = useTheme();
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch users and messages
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch users from admin endpoint
        console.log('Fetching users from /admin/users endpoint...');
        const usersResponse = await API.get('/admin/users');
        console.log('Users response:', usersResponse.data);
        
        // Filter out the current user
        const filteredUsers = usersResponse.data.filter(u => u._id !== user._id);
        console.log('Filtered users:', filteredUsers);
        
        setUsers(filteredUsers);

        // Fetch messages if a user is selected
        if (selectedUser) {
          console.log('Fetching messages for selected user:', selectedUser._id);
          const messagesResponse = await API.get(`/messages/direct/${selectedUser._id}`);
          console.log('Messages response:', messagesResponse.data);
          setMessages(messagesResponse.data);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load messages. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user._id, selectedUser]);

  // Handle sending a new message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser) return;

    try {
      const response = await API.post('/messages/direct', {
        recipientId: selectedUser._id,
        content: newMessage.trim(),
        subject: 'Direct Message'
      });

      setMessages([...messages, response.data]);
      setNewMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message. Please try again.');
    }
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', gap: 2, p: 2 }}>
      {/* Users List */}
      <Paper 
        elevation={0}
        sx={{ 
          width: 300,
          height: '100%',
          overflow: 'auto',
          bgcolor: alpha(theme.palette.background.paper, 0.8),
          backdropFilter: 'blur(10px)',
          borderRadius: 2,
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        }}
      >
        <Typography variant="h6" sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          Contacts
        </Typography>
        <List>
          {users.length > 0 ? (
            users.map((u) => (
              <ListItem
                key={u._id}
                button
                selected={selectedUser?._id === u._id}
                onClick={() => setSelectedUser(u)}
                sx={{
                  '&:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.05),
                  },
                  '&.Mui-selected': {
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                  },
                }}
              >
                <ListItemAvatar>
                  <Avatar>
                    <PersonIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText 
                  primary={u.name}
                  secondary={u.role}
                />
                <Badge 
                  color="primary" 
                  variant="dot" 
                  invisible={!u.unreadCount}
                />
              </ListItem>
            ))
          ) : (
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                No contacts found
              </Typography>
            </Box>
          )}
        </List>
      </Paper>

      {/* Chat Area */}
      <Paper 
        elevation={0}
        sx={{ 
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          bgcolor: alpha(theme.palette.background.paper, 0.8),
          backdropFilter: 'blur(10px)',
          borderRadius: 2,
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        }}
      >
        {selectedUser ? (
          <>
            {/* Chat Header */}
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant="h6">
                {selectedUser.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedUser.role}
              </Typography>
            </Box>

            {/* Messages */}
            <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
              {loading ? (
                <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                  <CircularProgress />
                </Box>
              ) : error ? (
                <Typography color="error" align="center">
                  {error}
                </Typography>
              ) : messages.length > 0 ? (
                messages.map((message) => (
                  <Box
                    key={message._id}
                    sx={{
                      display: 'flex',
                      justifyContent: message.sender === user._id ? 'flex-end' : 'flex-start',
                      mb: 2,
                    }}
                  >
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2,
                        maxWidth: '70%',
                        bgcolor: message.sender === user._id 
                          ? alpha(theme.palette.primary.main, 0.1)
                          : alpha(theme.palette.background.paper, 0.8),
                        borderRadius: 2,
                      }}
                    >
                      <Typography variant="body1">
                        {message.content}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatTime(message.createdAt)}
                      </Typography>
                    </Paper>
                  </Box>
                ))
              ) : (
                <Box sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    No messages yet. Start a conversation!
                  </Typography>
                </Box>
              )}
              <div ref={messagesEndRef} />
            </Box>

            {/* Message Input */}
            <Box 
              component="form" 
              onSubmit={handleSendMessage}
              sx={{ 
                p: 2, 
                borderTop: 1, 
                borderColor: 'divider',
                display: 'flex',
                gap: 1,
              }}
            >
              <IconButton size="small">
                <AttachFileIcon />
              </IconButton>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                size="small"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />
              <Button
                type="submit"
                variant="contained"
                endIcon={<SendIcon />}
                disabled={!newMessage.trim()}
                sx={{ borderRadius: 2 }}
              >
                Send
              </Button>
            </Box>
          </>
        ) : (
          <Box 
            display="flex" 
            justifyContent="center" 
            alignItems="center" 
            height="100%"
          >
            <Typography variant="body1" color="text.secondary">
              Select a contact to start messaging
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default DirectMessages; 