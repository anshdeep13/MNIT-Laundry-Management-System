import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  CircularProgress,
  Paper,
  TextField,
  Snackbar,
  Alert
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import { useNavigate } from 'react-router-dom';

const BookMachine = () => {
  // eslint-disable-next-line no-unused-vars
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [hostels, setHostels] = useState([]);
  const [machines, setMachines] = useState([]);
  const [selectedHostel, setSelectedHostel] = useState('');
  const [selectedMachine, setSelectedMachine] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [timeSlots, setTimeSlots] = useState({ thirtyMinutes: [], sixtyMinutes: [] });
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedDuration, setSelectedDuration] = useState(30);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  useEffect(() => {
    fetchHostels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  useEffect(() => {
    if (selectedHostel) {
      fetchMachines(selectedHostel);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedHostel]);
  
  useEffect(() => {
    if (selectedMachine && selectedDate) {
      fetchTimeSlots();
    } else {
      setTimeSlots({ thirtyMinutes: [], sixtyMinutes: [] });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMachine, selectedDate]);
  
  const fetchHostels = async () => {
    try {
      setLoading(true);
      
      // For students, only fetch their assigned hostel
      if (user && user.role === 'student' && user.hostel) {
        // Check if user.hostel is an object or string ID
        const hostelId = typeof user.hostel === 'object' ? user.hostel._id : user.hostel;
        
        console.log('User hostel ID:', hostelId);
        
        // Fetch the specific hostel details
        const response = await API.get(`/hostels/${hostelId}`);
        // Set the hostels state to an array with just the user's hostel
        setHostels([response.data]);
        setSelectedHostel(response.data._id);
      } else {
        // For admin/staff, fetch all hostels
        const response = await API.get('/hostels');
        setHostels(response.data);
        if (response.data.length > 0) {
          setSelectedHostel(response.data[0]._id);
        }
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching hostels:', error);
      showNotification('Failed to load hostels', 'error');
      setLoading(false);
      
      // Fall back to fetching all hostels if specific hostel fetch fails
      try {
        const response = await API.get('/hostels');
        setHostels(response.data);
        if (response.data.length > 0) {
          setSelectedHostel(response.data[0]._id);
        }
      } catch (fallbackError) {
        console.error('Error fetching all hostels as fallback:', fallbackError);
      }
    }
  };
  
  const fetchMachines = async (hostelId) => {
    try {
      setLoading(true);
      const response = await API.get(`/machines?hostel=${hostelId}`);
      // Filter to only show available machines
      const availableMachines = response.data.filter(m => m.status === 'available');
      setMachines(availableMachines);
      if (availableMachines.length > 0) {
        setSelectedMachine(availableMachines[0]._id);
      } else {
        setSelectedMachine('');
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching machines:', error);
      showNotification('Failed to load machines', 'error');
      setLoading(false);
    }
  };
  
  const fetchTimeSlots = async () => {
    try {
      setLoading(true);
      const response = await API.get('/bookings/available-slots', {
        params: {
          machineId: selectedMachine,
          date: selectedDate.toISOString().split('T')[0]
        }
      });
      setTimeSlots(response.data);
      setSelectedSlot(null); // Reset selected slot when fetching new slots
      setLoading(false);
    } catch (error) {
      console.error('Error fetching time slots:', error);
      showNotification('Failed to load available time slots', 'error');
      setLoading(false);
    }
  };
  
  const handleHostelChange = (e) => {
    setSelectedHostel(e.target.value);
    setSelectedMachine('');
    setTimeSlots({ thirtyMinutes: [], sixtyMinutes: [] });
    setSelectedSlot(null);
  };
  
  const handleMachineChange = (e) => {
    setSelectedMachine(e.target.value);
    setTimeSlots({ thirtyMinutes: [], sixtyMinutes: [] });
    setSelectedSlot(null);
  };
  
  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
    setTimeSlots({ thirtyMinutes: [], sixtyMinutes: [] });
    setSelectedSlot(null);
  };
  
  const handleDurationChange = (e) => {
    setSelectedDuration(Number(e.target.value));
    setSelectedSlot(null);
  };
  
  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
  };
  
  const handleBooking = async () => {
    if (!selectedSlot || !selectedMachine || !selectedHostel) {
      showNotification('Please select all required fields', 'error');
      return;
    }

    // Calculate amount based on duration
    const amount = selectedDuration === 30 ? 20 : 40;
    
    // Pre-check wallet balance to avoid unnecessary API call
    if (user?.walletBalance < amount) {
      showNotification(`Insufficient wallet balance. You need ₹${amount} for this booking.`, 'error');
      return;
    }
    
    try {
      setLoading(true);
      await API.post('/bookings', {
        machineId: selectedMachine,
        hostelId: selectedHostel,
        startTime: selectedSlot.start,
        duration: selectedDuration
      });
      
      showNotification(`Booking successful! ₹${amount} has been deducted from your wallet.`, 'success');
      setTimeout(() => {
        navigate('/bookings');
      }, 2000);
      
    } catch (error) {
      console.error('Error creating booking:', error);
      let errorMessage = 'Failed to create booking';
      
      if (error.response?.data?.msg) {
        errorMessage = error.response.data.msg;
      }
      
      showNotification(errorMessage, 'error');
      setLoading(false);
    }
  };
  
  const formatTimeSlot = (slot) => {
    const start = new Date(slot.start);
    const end = new Date(slot.end);
    
    const formatTime = (date) => {
      return date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    };
    
    return `${formatTime(start)} - ${formatTime(end)}`;
  };
  
  const showNotification = (message, severity = 'success') => {
    setNotification({
      open: true,
      message,
      severity
    });
  };
  
  const handleCloseNotification = () => {
    setNotification({
      ...notification,
      open: false
    });
  };
  
  const getUserHostelName = () => {
    if (!user || !user.hostel || hostels.length === 0) return 'Loading...';
    
    const userHostel = hostels.find(h => h._id === user.hostel);
    return userHostel ? userHostel.name : 'Your hostel';
  };
  
  if (loading && hostels.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Book a Machine
      </Typography>
      
      {/* Display wallet balance */}
      <Box mb={2} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Paper elevation={1} sx={{ p: 2, display: 'inline-flex', alignItems: 'center' }}>
          <Typography variant="subtitle1" sx={{ mr: 1 }}>
            Wallet Balance:
          </Typography>
          <Typography 
            variant="subtitle1" 
            color={user?.walletBalance < 20 ? 'error.main' : 'success.main'} 
            fontWeight="bold"
          >
            ₹{user?.walletBalance || 0}
          </Typography>
        </Paper>
      </Box>
      
      {/* Show insufficient balance warning if needed */}
      {user?.walletBalance < 20 && (
        <Box mb={3}>
          <Alert severity="warning" variant="outlined">
            Your wallet balance is low. Please recharge to book a machine.
          </Alert>
        </Box>
      )}
      
      <Box mb={4}>
        <Paper elevation={2} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Select Booking Details
          </Typography>
          
          <Grid container spacing={3}>
            {/* Hostel Selection */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth disabled={loading || (user?.role === 'student')}>
                <InputLabel>Hostel</InputLabel>
                <Select
                  value={selectedHostel}
                  onChange={handleHostelChange}
                  label="Hostel"
                >
                  {hostels.map((hostel) => (
                    <MenuItem key={hostel._id} value={hostel._id}>
                      {hostel.name}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>
                  {user?.role === 'student' 
                    ? `You can only book from your hostel (${getUserHostelName()})` 
                    : "Select a hostel"}
                </FormHelperText>
              </FormControl>
            </Grid>
            
            {/* Machine Selection */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth disabled={!selectedHostel || loading}>
                <InputLabel>Machine</InputLabel>
                <Select
                  value={selectedMachine}
                  onChange={handleMachineChange}
                  label="Machine"
                >
                  {machines.map((machine) => (
                    <MenuItem key={machine._id} value={machine._id}>
                      {machine.name} - {machine.type.toUpperCase()} 
                      {machine.status === 'available' ? (
                        <Typography component="span" color="success.main" sx={{ ml: 1, fontSize: '0.8rem' }}>
                          (Available)
                        </Typography>
                      ) : (
                        <Typography component="span" color="error.main" sx={{ ml: 1, fontSize: '0.8rem' }}>
                          ({machine.status})
                        </Typography>
                      )}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>
                  {machines.length === 0 
                    ? "No available machines in this hostel" 
                    : "Select a machine to book"}
                </FormHelperText>
              </FormControl>
            </Grid>
            
            {/* Date Selection */}
            <Grid item xs={12} md={6}>
              <TextField
                label="Select Date"
                type="date"
                value={selectedDate.toISOString().split('T')[0]}
                onChange={(e) => handleDateChange(new Date(e.target.value))}
                disabled={!selectedMachine || loading}
                fullWidth
                InputLabelProps={{
                  shrink: true,
                }}
                inputProps={{
                  min: new Date().toISOString().split('T')[0],
                }}
              />
            </Grid>
            
            {/* Duration Selection */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth disabled={!selectedMachine || loading}>
                <InputLabel>Duration</InputLabel>
                <Select
                  value={selectedDuration}
                  onChange={handleDurationChange}
                  label="Duration"
                >
                  <MenuItem value={30}>30 Minutes - ₹20</MenuItem>
                  <MenuItem value={60}>60 Minutes - ₹40</MenuItem>
                </Select>
                <FormHelperText>Select booking duration</FormHelperText>
              </FormControl>
            </Grid>
            
            {/* Pricing Info */}
            <Grid item xs={12} md={6}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Pricing Information
                </Typography>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2">30 Minutes:</Typography>
                  <Typography variant="body2" fontWeight="bold">₹20</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2">60 Minutes:</Typography>
                  <Typography variant="body2" fontWeight="bold">₹40</Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Paper>
      </Box>
      
      {selectedMachine && selectedHostel && selectedDate && (
        <Box mb={4}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Available Time Slots
            </Typography>
            
            {loading ? (
              <Box display="flex" justifyContent="center" p={3}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                {selectedDuration === 30 ? (
                  <>
                    {timeSlots.thirtyMinutes && timeSlots.thirtyMinutes.length > 0 ? (
                      <Grid container spacing={2}>
                        {timeSlots.thirtyMinutes.map((slot, index) => (
                          <Grid item xs={6} sm={4} md={3} key={index}>
                            <Button
                              variant={selectedSlot === slot ? "contained" : "outlined"}
                              fullWidth
                              onClick={() => handleSlotSelect(slot)}
                              sx={{ mb: 1 }}
                            >
                              {formatTimeSlot(slot)}
                            </Button>
                          </Grid>
                        ))}
                      </Grid>
                    ) : (
                      <Typography color="text.secondary">
                        No 30-minute slots available for this date. Try another date.
                      </Typography>
                    )}
                  </>
                ) : (
                  <>
                    {timeSlots.sixtyMinutes && timeSlots.sixtyMinutes.length > 0 ? (
                      <Grid container spacing={2}>
                        {timeSlots.sixtyMinutes.map((slot, index) => (
                          <Grid item xs={6} sm={4} md={3} key={index}>
                            <Button
                              variant={selectedSlot === slot ? "contained" : "outlined"}
                              fullWidth
                              onClick={() => handleSlotSelect(slot)}
                              sx={{ mb: 1 }}
                            >
                              {formatTimeSlot(slot)}
                            </Button>
                          </Grid>
                        ))}
                      </Grid>
                    ) : (
                      <Typography color="text.secondary">
                        No 60-minute slots available for this date. Try another date or a 30-minute booking.
                      </Typography>
                    )}
                  </>
                )}
              </>
            )}
          </Paper>
        </Box>
      )}
      
      <Box display="flex" justifyContent="space-between" alignItems="center" mt={3}>
        <Typography variant="body1" color="text.secondary">
          {selectedSlot && `Total cost: ₹${selectedDuration === 30 ? 20 : 40}`}
        </Typography>
        
        <Box>
          <Button 
            variant="outlined" 
            onClick={() => navigate(-1)} 
            sx={{ mr: 2 }}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleBooking}
            disabled={!selectedSlot || loading || (user?.walletBalance < (selectedDuration === 30 ? 20 : 40))}
          >
            {!selectedSlot ? 'Select a Time Slot' : 
              user?.walletBalance < (selectedDuration === 30 ? 20 : 40) ? 'Insufficient Balance' : 
              `Book Now (₹${selectedDuration === 30 ? 20 : 40})`}
          </Button>
        </Box>
      </Box>
      
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default BookMachine; 