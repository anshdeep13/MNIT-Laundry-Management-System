import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  TextField,
  Button,
  Link,
  Grid,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Box,
  Alert,
  InputAdornment,
  IconButton,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Paper,
  Divider,
  Fade,
  Zoom,
  useTheme,
  alpha,
  Card,
  CardContent,
  Avatar,
  Tooltip,
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Home as HomeIcon,
  MeetingRoom as RoomIcon,
  ArrowForward as ArrowForwardIcon,
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon,
  School as SchoolIcon,
  Badge as BadgeIcon,
} from '@mui/icons-material';
import { staffAPI } from '../services/api';

const steps = ['Account Information', 'Personal Details', 'Confirmation'];

const Register = () => {
  const navigate = useNavigate();
  const { register, error } = useAuth();
  const theme = useTheme();
  const [activeStep, setActiveStep] = useState(0);
  const [hostels, setHostels] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    roomNumber: '',
    hostel: '',
    role: 'student',
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [alertError, setAlertError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { name, email, password, confirmPassword, roomNumber, hostel, role } = formData;

  // Fetch hostels on component mount
  useEffect(() => {
    const fetchHostels = async () => {
      try {
        const response = await staffAPI.getHostels();
        setHostels(response.data);
      } catch (err) {
        console.error('Error fetching hostels:', err);
      }
    };
    
    fetchHostels();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear error when user types
    if (formErrors[e.target.name]) {
      setFormErrors({ ...formErrors, [e.target.name]: '' });
    }
  };

  const validateStep = (step) => {
    const errors = {};
    
    if (step === 0) {
      // Account Information step
      if (!email) errors.email = 'Email is required';
      else if (role === 'student' && !email.endsWith('@mnit.ac.in')) {
        errors.email = 'Students must use a @mnit.ac.in email';
      }
      
      if (!password) errors.password = 'Password is required';
      else if (password.length < 6) errors.password = 'Password must be at least 6 characters';
      
      if (password !== confirmPassword) errors.confirmPassword = 'Passwords do not match';
    } else if (step === 1) {
      // Personal Details step
      if (!name) errors.name = 'Name is required';
      
      if (role === 'student') {
        if (!roomNumber) errors.roomNumber = 'Room number is required for students';
        if (!hostel) errors.hostel = 'Hostel selection is required for students';
      }
    }
    
    return errors;
  };

  const handleNext = () => {
    const errors = validateStep(activeStep);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate final step
    const errors = validateStep(activeStep);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    setSubmitting(true);
    setAlertError('');
    
    try {
      console.log('Submitting registration data:', formData);
      
      // Remove confirmPassword before sending to API
      const { confirmPassword, ...registerData } = formData;
      
      // Log the data being sent to the API
      console.log('Sending registration data to API:', registerData);
      
      const response = await register(registerData);
      console.log('Registration successful:', response);
      
      // Show success message
      setAlertError('');
      
      // Navigate to dashboard after successful registration
      navigate('/dashboard');
    } catch (err) {
      console.error('Registration error:', err);
      
      // Extract error message from the error object
      const errorMessage = err.response?.data?.msg || err.message || 'Registration failed. Please try again.';
      setAlertError(errorMessage);
      
      // If there are validation errors from the server, update form errors
      if (err.response?.data?.details) {
        setFormErrors(err.response.data.details);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Fade in={true} timeout={500}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar 
                    sx={{ 
                      bgcolor: theme.palette.primary.main,
                      mr: 2,
                      width: 40,
                      height: 40
                    }}
                  >
                    <EmailIcon />
                  </Avatar>
                  <Typography variant="h6" color="primary">
                    Account Information
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Create your account credentials to access the MNIT Laundry System.
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel id="role-label">Role</InputLabel>
                  <Select
                    labelId="role-label"
                    id="role"
                    name="role"
                    value={role}
                    label="Role"
                    onChange={handleChange}
                    sx={{
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: alpha(theme.palette.primary.main, 0.2),
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: theme.palette.primary.main,
                      },
                    }}
                  >
                    <MenuItem value="student">
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <SchoolIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                        Student
                      </Box>
                    </MenuItem>
                    <MenuItem value="staff">
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <BadgeIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                        Staff
                      </Box>
                    </MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  value={email}
                  onChange={handleChange}
                  error={!!formErrors.email}
                  helperText={formErrors.email}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon color="primary" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: theme.palette.primary.main,
                      },
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={handleChange}
                  error={!!formErrors.password}
                  helperText={formErrors.password}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon color="primary" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={togglePasswordVisibility}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: theme.palette.primary.main,
                      },
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  name="confirmPassword"
                  label="Confirm Password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={handleChange}
                  error={!!formErrors.confirmPassword}
                  helperText={formErrors.confirmPassword}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon color="primary" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle confirm password visibility"
                          onClick={toggleConfirmPasswordVisibility}
                          edge="end"
                        >
                          {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: theme.palette.primary.main,
                      },
                    },
                  }}
                />
              </Grid>
            </Grid>
          </Fade>
        );
      case 1:
        return (
          <Fade in={true} timeout={500}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar 
                    sx={{ 
                      bgcolor: theme.palette.secondary.main,
                      mr: 2,
                      width: 40,
                      height: 40
                    }}
                  >
                    <PersonIcon />
                  </Avatar>
                  <Typography variant="h6" color="secondary">
                    Personal Details
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  {role === 'student' 
                    ? 'Provide your student information to complete registration.' 
                    : 'Provide your personal information to complete registration.'}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="name"
                  label="Full Name"
                  name="name"
                  autoComplete="name"
                  value={name}
                  onChange={handleChange}
                  error={!!formErrors.name}
                  helperText={formErrors.name}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon color="secondary" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: theme.palette.secondary.main,
                      },
                    },
                  }}
                />
              </Grid>
              {role === 'student' && (
                <>
                  <Grid item xs={12}>
                    <TextField
                      required
                      fullWidth
                      id="roomNumber"
                      label="Room Number"
                      name="roomNumber"
                      autoComplete="off"
                      value={roomNumber}
                      onChange={handleChange}
                      error={!!formErrors.roomNumber}
                      helperText={formErrors.roomNumber}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <RoomIcon color="secondary" />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '&:hover fieldset': {
                            borderColor: theme.palette.secondary.main,
                          },
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl fullWidth required error={!!formErrors.hostel}>
                      <InputLabel id="hostel-label">Hostel</InputLabel>
                      <Select
                        labelId="hostel-label"
                        id="hostel"
                        name="hostel"
                        value={hostel}
                        label="Hostel"
                        onChange={handleChange}
                        startAdornment={
                          <InputAdornment position="start">
                            <HomeIcon color="secondary" />
                          </InputAdornment>
                        }
                        sx={{
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: alpha(theme.palette.secondary.main, 0.2),
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: theme.palette.secondary.main,
                          },
                        }}
                      >
                        {hostels.map((h) => (
                          <MenuItem key={h._id} value={h._id}>
                            {h.name}
                          </MenuItem>
                        ))}
                      </Select>
                      {formErrors.hostel && (
                        <FormHelperText>{formErrors.hostel}</FormHelperText>
                      )}
                    </FormControl>
                  </Grid>
                </>
              )}
            </Grid>
          </Fade>
        );
      case 2:
        return (
          <Fade in={true} timeout={500}>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar 
                  sx={{ 
                    bgcolor: theme.palette.success.main,
                    mr: 2,
                    width: 40,
                    height: 40
                  }}
                >
                  <CheckCircleIcon />
                </Avatar>
                <Typography variant="h6" color="success.main">
                  Review Your Information
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Please review your information before submitting your registration.
              </Typography>
              
              <Card 
                variant="outlined" 
                sx={{ 
                  mb: 3, 
                  borderRadius: 2,
                  borderColor: alpha(theme.palette.primary.main, 0.2),
                  boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                  '&:hover': {
                    boxShadow: '0 8px 30px rgba(0,0,0,0.1)',
                    borderColor: theme.palette.primary.main,
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                <CardContent>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Name
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {name}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Email
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {email}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Role
                      </Typography>
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          fontWeight: 500,
                          textTransform: 'capitalize',
                          color: role === 'student' ? theme.palette.primary.main : theme.palette.secondary.main
                        }}
                      >
                        {role}
                      </Typography>
                    </Grid>
                    {role === 'student' && (
                      <>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            Room Number
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {roomNumber}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            Hostel
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {hostels.find(h => h._id === hostel)?.name || hostel}
                          </Typography>
                        </Grid>
                      </>
                    )}
                  </Grid>
                </CardContent>
              </Card>
              
              <Divider sx={{ my: 3 }} />
              
              <Box sx={{ 
                p: 2, 
                borderRadius: 2, 
                bgcolor: alpha(theme.palette.primary.main, 0.05),
                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
              }}>
                <Typography variant="body2" color="text.secondary" align="center">
                  By registering, you agree to our{' '}
                  <Link component={RouterLink} to="/terms" color="primary">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link component={RouterLink} to="/privacy" color="primary">
                    Privacy Policy
                  </Link>.
                </Typography>
              </Box>
            </Box>
          </Fade>
        );
      default:
        return 'Unknown step';
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      {alertError && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 3,
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
          }}
        >
          {alertError}
        </Alert>
      )}
      
      <Box
        sx={{
          background: (theme) => theme.palette.background.headerGradient || 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)',
          p: 3,
          color: 'white',
          borderRadius: '15px 15px 0 0',
          mb: 4,
        }}
      >
        <Typography variant="h4" fontWeight="bold" align="center">
          Register
        </Typography>
      </Box>
      
      <Paper 
        elevation={0} 
        sx={{ 
          p: 4, 
          borderRadius: 2,
          bgcolor: alpha(theme.palette.background.paper, 0.8),
          backdropFilter: 'blur(10px)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: '0 8px 30px rgba(0,0,0,0.1)',
          },
        }}
      >
        {getStepContent(activeStep)}
      </Paper>
      
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          mt: 4,
          px: 1,
        }}
      >
        <Tooltip title="Go back to previous step">
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            sx={{ 
              borderRadius: 2,
              px: 3,
              py: 1,
              '&:hover': {
                bgcolor: alpha(theme.palette.primary.main, 0.05),
              },
            }}
          >
            Back
          </Button>
        </Tooltip>
        <Box>
          {activeStep === steps.length - 1 ? (
            <Tooltip title="Complete registration">
              <Button
                type="submit"
                variant="contained"
                disabled={submitting}
                endIcon={!submitting && <CheckCircleIcon />}
                sx={{ 
                  position: 'relative',
                  minWidth: 150,
                  borderRadius: 2,
                  px: 3,
                  py: 1,
                  bgcolor: theme.palette.success.main,
                  '&:hover': {
                    bgcolor: theme.palette.success.dark,
                  },
                }}
              >
                {submitting ? (
                  <CircularProgress
                    size={24}
                    sx={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      marginTop: '-12px',
                      marginLeft: '-12px',
                      color: 'white',
                    }}
                  />
                ) : (
                  'Complete Registration'
                )}
              </Button>
            </Tooltip>
          ) : (
            <Tooltip title="Continue to next step">
              <Button
                variant="contained"
                onClick={handleNext}
                endIcon={<ArrowForwardIcon />}
                sx={{ 
                  borderRadius: 2,
                  px: 3,
                  py: 1,
                }}
              >
                Next
              </Button>
            </Tooltip>
          )}
        </Box>
      </Box>
      
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Already have an account?{' '}
          <Link 
            component={RouterLink} 
            to="/login" 
            color="primary"
            sx={{ 
              fontWeight: 500,
              textDecoration: 'none',
              '&:hover': {
                textDecoration: 'underline',
              },
            }}
          >
            Sign in
          </Link>
        </Typography>
      </Box>
    </Box>
  );
};

export default Register;
