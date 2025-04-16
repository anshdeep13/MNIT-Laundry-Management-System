import { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Container,
  useTheme,
  alpha,
  Chip,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Divider
} from '@mui/material';
import { 
  Receipt as ReceiptIcon, 
  LocalLaundryService as LaundryIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  Cancel as CancelIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import API from '../services/api';

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const theme = useTheme();

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const { data } = await API.get('/bookings');
        setBookings(data);
        setError('');
      } catch (err) {
        console.error(err);
        setError('Failed to load bookings. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const getStatusChip = (status) => {
    let color, icon;
    
    switch(status.toLowerCase()) {
      case 'completed':
        color = 'success';
        icon = <CheckCircleIcon />;
        break;
      case 'cancelled':
        color = 'error';
        icon = <CancelIcon />;
        break;
      case 'pending':
      default:
        color = 'warning';
        icon = <PendingIcon />;
    }
    
    return (
      <Chip 
        icon={icon}
        label={status.charAt(0).toUpperCase() + status.slice(1)}
        size="small"
        color={color}
        variant="outlined"
        sx={{ 
          fontWeight: 500,
          '& .MuiChip-icon': { fontSize: '1rem' }
        }}
      />
    );
  };
  
  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  };
  
  const formatTimeSlot = (start, end) => {
    const startTime = new Date(start);
    const endTime = new Date(end);
    
    return `${startTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - 
            ${endTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
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
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <ReceiptIcon sx={{ mr: 1, fontSize: '2rem' }} />
              <Typography variant="h4" fontWeight="bold">
                My Bookings
              </Typography>
            </Box>
            
            <Typography variant="body1" sx={{ maxWidth: '600px', opacity: 0.9 }}>
              Track all your laundry machine bookings, view status, and manage your reservations.
            </Typography>
          </Box>
        </Paper>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {bookings.length === 0 && !loading && !error ? (
          <Paper sx={{ p: 4, textAlign: 'center', borderRadius: '16px' }}>
            <Typography variant="h6" color="textSecondary" gutterBottom>
              No bookings found
            </Typography>
            <Typography variant="body2" color="textSecondary">
              You haven't made any laundry machine bookings yet.
            </Typography>
          </Paper>
        ) : (
          <Paper 
            elevation={0} 
            sx={{ 
              borderRadius: '16px', 
              overflow: 'hidden',
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
            }}
          >
            <Box sx={{ 
              p: 2, 
              bgcolor: alpha(theme.palette.primary.main, 0.03),
              borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}` 
            }}>
              <Typography variant="subtitle1" fontWeight={600}>
                Recent Bookings
              </Typography>
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ '& th': { fontWeight: 600 } }}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <LaundryIcon sx={{ mr: 1, color: theme.palette.primary.main, fontSize: '1.2rem' }} />
                        Machine
                      </Box>
                    </TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Time Slot</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {bookings.map((booking) => (
                    <TableRow 
                      key={booking._id}
                      sx={{ 
                        '&:hover': { 
                          bgcolor: alpha(theme.palette.primary.main, 0.03)
                        },
                        transition: 'background-color 0.2s'
                      }}
                    >
                      <TableCell sx={{ fontWeight: 500 }}>
                        {booking.machine?.name || 'Unknown Machine'}
                      </TableCell>
                      <TableCell>{formatDateTime(booking.startTime)}</TableCell>
                      <TableCell>
                        {formatTimeSlot(booking.startTime, booking.endTime)}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 500, color: theme.palette.primary.main }}>
                        ₹{booking.amount}
                      </TableCell>
                      <TableCell>
                        {getStatusChip(booking.status)}
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="View Details">
                          <IconButton 
                            size="small"
                            sx={{ 
                              color: theme.palette.primary.main,
                              bgcolor: alpha(theme.palette.primary.main, 0.1),
                              '&:hover': {
                                bgcolor: alpha(theme.palette.primary.main, 0.2),
                              }
                            }}
                          >
                            <ViewIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}
      </Box>
    </Container>
  );
};

export default Bookings;