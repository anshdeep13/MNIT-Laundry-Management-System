import React from 'react';
import { Outlet, Navigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Container, 
  Box, 
  Paper, 
  Typography, 
  CircularProgress,
  Grid,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { LocalLaundryService as LaundryIcon } from '@mui/icons-material';

const AuthLayout = () => {
  const { user, loading } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  console.log('AuthLayout: Auth state:', { user, loading });

  // Show loading indicator while checking authentication
  if (loading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="100vh"
        bgcolor="background.default"
      >
        <CircularProgress size={60} thickness={4} />
      </Box>
    );
  }

  // If user is already logged in, redirect to dashboard
  if (user) {
    console.log('AuthLayout: User already logged in, redirecting to dashboard');
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <Box 
      sx={{ 
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.default',
        backgroundImage: 'linear-gradient(135deg, rgba(25, 118, 210, 0.05) 0%, rgba(156, 39, 176, 0.05) 100%)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <Container component="main" maxWidth="lg" sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', py: 4 }}>
        <Grid container spacing={4} alignItems="center" justifyContent="center">
          {!isMobile && (
            <Grid item xs={12} md={6}>
              <Box 
                sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  p: 4,
                }}
              >
                <Box 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    mb: 4,
                    color: 'primary.main',
                  }}
                >
                  <LaundryIcon sx={{ fontSize: 60, mr: 2 }} />
                  <Typography variant="h3" component="h1" sx={{ fontWeight: 700 }}>
                    MNIT Laundry
                  </Typography>
                </Box>
                <Typography variant="h5" component="h2" sx={{ mb: 3, textAlign: 'center', color: 'text.secondary' }}>
                  Smart Laundry Management System
                </Typography>
                <Typography variant="body1" sx={{ mb: 4, textAlign: 'center', maxWidth: 500, color: 'text.secondary' }}>
                  Book your laundry machines online, track your bookings, and manage your laundry schedule with ease.
                </Typography>
                <Box 
                  sx={{ 
                    display: 'flex', 
                    flexWrap: 'wrap', 
                    gap: 2, 
                    justifyContent: 'center',
                    mt: 4,
                  }}
                >
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      p: 2, 
                      borderRadius: 2, 
                      bgcolor: 'primary.light',
                      color: 'white',
                      width: 120,
                      textAlign: 'center',
                    }}
                  >
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>Easy Booking</Typography>
                  </Paper>
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      p: 2, 
                      borderRadius: 2, 
                      bgcolor: 'secondary.light',
                      color: 'white',
                      width: 120,
                      textAlign: 'center',
                    }}
                  >
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>Real-time Status</Typography>
                  </Paper>
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      p: 2, 
                      borderRadius: 2, 
                      bgcolor: 'info.light',
                      color: 'white',
                      width: 120,
                      textAlign: 'center',
                    }}
                  >
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>Secure Payment</Typography>
                  </Paper>
                </Box>
              </Box>
            </Grid>
          )}
          <Grid item xs={12} md={6}>
            <Paper 
              elevation={3}
              sx={{
                p: 4,
                borderRadius: 2,
                boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.08)',
                maxWidth: 500,
                mx: 'auto',
              }}
            >
              <Box sx={{ mb: 3, textAlign: 'center' }}>
                <Box 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    mb: 2,
                    color: 'primary.main',
                  }}
                >
                  <LaundryIcon sx={{ fontSize: 40, mr: 1 }} />
                  <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
                    MNIT Laundry
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {window.location.pathname === '/login' 
                    ? "Don't have an account? " 
                    : "Already have an account? "}
                  <Link 
                    to={window.location.pathname === '/login' ? '/register' : '/login'}
                    style={{ 
                      color: theme.palette.primary.main, 
                      textDecoration: 'none',
                      fontWeight: 500,
                    }}
                  >
                    {window.location.pathname === '/login' ? 'Sign up' : 'Sign in'}
                  </Link>
                </Typography>
              </Box>
              <Outlet />
            </Paper>
          </Grid>
        </Grid>
      </Container>
      <Box 
        component="footer" 
        sx={{ 
          py: 2, 
          textAlign: 'center',
          bgcolor: 'background.paper',
          borderTop: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Typography variant="body2" color="text.secondary">
          © {new Date().getFullYear()} MNIT Laundry Management System. All rights reserved.
        </Typography>
      </Box>
    </Box>
  );
};

export default AuthLayout; 