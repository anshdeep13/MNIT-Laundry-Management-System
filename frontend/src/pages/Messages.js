import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  TextField,
  Button,
  Grid,
  CircularProgress,
} from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Messages = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchMessages();
    fetchUsers();
  }, []);

  const fetchMessages = async () => {
    try {
      const response = await api.get('/messages');
      setMessages(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      let response;
      if (user.role === 'admin') {
        response = await api.get('/admin/users');
      } else if (user.role === 'staff') {
        response = await api.get('/staff/users');
      } else {
        response = await api.get('/users');
      }
      setUsers(response.data.filter(u => u._id !== user._id));
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedUser) return;

    try {
      await api.post('/messages/direct', {
        receiver: selectedUser._id,
        content: newMessage,
        subject: 'New Message'
      });
      setNewMessage('');
      fetchMessages();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Messages
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Users
            </Typography>
            <List>
              {users.map((user) => (
                <ListItem
                  key={user._id}
                  button
                  selected={selectedUser?._id === user._id}
                  onClick={() => setSelectedUser(user)}
                >
                  <ListItemAvatar>
                    <Avatar>{user.name[0]}</Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={user.name}
                    secondary={user.role}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, height: '100%' }}>
            {selectedUser ? (
              <>
                <Typography variant="h6" gutterBottom>
                  Chat with {selectedUser.name}
                </Typography>
                <Box sx={{ height: '400px', overflowY: 'auto', mb: 2 }}>
                  {messages
                    .filter(m => 
                      (m.sender._id === user._id && m.receiver._id === selectedUser._id) ||
                      (m.sender._id === selectedUser._id && m.receiver._id === user._id)
                    )
                    .map((message) => (
                      <Box
                        key={message._id}
                        sx={{
                          display: 'flex',
                          justifyContent: message.sender._id === user._id ? 'flex-end' : 'flex-start',
                          mb: 1,
                        }}
                      >
                        <Paper
                          sx={{
                            p: 1,
                            maxWidth: '70%',
                            bgcolor: message.sender._id === user._id ? 'primary.main' : 'grey.100',
                            color: message.sender._id === user._id ? 'white' : 'text.primary',
                          }}
                        >
                          <Typography variant="body1">{message.content}</Typography>
                          <Typography variant="caption" sx={{ opacity: 0.7 }}>
                            {new Date(message.createdAt).toLocaleString()}
                          </Typography>
                        </Paper>
                      </Box>
                    ))}
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleSendMessage();
                      }
                    }}
                  />
                  <Button
                    variant="contained"
                    endIcon={<SendIcon />}
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                  >
                    Send
                  </Button>
                </Box>
              </>
            ) : (
              <Typography variant="body1" sx={{ textAlign: 'center', mt: 4 }}>
                Select a user to start chatting
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Messages; 