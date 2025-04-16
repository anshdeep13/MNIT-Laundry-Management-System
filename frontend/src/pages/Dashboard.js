import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
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
  useTheme,
  alpha,
  IconButton,
  Avatar,
  Tooltip,
  Fade,
  Zoom,
  LinearProgress,
} from '@mui/material';
import {
  LocalLaundryService as LaundryIcon,
  AccountBalanceWallet as WalletIcon,
  CalendarToday as CalendarIcon,
  CheckCircle as CheckCircleIcon,
  History as HistoryIcon,
  Add as AddIcon,
  Schedule as ScheduleIcon,
  TrendingUp as TrendingUpIcon,
  ArrowForward as ArrowForwardIcon,
  Event as EventIcon,
} from '@mui/icons-material';
import API from '../services/api';
import { keyframes } from '@mui/system';

// Define animations
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const pulse = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
`;

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const [stats, setStats] = useState({
    activeBookings: 0,
    completedBookings: 0,
    availableMachines: 0,
    walletBalance: user?.walletBalance || 0,
    totalTimeUsed: 0,
    totalAmountSpent: 0
  });
  const [loading, setLoading] = useState(true);
  const [upcomingBookings, setUpcomingBookings] = useState([]);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (user) {
      fetchUserStats();
    }
    // Trigger animations after a short delay
    const timer = setTimeout(() => {
      setAnimate(true);
    }, 100);
    return () => clearTimeout(timer);
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
        flexDirection="column"
        minHeight="80vh"
      >
        <CircularProgress size={60} thickness={4} color="primary" sx={{ mb: 3 }} />
        <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 500 }}>
          Loading your dashboard...
        </Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header Section with Curved Background */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 4, 
          mb: 5, 
          borderRadius: 4, 
          background: theme.palette.background.headerGradient,
          position: 'relative',
          overflow: 'hidden',
          animation: animate ? `${fadeIn} 0.8s ease-out` : 'none',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
        }}
      >
        {/* Background decorative elements */}
        <Box sx={{ 
          position: 'absolute', 
          top: -40, 
          right: -20, 
          width: 150, 
          height: 150, 
          borderRadius: '50%', 
          background: 'rgba(255,255,255,0.1)',
          filter: 'blur(1px)'
        }} />
        <Box sx={{ 
          position: 'absolute', 
          bottom: -60, 
          left: '30%', 
          width: 250, 
          height: 250, 
          borderRadius: '50%', 
          background: 'rgba(255,255,255,0.08)',
          filter: 'blur(1px)'
        }} />
        <Box sx={{ 
          position: 'absolute', 
          top: '40%', 
          right: '20%', 
          width: 80, 
          height: 80, 
          borderRadius: '50%', 
          background: 'rgba(255,255,255,0.12)',
          filter: 'blur(1px)'
        }} />
        
        {/* User profile section */}
        <Box sx={{ 
          position: 'relative', 
          zIndex: 1, 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start'
        }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: 'white', mb: 1 }}>
              Welcome, {user?.name || 'User'}!
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                color: 'rgba(255,255,255,0.9)', 
                fontSize: '1.1rem', 
                mb: 2 
              }}
            >
              {user?.role === 'student'
                ? `Room ${user?.roomNumber}, ${user?.hostel?.name || 'Hostel'}`
                : `Staff Role: ${user?.role}`}
            </Typography>
          </Box>
          
          <Box sx={{ textAlign: 'right' }}>
            <Box sx={{ 
              display: 'inline-flex',
              flexDirection: 'column',
              alignItems: 'center',
              p: 2,
              borderRadius: 2,
              background: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(10px)'
            }}>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: 'rgba(255,255,255,0.8)', 
                  fontWeight: 500,
                  mb: 0.5
                }}
              >
                Wallet Balance
              </Typography>
              <Typography 
                variant="h5" 
                sx={{ 
                  color: 'white', 
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <WalletIcon sx={{ mr: 1, fontSize: '1.2rem' }} />
                ₹{user?.walletBalance || 0}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Admin Quick actions */}
        {user?.role === 'admin' && (
          <>
            <Box mb={4} sx={{ position: 'relative', zIndex: 1 }}>
              <Typography variant="h5" gutterBottom sx={{ mb: 2, fontWeight: 500, color: 'white' }}>
                Admin Quick Actions
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Button 
                    variant="contained" 
                    fullWidth 
                    onClick={() => goToAdminPage('')}
                    sx={{ 
                      mb: 2, 
                      py: 1.5, 
                      borderRadius: 2, 
                      bgcolor: 'rgba(255,255,255,0.9)', 
                      color: theme.palette.primary.dark,
                      transition: 'all 0.3s',
                      '&:hover': {
                        bgcolor: 'white',
                        transform: 'translateY(-3px)',
                        boxShadow: '0 6px 12px rgba(0,0,0,0.1)'
                      }
                    }}
                  >
                    Admin Dashboard
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Button 
                    variant="contained" 
                    fullWidth 
                    onClick={() => goToAdminPage('machines')}
                    sx={{ 
                      mb: 2, 
                      py: 1.5, 
                      borderRadius: 2, 
                      bgcolor: 'rgba(255,255,255,0.9)', 
                      color: theme.palette.primary.dark,
                      '&:hover': {
                        bgcolor: 'white',
                      }
                    }}
                  >
                    Manage Machines
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Button 
                    variant="contained" 
                    fullWidth 
                    onClick={() => goToAdminPage('hostels')}
                    sx={{ 
                      mb: 2, 
                      py: 1.5, 
                      borderRadius: 2, 
                      bgcolor: 'rgba(255,255,255,0.9)', 
                      color: theme.palette.primary.dark,
                      '&:hover': {
                        bgcolor: 'white',
                      }
                    }}
                  >
                    Manage Hostels
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Button 
                    variant="contained" 
                    fullWidth 
                    onClick={() => goToAdminPage('users')}
                    sx={{ 
                      mb: 2, 
                      py: 1.5, 
                      borderRadius: 2, 
                      bgcolor: 'rgba(255,255,255,0.9)', 
                      color: theme.palette.primary.dark,
                      '&:hover': {
                        bgcolor: 'white',
                      }
                    }}
                  >
                    Manage Users
                  </Button>
                </Grid>
              </Grid>
            </Box>
            <Divider sx={{ my: 3, borderColor: 'rgba(255,255,255,0.2)' }} />
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 500, color: 'white' }}>
              User Dashboard
            </Typography>
          </>
        )}
        
        {/* Quick Action Button for Students */}
        {user?.role === 'student' && (
          <Box 
            sx={{ 
              mt: 3, 
              position: 'relative', 
              zIndex: 1,
              display: 'flex',
              gap: 2
            }}
          >
            <Button 
              variant="contained" 
              color="secondary"
              startIcon={<LaundryIcon />}
              onClick={() => navigate('/book-machine')}
              sx={{ 
                bgcolor: 'rgba(255,255,255,0.9)', 
                color: theme.palette.primary.dark,
                fontWeight: 600,
                px: 3,
                py: 1.2,
                '&:hover': {
                  bgcolor: 'white',
                  transform: 'translateY(-3px)',
                  boxShadow: '0 6px 15px rgba(0,0,0,0.1)'
                }
              }}
            >
              Book a Machine
            </Button>
            
            <Button 
              variant="outlined"
              startIcon={<WalletIcon />}
              onClick={() => navigate('/wallet')}
              sx={{ 
                borderColor: 'rgba(255,255,255,0.6)',
                color: 'white',
                fontWeight: 600,
                px: 3,
                py: 1.2,
                '&:hover': {
                  borderColor: 'white',
                  bgcolor: 'rgba(255,255,255,0.1)',
                }
              }}
            >
              Add Money
            </Button>
          </Box>
        )}
      </Paper>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Zoom in={animate} style={{ transitionDelay: '100ms' }}>
            <Card sx={{ 
              height: '100%',
              position: 'relative',
              overflow: 'hidden',
              background: `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.8)}, ${alpha(theme.palette.primary.main, 0.85)})`,
              color: 'white',
              boxShadow: `0 10px 20px ${alpha(theme.palette.primary.main, 0.3)}`,
              border: `1px solid ${alpha(theme.palette.primary.light, 0.3)}`,
              transition: 'all 0.3s ease-in-out',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: `0 15px 30px ${alpha(theme.palette.primary.main, 0.4)}`
              }
            }}>
              <Box sx={{ 
                position: 'absolute', 
                top: -20, 
                right: -20, 
                width: 100, 
                height: 100, 
                borderRadius: '50%', 
                background: 'rgba(255,255,255,0.1)',
                filter: 'blur(1px)'
              }} />
              <CardContent sx={{ position: 'relative', zIndex: 1, p: 3 }}>
                <Box sx={{ 
                  display: 'flex',
                  alignItems: 'center',
                  mb: 2
                }}>
                  <Avatar 
                    sx={{ 
                      bgcolor: 'rgba(255,255,255,0.2)',
                      mr: 2,
                      width: 48,
                      height: 48
                    }}
                  >
                    <CalendarIcon />
                  </Avatar>
                  <Typography variant="h5" component="div" sx={{ fontWeight: 700 }}>
                    {stats.activeBookings}
                  </Typography>
                </Box>
                <Typography sx={{ mb: 1.5, fontWeight: 500 }}>
                  Active Bookings
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={Math.min((stats.activeBookings / 5) * 100, 100)}
                  sx={{ 
                    mt: 1,
                    height: 6,
                    borderRadius: 3,
                    bgcolor: 'rgba(255,255,255,0.2)',
                    '& .MuiLinearProgress-bar': {
                      bgcolor: 'white'
                    }
                  }}
                />
              </CardContent>
            </Card>
          </Zoom>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Zoom in={animate} style={{ transitionDelay: '150ms' }}>
            <Card sx={{ 
              height: '100%',
              position: 'relative',
              overflow: 'hidden',
              background: `linear-gradient(135deg, ${alpha(theme.palette.success.light, 0.8)}, ${alpha(theme.palette.success.main, 0.85)})`,
              color: 'white',
              boxShadow: `0 10px 20px ${alpha(theme.palette.success.main, 0.3)}`,
              border: `1px solid ${alpha(theme.palette.success.light, 0.3)}`,
              transition: 'all 0.3s ease-in-out',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: `0 15px 30px ${alpha(theme.palette.success.main, 0.4)}`
              }
            }}>
              <Box sx={{ 
                position: 'absolute', 
                top: -20, 
                right: -20, 
                width: 100, 
                height: 100, 
                borderRadius: '50%', 
                background: 'rgba(255,255,255,0.1)',
                filter: 'blur(1px)'
              }} />
              <CardContent sx={{ position: 'relative', zIndex: 1, p: 3 }}>
                <Box sx={{ 
                  display: 'flex',
                  alignItems: 'center',
                  mb: 2
                }}>
                  <Avatar 
                    sx={{ 
                      bgcolor: 'rgba(255,255,255,0.2)',
                      mr: 2,
                      width: 48,
                      height: 48
                    }}
                  >
                    <CheckCircleIcon />
                  </Avatar>
                  <Typography variant="h5" component="div" sx={{ fontWeight: 700 }}>
                    {stats.completedBookings}
                  </Typography>
                </Box>
                <Typography sx={{ mb: 1.5, fontWeight: 500 }}>
                  Completed Bookings
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={Math.min((stats.completedBookings / 10) * 100, 100)}
                  sx={{ 
                    mt: 1,
                    height: 6,
                    borderRadius: 3,
                    bgcolor: 'rgba(255,255,255,0.2)',
                    '& .MuiLinearProgress-bar': {
                      bgcolor: 'white'
                    }
                  }}
                />
              </CardContent>
            </Card>
          </Zoom>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Zoom in={animate} style={{ transitionDelay: '200ms' }}>
            <Card sx={{ 
              height: '100%',
              position: 'relative',
              overflow: 'hidden',
              background: `linear-gradient(135deg, ${alpha(theme.palette.info.light, 0.8)}, ${alpha(theme.palette.info.main, 0.85)})`,
              color: 'white',
              boxShadow: `0 10px 20px ${alpha(theme.palette.info.main, 0.3)}`,
              border: `1px solid ${alpha(theme.palette.info.light, 0.3)}`,
              transition: 'all 0.3s ease-in-out',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: `0 15px 30px ${alpha(theme.palette.info.main, 0.4)}`
              }
            }}>
              <Box sx={{ 
                position: 'absolute', 
                top: -20, 
                right: -20, 
                width: 100, 
                height: 100, 
                borderRadius: '50%', 
                background: 'rgba(255,255,255,0.1)',
                filter: 'blur(1px)'
              }} />
              <CardContent sx={{ position: 'relative', zIndex: 1, p: 3 }}>
                <Box sx={{ 
                  display: 'flex',
                  alignItems: 'center',
                  mb: 2
                }}>
                  <Avatar 
                    sx={{ 
                      bgcolor: 'rgba(255,255,255,0.2)',
                      mr: 2,
                      width: 48,
                      height: 48
                    }}
                  >
                    <LaundryIcon />
                  </Avatar>
                  <Typography variant="h5" component="div" sx={{ fontWeight: 700 }}>
                    {stats.availableMachines}
                  </Typography>
                </Box>
                <Typography sx={{ mb: 1.5, fontWeight: 500 }}>
                  Available Machines
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={Math.min((stats.availableMachines / 8) * 100, 100)}
                  sx={{ 
                    mt: 1,
                    height: 6,
                    borderRadius: 3,
                    bgcolor: 'rgba(255,255,255,0.2)',
                    '& .MuiLinearProgress-bar': {
                      bgcolor: 'white'
                    }
                  }}
                />
              </CardContent>
            </Card>
          </Zoom>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Zoom in={animate} style={{ transitionDelay: '250ms' }}>
            <Card sx={{ 
              height: '100%',
              position: 'relative',
              overflow: 'hidden',
              background: `linear-gradient(135deg, ${alpha(theme.palette.warning.light, 0.8)}, ${alpha(theme.palette.warning.main, 0.85)})`,
              color: 'white',
              boxShadow: `0 10px 20px ${alpha(theme.palette.warning.main, 0.3)}`,
              border: `1px solid ${alpha(theme.palette.warning.light, 0.3)}`,
              transition: 'all 0.3s ease-in-out',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: `0 15px 30px ${alpha(theme.palette.warning.main, 0.4)}`
              }
            }}>
              <Box sx={{ 
                position: 'absolute', 
                top: -20, 
                right: -20, 
                width: 100, 
                height: 100, 
                borderRadius: '50%', 
                background: 'rgba(255,255,255,0.1)',
                filter: 'blur(1px)'
              }} />
              <CardContent sx={{ position: 'relative', zIndex: 1, p: 3 }}>
                <Box sx={{ 
                  display: 'flex',
                  alignItems: 'center',
                  mb: 2
                }}>
                  <Avatar 
                    sx={{ 
                      bgcolor: 'rgba(255,255,255,0.2)',
                      mr: 2,
                      width: 48,
                      height: 48
                    }}
                  >
                    <WalletIcon />
                  </Avatar>
                  <Typography variant="h5" component="div" sx={{ fontWeight: 700 }}>
                    ₹{user?.walletBalance || 0}
                  </Typography>
                </Box>
                <Typography sx={{ mb: 1.5, fontWeight: 500 }}>
                  Wallet Balance
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={Math.min((user?.walletBalance / 500) * 100, 100)}
                  sx={{ 
                    mt: 1,
                    height: 6,
                    borderRadius: 3,
                    bgcolor: 'rgba(255,255,255,0.2)',
                    '& .MuiLinearProgress-bar': {
                      bgcolor: 'white'
                    }
                  }}
                />
              </CardContent>
            </Card>
          </Zoom>
        </Grid>
      </Grid>

      {/* Recent Bookings and Usage Stats */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Fade in={animate} timeout={1000} style={{ transitionDelay: '300ms' }}>
            <Card sx={{ 
              height: '100%',
              boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
              backdropFilter: 'blur(10px)',
              border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            }}>
              <CardHeader 
                title={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <EventIcon sx={{ mr: 1.5, color: theme.palette.primary.main }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Recent Bookings
                    </Typography>
                  </Box>
                }
                sx={{ 
                  p: 3,
                  pb: 0,
                  '& .MuiCardHeader-title': { fontWeight: 600 }
                }}
              />
              <CardContent sx={{ p: 3 }}>
                {upcomingBookings.length > 0 ? (
                  <List sx={{ 
                    '& .MuiListItem-root': { 
                      px: 2, 
                      py: 1.5,
                      borderRadius: 2,
                      mb: 1,
                      transition: 'all 0.2s',
                      '&:hover': {
                        bgcolor: alpha(theme.palette.primary.main, 0.05),
                        transform: 'translateX(5px)'
                      }
                    } 
                  }}>
                    {upcomingBookings.map((booking, index) => (
                      <React.Fragment key={booking._id || index}>
                        <ListItem>
                          <ListItemText
                            primary={
                              <Box display="flex" justifyContent="space-between" alignItems="center">
                                <Typography 
                                  variant="subtitle1" 
                                  sx={{ 
                                    fontWeight: 600,
                                    display: 'flex',
                                    alignItems: 'center' 
                                  }}
                                >
                                  <LaundryIcon 
                                    sx={{ 
                                      mr: 1, 
                                      color: theme.palette.primary.main,
                                      fontSize: '1.2rem'
                                    }} 
                                  />
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
                                  sx={{ fontWeight: 600, px: 1 }}
                                />
                              </Box>
                            }
                            secondary={
                              <Box sx={{ mt: 1 }}>
                                <Typography 
                                  variant="body2" 
                                  sx={{ 
                                    color: theme.palette.text.secondary,
                                    display: 'flex',
                                    alignItems: 'center',
                                    mb: 0.5
                                  }}
                                >
                                  {booking.hostel?.name || 'Hostel'} 
                                </Typography>
                                <Typography 
                                  variant="body2" 
                                  sx={{ 
                                    color: theme.palette.text.secondary,
                                    display: 'flex',
                                    alignItems: 'center',
                                    mb: 0.5
                                  }}
                                >
                                  <ScheduleIcon sx={{ mr: 0.5, fontSize: '0.9rem' }} />
                                  {formatDateTime(booking.startTime)} - {formatDateTime(booking.endTime)}
                                </Typography>
                                <Box sx={{ 
                                  display: 'flex', 
                                  justifyContent: 'space-between',
                                  mt: 1
                                }}>
                                  <Chip 
                                    label={`${booking.duration} mins`} 
                                    size="small"
                                    variant="outlined"
                                    sx={{ 
                                      borderRadius: 1,
                                      backgroundColor: alpha(theme.palette.primary.main, 0.05),
                                      borderColor: alpha(theme.palette.primary.main, 0.2),
                                      color: theme.palette.primary.main,
                                      fontWeight: 500,
                                      fontSize: '0.75rem'
                                    }}
                                  />
                                  <Chip 
                                    label={`₹${booking.amount}`} 
                                    size="small"
                                    variant="outlined"
                                    sx={{ 
                                      borderRadius: 1,
                                      backgroundColor: alpha(theme.palette.success.main, 0.05),
                                      borderColor: alpha(theme.palette.success.main, 0.2),
                                      color: theme.palette.success.main,
                                      fontWeight: 500,
                                      fontSize: '0.75rem'
                                    }}
                                  />
                                </Box>
                              </Box>
                            }
                          />
                        </ListItem>
                        {index < upcomingBookings.length - 1 && (
                          <Divider sx={{ my: 1, borderColor: alpha(theme.palette.divider, 0.5) }} />
                        )}
                      </React.Fragment>
                    ))}
                  </List>
                ) : (
                  <Box 
                    sx={{ 
                      textAlign: 'center', 
                      py: 4,
                      color: theme.palette.text.secondary 
                    }}
                  >
                    <EventIcon sx={{ fontSize: 48, opacity: 0.3, mb: 2 }} />
                    <Typography variant="subtitle1" gutterBottom>
                      No Recent Bookings
                    </Typography>
                    <Typography variant="body2">
                      You don't have any recent bookings.
                    </Typography>
                  </Box>
                )}
                <Button 
                  variant="outlined" 
                  fullWidth
                  endIcon={<ArrowForwardIcon />}
                  sx={{ 
                    mt: 2,
                    borderWidth: 1.5,
                    py: 1.2,
                    borderRadius: 2,
                    fontWeight: 600,
                    '&:hover': {
                      borderWidth: 1.5,
                    }
                  }}
                  onClick={() => navigate('/bookings')}
                >
                  View All Bookings
                </Button>
              </CardContent>
            </Card>
          </Fade>
        </Grid>
        
        <Grid item xs={12} md={5}>
          <Fade in={animate} timeout={1000} style={{ transitionDelay: '400ms' }}>
            <Card sx={{ 
              height: '100%',
              boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
              backdropFilter: 'blur(10px)',
              border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            }}>
              <CardHeader 
                title={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <TrendingUpIcon sx={{ mr: 1.5, color: theme.palette.primary.main }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Usage Statistics
                    </Typography>
                  </Box>
                }
                sx={{ 
                  p: 3,
                  pb: 0,
                  '& .MuiCardHeader-title': { fontWeight: 600 }
                }}
              />
              <CardContent sx={{ p: 3 }}>
                <Grid container spacing={3} sx={{ mt: 1, mb: 4 }}>
                  <Grid item xs={6}>
                    <Paper 
                      elevation={0} 
                      sx={{ 
                        p: 2.5, 
                        borderRadius: 3,
                        background: alpha(theme.palette.primary.main, 0.05),
                        border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                        textAlign: 'center'
                      }}
                    >
                      <Typography 
                        variant="subtitle2" 
                        gutterBottom
                        sx={{ color: theme.palette.text.secondary, mb: 1, fontWeight: 500 }}
                      >
                        Total Time Used
                      </Typography>
                      <Typography 
                        variant="h4" 
                        sx={{ 
                          fontWeight: 700, 
                          color: theme.palette.primary.main,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        {stats.totalTimeUsed || 0}
                        <Typography 
                          component="span" 
                          sx={{ 
                            fontSize: '0.9rem', 
                            fontWeight: 600, 
                            ml: 0.5,
                            color: alpha(theme.palette.text.primary, 0.7),
                          }}
                        >
                          mins
                        </Typography>
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6}>
                    <Paper 
                      elevation={0} 
                      sx={{ 
                        p: 2.5, 
                        borderRadius: 3,
                        background: alpha(theme.palette.success.main, 0.05),
                        border: `1px solid ${alpha(theme.palette.success.main, 0.1)}`,
                        textAlign: 'center'
                      }}
                    >
                      <Typography 
                        variant="subtitle2" 
                        gutterBottom
                        sx={{ color: theme.palette.text.secondary, mb: 1, fontWeight: 500 }}
                      >
                        Total Amount Spent
                      </Typography>
                      <Typography 
                        variant="h4" 
                        sx={{ 
                          fontWeight: 700, 
                          color: theme.palette.success.main,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        ₹{stats.totalAmountSpent || 0}
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>

                <Box sx={{ mt: 5, textAlign: 'center' }}>
                  <Button 
                    variant="contained"
                    size="large"
                    startIcon={<AddIcon />}
                    onClick={() => navigate('/book-machine')}
                    sx={{ 
                      py: 1.5,
                      px: 4,
                      fontWeight: 600,
                      borderRadius: 2,
                      boxShadow: `0 8px 20px ${alpha(theme.palette.primary.main, 0.3)}`,
                      '&:hover': {
                        boxShadow: `0 10px 25px ${alpha(theme.palette.primary.main, 0.4)}`,
                        transform: 'translateY(-5px)'
                      }
                    }}
                  >
                    Book a Machine
                  </Button>

                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: theme.palette.text.secondary,
                      mt: 2
                    }}
                  >
                    Book your next laundry slot in just a few clicks
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Fade>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;
