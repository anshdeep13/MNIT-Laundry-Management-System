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
  IconButton,
  Grid,
  CircularProgress,
  Snackbar,
  Alert,
  Card,
  CardContent,
  CardHeader,
  CardMedia,
  Stack
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  LocationOn as LocationIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import API from '../../services/api';

const ManageHostels = () => {
  const { user } = useAuth();
  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedHostel, setSelectedHostel] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    totalMachines: 0,
    description: '',
    imageUrl: 'https://via.placeholder.com/150x100?text=Hostel+Image'
  });
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    fetchHostels();
  }, []);

  const fetchHostels = async () => {
    try {
      const response = await API.get('/hostels');
      setHostels(response.data);
    } catch (error) {
      console.error('Error fetching hostels:', error);
      showNotification('Failed to load hostels', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDialogOpen = (hostel = null) => {
    if (hostel) {
      setSelectedHostel(hostel);
      setFormData({
        name: hostel.name,
        location: hostel.location,
        totalMachines: hostel.totalMachines,
        description: hostel.description || '',
        imageUrl: hostel.imageUrl || 'https://via.placeholder.com/150x100?text=Hostel+Image'
      });
    } else {
      setSelectedHostel(null);
      setFormData({
        name: '',
        location: '',
        totalMachines: 0,
        description: '',
        imageUrl: 'https://via.placeholder.com/150x100?text=Hostel+Image'
      });
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
      [name]: name === 'totalMachines' ? Number(value) : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedHostel) {
        // Update existing hostel
        await API.put(`/hostels/${selectedHostel._id}`, formData);
        showNotification('Hostel updated successfully');
      } else {
        // Create new hostel
        await API.post('/hostels', formData);
        showNotification('Hostel added successfully');
      }
      handleDialogClose();
      fetchHostels();
    } catch (error) {
      console.error('Error saving hostel:', error);
      showNotification('Failed to save hostel', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this hostel? This will also remove all machines assigned to this hostel.')) {
      try {
        await API.delete(`/hostels/${id}`);
        showNotification('Hostel deleted successfully');
        fetchHostels();
      } catch (error) {
        console.error('Error deleting hostel:', error);
        showNotification('Failed to delete hostel', 'error');
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
          <Typography variant="h4">Manage Hostels</Typography>
        </Grid>
        <Grid item>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />} 
            onClick={() => handleDialogOpen()}
          >
            Add Hostel
          </Button>
        </Grid>
      </Grid>

      {hostels.length > 0 ? (
        <Grid container spacing={3}>
          {hostels.map((hostel) => (
            <Grid item xs={12} md={6} lg={4} key={hostel._id}>
              <Card>
                <CardHeader
                  title={hostel.name}
                  subheader={
                    <Stack direction="row" spacing={1} alignItems="center">
                      <LocationIcon fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {hostel.location}
                      </Typography>
                    </Stack>
                  }
                  action={
                    <Box>
                      <IconButton onClick={() => handleDialogOpen(hostel)} size="small" color="primary">
                        <EditIcon />
                      </IconButton>
                      <IconButton onClick={() => handleDelete(hostel._id)} size="small" color="error">
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  }
                />
                <CardMedia
                  component="img"
                  height="140"
                  image={hostel.imageUrl || "https://via.placeholder.com/150x100?text=Hostel+Image"}
                  alt={hostel.name}
                />
                <CardContent>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {hostel.description || "No description available"}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    <strong>Total Machines:</strong> {hostel.totalMachines}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Machines Available:</strong> {hostel.machinesAvailable || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1">
            No hostels found. Add a new hostel to get started.
          </Typography>
        </Paper>
      )}

      {/* Add/Edit Hostel Dialog */}
      <Dialog open={openDialog} onClose={handleDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedHostel ? 'Edit Hostel' : 'Add New Hostel'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" noValidate sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Hostel Name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Total Machines"
                  name="totalMachines"
                  type="number"
                  value={formData.totalMachines}
                  onChange={handleInputChange}
                  InputProps={{ inputProps: { min: 0 } }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  multiline
                  rows={3}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Image URL"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleInputChange}
                  helperText="Enter URL for hostel image"
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {selectedHostel ? 'Update' : 'Add'}
          </Button>
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

export default ManageHostels; 