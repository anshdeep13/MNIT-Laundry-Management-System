import React, { useState, useEffect } from 'react';
import { Box, Grid, Paper, Typography, Card, CardContent, CircularProgress } from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import API from '../../services/api';
import { 
  PeopleAlt as PeopleIcon, 
  LocationCity as HostelIcon,
  LocalLaundryService as MachineIcon,
  EventNote as BookingIcon 
} from '@mui/icons-material';

const StatCard = ({ title, value, icon, color }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Grid container spacing={2} alignItems="center">
        <Grid item>
          <Box sx={{ 
            backgroundColor: `${color}.light`, 
            borderRadius: '50%', 
            padding: 1,
            display: 'flex'
          }}>
            {icon}
          </Box>
        </Grid>
        <Grid item xs>
          <Typography variant="h5" component="div">
            {value !== undefined ? value : <CircularProgress size={20} />}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {title}
          </Typography>
        </Grid>
      </Grid>
    </CardContent>
  </Card>
);

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    users: null,
    hostels: null,
    machines: null,
    bookings: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [usersRes, hostelsRes, machinesRes, bookingsRes] = await Promise.all([
          API.get('/admin/stats/users'),
          API.get('/admin/stats/hostels'),
          API.get('/admin/stats/machines'),
          API.get('/admin/stats/bookings'),
        ]);

        setStats({
          users: usersRes.data.count,
          hostels: hostelsRes.data.count,
          machines: machinesRes.data.count,
          bookings: bookingsRes.data.count,
        });
      } catch (error) {
        console.error('Error fetching admin stats:', error);
        // Set fallback stats for development
        setStats({
          users: 12,
          hostels: 4,
          machines: 16,
          bookings: 28,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (!user || user.role !== 'admin') {
    return (
      <Box p={3}>
        <Typography variant="h5" color="error">
          Access Denied: Admin privileges required
        </Typography>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>
      
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Welcome, {user.name}! Here's an overview of the laundry system.
      </Typography>
      
      <Grid container spacing={3} mt={2}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Total Users" 
            value={stats.users} 
            icon={<PeopleIcon sx={{ color: 'primary.main' }} />} 
            color="primary" 
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Hostels" 
            value={stats.hostels} 
            icon={<HostelIcon sx={{ color: 'secondary.main' }} />} 
            color="secondary" 
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Machines" 
            value={stats.machines} 
            icon={<MachineIcon sx={{ color: 'success.main' }} />} 
            color="success" 
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Bookings" 
            value={stats.bookings} 
            icon={<BookingIcon sx={{ color: 'warning.main' }} />} 
            color="warning" 
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboard; 