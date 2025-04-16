import React, { useState, useEffect } from 'react';
import { 
  Grid, 
  Box, 
  Card, 
  Paper, 
  Typography, 
  Divider, 
  Button,
  useTheme
} from '@mui/material';
import { 
  PeopleAlt as PeopleIcon, 
  LocalLaundryService as LaundryIcon,
  DomainAdd as HostelIcon,
  AssignmentTurnedIn as CompletedIcon,
  AssignmentLate as PendingIcon,
  EventNote as CalendarIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import StatsCard from '../components/StatsCard';
import AdminPageHeader from '../components/AdminPageHeader';

const AdminDashboard = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalLaundryRequests: 0,
    totalHostels: 0,
    completedRequests: 0,
    pendingRequests: 0
  });

  // Fetch dashboard stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        // Replace with actual API calls
        // const response = await axios.get('/api/admin/dashboard/stats');
        // setStats(response.data);
        
        // Simulating API response with mock data
        setTimeout(() => {
          setStats({
            totalUsers: 385,
            totalLaundryRequests: 1256,
            totalHostels: 8,
            completedRequests: 975,
            pendingRequests: 281
          });
          setLoading(false);
        }, 1500);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const handleViewAllUsers = () => {
    navigate('/admin/users');
  };

  return (
    <Box sx={{ p: 3 }}>
      <AdminPageHeader 
        title="Admin Dashboard" 
        description="Overview of your laundry management system"
        icon={<CalendarIcon fontSize="large" />}
      />

      <Grid container spacing={3} sx={{ mt: 1 }}>
        {/* Stats Cards */}
        <Grid item xs={12} sm={6} md={4}>
          <StatsCard
            title="Total Users"
            value={stats.totalUsers}
            subtitle="Students and Staff accounts"
            icon={<PeopleIcon />}
            color="primary"
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatsCard
            title="Laundry Requests"
            value={stats.totalLaundryRequests}
            subtitle="All-time total"
            icon={<LaundryIcon />}
            color="secondary"
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatsCard
            title="Hostels"
            value={stats.totalHostels}
            subtitle="Registered in system"
            icon={<HostelIcon />}
            color="success"
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={6}>
          <StatsCard
            title="Completed Requests"
            value={stats.completedRequests}
            subtitle={`${Math.round((stats.completedRequests / stats.totalLaundryRequests) * 100)}% of total`}
            icon={<CompletedIcon />}
            color="info"
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={6}>
          <StatsCard
            title="Pending Requests"
            value={stats.pendingRequests}
            subtitle="Awaiting processing"
            icon={<PendingIcon />}
            color="warning"
            loading={loading}
          />
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              boxShadow: `0 2px 14px 0 ${theme.palette.divider}`
            }}
          >
            <Typography variant="h6" fontWeight="600" sx={{ mb: 2 }}>
              Quick Actions
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={4}>
                <Button 
                  fullWidth 
                  variant="outlined" 
                  color="primary" 
                  size="large"
                  sx={{ py: 1.5, borderRadius: 2 }}
                  onClick={() => navigate('/admin/users/create')}
                >
                  Add New User
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Button 
                  fullWidth 
                  variant="outlined" 
                  color="secondary" 
                  size="large"
                  sx={{ py: 1.5, borderRadius: 2 }}
                  onClick={() => navigate('/admin/hostels/manage')}
                >
                  Manage Hostels
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Button 
                  fullWidth 
                  variant="outlined" 
                  color="success" 
                  size="large"
                  sx={{ py: 1.5, borderRadius: 2 }}
                  onClick={() => navigate('/admin/machines')}
                >
                  Manage Machines
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboard; 