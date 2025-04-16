import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Tabs, 
  Tab, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Card,
  CardContent,
  CardHeader,
  Divider,
  CircularProgress,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Tooltip
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { format } from 'date-fns';
import { staffAPI } from '../services/api';
import { useTheme } from '@mui/material/styles';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import BuildIcon from '@mui/icons-material/Build';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import PendingIcon from '@mui/icons-material/Pending';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';
import LocalLaundryServiceIcon from '@mui/icons-material/LocalLaundryService';
import DashboardIcon from '@mui/icons-material/Dashboard';
import StaffPageHeader from '../components/StaffPageHeader';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

// TabPanel component for tab content
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const StaffDashboard = () => {
  const [tabValue, setTabValue] = useState(0);
  const [bookings, setBookings] = useState([]);
  const [bookingsByHostel, setBookingsByHostel] = useState([]);
  const [machines, setMachines] = useState([]);
  const [machinesByHostel, setMachinesByHostel] = useState([]);
  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const theme = useTheme();
  
  // Filter states for bookings
  const [selectedHostel, setSelectedHostel] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  
  // Filter states for machines
  const [selectedMachineHostel, setSelectedMachineHostel] = useState('');
  const [selectedMachineStatus, setSelectedMachineStatus] = useState('');
  const [selectedMachineType, setSelectedMachineType] = useState('');
  
  // Machine status update dialog
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [maintenanceNote, setMaintenanceNote] = useState('');
  const [newStatus, setNewStatus] = useState('');
  
  const [successMessage, setSuccessMessage] = useState(null);
  
  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Check if user is logged in
        const token = localStorage.getItem('token');
        if (!token) {
          setError('You are not logged in. Please log in to access the staff dashboard.');
          setLoading(false);
          return;
        }
        
        console.log('Fetching data with token:', token);
        
        // Fetch hostels
        try {
          const hostelsResponse = await staffAPI.getHostels();
          setHostels(hostelsResponse.data);
          console.log('Hostels fetched successfully:', hostelsResponse.data);
        } catch (err) {
          console.error('Error fetching hostels:', err);
          setError(`Error fetching hostels: ${err.message}`);
          setLoading(false);
          return;
        }
        
        // Fetch bookings by hostel
        try {
          const bookingsByHostelResponse = await staffAPI.getBookingsByHostel();
          setBookingsByHostel(bookingsByHostelResponse.data);
          console.log('Bookings by hostel fetched successfully:', bookingsByHostelResponse.data);
        } catch (err) {
          console.error('Error fetching bookings by hostel:', err);
          setError(`Error fetching bookings by hostel: ${err.message}`);
          setLoading(false);
          return;
        }
        
        // Fetch all bookings
        try {
          const bookingsResponse = await staffAPI.getBookings();
          setBookings(bookingsResponse.data);
          console.log('All bookings fetched successfully:', bookingsResponse.data);
        } catch (err) {
          console.error('Error fetching all bookings:', err);
          setError(`Error fetching all bookings: ${err.message}`);
          setLoading(false);
          return;
        }
        
        // Fetch machines by hostel
        try {
          const machinesByHostelResponse = await staffAPI.getMachinesByHostel();
          setMachinesByHostel(machinesByHostelResponse.data);
          console.log('Machines by hostel fetched successfully:', machinesByHostelResponse.data);
        } catch (err) {
          console.error('Error fetching machines by hostel:', err);
          setError(`Error fetching machines by hostel: ${err.message}`);
          setLoading(false);
          return;
        }
        
        // Fetch all machines
        try {
          const machinesResponse = await staffAPI.getMachines();
          setMachines(machinesResponse.data);
          console.log('All machines fetched successfully:', machinesResponse.data);
        } catch (err) {
          console.error('Error fetching all machines:', err);
          setError(`Error fetching all machines: ${err.message}`);
          setLoading(false);
          return;
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(`Failed to load data: ${err.message}. Please try again later.`);
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Handle booking filter changes
  const handleBookingFilterChange = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Build query params
      const params = {};
      if (selectedHostel) params.hostelId = selectedHostel;
      if (selectedStatus) params.status = selectedStatus;
      if (startDate) params.startDate = format(startDate, 'yyyy-MM-dd');
      if (endDate) params.endDate = format(endDate, 'yyyy-MM-dd');
      
      // Fetch filtered bookings
      const response = await staffAPI.getBookings(params);
      setBookings(response.data);
      
      setLoading(false);
    } catch (err) {
      console.error('Error filtering bookings:', err);
      setError('Failed to filter bookings. Please try again.');
      setLoading(false);
    }
  };
  
  // Handle machine filter changes
  const handleMachineFilterChange = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Build query params
      const params = {};
      if (selectedMachineHostel) params.hostelId = selectedMachineHostel;
      if (selectedMachineStatus) params.status = selectedMachineStatus;
      if (selectedMachineType) params.type = selectedMachineType;
      
      // Fetch filtered machines
      const response = await staffAPI.getMachines(params);
      setMachines(response.data);
      
      setLoading(false);
    } catch (err) {
      console.error('Error filtering machines:', err);
      setError('Failed to filter machines. Please try again.');
      setLoading(false);
    }
  };
  
  // Open machine status update dialog
  const handleOpenDialog = (machine) => {
    setSelectedMachine(machine);
    setNewStatus(machine.status);
    setMaintenanceNote('');
    setOpenDialog(true);
  };
  
  // Close machine status update dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedMachine(null);
    setNewStatus('');
    setMaintenanceNote('');
  };
  
  // Update machine status
  const handleUpdateMachineStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!selectedMachine) {
        setError('No machine selected');
        setLoading(false);
        return;
      }
      
      const response = await staffAPI.updateMachineStatus(selectedMachine._id, {
        status: newStatus,
        maintenanceNote: maintenanceNote
      });
      
      // Update machines list
      const updatedMachines = machines.map(machine => 
        machine._id === selectedMachine._id ? response.data : machine
      );
      setMachines(updatedMachines);
      
      // Update machines by hostel
      const updatedMachinesByHostel = machinesByHostel.map(hostelData => {
        if (hostelData.hostel._id === selectedMachine.hostel) {
          return {
            ...hostelData,
            machines: hostelData.machines.map(machine => 
              machine._id === selectedMachine._id ? response.data : machine
            )
          };
        }
        return hostelData;
      });
      setMachinesByHostel(updatedMachinesByHostel);
      
      handleCloseDialog();
      setLoading(false);
    } catch (err) {
      console.error('Error updating machine status:', err);
      setError('Failed to update machine status. Please try again.');
      setLoading(false);
    }
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    return format(new Date(dateString), 'MMM dd, yyyy hh:mm a');
  };
  
  // Get status color for chips
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'cancelled':
        return 'error';
      case 'in-progress':
        return 'info';
      default:
        return 'default';
    }
  };
  
  // Get machine status chip
  const getMachineStatusChip = (status) => {
    let color = 'default';
    let icon = null;
    
    switch (status) {
      case 'available':
        color = 'success';
        icon = <CheckCircleIcon fontSize="small" />;
        break;
      case 'in-use':
        color = 'info';
        icon = <AccessTimeIcon fontSize="small" />;
        break;
      case 'maintenance':
        color = 'error';
        icon = <BuildIcon fontSize="small" />;
        break;
      case 'offline':
        color = 'default';
        icon = <ErrorIcon fontSize="small" />;
        break;
      default:
        break;
    }
    
    return (
      <Chip 
        label={status.charAt(0).toUpperCase() + status.slice(1)} 
        color={color} 
        size="small"
        icon={icon}
      />
    );
  };
  
  // Add a function to get booking details before attempting to complete it
  const getAndLogBookingDetails = async (bookingId) => {
    try {
      // Find the booking in the current data
      const bookingInAll = bookings.find(b => b._id === bookingId);
      const hostelsWithBooking = bookingsByHostel.filter(h => 
        h.bookings.some(b => b._id === bookingId)
      );
      
      const bookingInByHostel = hostelsWithBooking.length > 0 
        ? hostelsWithBooking[0].bookings.find(b => b._id === bookingId)
        : null;
      
      const booking = bookingInAll || bookingInByHostel;
      
      if (booking) {
        console.log('Attempting to complete booking with details:', {
          id: booking._id,
          status: booking.status,
          startTime: booking.startTime,
          endTime: booking.endTime,
          user: booking.user?.name,
          machine: booking.machine?.name
        });
      } else {
        console.log('Booking not found in local state, ID:', bookingId);
      }
      
      return booking?.status;
    } catch (err) {
      console.error('Error getting booking details:', err);
      return null;
    }
  };
  
  // Handle booking completion
  const handleCompleteBooking = async (bookingId) => {
    try {
      setLoading(true);
      setError(null);
      setSuccessMessage(null);
      
      // Get booking details for debugging
      const status = await getAndLogBookingDetails(bookingId);
      console.log('Booking status before completion attempt:', status);
      
      console.log('Sending complete booking request with ID:', bookingId);
      
      // Call the API to complete the booking
      const response = await staffAPI.completeBooking(bookingId);
      console.log('Booking completed successfully:', response.data);
      
      // Show success message
      setSuccessMessage('Booking completed successfully!');
      
      // Fetch updated booking data
      const bookingsResponse = await staffAPI.getBookings();
      setBookings(bookingsResponse.data);
      
      const bookingsByHostelResponse = await staffAPI.getBookingsByHostel();
      setBookingsByHostel(bookingsByHostelResponse.data);
      
      setLoading(false);
    } catch (err) {
      console.error('Error completing booking:', err);
      
      // Display the specific error message from the API if available
      const errorMsg = err.data?.msg || err.message || 'Unknown error';
      setError(`Failed to complete booking: ${errorMsg}`);
      
      // Log more details to help debugging
      if (err.data) {
        console.log('Error details:', err.data);
      }
      
      setLoading(false);
    }
  };
  
  // Render bookings by hostel
  const renderBookingsByHostel = () => {
    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      );
    }
    
    if (error) {
      return (
        <Alert severity="error" sx={{ my: 2 }}>
          {error}
        </Alert>
      );
    }
    
    if (bookingsByHostel.length === 0) {
      return (
        <Alert severity="info" sx={{ my: 2 }}>
          No bookings found.
        </Alert>
      );
    }
    
    return (
      <Box>
        {bookingsByHostel.map((hostelData) => (
          <Accordion key={hostelData.hostel._id} defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">
                {hostelData.hostel.name} - {hostelData.bookings.length} Bookings
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>User</TableCell>
                      <TableCell>Machine</TableCell>
                      <TableCell>Start Time</TableCell>
                      <TableCell>End Time</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Payment</TableCell>
                      <TableCell width="140px">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {hostelData.bookings.map((booking) => (
                      <TableRow key={booking._id}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <PersonIcon fontSize="small" sx={{ mr: 1 }} />
                            {booking.user.name} (Room {booking.user.roomNumber})
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <LocalLaundryServiceIcon fontSize="small" sx={{ mr: 1 }} />
                            {booking.machine.name}
                          </Box>
                        </TableCell>
                        <TableCell>{formatDate(booking.startTime)}</TableCell>
                        <TableCell>{formatDate(booking.endTime)}</TableCell>
                        <TableCell>
                          <Chip 
                            label={booking.status.charAt(0).toUpperCase() + booking.status.slice(1)} 
                            color={getStatusColor(booking.status)} 
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={booking.paymentStatus} 
                            color={booking.paymentStatus === 'paid' ? 'success' : 'warning'} 
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {(booking.status === 'in-progress' || booking.status === 'confirmed') && (
                            <Button
                              variant="contained"
                              color="success"
                              size="small"
                              startIcon={<CheckCircleOutlineIcon />}
                              onClick={() => handleCompleteBooking(booking._id)}
                            >
                              Complete
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
    );
  };
  
  // Render machines by hostel
  const renderMachinesByHostel = () => {
    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      );
    }
    
    if (error) {
      return (
        <Alert severity="error" sx={{ my: 2 }}>
          {error}
        </Alert>
      );
    }
    
    if (machinesByHostel.length === 0) {
      return (
        <Alert severity="info" sx={{ my: 2 }}>
          No machines found.
        </Alert>
      );
    }
    
    return (
      <Box>
        {machinesByHostel.map((hostelData) => (
          <Accordion key={hostelData.hostel._id} defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">
                {hostelData.hostel.name} - {hostelData.machines.length} Machines
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                {hostelData.machines.map((machine) => (
                  <Grid item xs={12} sm={6} md={4} key={machine._id}>
                    <Card variant="outlined">
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography variant="h6">
                            {machine.name}
                          </Typography>
                          {getMachineStatusChip(machine.status)}
                        </Box>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Hostel: {machine.hostel.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Type: {machine.type}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Last Maintenance: {machine.lastMaintenance ? formatDate(machine.lastMaintenance) : 'Never'}
                        </Typography>
                        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                          <Tooltip title="Update Status">
                            <IconButton 
                              size="small" 
                              color="primary" 
                              onClick={() => handleOpenDialog(machine)}
                            >
                              <BuildIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
    );
  };
  
  if (loading && !selectedMachine) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <StaffPageHeader
        title="Staff Dashboard"
        description="Manage bookings, machines, and monitor campus laundry operations from one central location."
        icon={<DashboardIcon />}
      />
      
      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}
      
      {successMessage && (
        <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
          {successMessage}
        </Alert>
      )}
        
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          indicatorColor="primary" 
          textColor="primary" 
          sx={{ mb: 3 }}
        >
          <Tab label="Bookings by Hostel" />
          <Tab label="Machines by Hostel" />
          <Tab label="All Bookings" />
          <Tab label="All Machines" />
        </Tabs>
        
        <TabPanel value={tabValue} index={0}>
          <Typography variant="h5" gutterBottom>
            Bookings by Hostel
          </Typography>
          {renderBookingsByHostel()}
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <Typography variant="h5" gutterBottom>
            Machines by Hostel
          </Typography>
          {renderMachinesByHostel()}
        </TabPanel>
        
        <TabPanel value={tabValue} index={2}>
          <Typography variant="h5" gutterBottom>
            All Bookings
          </Typography>
          
          <Box sx={{ mb: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Hostel</InputLabel>
                  <Select
                    value={selectedHostel}
                    label="Hostel"
                    onChange={(e) => setSelectedHostel(e.target.value)}
                  >
                    <MenuItem value="">All Hostels</MenuItem>
                    {hostels.map((hostel) => (
                      <MenuItem key={hostel._id} value={hostel._id}>
                        {hostel.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={selectedStatus}
                    label="Status"
                    onChange={(e) => setSelectedStatus(e.target.value)}
                  >
                    <MenuItem value="">All Statuses</MenuItem>
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="in-progress">In Progress</MenuItem>
                    <MenuItem value="completed">Completed</MenuItem>
                    <MenuItem value="cancelled">Cancelled</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Start Date"
                    value={startDate}
                    onChange={setStartDate}
                    renderInput={(params) => <TextField {...params} size="small" fullWidth />}
                  />
                </LocalizationProvider>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="End Date"
                    value={endDate}
                    onChange={setEndDate}
                    renderInput={(params) => <TextField {...params} size="small" fullWidth />}
                  />
                </LocalizationProvider>
              </Grid>
              <Grid item xs={12}>
                <Button 
                  variant="contained" 
                  onClick={handleBookingFilterChange}
                  disabled={loading}
                >
                  Apply Filters
                </Button>
              </Grid>
            </Grid>
          </Box>
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ my: 2 }}>
              {error}
            </Alert>
          ) : bookings.length === 0 ? (
            <Alert severity="info" sx={{ my: 2 }}>
              No bookings found.
            </Alert>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>User</TableCell>
                    <TableCell>Hostel</TableCell>
                    <TableCell>Machine</TableCell>
                    <TableCell>Start Time</TableCell>
                    <TableCell>End Time</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Payment</TableCell>
                    <TableCell width="140px">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {bookings.map((booking) => (
                    <TableRow key={booking._id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <PersonIcon fontSize="small" sx={{ mr: 1 }} />
                          {booking.user.name} (Room {booking.user.roomNumber})
                        </Box>
                      </TableCell>
                      <TableCell>{booking.hostel.name}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <LocalLaundryServiceIcon fontSize="small" sx={{ mr: 1 }} />
                          {booking.machine.name}
                        </Box>
                      </TableCell>
                      <TableCell>{formatDate(booking.startTime)}</TableCell>
                      <TableCell>{formatDate(booking.endTime)}</TableCell>
                      <TableCell>
                        <Chip 
                          label={booking.status.charAt(0).toUpperCase() + booking.status.slice(1)} 
                          color={getStatusColor(booking.status)} 
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={booking.paymentStatus} 
                          color={booking.paymentStatus === 'paid' ? 'success' : 'warning'} 
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {(booking.status === 'in-progress' || booking.status === 'confirmed') && (
                          <Button
                            variant="contained"
                            color="success"
                            size="small"
                            startIcon={<CheckCircleOutlineIcon />}
                            onClick={() => handleCompleteBooking(booking._id)}
                          >
                            Complete
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </TabPanel>
        
        <TabPanel value={tabValue} index={3}>
          <Typography variant="h5" gutterBottom>
            All Machines
          </Typography>
          
          <Box sx={{ mb: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Hostel</InputLabel>
                  <Select
                    value={selectedMachineHostel}
                    label="Hostel"
                    onChange={(e) => setSelectedMachineHostel(e.target.value)}
                  >
                    <MenuItem value="">All Hostels</MenuItem>
                    {hostels.map((hostel) => (
                      <MenuItem key={hostel._id} value={hostel._id}>
                        {hostel.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={selectedMachineStatus}
                    label="Status"
                    onChange={(e) => setSelectedMachineStatus(e.target.value)}
                  >
                    <MenuItem value="">All Statuses</MenuItem>
                    <MenuItem value="available">Available</MenuItem>
                    <MenuItem value="in-use">In Use</MenuItem>
                    <MenuItem value="maintenance">Maintenance</MenuItem>
                    <MenuItem value="offline">Offline</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={selectedMachineType}
                    label="Type"
                    onChange={(e) => setSelectedMachineType(e.target.value)}
                  >
                    <MenuItem value="">All Types</MenuItem>
                    <MenuItem value="washer">Washer</MenuItem>
                    <MenuItem value="dryer">Dryer</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <Button 
                  variant="contained" 
                  onClick={handleMachineFilterChange}
                  disabled={loading}
                >
                  Apply Filters
                </Button>
              </Grid>
            </Grid>
          </Box>
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ my: 2 }}>
              {error}
            </Alert>
          ) : machines.length === 0 ? (
            <Alert severity="info" sx={{ my: 2 }}>
              No machines found.
            </Alert>
          ) : (
            <Grid container spacing={2}>
              {machines.map((machine) => (
                <Grid item xs={12} sm={6} md={4} key={machine._id}>
                  <Card variant="outlined">
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="h6">
                          {machine.name}
                        </Typography>
                        {getMachineStatusChip(machine.status)}
                      </Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Hostel: {machine.hostel.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Type: {machine.type}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Last Maintenance: {machine.lastMaintenance ? formatDate(machine.lastMaintenance) : 'Never'}
                      </Typography>
                      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                        <Tooltip title="Update Status">
                          <IconButton 
                            size="small" 
                            color="primary" 
                            onClick={() => handleOpenDialog(machine)}
                          >
                            <BuildIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </TabPanel>
      </Paper>
      
      {/* Machine Status Update Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Update Machine Status</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1">
              {selectedMachine?.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Current Status: {selectedMachine?.status}
            </Typography>
          </Box>
          
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>New Status</InputLabel>
            <Select
              value={newStatus}
              label="New Status"
              onChange={(e) => setNewStatus(e.target.value)}
            >
              <MenuItem value="available">Available</MenuItem>
              <MenuItem value="in-use">In Use</MenuItem>
              <MenuItem value="maintenance">Maintenance</MenuItem>
              <MenuItem value="offline">Offline</MenuItem>
            </Select>
          </FormControl>
          
          {newStatus === 'maintenance' && (
            <TextField
              fullWidth
              label="Maintenance Note"
              multiline
              rows={3}
              value={maintenanceNote}
              onChange={(e) => setMaintenanceNote(e.target.value)}
              sx={{ mb: 2 }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleUpdateMachineStatus} 
            variant="contained" 
            color="primary"
            disabled={loading}
          >
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default StaffDashboard; 