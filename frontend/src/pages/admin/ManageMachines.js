import React, { useState, useEffect } from 'react';
import {
  Box, 
  Typography, 
  Button, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Chip,
  Grid,
  CircularProgress,
  Snackbar,
  Alert,
  FormHelperText
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as AvailableIcon,
  Cancel as UnavailableIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import API from '../../services/api';
import { useNavigate } from 'react-router-dom';

const API_DEBUG = true;
const API_DEBUG_VERBOSE = true;

const ManageMachines = () => {
  const { user } = useAuth();
  const [machines, setMachines] = useState([]);
  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'washer',
    status: 'available',
    hostel: '',
    costPerUse: 20,
    timePerUse: 30
  });
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchMachines();
    fetchHostels();
  }, []);

  // Add a new useEffect to track and debug form data changes
  useEffect(() => {
    console.log('Form data updated:', formData);
    // Check if hostel is valid whenever form data changes
    if (formData.hostel && hostels.length > 0) {
      const hostelExists = hostels.some(h => h._id === formData.hostel);
      if (!hostelExists) {
        console.warn('Current hostel ID in form is not in available hostels list:', formData.hostel);
      }
    }
  }, [formData, hostels]);

  const fetchMachines = async () => {
    try {
      const response = await API.get('/machines');
      setMachines(response.data);
    } catch (error) {
      console.error('Error fetching machines:', error);
      showNotification('Failed to load machines', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Debug function to show current form data
  const debugFormData = () => {
    console.log('Current form data:', formData);
    console.log('Available hostels:', hostels);
  };

  const fetchHostels = async () => {
    try {
      const response = await API.get('/hostels');
      console.log('Available hostels:', response.data);
      
      if (response.data && response.data.length > 0) {
        setHostels(response.data);
        
        // Set the default hostel if no hostel is selected
        if (!formData.hostel) {
          const defaultHostel = response.data[0]._id;
          console.log('Setting default hostel ID:', defaultHostel);
          setFormData(prev => ({
            ...prev,
            hostel: defaultHostel
          }));
        }
      } else {
        console.warn('No hostels found in the system');
        setHostels([]);
        
        // Reset hostel in formData if we have no hostels
        if (formData.hostel) {
          setFormData(prev => ({...prev, hostel: ''}));
        }
      }
    } catch (error) {
      console.error('Error fetching hostels:', error);
      showNotification('Failed to fetch hostels', 'error');
      setHostels([]);
    }
  };

  const handleDialogOpen = (machine = null) => {
    console.log('Opening dialog with machine:', machine);
    
    // Refresh hostels list first
    fetchHostels();
    
    // For editing, set the selected machine and populate form data
    if (machine) {
      console.log('Editing machine with data:', machine);
      setSelectedMachine(machine);
      setFormData({
        name: machine.name,
        hostel: machine.hostel._id || machine.hostel,
        status: machine.status
      });
      console.log('Form data set for editing:', { 
        name: machine.name, 
        hostel: machine.hostel._id || machine.hostel, 
        status: machine.status 
      });
    } else {
      // For adding, reset selected machine and set default form data
      console.log('Adding new machine');
      setSelectedMachine(null);
      
      // Check if we have hostels available and set default if needed
      if (hostels.length > 0) {
        const defaultHostel = hostels[0]._id;
        console.log('Using default hostel ID for new machine:', defaultHostel);
        
        setFormData({
          name: '',
          type: 'washer',
          status: 'available',
          hostel: defaultHostel,
          costPerUse: 20,
          timePerUse: 30
        });
      } else {
        console.warn('No hostels available for new machine');
        setFormData({
          name: '',
          type: 'washer',
          status: 'available',
          hostel: '',
          costPerUse: 20,
          timePerUse: 30
        });
      }
    }
    
    setOpenDialog(true);
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'costPerUse' || name === 'timePerUse' ? Number(value) : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Debug output before submission
      console.log('Form data to submit:', formData);
      console.log('Available hostels for validation:', hostels.map(h => ({ id: h._id, name: h.name })));
      
      // Validate the form data
      if (!formData.name) {
        showNotification('Please provide a machine name', 'error');
        return;
      }
      
      // Validate hostel is in the available hostels
      if (!formData.hostel) {
        showNotification('Please select a hostel. If no hostels are available, create one first.', 'error');
        return;
      }
      
      // Verify hostel exists in our local state
      const hostelExists = hostels.some(h => h._id === formData.hostel);
      if (!hostelExists) {
        console.error(`Selected hostel ID ${formData.hostel} is not in the available hostels list`);
        showNotification('Invalid hostel selected. Please select from the available hostels.', 'error');
        
        // Refresh hostels and update form with first available
        await fetchHostels();
        return;
      }

      // Prepare data for submission to match backend expectations
      const dataToSubmit = {
        name: formData.name,
        type: formData.type || 'washer',
        hostel: formData.hostel,
        status: formData.status,
        costPerUse: Number(formData.costPerUse),
        timePerUse: Number(formData.timePerUse)
      };

      // Log the data being sent for debugging
      if (API_DEBUG_VERBOSE) {
        console.log('------- MACHINE CREATION DEBUG -------');
        console.log('Formatted data for API submission:', dataToSubmit);
        console.log('Hostel ID type:', typeof dataToSubmit.hostel);
        console.log('Status value:', dataToSubmit.status);
        console.log('API URL:', API.defaults.baseURL + '/machines');
        console.log('Auth token:', localStorage.getItem('token')?.substring(0, 20) + '...');
        console.log('--------------------------------------');
      }

      if (selectedMachine) {
        // Update existing machine
        const url = `/machines/${selectedMachine._id}`;
        if (API_DEBUG) console.log(`Making PUT request to: ${url}`, dataToSubmit);
        const response = await API.put(url, dataToSubmit);
        console.log('Machine update response:', response.data);
        showNotification('Machine updated successfully');
      } else {
        // Create new machine
        const url = '/machines';
        if (API_DEBUG) {
          console.log('Making POST request to create new machine:');
          console.log(`URL: ${url}`);
          console.log('Data:', dataToSubmit);
          console.log('Token:', localStorage.getItem('token'));
        }
        const response = await API.post(url, dataToSubmit);
        console.log('Machine create response:', response.data);
        showNotification('Machine added successfully');
      }
      handleDialogClose();
      fetchMachines();
    } catch (error) {
      console.error('Error saving machine:', error);
      
      // Enhanced error handling
      let errorMessage = 'Failed to save machine';
      
      if (error.response) {
        console.error('Error details:', error.response.data);
        console.error('Error status:', error.response.status);
        
        // Handle specific error cases
        if (error.response.status === 404 && error.response.data.msg === 'Hostel not found') {
          // If we got available hostels in the response, update our local state
          if (error.response.data.availableHostels) {
            console.log('Updating hostels list with server data:', error.response.data.availableHostels);
            setHostels(error.response.data.availableHostels);
            
            // Reset hostel in form data
            if (error.response.data.availableHostels.length > 0) {
              const newHostelId = error.response.data.availableHostels[0]._id;
              setFormData(prev => ({...prev, hostel: newHostelId}));
              console.log('Updated form hostel ID to:', newHostelId);
            }
          }
          
          errorMessage = `Hostel not found. Please select a valid hostel.`;
          
          // Refresh hostels list
          fetchHostels();
        } else if (error.response.data.msg) {
          errorMessage = error.response.data.msg;
          
          // Add details if available
          if (error.response.data.details) {
            errorMessage += `: ${error.response.data.details}`;
          }
        }
      }
      
      showNotification(errorMessage, 'error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this machine?')) {
      try {
        await API.delete(`/machines/${id}`);
        showNotification('Machine deleted successfully');
        fetchMachines();
      } catch (error) {
        console.error('Error deleting machine:', error);
        showNotification('Failed to delete machine', 'error');
      }
    }
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

  if (!user || user.role !== 'admin') {
    return (
      <Box p={3}>
        <Typography variant="h5" color="error">
          Access Denied: Admin privileges required
        </Typography>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Grid container justifyContent="space-between" alignItems="center" mb={3}>
        <Grid item>
          <Typography variant="h4">Manage Machines</Typography>
        </Grid>
        <Grid item>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />} 
            onClick={() => handleDialogOpen()}
          >
            Add Machine
          </Button>
        </Grid>
      </Grid>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Hostel</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Cost (₹)</TableCell>
              <TableCell>Time (min)</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {machines.length > 0 ? (
              machines.map((machine) => (
                <TableRow key={machine._id}>
                  <TableCell>{machine.name}</TableCell>
                  <TableCell>
                    {machine.type === 'washer' ? 'Washing Machine' : 'Dryer'}
                  </TableCell>
                  <TableCell>
                    {machine.hostel?.name || 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={machine.status === 'available' ? <AvailableIcon /> : <UnavailableIcon />}
                      label={machine.status.charAt(0).toUpperCase() + machine.status.slice(1)}
                      color={machine.status === 'available' ? 'success' : 'error'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>₹{machine.costPerUse}</TableCell>
                  <TableCell>{machine.timePerUse} min</TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => handleDialogOpen(machine)} color="primary">
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(machine._id)} color="error">
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No machines found. Add a new machine to get started.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Machine Dialog */}
      <Dialog open={openDialog} onClose={handleDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedMachine ? 'Edit Machine' : 'Add New Machine'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" noValidate sx={{ mt: 2 }}>
            {hostels.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <Typography color="error" gutterBottom>
                  No hostels available!
                </Typography>
                <Typography variant="body2" paragraph>
                  You need to create at least one hostel before adding machines.
                </Typography>
                <Button 
                  variant="contained" 
                  onClick={() => {
                    handleDialogClose();
                    navigate('/admin/hostels');
                  }}
                >
                  Go to Hostel Management
                </Button>
              </Box>
            ) : (
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Machine Name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Type</InputLabel>
                    <Select
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      label="Type"
                    >
                      <MenuItem value="washer">Washing Machine</MenuItem>
                      <MenuItem value="dryer">Dryer</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      label="Status"
                    >
                      <MenuItem value="available">Available</MenuItem>
                      <MenuItem value="in_use">In Use</MenuItem>
                      <MenuItem value="maintenance">Maintenance</MenuItem>
                      <MenuItem value="out_of_order">Out of Order</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel id="hostel-label">Hostel</InputLabel>
                    <Select
                      labelId="hostel-label"
                      id="hostel"
                      name="hostel"
                      value={formData.hostel || ''}
                      onChange={handleInputChange}
                      label="Hostel"
                      required
                    >
                      {hostels.length > 0 ? (
                        hostels.map((hostel) => (
                          <MenuItem key={hostel._id} value={hostel._id}>
                            {hostel.name} (ID: {hostel._id})
                          </MenuItem>
                        ))
                      ) : (
                        <MenuItem disabled value="">
                          No hostels available
                        </MenuItem>
                      )}
                    </Select>
                    <FormHelperText>
                      {hostels.length === 0 
                        ? "Please create a hostel first" 
                        : "Select the hostel for this machine"}
                    </FormHelperText>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Cost Per Use (₹)"
                    name="costPerUse"
                    type="number"
                    value={formData.costPerUse}
                    onChange={handleInputChange}
                    InputProps={{ inputProps: { min: 0 } }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Time Per Use (minutes)"
                    name="timePerUse"
                    type="number"
                    value={formData.timePerUse}
                    onChange={handleInputChange}
                    InputProps={{ inputProps: { min: 1 } }}
                  />
                </Grid>
              </Grid>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          {hostels.length > 0 && (
            <Button onClick={handleSubmit} variant="contained">
              {selectedMachine ? 'Update' : 'Add'}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={5000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseNotification} severity={notification.severity}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ManageMachines; 