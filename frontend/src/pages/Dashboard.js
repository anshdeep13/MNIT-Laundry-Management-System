import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  CardActions,
  Button,
  Box,
  CircularProgress,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  CardHeader,
  Chip,
} from '@mui/material';
import API from '../services/api';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    activeBookings: 0,
    completedBookings: 0,
    availableMachines: 0,
    walletBalance: user?.walletBalance || 0
  });
  const [loading, setLoading] = useState(true);
  const [upcomingBookings, setUpcomingBookings] = useState([]);

  useEffect(() => {
    if (user) {
      fetchUserStats();
    }
  }, [user]);

  const fetchUserStats = async () => {
    setLoading(true);
    try {
      // Use our new user-stats endpoint instead of the problematic /bookings/stats
      const response = await API.get('/bookings/user-stats');
      
      // Get available machines count
      const machinesResponse = await API.get('/machines');
      const availableMachines = machinesResponse.data.filter(
        machine => machine.status === 'available'
      ).length;

      setStats({
        activeBookings: response.data.upcomingBookings || 0,
        completedBookings: response.data.completedBookings || 0,
        availableMachines: availableMachines,
        walletBalance: user?.walletBalance || 0,
        totalTimeUsed: response.data.totalTimeUsed || 0,
        totalAmountSpent: response.data.totalAmountSpent || 0
      });

      // Set upcoming bookings
      setUpcomingBookings(response.data.recentBookings || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      // Use fallback data if API fails
      setStats({
        activeBookings: 0,
        completedBookings: 0,
        availableMachines: 0,
        walletBalance: user?.walletBalance || 0,
        totalTimeUsed: 0,
        totalAmountSpent: 0
      });
      setUpcomingBookings([]);
      setLoading(false);
    }
  };

  // Redirect to admin pages
  const goToAdminPage = (page) => {
    navigate(`/admin/${page}`);
  };

  // Format date for display
  const formatDateTime = (dateString) => {
    const options = {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };
    return new Date(dateString).toLocaleString('en-US', options);
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="50vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Welcome, {user?.name || 'User'}!
      </Typography>
      <Typography variant="body1" color="textSecondary" paragraph>
        {user?.role === 'student'
          ? `Room ${user?.roomNumber}, ${user?.hostel?.name || 'Hostel'}`
          : `Staff Role: ${user?.role}`}
      </Typography>

      {/* Show admin quick actions if user is admin */}
      {user?.role === 'admin' && (
        <>
          <Box mb={4}>
            <Typography variant="h5" gutterBottom sx={{ mb: 2 }}>
              Admin Quick Actions
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Button 
                  variant="contained" 
                  fullWidth 
                  onClick={() => goToAdminPage('')}
                  sx={{ mb: 2 }}
                >
                  Admin Dashboard
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button 
                  variant="contained" 
                  fullWidth 
                  onClick={() => goToAdminPage('machines')}
                  sx={{ mb: 2 }}
                >
                  Manage Machines
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button 
                  variant="contained" 
                  fullWidth 
                  onClick={() => goToAdminPage('hostels')}
                  sx={{ mb: 2 }}
                >
                  Manage Hostels
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button 
                  variant="contained" 
                  fullWidth 
                  onClick={() => goToAdminPage('users')}
                  sx={{ mb: 2 }}
                >
                  Manage Users
                </Button>
              </Grid>
            </Grid>
          </Box>
          <Divider sx={{ my: 3 }} />
          <Typography variant="h5" gutterBottom>
            User Dashboard
          </Typography>
        </>
      )}

      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h5" component="div">
                {stats.activeBookings}
              </Typography>
              <Typography color="text.secondary">
                Active Bookings
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h5" component="div">
                {stats.completedBookings}
              </Typography>
              <Typography color="text.secondary">
                Completed Bookings
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h5" component="div">
                {stats.availableMachines}
              </Typography>
              <Typography color="text.secondary">
                Available Machines
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h5" component="div">
                ₹{user?.walletBalance || 0}
              </Typography>
              <Typography color="text.secondary">
                Wallet Balance
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box mt={4}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title="Recent Bookings" />
              <CardContent>
                {upcomingBookings.length > 0 ? (
                  <List>
                    {upcomingBookings.map((booking, index) => (
                      <React.Fragment key={booking._id || index}>
                        <ListItem>
                          <ListItemText
                            primary={
                              <Box display="flex" justifyContent="space-between">
                                <Typography variant="subtitle1">
                                  {booking.machine?.name || 'Machine'}
                                </Typography>
                                <Chip 
                                  size="small" 
                                  label={booking.status} 
                                  color={
                                    booking.status === 'confirmed' ? 'primary' : 
                                    booking.status === 'completed' ? 'success' : 
                                    booking.status === 'cancelled' ? 'error' : 'default'
                                  }
                                />
                              </Box>
                            }
                            secondary={
                              <>
                                <Typography variant="body2">
                                  {booking.hostel?.name || 'Hostel'} 
                                </Typography>
                                <Typography variant="body2">
                                  {formatDateTime(booking.startTime)} - {formatDateTime(booking.endTime)}
                                </Typography>
                                <Typography variant="body2">
                                  Duration: {booking.duration} mins, Cost: ₹{booking.amount}
                                </Typography>
                              </>
                            }
                          />
                        </ListItem>
                        {index < upcomingBookings.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                ) : (
                  <Typography color="text.secondary">
                    You don't have any recent bookings.
                  </Typography>
                )}
                <Button 
                  variant="contained" 
                  sx={{ mt: 2 }}
                  onClick={() => navigate('/bookings')}
                >
                  View All Bookings
                </Button>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title="Usage Statistics" />
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="subtitle1">Total Time Used:</Typography>
                    <Typography variant="h6">{stats.totalTimeUsed || 0} mins</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle1">Total Amount Spent:</Typography>
                    <Typography variant="h6">₹{stats.totalAmountSpent || 0}</Typography>
                  </Grid>
                </Grid>

                <Button 
                  variant="contained"
                  sx={{ mt: 3 }}
                  onClick={() => navigate('/book-machine')}
                >
                  Book a Machine
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default Dashboard;
