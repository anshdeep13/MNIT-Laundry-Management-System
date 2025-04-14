import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Typography,
  Grid,
  Paper,
  useTheme,
  alpha,
  Card,
  CardContent,
  CardMedia,
  Stack,
  Divider,
  Fade,
  Zoom,
  Avatar,
  IconButton,
  Tooltip,
  useMediaQuery,
  CircularProgress,
} from '@mui/material';
import {
  LocalLaundryService as LaundryIcon,
  Login as LoginIcon,
  Speed as SpeedIcon,
  Security as SecurityIcon,
  Payment as PaymentIcon,
  Support as SupportIcon,
  ArrowForward as ArrowForwardIcon,
  School as SchoolIcon,
  CheckCircle as CheckCircleIcon,
  Star as StarIcon,
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  Instagram as InstagramIcon,
  LinkedIn as LinkedInIcon,
} from '@mui/icons-material';

// Animated background component
const AnimatedBackground = () => {
  const theme = useTheme();
  
  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden',
        zIndex: -1,
      }}
    >
      {[...Array(20)].map((_, i) => (
        <Box
          key={i}
          sx={{
            position: 'absolute',
            width: Math.random() * 100 + 50,
            height: Math.random() * 100 + 50,
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.1)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            animation: `float ${Math.random() * 10 + 10}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 5}s`,
            '@keyframes float': {
              '0%': {
                transform: 'translate(0, 0) rotate(0deg)',
              },
              '50%': {
                transform: `translate(${Math.random() * 100 - 50}px, ${Math.random() * 100 - 50}px) rotate(${Math.random() * 360}deg)`,
              },
              '100%': {
                transform: 'translate(0, 0) rotate(0deg)',
              },
            },
          }}
        />
      ))}
    </Box>
  );
};

const FeatureCard = ({ icon, title, description, delay = 0 }) => {
  const theme = useTheme();
  
  return (
    <Zoom in={true} timeout={800} style={{ transitionDelay: `${delay}ms` }}>
      <Card 
        elevation={0}
        sx={{ 
          height: '100%',
          borderRadius: 3,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
          transition: 'all 0.3s ease',
          background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)} 0%, ${alpha(theme.palette.background.paper, 0.7)} 100%)`,
          backdropFilter: 'blur(10px)',
          '&:hover': {
            transform: 'translateY(-8px)',
            boxShadow: '0 12px 30px rgba(0,0,0,0.1)',
            borderColor: theme.palette.primary.main,
            '& .feature-icon': {
              transform: 'scale(1.1) rotate(5deg)',
              color: theme.palette.primary.main,
            },
          },
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              mb: 2,
              color: theme.palette.primary.main,
            }}
          >
            <Box 
              className="feature-icon"
              sx={{ 
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 50,
                height: 50,
                borderRadius: 2,
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                mr: 2,
                transition: 'all 0.3s ease',
              }}
            >
              {icon}
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {title}
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        </CardContent>
      </Card>
    </Zoom>
  );
};

const TestimonialCard = ({ name, role, comment, avatar, delay = 0 }) => {
  const theme = useTheme();
  
  return (
    <Fade in={true} timeout={800} style={{ transitionDelay: `${delay}ms` }}>
      <Card 
        elevation={0}
        sx={{ 
          height: '100%',
          borderRadius: 3,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
          transition: 'all 0.3s ease',
          background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)} 0%, ${alpha(theme.palette.background.paper, 0.7)} 100%)`,
          backdropFilter: 'blur(10px)',
          '&:hover': {
            transform: 'translateY(-8px)',
            boxShadow: '0 12px 30px rgba(0,0,0,0.1)',
            borderColor: theme.palette.primary.main,
          },
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar 
              src={avatar} 
              alt={name}
              sx={{ 
                width: 50, 
                height: 50, 
                mr: 2,
                border: `2px solid ${theme.palette.primary.main}`,
              }}
            />
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {role}
              </Typography>
            </Box>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
            "{comment}"
          </Typography>
          <Box sx={{ display: 'flex', mt: 2 }}>
            {[...Array(5)].map((_, i) => (
              <StarIcon 
                key={i} 
                sx={{ 
                  color: theme.palette.warning.main,
                  fontSize: 16,
                }} 
              />
            ))}
          </Box>
        </CardContent>
      </Card>
    </Fade>
  );
};

const LandingPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  const handleLoginClick = () => {
    navigate('/login');
  };

  if (isLoading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.1)} 0%, ${alpha(theme.palette.background.paper, 0.9)} 100%)`,
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={60} thickness={4} sx={{ mb: 2 }} />
          <Typography variant="h6" color="primary">
            Loading MNIT Laundry System...
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box 
      sx={{ 
        minHeight: '100vh',
        position: 'relative',
        overflow: 'hidden',
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.1)} 0%, ${alpha(theme.palette.background.paper, 0.9)} 100%)`,
        pt: { xs: 4, md: 8 },
        pb: { xs: 8, md: 12 },
      }}
    >
      <AnimatedBackground />
      
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Hero Section */}
          <Grid item xs={12}>
            <Fade in={true} timeout={1000}>
              <Box 
                sx={{ 
                  textAlign: 'center',
                  mb: { xs: 4, md: 8 },
                }}
              >
                <Box 
                  sx={{ 
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 3,
                    p: 2,
                    borderRadius: 3,
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    backdropFilter: 'blur(10px)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'scale(1.02)',
                      boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
                    },
                  }}
                >
                  <LaundryIcon 
                    sx={{ 
                      fontSize: 40, 
                      color: theme.palette.primary.main,
                      mr: 1,
                    }} 
                  />
                  <Typography 
                    variant="h4" 
                    component="h1" 
                    sx={{ 
                      fontWeight: 700,
                      color: theme.palette.primary.main,
                      background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    MNIT Laundry System
                  </Typography>
                </Box>
                
                <Typography 
                  variant="h5" 
                  sx={{ 
                    mb: 3,
                    color: theme.palette.text.secondary,
                    maxWidth: '800px',
                    mx: 'auto',
                  }}
                >
                  Streamline your laundry experience with our easy-to-use booking system
                </Typography>
                
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
                  <Button
                    variant="contained"
                    size="large"
                    endIcon={<LoginIcon />}
                    onClick={handleLoginClick}
                    sx={{ 
                      py: 1.5,
                      px: 4,
                      borderRadius: 2,
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
                      background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                      '&:hover': {
                        boxShadow: '0 12px 30px rgba(0,0,0,0.15)',
                        background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                      },
                    }}
                  >
                    Get Started
                  </Button>
                  
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={handleLoginClick}
                    sx={{ 
                      py: 1.5,
                      px: 4,
                      borderRadius: 2,
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      borderWidth: 2,
                      '&:hover': {
                        borderWidth: 2,
                        bgcolor: alpha(theme.palette.primary.main, 0.05),
                      },
                    }}
                  >
                    Learn More
                  </Button>
                </Box>
              </Box>
            </Fade>
          </Grid>
          
          {/* Features Section */}
          <Grid item xs={12}>
            <Typography 
              variant="h5" 
              align="center" 
              sx={{ 
                mb: 4,
                fontWeight: 600,
                position: 'relative',
                '&:after': {
                  content: '""',
                  position: 'absolute',
                  bottom: -10,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 80,
                  height: 3,
                  borderRadius: 3,
                  background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                },
              }}
            >
              Why Choose Our Laundry System?
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={4}>
                <FeatureCard 
                  icon={<SpeedIcon fontSize="large" />}
                  title="Easy Booking"
                  description="Book your laundry service in just a few clicks. No more waiting in queues or manual scheduling."
                  delay={0}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <FeatureCard 
                  icon={<SecurityIcon fontSize="large" />}
                  title="Secure Process"
                  description="Your clothes are handled with care and tracked throughout the entire laundry process."
                  delay={100}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <FeatureCard 
                  icon={<PaymentIcon fontSize="large" />}
                  title="Simple Payments"
                  description="Pay securely online with multiple payment options. No need to carry cash."
                  delay={200}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <FeatureCard 
                  icon={<LaundryIcon fontSize="large" />}
                  title="Real-time Status"
                  description="Track the status of your laundry in real-time. Know exactly when your clothes will be ready."
                  delay={300}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <FeatureCard 
                  icon={<SupportIcon fontSize="large" />}
                  title="24/7 Support"
                  description="Our support team is always available to help you with any questions or concerns."
                  delay={400}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <FeatureCard 
                  icon={<SpeedIcon fontSize="large" />}
                  title="Fast Service"
                  description="Get your laundry back quickly with our efficient processing and delivery system."
                  delay={500}
                />
              </Grid>
            </Grid>
          </Grid>
          
          {/* Testimonials Section */}
          <Grid item xs={12}>
            <Typography 
              variant="h5" 
              align="center" 
              sx={{ 
                mb: 4,
                mt: 6,
                fontWeight: 600,
                position: 'relative',
                '&:after': {
                  content: '""',
                  position: 'absolute',
                  bottom: -10,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 80,
                  height: 3,
                  borderRadius: 3,
                  background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                },
              }}
            >
              What Our Users Say
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <TestimonialCard 
                  name="Rahul Sharma"
                  role="Student, CSE"
                  comment="This laundry system has made my life so much easier! No more waiting in queues or tracking my clothes manually."
                  avatar="https://randomuser.me/api/portraits/men/32.jpg"
                  delay={0}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TestimonialCard 
                  name="Priya Patel"
                  role="Student, ECE"
                  comment="The real-time status updates are amazing. I always know exactly when my clothes will be ready."
                  avatar="https://randomuser.me/api/portraits/women/44.jpg"
                  delay={100}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TestimonialCard 
                  name="Amit Kumar"
                  role="Staff"
                  comment="As a staff member, this system has streamlined our operations significantly. Highly recommended!"
                  avatar="https://randomuser.me/api/portraits/men/67.jpg"
                  delay={200}
                />
              </Grid>
            </Grid>
          </Grid>
          
          {/* CTA Section */}
          <Grid item xs={12}>
            <Fade in={true} timeout={1200}>
              <Paper 
                elevation={0}
                sx={{ 
                  p: { xs: 3, md: 5 },
                  mt: 6,
                  borderRadius: 3,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                  color: 'white',
                  textAlign: 'center',
                  position: 'relative',
                  overflow: 'hidden',
                  '&:before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z\' fill=\'%23ffffff\' fill-opacity=\'0.05\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")',
                    opacity: 0.1,
                  },
                }}
              >
                <Typography variant="h4" sx={{ mb: 2, fontWeight: 700 }}>
                  Ready to Get Started?
                </Typography>
                <Typography variant="body1" sx={{ mb: 4, maxWidth: '600px', mx: 'auto', opacity: 0.9 }}>
                  Join thousands of students who are already using our laundry system to save time and hassle.
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  endIcon={<ArrowForwardIcon />}
                  onClick={handleLoginClick}
                  sx={{ 
                    py: 1.5,
                    px: 4,
                    borderRadius: 2,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    bgcolor: 'white',
                    color: theme.palette.primary.main,
                    '&:hover': {
                      bgcolor: alpha(theme.palette.common.white, 0.9),
                      transform: 'translateY(-3px)',
                      boxShadow: '0 12px 30px rgba(0,0,0,0.15)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  Login Now
                </Button>
              </Paper>
            </Fade>
          </Grid>
          
          {/* Footer */}
          <Grid item xs={12}>
            <Box 
              sx={{ 
                mt: 8, 
                pt: 4, 
                borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Box sx={{ mb: { xs: 2, md: 0 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <LaundryIcon sx={{ color: theme.palette.primary.main, mr: 1 }} />
                  <Typography variant="h6" color="primary" sx={{ fontWeight: 600 }}>
                    MNIT Laundry
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  © {new Date().getFullYear()} MNIT Laundry System. All rights reserved.
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Tooltip title="Facebook">
                  <IconButton 
                    sx={{ 
                      color: theme.palette.text.secondary,
                      '&:hover': { color: theme.palette.primary.main },
                    }}
                  >
                    <FacebookIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Twitter">
                  <IconButton 
                    sx={{ 
                      color: theme.palette.text.secondary,
                      '&:hover': { color: theme.palette.primary.main },
                    }}
                  >
                    <TwitterIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Instagram">
                  <IconButton 
                    sx={{ 
                      color: theme.palette.text.secondary,
                      '&:hover': { color: theme.palette.primary.main },
                    }}
                  >
                    <InstagramIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="LinkedIn">
                  <IconButton 
                    sx={{ 
                      color: theme.palette.text.secondary,
                      '&:hover': { color: theme.palette.primary.main },
                    }}
                  >
                    <LinkedInIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default LandingPage; 