import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Alert,
  Tooltip,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  useTheme,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Apartment as ApartmentIcon,
  LocationOn as LocationIcon,
  Watch as WatchIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { staffAPI } from '../services/api';
import { alpha } from '@mui/material/styles';
import StaffPageHeader from '../components/StaffPageHeader';

const StaffHostels = () => {
  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('add'); // 'add' or 'edit'
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    machines: 0
  });
  const [selectedHostel, setSelectedHostel] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const theme = useTheme();

  // Fetch hostels on component mount
  useEffect(() => {
    fetchHostels();
  }, []);

  // Fetch hostels from API
  const fetchHostels = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await staffAPI.getHostels();
      setHostels(response.data);
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching hostels:', err);
      setError(`Failed to load hostels: ${err.message}`);
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'machines' ? parseInt(value, 10) || 0 : value
    }));
  };

  // Open add hostel dialog
  const handleAddClick = () => {
    setFormData({
      name: '',
      location: '',
      machines: 0
    });
    setDialogMode('add');
    setOpenDialog(true);
  };

  // Open edit hostel dialog
  const handleEditClick = (hostel) => {
    setSelectedHostel(hostel);
    setFormData({
      name: hostel.name,
      location: hostel.location || '',
      machines: hostel.machines?.length || 0
    });
    setDialogMode('edit');
    setOpenDialog(true);
  };

  // Open delete confirmation dialog
  const handleDeleteClick = (hostel) => {
    setSelectedHostel(hostel);
    setDeleteConfirmOpen(true);
  };

  // Close dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  // Close delete confirmation
  const handleCloseDeleteConfirm = () => {
    setDeleteConfirmOpen(false);
  };

  // Submit form data
  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      if (dialogMode === 'add') {
        // Add new hostel
        await staffAPI.addHostel(formData);
      } else {
        // Edit existing hostel
        await staffAPI.updateHostel(selectedHostel._id, formData);
      }
      
      // Refresh hostels list
      await fetchHostels();
      
      // Close dialog
      setOpenDialog(false);
      setLoading(false);
    } catch (err) {
      console.error('Error saving hostel:', err);
      setError(`Failed to save hostel: ${err.message}`);
      setLoading(false);
    }
  };

  // Delete hostel
  const handleDeleteConfirm = async () => {
    try {
      setLoading(true);
      
      await staffAPI.deleteHostel(selectedHostel._id);
      
      // Refresh hostels list
      await fetchHostels();
      
      // Close dialog
      setDeleteConfirmOpen(false);
      setLoading(false);
    } catch (err) {
      console.error('Error deleting hostel:', err);
      setError(`Failed to delete hostel: ${err.message}`);
      setLoading(false);
    }
  };

  if (loading && hostels.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <StaffPageHeader
        title="Manage Hostels"
        description="Add, edit, and manage hostel information for the laundry management system."
        icon={<ApartmentIcon />}
        action={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddClick}
            sx={{ 
              bgcolor: 'rgba(255,255,255,0.2)', 
              '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } 
            }}
          >
            Add Hostel
          </Button>
        }
      />
      
      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}
      
      {/* Display hostels in a grid of cards for modern look */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {hostels.map((hostel) => (
          <Grid item xs={12} sm={6} md={4} key={hostel._id}>
            <Card 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                },
                borderRadius: 2
              }}
            >
              <Box sx={{ 
                p: 2, 
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                display: 'flex',
                alignItems: 'center'
              }}>
                <ApartmentIcon sx={{ color: theme.palette.primary.main, mr: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {hostel.name}
                </Typography>
              </Box>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <LocationIcon fontSize="small" sx={{ color: theme.palette.text.secondary, mr: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    {hostel.location || 'No location specified'}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <WatchIcon fontSize="small" sx={{ color: theme.palette.text.secondary, mr: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    {hostel.machines?.length || 0} machines
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {hostel.machines?.length > 0 ? (
                    hostel.machines.map((machine) => (
                      <Chip 
                        key={machine._id}
                        label={machine.name}
                        size="small"
                        color={
                          machine.status === 'available' ? 'success' :
                          machine.status === 'in-use' ? 'primary' :
                          machine.status === 'maintenance' ? 'error' : 'default'
                        }
                      />
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No machines assigned
                    </Typography>
                  )}
                </Box>
              </CardContent>
              <CardActions sx={{ p: 2, pt: 0 }}>
                <Button 
                  size="small" 
                  startIcon={<EditIcon />}
                  onClick={() => handleEditClick(hostel)}
                >
                  Edit
                </Button>
                <Button 
                  size="small" 
                  color="error" 
                  startIcon={<DeleteIcon />}
                  onClick={() => handleDeleteClick(hostel)}
                >
                  Delete
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
        
        {hostels.length === 0 && !loading && (
          <Grid item xs={12}>
            <Paper sx={{ p: 3, borderRadius: 2, textAlign: 'center' }}>
              <Typography variant="body1" color="text.secondary">
                No hostels found. Click "Add Hostel" to create one.
              </Typography>
            </Paper>
          </Grid>
        )}
      </Grid>
      
      {/* Table view for detailed information */}
      <Paper sx={{ mb: 4, p: 3, borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          Hostel List
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Machines</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {hostels.map((hostel) => (
                <TableRow key={hostel._id}>
                  <TableCell>{hostel.name}</TableCell>
                  <TableCell>{hostel.location || '-'}</TableCell>
                  <TableCell>{hostel.machines?.length || 0}</TableCell>
                  <TableCell align="right">
                    <Tooltip title="Edit">
                      <IconButton 
                        size="small" 
                        color="primary"
                        onClick={() => handleEditClick(hostel)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={() => handleDeleteClick(hostel)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
              {hostels.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    No hostels found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      
      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {dialogMode === 'add' ? 'Add New Hostel' : 'Edit Hostel'}
        </DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            name="name"
            label="Hostel Name"
            fullWidth
            variant="outlined"
            value={formData.name}
            onChange={handleChange}
            required
            sx={{ mb: 2, mt: 1 }}
          />
          <TextField
            margin="dense"
            name="location"
            label="Location"
            fullWidth
            variant="outlined"
            value={formData.location}
            onChange={handleChange}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="machines"
            label="Number of Machines"
            type="number"
            fullWidth
            variant="outlined"
            value={formData.machines}
            onChange={handleChange}
            InputProps={{ readOnly: true }}
            helperText="Machine count is managed automatically when adding/removing machines"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="inherit" startIcon={<CancelIcon />}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            color="primary"
            disabled={!formData.name}
            startIcon={<SaveIcon />}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={handleCloseDeleteConfirm}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete <strong>{selectedHostel?.name}</strong>?
            {selectedHostel?.machines?.length > 0 && (
              <Typography color="error" sx={{ mt: 1 }}>
                Warning: This hostel has {selectedHostel.machines.length} machines associated with it.
                Deleting it will remove all machine assignments.
              </Typography>
            )}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteConfirm} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default StaffHostels; 