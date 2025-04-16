import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Grid, 
  Paper, 
  Typography, 
  Card, 
  CardContent, 
  CircularProgress, 
  Container,
  Avatar,
  IconButton,
  Tooltip,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Divider,
  useTheme,
  alpha,
  Button
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import API from '../../services/api';
import { 
  PeopleAlt as PeopleIcon, 
  LocationCity as HostelIcon,
  LocalLaundryService as MachineIcon,
  EventNote as BookingIcon,
  Dashboard as DashboardIcon,
  MoreVert as MoreIcon,
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material';
import AdminPageHeader, { HeaderStat } from '../../components/AdminPageHeader';
import { Link } from 'react-router-dom';

const StatCard = ({ title, value, icon, color, trend, percentage }) => {
  const theme = useTheme();
  
  return (
    <Card sx={{ 
      height: '100%',
      borderRadius: 4,
      boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
      border: `1px solid ${alpha(theme.palette.divider, 0.05)}`,
      overflow: 'visible',
      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
      '&:hover': {
        transform: 'translateY(-5px)',
        boxShadow: '0 15px 35px rgba(0,0,0,0.1)',
      }
    }}>
      <CardContent sx={{ position: 'relative', p: 3 }}>
        <Box 
          sx={{ 
            position: 'absolute',
            top: -20,
            left: 24,
            width: 56,
            height: 56,
            backgroundColor: `${color}.main`, 
            borderRadius: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 10px 20px ${alpha(theme.palette[color].main, 0.3)}`,
          }}
        >
          {icon}
        </Box>
        
        <Box sx={{ mt: 4, mb: 1 }}>
          <Typography variant="body2" color="text.secondary" fontWeight={500}>
            {title}
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <Typography variant="h4" component="div" fontWeight="bold" sx={{ my: 1 }}>
              {value !== undefined ? value : <CircularProgress size={24} />}
            </Typography>
            
            {trend && (
              <Box 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  backgroundColor: trend === 'up' ? alpha(theme.palette.success.main, 0.1) : alpha(theme.palette.error.main, 0.1),
                  borderRadius: 2,
                  px: 1,
                  py: 0.5
                }}
              >
                {trend === 'up' ? (
                  <TrendingUpIcon fontSize="small" sx={{ color: 'success.main', mr: 0.5 }} />
                ) : (
                  <TrendingDownIcon fontSize="small" sx={{ color: 'error.main', mr: 0.5 }} />
                )}
                <Typography 
                  variant="caption" 
                  color={trend === 'up' ? 'success.main' : 'error.main'}
                  fontWeight="bold"
                >
                  {percentage}%
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

const RecentBookingsTable = ({ bookings = [] }) => {
  return (
    <TableContainer component={Paper} sx={{ borderRadius: 4, boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>User</TableCell>
            <TableCell>Machine</TableCell>
            <TableCell>Time</TableCell>
            <TableCell>Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {bookings.length > 0 ? (
            bookings.map((booking, index) => (
              <TableRow key={index}>
                <TableCell>{booking.user.name}</TableCell>
                <TableCell>{booking.machine.name}</TableCell>
                <TableCell>{new Date(booking.startTime).toLocaleString()}</TableCell>
                <TableCell>
                  <Box 
                    component="span" 
                    sx={{ 
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 10,
                      fontSize: '0.75rem',
                      fontWeight: 'bold',
                      backgroundColor: 
                        booking.status === 'completed' ? 'success.lighter' : 
                        booking.status === 'pending' ? 'warning.lighter' :
                        booking.status === 'in-progress' ? 'info.lighter' : 'grey.lighter',
                      color: 
                        booking.status === 'completed' ? 'success.dark' : 
                        booking.status === 'pending' ? 'warning.dark' :
                        booking.status === 'in-progress' ? 'info.dark' : 'grey.dark',
                    }}
                  >
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </Box>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} align="center">No recent bookings</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

const HostelStatusCard = ({ hostels = [] }) => {
  const theme = useTheme();
  
  return (
    <Card sx={{ 
      height: '100%', 
      borderRadius: 4, 
      boxShadow: '0 10px 30px rgba(0,0,0,0.05)'
    }}>
      <CardContent sx={{ p: 0 }}>
        <Box sx={{ p: 3, pb: 2 }}>
          <Typography variant="h6" fontWeight="bold">
            Hostel Status
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Machine availability across hostels
          </Typography>
        </Box>
        
        <Divider />
        
        <Box sx={{ p: 2 }}>
          {hostels.map((hostel, index) => (
            <Box 
              key={index}
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                p: 1,
                '&:not(:last-child)': {
                  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: theme.palette.primary.lighter, mr: 2 }}>
                  <HostelIcon sx={{ color: theme.palette.primary.main }} />
                </Avatar>
                <Box>
                  <Typography variant="body1" fontWeight={500}>
                    {hostel.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {hostel.totalMachines} machines
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box 
                  component="span"
                  sx={{ 
                    display: 'inline-block',
                    px: 2,
                    py: 0.5,
                    borderRadius: 10,
                    backgroundColor: 
                      hostel.availablePercentage > 70 ? 'success.lighter' :
                      hostel.availablePercentage > 30 ? 'warning.lighter' : 'error.lighter',
                    color: 
                      hostel.availablePercentage > 70 ? 'success.dark' :
                      hostel.availablePercentage > 30 ? 'warning.dark' : 'error.dark',
                    fontWeight: 'bold',
                    fontSize: '0.75rem'
                  }}
                >
                  {hostel.availableCount} / {hostel.totalMachines} Available
                </Box>
              </Box>
            </Box>
          ))}
          
          {hostels.length === 0 && (
            <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 2 }}>
              No hostel data available
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

const AdminDashboard = () => {
  const { user } = useAuth();
  const theme = useTheme();
  const [stats, setStats] = useState({
    users: null,
    hostels: null,
    machines: null,
    bookings: null,
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [hostelsStatus, setHostelsStatus] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      // Fetch basic stats
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

      // Fetch recent bookings
      const recentBookingsRes = await API.get('/admin/bookings/recent');
      setRecentBookings(recentBookingsRes.data || []);

      // Fetch hostel status
      const hostelStatusRes = await API.get('/admin/hostels/status');
      setHostelsStatus(hostelStatusRes.data || []);
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      // Set fallback stats for development
      setStats({
        users: 12,
        hostels: 4,
        machines: 16,
        bookings: 28,
      });
      
      // Sample recent bookings data
      setRecentBookings([
        {
          user: { name: 'John Doe' },
          machine: { name: 'Washer 1' },
          startTime: new Date().toISOString(),
          status: 'completed'
        },
        {
          user: { name: 'Jane Smith' },
          machine: { name: 'Dryer 2' },
          startTime: new Date().toISOString(),
          status: 'in-progress'
        }
      ]);
      
      // Sample hostel status data
      setHostelsStatus([
        { name: 'Hostel A', totalMachines: 6, availableCount: 4, availablePercentage: 67 },
        { name: 'Hostel B', totalMachines: 8, availableCount: 2, availablePercentage: 25 },
        { name: 'Hostel C', totalMachines: 4, availableCount: 3, availablePercentage: 75 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // Set up auto-refresh every 60 seconds
    const interval = setInterval(fetchStats, 60000);
    return () => clearInterval(interval);
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

  // Generate header stats
  const headerStats = [
    <HeaderStat key="users" label="Total Users" value={stats.users || '-'} icon={<PeopleIcon />} />,
    <HeaderStat key="bookings" label="Total Bookings" value={stats.bookings || '-'} icon={<BookingIcon />} />
  ];

  return (
    <Container maxWidth="xl">
      <AdminPageHeader 
        title="Admin Dashboard"
        description={`Welcome back, ${user.name}! Here's what's happening with your laundry system.`}
        icon={<DashboardIcon />}
        stats={headerStats}
        action={
          <Button 
            variant="contained" 
            startIcon={<RefreshIcon />}
            onClick={fetchStats}
            sx={{ 
              bgcolor: 'rgba(255,255,255,0.2)', 
              backdropFilter: 'blur(10px)',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
            }}
          >
            Refresh Data
          </Button>
        }
      />
      
      <Grid container spacing={3}>
        {/* Statistics Cards */}
        <Grid item xs={12} md={6} lg={3}>
          <StatCard 
            title="Total Users" 
            value={stats.users} 
            icon={<PeopleIcon sx={{ color: 'white', fontSize: 24 }} />} 
            color="primary" 
            trend="up"
            percentage="12"
          />
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <StatCard 
            title="Hostels" 
            value={stats.hostels} 
            icon={<HostelIcon sx={{ color: 'white', fontSize: 24 }} />} 
            color="secondary" 
          />
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <StatCard 
            title="Machines" 
            value={stats.machines} 
            icon={<MachineIcon sx={{ color: 'white', fontSize: 24 }} />} 
            color="success" 
            trend="up"
            percentage="8"
          />
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <StatCard 
            title="Bookings" 
            value={stats.bookings} 
            icon={<BookingIcon sx={{ color: 'white', fontSize: 24 }} />} 
            color="warning" 
            trend="down"
            percentage="3"
          />
        </Grid>
        
        {/* Recent Bookings Table */}
        <Grid item xs={12} lg={8}>
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" fontWeight="bold">
              Recent Bookings
            </Typography>
            <Button 
              component={Link}
              to="/admin/bookings"
              size="small"
              endIcon={<AssessmentIcon />}
            >
              View All
            </Button>
          </Box>
          <RecentBookingsTable bookings={recentBookings} />
        </Grid>
        
        {/* Hostel Status */}
        <Grid item xs={12} lg={4}>
          <HostelStatusCard hostels={hostelsStatus} />
        </Grid>
      </Grid>
    </Container>
  );
};

export default AdminDashboard; 