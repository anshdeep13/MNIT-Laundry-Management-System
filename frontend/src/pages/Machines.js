import { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Button, 
  Grid, 
  Paper, 
  Chip, 
  CircularProgress, 
  Alert, 
  useTheme, 
  alpha, 
  Container,
  Divider,
  Badge
} from '@mui/material';
import { 
  LocalLaundryService as LaundryIcon, 
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  AccessTime as TimeIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';

const Machines = () => {
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const theme = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMachines = async () => {
      try {
        setLoading(true);
        const { data } = await API.get('/machines');
        setMachines(data);
        setError('');
      } catch (err) {
        console.error(err);
        setError('Failed to load machines. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchMachines();
  }, []);

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'available':
        return theme.palette.success.main;
      case 'in_use':
        return theme.palette.warning.main;
      case 'maintenance':
        return theme.palette.error.main;
      default:
        return theme.palette.info.main;
    }
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'available':
        return <CheckCircleIcon />;
      case 'in_use':
        return <TimeIcon />;
      case 'maintenance':
        return <ErrorIcon />;
      default:
        return <WarningIcon />;
    }
  };

  const handleBooking = (machineId) => {
    navigate('/book-machine', { state: { machineId } });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box>
        <Paper
          elevation={0}
          sx={{
            mb: 4,
            overflow: 'hidden',
            borderRadius: '16px',
            background: theme.palette.background.headerGradient || 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)',
          }}
        >
          <Box
            sx={{
              p: 4,
              color: 'white',
              position: 'relative',
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: '150px',
                height: '150px',
                opacity: 0.2,
                transform: 'translate(30%, -30%)',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 70%)',
              }}
            />
            
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Laundry Machines
            </Typography>
            
            <Typography variant="body1" sx={{ maxWidth: '600px', mb: 1, opacity: 0.9 }}>
              Browse available machines across campus. Book a machine for your next laundry session.
            </Typography>
            
            <Box sx={{ display: 'flex', mt: 2, gap: 1 }}>
              <Chip 
                icon={<CheckCircleIcon />} 
                label="Available" 
                size="small" 
                sx={{ bgcolor: alpha(theme.palette.success.main, 0.2), color: theme.palette.success.main }}
              />
              <Chip 
                icon={<TimeIcon />} 
                label="In Use" 
                size="small" 
                sx={{ bgcolor: alpha(theme.palette.warning.main, 0.2), color: theme.palette.warning.main }}
              />
              <Chip 
                icon={<ErrorIcon />} 
                label="Maintenance" 
                size="small" 
                sx={{ bgcolor: alpha(theme.palette.error.main, 0.2), color: theme.palette.error.main }}
              />
            </Box>
          </Box>
        </Paper>
      
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {machines.length === 0 && !loading && !error ? (
          <Paper sx={{ p: 4, textAlign: 'center', borderRadius: '16px' }}>
            <Typography variant="h6" color="textSecondary" gutterBottom>
              No machines available at the moment
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Please check back later or contact maintenance staff.
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {machines.map((machine) => (
              <Grid item xs={12} sm={6} md={4} key={machine._id}>
                <Card 
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    borderRadius: '16px',
                    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: '0px 10px 20px rgba(0, 0, 0, 0.1)'
                    },
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
                  }}
                >
                  <Box 
                    sx={{ 
                      p: 2, 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      borderBottom: `1px solid ${alpha(theme.palette.divider, 0.7)}`
                    }}
                  >
                    <Typography variant="h6" fontWeight="600">{machine.name}</Typography>
                    <Chip
                      icon={getStatusIcon(machine.status)}
                      label={machine.status.replace('_', ' ')}
                      size="small"
                      sx={{
                        bgcolor: alpha(getStatusColor(machine.status), 0.1),
                        color: getStatusColor(machine.status),
                        fontWeight: 500,
                      }}
                    />
                  </Box>
                  
                  <CardContent sx={{ flexGrow: 1, pt: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Box 
                        sx={{ 
                          p: 1.5, 
                          borderRadius: '12px', 
                          display: 'flex',
                          backgroundColor: alpha(theme.palette.primary.main, 0.1),
                          color: theme.palette.primary.main,
                          mr: 2
                        }}
                      >
                        <LaundryIcon fontSize="large" />
                      </Box>
                      <Box>
                        <Typography variant="body2" color="textSecondary">
                          Capacity
                        </Typography>
                        <Typography variant="body1" fontWeight="500">
                          {machine.capacity} kg
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Divider sx={{ mb: 2 }} />
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" color="textSecondary">
                        Location: <b>{machine.hostel?.name || 'N/A'}</b>
                      </Typography>
                      
                      <Typography variant="body2" color="primary" fontWeight="500">
                        ₹20 / 30min
                      </Typography>
                    </Box>
                  </CardContent>
                  
                  <Box sx={{ p: 2, pt: 0 }}>
                    <Button 
                      variant="contained" 
                      fullWidth
                      disabled={machine.status.toLowerCase() !== 'available'}
                      onClick={() => handleBooking(machine._id)}
                      sx={{ 
                        borderRadius: '8px',
                        py: 1
                      }}
                    >
                      {machine.status.toLowerCase() === 'available' ? 'Book Now' : 'Unavailable'}
                    </Button>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Container>
  );
};

export default Machines;