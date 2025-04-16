import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Container,
  Card,
  CardContent,
  CardHeader,
  Avatar,
  Button,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  CircularProgress,
  useTheme,
  alpha,
  Skeleton,
  LinearProgress
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Person as PersonIcon,
  LocalLaundryService as LaundryIcon,
  Event as EventIcon,
  AttachMoney as MoneyIcon,
  TrendingUp as TrendingUpIcon,
  Apartment as ApartmentIcon,
  Warning as WarningIcon,
  Check as CheckIcon,
  Timer as TimerIcon,
  MoreVert as MoreVertIcon,
  NotificationImportant as AlertIcon,
  ArrowUpward as ArrowUpIcon,
  ArrowDownward as ArrowDownIcon,
  PeopleAlt as PeopleIcon,
  AssignmentTurnedIn as TaskIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, BarElement } from 'chart.js';
import { Pie, Line, Bar } from 'react-chartjs-2';
import AdminPageHeader from '../../components/AdminPageHeader';
import StatsCard from '../../components/StatsCard';
import axios from 'axios';
import { API_BASE_URL } from '../../config';

ChartJS.register(ArcElement, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip, Legend);

const AdminDashboard = () => {
  const { user } = useAuth();
  const theme = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    userCount: 0,
    bookingsToday: 0,
    activeHostels: 0,
    activeMachines: 0,
    pendingIssues: 0,
    totalRevenue: 0,
    recentBookings: [],
    recentIssues: [],
    machineStatus: { operational: 0, maintenance: 0, offline: 0 },
    userTypes: { students: 0, staff: 0, admin: 0 },
    bookingTrends: [],
    hostelUsage: [],
    totalStudents: 0,
    totalStaff: 0,
    totalHostels: 0,
    pendingRequests: 0,
    completedRequests: 0,
    loading: true
  });

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/admin/dashboard-stats`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        
        setStats({
          ...response.data,
          loading: false
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        setStats(prev => ({ ...prev, loading: false }));
      }
    };

    fetchDashboardStats();
    
    // For demonstration, set mock data after a delay
    setTimeout(() => {
      setStats({
        userCount: 1240,
        bookingsToday: 78,
        activeHostels: 5,
        activeMachines: 32,
        pendingIssues: 3,
        totalRevenue: 15780,
        recentBookings: [
          { id: 'B1001', user: 'Rajat Sharma', hostel: 'Aurobindo Hostel', time: '10:30 AM', status: 'completed' },
          { id: 'B1002', user: 'Priya Singh', hostel: 'Gargi Hostel', time: '11:15 AM', status: 'active' },
          { id: 'B1003', user: 'Amit Kumar', hostel: 'Aryabhatta Hostel', time: '12:00 PM', status: 'pending' },
          { id: 'B1004', user: 'Neha Gupta', hostel: 'Gargi Hostel', time: '01:45 PM', status: 'active' },
        ],
        recentIssues: [
          { id: 'I345', title: 'Machine not working', hostel: 'Aurobindo Hostel', user: 'Vikram Singh', priority: 'high' },
          { id: 'I346', title: 'Water leakage', hostel: 'Aryabhatta Hostel', user: 'Ananya Patel', priority: 'medium' },
          { id: 'I347', title: 'Payment failed', hostel: 'Gargi Hostel', user: 'Shivani Reddy', priority: 'low' },
        ],
        machineStatus: { operational: 25, maintenance: 4, offline: 3 },
        userTypes: { students: 1100, staff: 130, admin: 10 },
        bookingTrends: [
          { date: 'Mon', bookings: 52 },
          { date: 'Tue', bookings: 65 },
          { date: 'Wed', bookings: 59 },
          { date: 'Thu', bookings: 78 },
          { date: 'Fri', bookings: 91 },
          { date: 'Sat', bookings: 105 },
          { date: 'Sun', bookings: 47 },
        ],
        hostelUsage: [
          { name: 'Aurobindo', bookings: 125 },
          { name: 'Aryabhatta', bookings: 93 },
          { name: 'Gargi', bookings: 87 },
          { name: 'Tagore', bookings: 65 },
          { name: 'Vyas', bookings: 49 },
        ],
        totalStudents: 1250,
        totalStaff: 45,
        totalHostels: 8,
        pendingRequests: 23,
        completedRequests: 189,
        loading: false
      });
      setLoading(false);
    }, 1000);
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

  // Chart configurations
  const pieChartData = {
    labels: ['Operational', 'Maintenance', 'Offline'],
    datasets: [
      {
        data: [stats.machineStatus.operational, stats.machineStatus.maintenance, stats.machineStatus.offline],
        backgroundColor: [
          theme.palette.success.main,
          theme.palette.warning.main,
          theme.palette.error.main,
        ],
        borderColor: [
          theme.palette.success.dark,
          theme.palette.warning.dark,
          theme.palette.error.dark,
        ],
        borderWidth: 1,
      },
    ],
  };

  const bookingTrendsData = {
    labels: stats.bookingTrends.map(item => item.date),
    datasets: [
      {
        label: 'Bookings',
        data: stats.bookingTrends.map(item => item.bookings),
        fill: true,
        backgroundColor: alpha(theme.palette.primary.main, 0.1),
        borderColor: theme.palette.primary.main,
        tension: 0.4,
      },
    ],
  };

  const hostelUsageData = {
    labels: stats.hostelUsage.map(item => item.name),
    datasets: [
      {
        label: 'Bookings',
        data: stats.hostelUsage.map(item => item.bookings),
        backgroundColor: [
          alpha(theme.palette.primary.main, 0.7),
          alpha(theme.palette.primary.main, 0.6),
          alpha(theme.palette.primary.main, 0.5),
          alpha(theme.palette.primary.main, 0.4),
          alpha(theme.palette.primary.main, 0.3),
        ],
        borderColor: theme.palette.primary.main,
        borderWidth: 1,
      },
    ],
  };

  return (
    <Container maxWidth="xl">
      <AdminPageHeader
        title="Admin Dashboard"
        description="Overview of the laundry management system statistics and activities."
        icon={<DashboardIcon />}
      />

      {/* Welcome Section */}
      <Paper 
        elevation={0}
        sx={{ 
          p: 3, 
          mb: 4, 
          borderRadius: 2,
          background: theme.palette.background.paper,
          boxShadow: theme.customShadows?.z1 || '0 0 10px rgba(0,0,0,0.1)',
        }}
      >
        <Typography variant="h4" gutterBottom>
          Welcome back, {user?.name || 'Admin'}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Here's what's happening with your laundry management system today.
        </Typography>
      </Paper>
      
      {/* Stats Section */}
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 'medium' }}>
        System Overview
      </Typography>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            icon={<PeopleIcon />}
            title="Total Students"
            value={stats.totalStudents.toLocaleString()}
            trend="up"
            trendValue="+12%"
            color="primary"
            loading={stats.loading}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            icon={<PeopleIcon />}
            title="Total Staff"
            value={stats.totalStaff.toLocaleString()}
            trend="up"
            trendValue="+5%"
            color="info"
            loading={stats.loading}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            icon={<ApartmentIcon />}
            title="Total Hostels"
            value={stats.totalHostels.toLocaleString()}
            color="secondary"
            loading={stats.loading}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            icon={<LaundryIcon />}
            title="Pending Requests"
            value={stats.pendingRequests.toLocaleString()}
            trend="down"
            trendValue="-8%"
            color="warning"
            loading={stats.loading}
          />
        </Grid>
      </Grid>
      
      {/* Main Dashboard Content */}
      <Grid container spacing={3}>
        {/* Charts Section */}
        <Grid item xs={12} lg={8}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper sx={{ p: 3, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                <Typography variant="h6" gutterBottom>
                  Booking Trends (Last 7 days)
                </Typography>
                {loading ? (
                  <Skeleton variant="rectangular" height={300} />
                ) : (
                  <Box sx={{ height: 300, position: 'relative' }}>
                    <Line 
                      data={bookingTrendsData} 
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                          y: {
                            beginAtZero: true,
                            grid: {
                              color: alpha(theme.palette.text.secondary, 0.1),
                            },
                          },
                          x: {
                            grid: {
                              display: false,
                            },
                          },
                        },
                        plugins: {
                          legend: {
                            display: false,
                          },
                        },
                      }} 
                    />
                  </Box>
                )}
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                <Typography variant="h6" gutterBottom>
                  Machine Status
                </Typography>
                {loading ? (
                  <Skeleton variant="rectangular" height={220} />
                ) : (
                  <Box sx={{ height: 220, display: 'flex', justifyContent: 'center' }}>
                    <Pie 
                      data={pieChartData} 
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'bottom',
                          },
                        },
                      }} 
                    />
                  </Box>
                )}
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                <Typography variant="h6" gutterBottom>
                  Hostel Usage
                </Typography>
                {loading ? (
                  <Skeleton variant="rectangular" height={220} />
                ) : (
                  <Box sx={{ height: 220 }}>
                    <Bar 
                      data={hostelUsageData} 
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                          y: {
                            beginAtZero: true,
                            grid: {
                              color: alpha(theme.palette.text.secondary, 0.1),
                            },
                          },
                          x: {
                            grid: {
                              display: false,
                            },
                          },
                        },
                        plugins: {
                          legend: {
                            display: false,
                          },
                        },
                      }} 
                    />
                  </Box>
                )}
              </Paper>
            </Grid>
          </Grid>
        </Grid>

        {/* Recent Activities and Alerts */}
        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 0, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
            <Box sx={{ p: 2, bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
              <Typography variant="h6">Recent Activities</Typography>
            </Box>
            {loading ? (
              <Box sx={{ p: 2 }}>
                {[...Array(4)].map((_, index) => (
                  <Box key={index} sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                    <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
                    <Box sx={{ width: '100%' }}>
                      <Skeleton variant="text" width="60%" />
                      <Skeleton variant="text" width="40%" />
                    </Box>
                  </Box>
                ))}
              </Box>
            ) : (
              <List sx={{ p: 0 }}>
                {stats.recentBookings.map((booking, index) => (
                  <React.Fragment key={booking.id}>
                    <ListItem alignItems="flex-start">
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                          {booking.user.split(' ').map(n => n[0]).join('')}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography variant="subtitle2" component="span">
                            {booking.user}
                          </Typography>
                        }
                        secondary={
                          <>
                            <Typography variant="body2" component="span" color="text.secondary">
                              Booked {booking.hostel} at {booking.time}
                            </Typography>
                            <Box sx={{ mt: 0.5 }}>
                              <Chip
                                size="small"
                                label={booking.status}
                                sx={{
                                  bgcolor: booking.status === 'completed' 
                                    ? alpha(theme.palette.success.main, 0.1) 
                                    : booking.status === 'active' 
                                      ? alpha(theme.palette.info.main, 0.1) 
                                      : alpha(theme.palette.warning.main, 0.1),
                                  color: booking.status === 'completed' 
                                    ? theme.palette.success.dark 
                                    : booking.status === 'active' 
                                      ? theme.palette.info.dark 
                                      : theme.palette.warning.dark,
                                  fontWeight: 500,
                                }}
                              />
                            </Box>
                          </>
                        }
                      />
                      <ListItemSecondaryAction>
                        <IconButton edge="end" aria-label="more options" size="small">
                          <MoreVertIcon fontSize="small" />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                    {index < stats.recentBookings.length - 1 && (
                      <Divider variant="inset" component="li" />
                    )}
                  </React.Fragment>
                ))}
              </List>
            )}
          </Paper>

          <Paper sx={{ p: 0, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', mt: 3, overflow: 'hidden' }}>
            <Box sx={{ p: 2, bgcolor: alpha(theme.palette.error.main, 0.05), display: 'flex', alignItems: 'center' }}>
              <AlertIcon color="error" sx={{ mr: 1 }} />
              <Typography variant="h6">Pending Issues</Typography>
            </Box>
            {loading ? (
              <Box sx={{ p: 2 }}>
                {[...Array(3)].map((_, index) => (
                  <Skeleton key={index} variant="rectangular" height={60} sx={{ mb: 1, borderRadius: 1 }} />
                ))}
              </Box>
            ) : stats.recentIssues.length > 0 ? (
              <List sx={{ p: 0 }}>
                {stats.recentIssues.map((issue, index) => (
                  <React.Fragment key={issue.id}>
                    <ListItem alignItems="flex-start">
                      <ListItemAvatar>
                        <Avatar sx={{ 
                          bgcolor: issue.priority === 'high' 
                            ? theme.palette.error.main 
                            : issue.priority === 'medium' 
                              ? theme.palette.warning.main 
                              : theme.palette.info.main 
                        }}>
                          <WarningIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography variant="subtitle2" component="span">
                            {issue.title}
                          </Typography>
                        }
                        secondary={
                          <>
                            <Typography variant="body2" component="span" color="text.secondary">
                              {issue.hostel} - Reported by {issue.user}
                            </Typography>
                            <Box sx={{ mt: 0.5 }}>
                              <Chip
                                size="small"
                                label={issue.priority}
                                sx={{
                                  bgcolor: issue.priority === 'high' 
                                    ? alpha(theme.palette.error.main, 0.1) 
                                    : issue.priority === 'medium' 
                                      ? alpha(theme.palette.warning.main, 0.1) 
                                      : alpha(theme.palette.info.main, 0.1),
                                  color: issue.priority === 'high' 
                                    ? theme.palette.error.dark 
                                    : issue.priority === 'medium' 
                                      ? theme.palette.warning.dark 
                                      : theme.palette.info.dark,
                                  fontWeight: 500,
                                }}
                              />
                            </Box>
                          </>
                        }
                      />
                      <ListItemSecondaryAction>
                        <IconButton edge="end" aria-label="resolve issue" size="small" color="primary">
                          <CheckIcon fontSize="small" />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                    {index < stats.recentIssues.length - 1 && (
                      <Divider variant="inset" component="li" />
                    )}
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  No pending issues
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AdminDashboard; 