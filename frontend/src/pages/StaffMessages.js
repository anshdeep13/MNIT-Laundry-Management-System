import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  TextField,
  Button,
  Grid,
  CircularProgress,
  Badge,
  Divider,
  Alert,
  Snackbar,
  Container,
  useTheme,
} from '@mui/material';
import { Send as SendIcon, Person as PersonIcon, BugReport as DebugIcon, Info as InfoIcon } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { 
  getAllMessages, 
  getDirectMessages, 
  sendDirectMessage,
  getUsersByRole,
  markMessagesAsRead,
  testMessageService,
  diagnoseBackendServer,
  checkBackendConnection,
  testMessageSendFormats
} from '../services/message';
import api from '../services/api';
import { alpha } from '@mui/material/styles';
import StaffPageHeader from '../components/StaffPageHeader';

// Helper for local message storage
const LOCAL_MESSAGES_KEY = 'local_messages_staff';

const getLocalMessages = () => {
  try {
    const stored = localStorage.getItem(LOCAL_MESSAGES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error('Error reading local messages:', e);
    return [];
  }
};

const saveLocalMessage = (message) => {
  try {
    const messages = getLocalMessages();
    messages.push({
      ...message,
      _id: 'local_' + Date.now(),
      createdAt: new Date().toISOString(),
      status: 'local'
    });
    localStorage.setItem(LOCAL_MESSAGES_KEY, JSON.stringify(messages));
    return messages;
  } catch (e) {
    console.error('Error saving local message:', e);
    return [];
  }
};

// Helper component to show diagnostic summary
const DiagnosticSummary = ({ results }) => {
  if (!results) return null;
  
  const { connectionStatus, messageService, backendServer } = results;
  const isServerReachable = connectionStatus?.summary?.backendReachable;
  
  return (
    <Box sx={{ mb: 2 }}>
      <Alert severity={isServerReachable ? "info" : "error"}>
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          Server Status: {isServerReachable ? "Reachable" : "Unreachable"}
        </Typography>
        
        {isServerReachable ? (
          <Typography variant="body2">
            Server connection is working, but there may be an issue with the messaging feature.
            Please check the detailed diagnostics below.
          </Typography>
        ) : (
          <Typography variant="body2">
            Cannot connect to the server. This may be due to:
            <ul>
              <li>Server is down or having issues</li>
              <li>Network connectivity problems</li>
              <li>CORS configuration issues</li>
            </ul>
            Messaging will be available in offline mode only until connection is restored.
          </Typography>
        )}
      </Alert>
      
      {isServerReachable && messageService?.endpoints?.directMessageEndpoint && (
        <Alert severity="warning" sx={{ mt: 1 }}>
          <Typography variant="subtitle2">Message Endpoint Status:</Typography>
          <Typography variant="body2">
            {messageService.endpoints.directMessageEndpoint.optionsResponse?.status === 200 ? 
              "Message endpoint appears to be properly configured but may have internal errors." :
              "Message endpoint may be misconfigured or not responding properly."}
          </Typography>
        </Alert>
      )}
      
      {isServerReachable && backendServer?.messageTest?.sendTest && (
        <Alert severity={backendServer.messageTest.sendTest.ok ? "success" : "error"} sx={{ mt: 1 }}>
          <Typography variant="subtitle2">Message Sending Test:</Typography>
          <Typography variant="body2">
            {backendServer.messageTest.sendTest.ok ? 
              "Test message sent successfully!" :
              `Failed to send test message (${backendServer.messageTest.sendTest.status}: ${backendServer.messageTest.sendTest.statusText})`}
          </Typography>
        </Alert>
      )}
      
      <Box sx={{ mt: 2 }}>
        <Button 
          size="small" 
          variant="outlined" 
          onClick={() => window.open(api.defaults.baseURL, '_blank')}
        >
          Test Server URL Directly
        </Button>
      </Box>
    </Box>
  );
};

const StaffMessages = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [students, setStudents] = useState([]);
  const [error, setError] = useState(null);
  const [debugResults, setDebugResults] = useState(null);
  const [localMode, setLocalMode] = useState(false);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const messagesEndRef = useRef(null);
  const theme = useTheme();

  useEffect(() => {
    fetchMessages();
    fetchStudents();
  }, []);

  useEffect(() => {
    if (selectedUser) {
      fetchDirectMessages(selectedUser._id);
    }
  }, [selectedUser]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
    try {
      setLoading(true);
      // Use generic message endpoint
      const response = await api.get('/messages');
      setMessages(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setError('Failed to load messages. Please try again later.');
      setLoading(false);
    }
  };

  const fetchDirectMessages = async (userId) => {
    try {
      setLoading(true);
      
      // Ensure userId is a string
      const userIdStr = String(userId).trim();
      console.log('Fetching direct messages with user ID:', userIdStr);
      
      // Try multiple endpoints for fetching messages
      const attempts = [
        {
          url: `${api.defaults.baseURL}/messages/direct/${userIdStr}`,
          method: 'GET'
        },
        {
          url: `${api.defaults.baseURL}/staff/messages/direct/${userIdStr}`,
          method: 'GET'
        },
        // Handle potential alternative endpoint structures
        {
          url: `${api.defaults.baseURL}/messages/${userIdStr}`,
          method: 'GET'
        }
      ];
      
      let successfulResponse = null;
      let fetchedData = [];
      let lastError = null;
      
      // Try each endpoint until one works
      for (const attempt of attempts) {
        try {
          console.log(`Trying to fetch messages from: ${attempt.url}`);
          
          const token = localStorage.getItem('token');
          const response = await fetch(attempt.url, {
            method: attempt.method,
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'x-auth-token': token,
              'Authorization': `Bearer ${token}`
            },
            credentials: 'include'
          });
          
          if (response.ok) {
            const data = await response.json();
            console.log('Messages fetched successfully:', data);
            successfulResponse = response;
            fetchedData = data;
            break;
          } else {
            const errorText = await response.text();
            console.warn(`Fetch attempt failed with status ${response.status}:`, errorText);
            lastError = { status: response.status, text: errorText };
          }
        } catch (err) {
          console.error('Error with fetch attempt:', err);
          lastError = { error: err };
        }
      }
      
      // If any attempt was successful
      if (successfulResponse) {
        setMessages(fetchedData);
        
        // If we're in local mode, also include local messages
        if (localMode) {
          const localMessages = getLocalMessages().filter(msg => 
            (msg.sender === user._id && msg.receiver === userIdStr) ||
            (msg.sender === userIdStr && msg.receiver === user._id)
          );
          
          // Only add local messages if we found any
          if (localMessages.length > 0) {
            setMessages(prev => [...prev, ...localMessages]);
          }
        }
        
        setLoading(false);
        return;
      }
      
      // If all attempts failed, throw error
      throw new Error(`All message fetch attempts failed. Last error: ${lastError?.status || lastError?.error?.message}`);
    } catch (error) {
      console.error('Error fetching direct messages:', error);
      setError('Failed to load conversation. Showing local messages only.');
      setLoading(false);
      
      // Switch to local mode
      setLocalMode(true);
      setShowSnackbar(true);
      
      // Show local messages only
      const localMessages = getLocalMessages().filter(msg => 
        (msg.sender === user._id && msg.receiver === userId) ||
        (msg.sender === userId && msg.receiver === user._id)
      );
      setMessages(localMessages);
    }
  };

  const fetchStudents = async () => {
    try {
      // Direct fetch call to get students
      const token = localStorage.getItem('token');
      const response = await fetch(`${api.defaults.baseURL}/users`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'x-auth-token': token,
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch students with status: ${response.status}`);
      }
      
      const data = await response.json();
      setStudents(data.filter(user => user.role === 'student'));
    } catch (error) {
      console.error('Error fetching students:', error);
      setError('Failed to load students. Please try again later.');
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    
    // Capture input before clearing
    const messageContent = newMessage.trim();
    console.group('STAFF MESSAGE SEND OPERATION');
    console.log('Message send operation started', {
      timestamp: new Date().toISOString(),
      staffId: user._id,
      staffName: user.name,
      studentId: selectedUser._id,
      studentName: selectedUser.name,
      messageLength: messageContent.length,
      userAgent: navigator.userAgent,
      userRole: user.role
    });
    
    setLoading(true);
    
    try {
      console.log('Environment information:', {
        apiBaseUrl: api.defaults.baseURL,
        environment: process.env.NODE_ENV,
        apiTimeout: api.defaults.timeout || 'default',
        localStorage: {
          tokenExists: !!localStorage.getItem('token'),
          userExists: !!localStorage.getItem('user')
        }
      });
      
      console.log('Calling sendDirectMessage API with endpoint:', `${api.defaults.baseURL}/messages/direct`);
      console.log('Request payload:', {
        receiverId: selectedUser._id,
        content: messageContent.substring(0, 50) + (messageContent.length > 50 ? '...' : '')
      });
      
      const startTime = performance.now();
      console.log('About to call sendDirectMessage function - ' + new Date().toISOString());
      const response = await sendDirectMessage(selectedUser._id, messageContent);
      const endTime = performance.now();
      
      console.log('sendDirectMessage API response received - ' + new Date().toISOString(), {
        status: 'success',
        responseType: typeof response,
        responseId: response?._id || 'unknown',
        responseTimestamp: response?.createdAt || 'unknown'
      });
      console.log('Request duration:', (endTime - startTime).toFixed(2) + 'ms');
      
      setMessages(prevMessages => [...prevMessages, { 
        senderId: user._id, 
        content: messageContent,
        createdAt: new Date().toISOString()
      }]);
      
      setNewMessage('');
      console.log('Message sent successfully and state updated');
    } catch (error) {
      console.error('---------- ERROR IN HANDLE SEND MESSAGE ----------');
      console.error('Error type:', error.constructor.name);
      console.error('Error message:', error.message);
      
      // Enhanced error details
      const errorDetails = {
        message: error.message,
        stack: error.stack,
        name: error.name,
        status: error.response?.status,
        statusText: error.response?.statusText,
        responseData: error.response?.data
      };
      console.error('Error details:', errorDetails);
      
      // System state information
      console.log('System state at error time:', {
        networkState: navigator.onLine ? 'Online' : 'Offline',
        memoryInfo: performance?.memory ? {
          jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
          totalJSHeapSize: performance.memory.totalJSHeapSize,
          usedJSHeapSize: performance.memory.usedJSHeapSize
        } : 'Not available',
        timeOrigin: performance.timeOrigin,
        apiBaseURL: api.defaults.baseURL,
        selectedUserState: selectedUser ? {
          _id: selectedUser._id,
          role: selectedUser.role
        } : 'No user selected'
      });
      
      // Check for specific error types to give more detailed logging
      console.log('Network state:', navigator.onLine ? 'Online' : 'Offline');
      console.log('API base URL used:', api.defaults.baseURL);
      
      // Additional diagnostics for network problems
      try {
        const pingStart = performance.now();
        fetch(`${api.defaults.baseURL}/health`, { 
          method: 'GET',
          mode: 'no-cors',
          cache: 'no-cache'
        })
          .then(() => {
            const pingEnd = performance.now();
            console.log('Server ping test succeeded:', (pingEnd - pingStart).toFixed(2) + 'ms');
          })
          .catch(err => {
            console.error('Server ping test failed:', err.message);
          });
      } catch (pingError) {
        console.error('Error during ping test:', pingError);
      }
      
      // Custom error messages based on error type
      if (error.message && error.message.includes('500')) {
        setError('Server error: The message could not be sent due to a server issue. Please try again later.');
        console.error('Server error (500) detected when sending message');
        
        // Additional diagnostics for 500 error
        console.log('Attempting to diagnose 500 error. This could be:');
        console.log('1. Backend validation error');
        console.log('2. Database connection issue');
        console.log('3. Internal server exception');
        console.log('4. Message format or encoding issue');
        
        // Try to log possible problematic characters
        if (messageContent) {
          const specialChars = messageContent.match(/[^\w\s]/g);
          console.log('Message contains special characters:', specialChars ? specialChars.join('') : 'none');
          
          // Check for emoji or other non-ASCII characters
          const nonASCII = messageContent.match(/[^\x00-\x7F]/g);
          console.log('Message contains non-ASCII characters:', nonASCII ? nonASCII.join('') : 'none');
          
          // Check message length
          console.log('Message length (bytes):', new Blob([messageContent]).size);
        }
      } else if (error.message && error.message.includes('401')) {
        setError('Authentication error: Please log in again to send messages.');
        console.error('Authentication error (401) detected when sending message');
        
        // Token diagnostics
        const token = localStorage.getItem('token');
        if (token) {
          try {
            // Check if token is valid JSON Web Token format
            const tokenParts = token.split('.');
            console.log('Token format check:', {
              isCorrectFormat: tokenParts.length === 3,
              parts: tokenParts.length,
              firstChars: token.substring(0, 10) + '...'
            });
            
            // Try to decode payload without verification (just for debugging)
            if (tokenParts.length === 3) {
              try {
                const decoded = JSON.parse(atob(tokenParts[1]));
                console.log('Token payload valid JSON:', true);
                console.log('Token expiry time:', new Date(decoded.exp * 1000).toISOString());
                console.log('Token is expired:', Date.now() > decoded.exp * 1000);
              } catch (e) {
                console.log('Token payload is not valid JSON');
              }
            }
          } catch (e) {
            console.error('Error analyzing token:', e.message);
          }
        } else {
          console.log('No token found in localStorage');
        }
      } else if (error.message && error.message.includes('Network')) {
        setError('Network error: Please check your internet connection and try again.');
        console.error('Network error detected when sending message');
        
        // Additional network diagnostics
        if ('connection' in navigator) {
          console.log('Connection information:', {
            downlink: navigator.connection.downlink,
            effectiveType: navigator.connection.effectiveType,
            rtt: navigator.connection.rtt,
            saveData: navigator.connection.saveData
          });
        }
      } else {
        setError(`Failed to send message: ${error.message || 'Unknown error'}`);
        console.error('Unknown error type detected when sending message');
      }
    } finally {
      setLoading(false);
      console.log('Message sending process completed, loading state reset');
      console.groupEnd();
    }
  };

  const handleUserSelect = async (user) => {
    setSelectedUser(user);
    setError(null);
    try {
      // Direct fetch call for marking messages as read
      const token = localStorage.getItem('token');
      const response = await fetch(`${api.defaults.baseURL}/messages/read/${user._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'x-auth-token': token,
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      });
      
      if (!response.ok) {
        console.warn(`Failed to mark messages as read with status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const runDebugTest = async () => {
    try {
      setLoading(true);
      setError(null); // Clear any existing errors
      
      // First check if the backend is actually reachable
      const connectionStatus = await checkBackendConnection();
      
      // Run detailed diagnostic tools if connection is available
      let testResults = {};
      let backendResults = {};
      let messageFormatTests = {};
      
      if (connectionStatus.summary?.backendReachable) {
        // Basic connection works, get more detailed info
        testResults = await testMessageService();
        backendResults = await diagnoseBackendServer();
        
        // If a user is selected, test message formats
        if (selectedUser) {
          messageFormatTests = await testMessageSendFormats(
            selectedUser._id, 
            "This is an automated test message to identify working formats."
          );
        }
      }
      
      setDebugResults({
        connectionStatus,
        messageService: testResults,
        backendServer: backendResults,
        messageFormatTests,
        timestamp: new Date().toISOString()
      });
      
      // Display a useful error message if backend is unreachable
      if (!connectionStatus.summary?.backendReachable) {
        setError(`Cannot reach backend server at ${api.defaults.baseURL}. Please check your network connection or if the server is down.`);
      } else if (selectedUser && messageFormatTests.success) {
        // If we found a working format, show success
        const workingFormat = messageFormatTests.successfulFormats[0];
        setError(`Found a working message format! The "${workingFormat.formatDescription}" format works with endpoint: ${workingFormat.endpoint}`);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Debug test failed:', error);
      setError('Failed to run debug test: ' + error.message);
      setLoading(false);
    }
  };

  if (loading && !selectedUser) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  // Create a custom header action button with offline badge if needed
  const headerAction = (
    <Button 
      startIcon={<DebugIcon />} 
      variant="contained" 
      onClick={runDebugTest}
      sx={{ 
        bgcolor: 'rgba(255,255,255,0.2)', 
        '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } 
      }}
    >
      Diagnose Issues
    </Button>
  );

  // Create custom title component with offline badge if needed
  const headerTitle = (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Typography variant="h4" fontWeight="bold">
        Staff Messages
      </Typography>
      {localMode && (
        <Badge color="warning" badgeContent=" " variant="dot" sx={{ ml: 2 }}>
          <Typography variant="subtitle1" color="warning.main" sx={{ bgcolor: 'rgba(255,255,255,0.2)', px: 1.5, py: 0.5, borderRadius: 1 }}>
            Offline Mode
          </Typography>
        </Badge>
      )}
    </Box>
  );

  return (
    <Container maxWidth="lg">
      <StaffPageHeader 
        title={headerTitle}
        description="Communicate directly with students to answer questions and address issues with laundry services."
        icon={<SendIcon />}
        action={headerAction}
      />
      
      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
          {error}
        </Alert>
      )}
      
      {debugResults && (
        <>
          <DiagnosticSummary results={debugResults} />
          <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="subtitle2">Detailed Diagnostic Results:</Typography>
              <Button 
                size="small" 
                variant="text" 
                onClick={() => {
                  // Create and download diagnostic report
                  const dataStr = JSON.stringify(debugResults, null, 2);
                  const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
                  const downloadLink = document.createElement('a');
                  downloadLink.setAttribute('href', dataUri);
                  downloadLink.setAttribute('download', 'message-diagnostics.json');
                  document.body.appendChild(downloadLink);
                  downloadLink.click();
                  document.body.removeChild(downloadLink);
                }}
              >
                Download Report
              </Button>
            </Box>
            <Box sx={{ maxHeight: '200px', overflow: 'auto', borderRadius: 1, bgcolor: 'background.paper', p: 1, mt: 1 }}>
              <pre style={{ fontSize: '0.75rem' }}>
                {JSON.stringify(debugResults, null, 2)}
              </pre>
            </Box>
          </Alert>
        </>
      )}
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%', borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <PersonIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
              Students
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <List sx={{ overflowY: 'auto', maxHeight: 'calc(100vh - 300px)' }}>
              {students.map((student) => (
                <ListItem
                  key={student._id}
                  button
                  selected={selectedUser?._id === student._id}
                  onClick={() => handleUserSelect(student)}
                  sx={{ 
                    borderRadius: 1,
                    mb: 1,
                    '&.Mui-selected': {
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      '&:hover': {
                        bgcolor: alpha(theme.palette.primary.main, 0.15),
                      }
                    }
                  }}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                      <PersonIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={student.name}
                    secondary={`${student.hostel?.name || 'No Hostel'} - Room ${student.roomNumber || 'N/A'}`}
                  />
                </ListItem>
              ))}
              {students.length === 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
                  No students found
                </Typography>
              )}
            </List>
          </Paper>
        </Grid>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, height: '100%', borderRadius: 2, display: 'flex', flexDirection: 'column' }}>
            {selectedUser ? (
              <>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ bgcolor: theme.palette.primary.main, mr: 1.5, width: 28, height: 28 }}>
                    <PersonIcon fontSize="small" />
                  </Avatar>
                  Chat with {selectedUser.name}
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Box sx={{ height: 'calc(100vh - 360px)', overflowY: 'auto', mb: 2, bgcolor: alpha(theme.palette.background.default, 0.5), p: 2, borderRadius: 1 }}>
                  {loading ? (
                    <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                      <CircularProgress />
                    </Box>
                  ) : messages.length > 0 ? (
                    messages.map((message) => (
                      <Box
                        key={message._id || message.localId || Math.random().toString()}
                        sx={{
                          display: 'flex',
                          justifyContent: message.sender === user._id ? 'flex-end' : 'flex-start',
                          mb: 1.5,
                        }}
                      >
                        <Paper
                          sx={{
                            p: 1.5,
                            maxWidth: '75%',
                            bgcolor: message.sender === user._id ? theme.palette.primary.main : 'background.paper',
                            color: message.sender === user._id ? 'white' : 'text.primary',
                            borderRadius: message.sender === user._id ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                          }}
                        >
                          <Typography variant="body1">{message.content}</Typography>
                          <Typography variant="caption" sx={{ display: 'block', textAlign: 'right', opacity: 0.7, mt: 0.5 }}>
                            {new Date(message.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </Typography>
                        </Paper>
                      </Box>
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
                      No messages yet. Start the conversation!
                    </Typography>
                  )}
                  <div ref={messagesEndRef} />
                </Box>
                <Box sx={{ display: 'flex', gap: 1, mt: 'auto' }}>
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
                    sx={{ 
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '24px',
                        '&.Mui-focused fieldset': {
                          borderColor: theme.palette.primary.main,
                        }
                      }
                    }}
                  />
                  <Button
                    variant="contained"
                    endIcon={<SendIcon />}
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    sx={{ borderRadius: '24px', px: 3 }}
                  >
                    Send
                  </Button>
                </Box>
                {newMessage.trim() && (
                  <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button 
                      size="small" 
                      color="secondary" 
                      variant="outlined"
                      onClick={async () => {
                        try {
                          // Use XMLHttpRequest as a last resort (most basic approach)
                          const token = localStorage.getItem('token');
                          setError("Attempting ultra simple send...");
                          
                          // Create a minimal XHR request
                          const xhr = new XMLHttpRequest();
                          xhr.open('POST', `${api.defaults.baseURL}/staff/messages/direct`, true);
                          xhr.setRequestHeader('Content-Type', 'application/json');
                          xhr.setRequestHeader('x-auth-token', token);
                          
                          // Create a simple promise to handle the XHR
                          const result = await new Promise((resolve, reject) => {
                            xhr.onload = function() {
                              if (this.status >= 200 && this.status < 300) {
                                resolve({ success: true });
                              } else if (this.status === 500) {
                                // If failed, try alternative endpoint
                                const altXhr = new XMLHttpRequest();
                                altXhr.open('POST', `${api.defaults.baseURL}/messages/direct`, true);
                                altXhr.setRequestHeader('Content-Type', 'application/json');
                                altXhr.setRequestHeader('x-auth-token', token);
                                
                                altXhr.onload = function() {
                                  if (this.status >= 200 && this.status < 300) {
                                    resolve({ success: true, alternative: true });
                                  } else {
                                    reject(new Error(`All XHR attempts failed. Status: ${this.status}`));
                                  }
                                };
                                
                                altXhr.onerror = function() {
                                  reject(new Error('Alternative XHR failed'));
                                };
                                
                                // Use absolute minimal payload for alternative
                                altXhr.send(JSON.stringify({ 
                                  recipientId: selectedUser._id,
                                  content: newMessage 
                                }));
                              } else {
                                reject(new Error(`XHR failed with status ${xhr.status}`));
                              }
                            };
                            
                            xhr.onerror = function() {
                              reject(new Error('XHR request failed'));
                            };
                            
                            // Use absolute minimal payload
                            xhr.send(JSON.stringify({ 
                              recipientId: selectedUser._id,
                              content: newMessage 
                            }));
                          });
                          
                          // If we get here, the message was sent successfully
                          setError(null);
                          setNewMessage('');
                          await fetchDirectMessages(selectedUser._id);
                        } catch (err) {
                          console.error('Ultra simple send failed:', err);
                          setError(`Ultra simple send failed: ${err.message}. Please try direct API access.`);
                        }
                      }}
                      sx={{ borderRadius: '24px' }}
                    >
                      Try Ultra Simple Send
                    </Button>
                  </Box>
                )}
              </>
            ) : (
              <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100%">
                <PersonIcon sx={{ fontSize: 60, color: alpha(theme.palette.text.secondary, 0.2), mb: 2 }} />
                <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center' }}>
                  Select a student to start chatting
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
      
      {/* Snackbar for local mode notification */}
      <Snackbar
        open={showSnackbar}
        autoHideDuration={6000}
        onClose={() => setShowSnackbar(false)}
        message="You are in offline mode. Messages are being stored locally."
        action={
          <Button color="secondary" size="small" onClick={() => setShowSnackbar(false)}>
            OK
          </Button>
        }
      />
    </Container>
  );
};

export default StaffMessages; 