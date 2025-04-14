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
  Chip
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { format } from 'date-fns';
import { staffAPI } from '../services/api';

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
  
  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch hostels
        const hostelsResponse = await staffAPI.getHostels();
        setHostels(hostelsResponse.data);
        
        // Fetch bookings by hostel
        const bookingsByHostelResponse = await staffAPI.getBookingsByHostel();
        setBookingsByHostel(bookingsByHostelResponse.data);
        
        // Fetch all bookings
        const bookingsResponse = await staffAPI.getBookings();
        setBookings(bookingsResponse.data);
        
        // Fetch machines by hostel
        const machinesByHostelResponse = await staffAPI.getMachinesByHostel();
        setMachinesByHostel(machinesByHostelResponse.data);
        
        // Fetch all machines
        const machinesResponse = await staffAPI.getMachines();
        setMachines(machinesResponse.data);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again later.');
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
      
      const data = { status: newStatus };
      if (newStatus === 'maintenance' && maintenanceNote) {
        data.maintenanceNote = maintenanceNote;
      }
      
      await staffAPI.updateMachineStatus(selectedMachine._id, data);
      
      // Refresh machines data
      const machinesResponse = await staffAPI.getMachines();
      setMachines(machinesResponse.data);
      
      const machinesByHostelResponse = await staffAPI.getMachinesByHostel();
      setMachinesByHostel(machinesByHostelResponse.data);
      
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
  
  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'primary';
      case 'in_progress': return 'info';
      case 'completed': return 'success';
      case 'cancelled': return 'error';
      case 'available': return 'success';
      case 'in_use': return 'warning';
      case 'maintenance': return 'error';
      case 'out-of-order': return 'error';
      default: return 'default';
    }
  };
  
  // Get machine status chip
  const getMachineStatusChip = (status) => {
    let label = status.replace('_', ' ');
    if (status === 'out-of-order') {
      label = 'Out of Order';
    }
    
    return (
      <Chip 
        label={label} 
        color={getStatusColor(status)} 
        size="small"
      />
    );
  };
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Staff Dashboard
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Paper sx={{ width: '100%', mb: 2 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="All Bookings" />
          <Tab label="Bookings by Hostel" />
          <Tab label="Machine Status" />
          <Tab label="Machines by Hostel" />
        </Tabs>
        
        {/* All Bookings Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ mb: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
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
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={selectedStatus}
                    label="Status"
                    onChange={(e) => setSelectedStatus(e.target.value)}
                  >
                    <MenuItem value="">All Statuses</MenuItem>
                    <MenuItem value="confirmed">Confirmed</MenuItem>
                    <MenuItem value="in_progress">In Progress</MenuItem>
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
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                </LocalizationProvider>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="End Date"
                    value={endDate}
                    onChange={setEndDate}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                </LocalizationProvider>
              </Grid>
            </Grid>
            
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Button 
                variant="contained" 
                color="primary"
                onClick={handleBookingFilterChange}
                disabled={loading}
              >
                Apply Filters
              </Button>
            </Box>
          </Box>
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Booking ID</TableCell>
                    <TableCell>Student</TableCell>
                    <TableCell>Room</TableCell>
                    <TableCell>Hostel</TableCell>
                    <TableCell>Machine</TableCell>
                    <TableCell>Start Time</TableCell>
                    <TableCell>End Time</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Payment</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {bookings.length > 0 ? (
                    bookings.map((booking) => (
                      <TableRow key={booking._id}>
                        <TableCell>{booking._id.substring(0, 8)}</TableCell>
                        <TableCell>{booking.user.name}</TableCell>
                        <TableCell>{booking.user.roomNumber}</TableCell>
                        <TableCell>{booking.hostel.name}</TableCell>
                        <TableCell>{booking.machine.name}</TableCell>
                        <TableCell>{formatDate(booking.startTime)}</TableCell>
                        <TableCell>{formatDate(booking.endTime)}</TableCell>
                        <TableCell>
                          <Chip 
                            label={booking.status.replace('_', ' ')} 
                            color={getStatusColor(booking.status)} 
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {booking.paymentStatus ? (
                            <Chip label="Paid" color="success" size="small" />
                          ) : (
                            <Chip label="Unpaid" color="error" size="small" />
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={9} align="center">
                        No bookings found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </TabPanel>
        
        {/* Bookings by Hostel Tab */}
        <TabPanel value={tabValue} index={1}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Grid container spacing={3}>
              {bookingsByHostel.map((item) => (
                <Grid item xs={12} key={item.hostel._id}>
                  <Card>
                    <CardHeader 
                      title={item.hostel.name} 
                      subheader={item.hostel.location}
                    />
                    <Divider />
                    <CardContent>
                      {item.bookings.length > 0 ? (
                        <TableContainer>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>Booking ID</TableCell>
                                <TableCell>Student</TableCell>
                                <TableCell>Room</TableCell>
                                <TableCell>Machine</TableCell>
                                <TableCell>Start Time</TableCell>
                                <TableCell>End Time</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Payment</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {item.bookings.map((booking) => (
                                <TableRow key={booking._id}>
                                  <TableCell>{booking._id.substring(0, 8)}</TableCell>
                                  <TableCell>{booking.user.name}</TableCell>
                                  <TableCell>{booking.user.roomNumber}</TableCell>
                                  <TableCell>{booking.machine.name}</TableCell>
                                  <TableCell>{formatDate(booking.startTime)}</TableCell>
                                  <TableCell>{formatDate(booking.endTime)}</TableCell>
                                  <TableCell>
                                    <Chip 
                                      label={booking.status.replace('_', ' ')} 
                                      color={getStatusColor(booking.status)} 
                                      size="small"
                                    />
                                  </TableCell>
                                  <TableCell>
                                    {booking.paymentStatus ? (
                                      <Chip label="Paid" color="success" size="small" />
                                    ) : (
                                      <Chip label="Unpaid" color="error" size="small" />
                                    )}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      ) : (
                        <Typography variant="body2" color="text.secondary" align="center">
                          No bookings found for this hostel
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </TabPanel>
        
        {/* Machine Status Tab */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ mb: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth>
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
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={selectedMachineStatus}
                    label="Status"
                    onChange={(e) => setSelectedMachineStatus(e.target.value)}
                  >
                    <MenuItem value="">All Statuses</MenuItem>
                    <MenuItem value="available">Available</MenuItem>
                    <MenuItem value="in_use">In Use</MenuItem>
                    <MenuItem value="maintenance">Maintenance</MenuItem>
                    <MenuItem value="out-of-order">Out of Order</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth>
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
            </Grid>
            
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Button 
                variant="contained" 
                color="primary"
                onClick={handleMachineFilterChange}
                disabled={loading}
              >
                Apply Filters
              </Button>
            </Box>
          </Box>
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Machine Name</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Hostel</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Cost</TableCell>
                    <TableCell>Time</TableCell>
                    <TableCell>Last Maintenance</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {machines.length > 0 ? (
                    machines.map((machine) => (
                      <TableRow key={machine._id}>
                        <TableCell>{machine.name}</TableCell>
                        <TableCell>{machine.type.charAt(0).toUpperCase() + machine.type.slice(1)}</TableCell>
                        <TableCell>{machine.hostel.name}</TableCell>
                        <TableCell>{getMachineStatusChip(machine.status)}</TableCell>
                        <TableCell>₹{machine.costPerUse}</TableCell>
                        <TableCell>{machine.timePerUse} min</TableCell>
                        <TableCell>
                          {machine.lastMaintenance 
                            ? formatDate(machine.lastMaintenance) 
                            : 'Never'}
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="outlined" 
                            size="small"
                            onClick={() => handleOpenDialog(machine)}
                          >
                            Update Status
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} align="center">
                        No machines found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </TabPanel>
        
        {/* Machines by Hostel Tab */}
        <TabPanel value={tabValue} index={3}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Grid container spacing={3}>
              {machinesByHostel.map((item) => (
                <Grid item xs={12} key={item.hostel._id}>
                  <Card>
                    <CardHeader 
                      title={item.hostel.name} 
                      subheader={item.hostel.location}
                    />
                    <Divider />
                    <CardContent>
                      {item.machines.length > 0 ? (
                        <TableContainer>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>Machine Name</TableCell>
                                <TableCell>Type</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Cost</TableCell>
                                <TableCell>Time</TableCell>
                                <TableCell>Last Maintenance</TableCell>
                                <TableCell>Actions</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {item.machines.map((machine) => (
                                <TableRow key={machine._id}>
                                  <TableCell>{machine.name}</TableCell>
                                  <TableCell>{machine.type.charAt(0).toUpperCase() + machine.type.slice(1)}</TableCell>
                                  <TableCell>{getMachineStatusChip(machine.status)}</TableCell>
                                  <TableCell>₹{machine.costPerUse}</TableCell>
                                  <TableCell>{machine.timePerUse} min</TableCell>
                                  <TableCell>
                                    {machine.lastMaintenance 
                                      ? formatDate(machine.lastMaintenance) 
                                      : 'Never'}
                                  </TableCell>
                                  <TableCell>
                                    <Button 
                                      variant="outlined" 
                                      size="small"
                                      onClick={() => handleOpenDialog(machine)}
                                    >
                                      Update Status
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      ) : (
                        <Typography variant="body2" color="text.secondary" align="center">
                          No machines found for this hostel
                        </Typography>
                      )}
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
          {selectedMachine && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Machine: {selectedMachine.name} ({selectedMachine.type})
              </Typography>
              <Typography variant="subtitle2" gutterBottom>
                Current Status: {selectedMachine.status.replace('_', ' ')}
              </Typography>
              
              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel>New Status</InputLabel>
                <Select
                  value={newStatus}
                  label="New Status"
                  onChange={(e) => setNewStatus(e.target.value)}
                >
                  <MenuItem value="available">Available</MenuItem>
                  <MenuItem value="in_use">In Use</MenuItem>
                  <MenuItem value="maintenance">Maintenance</MenuItem>
                  <MenuItem value="out-of-order">Out of Order</MenuItem>
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
                  sx={{ mt: 2 }}
                />
              )}
            </Box>
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