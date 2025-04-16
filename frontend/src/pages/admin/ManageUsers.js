import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Chip,
  Grid,
  CircularProgress,
  Snackbar,
  Alert,
  TablePagination,
  InputAdornment,
  Container,
  useTheme,
  alpha,
  Tooltip,
  Avatar,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AccountCircle as UserIcon,
  AdminPanelSettings as AdminIcon,
  School as StudentIcon,
  Engineering as StaffIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  MoreHoriz as MoreHorizIcon,
  Group as GroupIcon,
  VerifiedUser as VerifiedIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  AccountBalanceWallet as WalletIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import API from '../../services/api';
import AdminPageHeader, { HeaderStat } from '../../components/AdminPageHeader';

const ManageUsers = () => {
  const { user } = useAuth();
  const theme = useTheme();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    hostel: '',
    roomNumber: '',
    walletBalance: 0,
    contactNumber: ''
  });
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchUsers();
    fetchHostels();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [searchQuery, users, filter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await API.get('/admin/users');
      setUsers(response.data);
      setFilteredUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      showNotification('Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchHostels = async () => {
    try {
      const response = await API.get('/hostels');
      setHostels(response.data);
    } catch (error) {
      console.error('Error fetching hostels:', error);
    }
  };

  const filterUsers = () => {
    if (!users.length) return;
    
    // First filter by role if filter is not 'all'
    let result = users;
    if (filter !== 'all') {
      result = users.filter(user => user.role === filter);
    }
    
    // Then filter by search query
    if (searchQuery) {
      result = result.filter(user => 
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user.roomNumber && user.roomNumber.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    setFilteredUsers(result);
    setPage(0);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
  };

  const handleDialogOpen = (user = null) => {
    if (user) {
      setSelectedUser(user);
      setFormData({
        name: user.name,
        email: user.email,
        password: '', // Don't show password in edit mode
        role: user.role,
        hostel: user.hostel?._id || user.hostel || '',
        roomNumber: user.roomNumber || '',
        walletBalance: user.walletBalance || 0,
        contactNumber: user.contactNumber || ''
      });
    } else {
      setSelectedUser(null);
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'student',
        hostel: hostels.length > 0 ? hostels[0]._id : '',
        roomNumber: '',
        walletBalance: 0,
        contactNumber: ''
      });
    }
    setOpenDialog(true);
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'walletBalance' ? Number(value) : value
    });
  };

  const handleRoleChange = (e) => {
    const role = e.target.value;
    setFormData({
      ...formData,
      role,
      // Clear hostel and roomNumber if not a student
      ...(role !== 'student' && { hostel: '', roomNumber: '' })
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userData = { ...formData };
      
      // Only include password in the data if it's provided
      if (!userData.password) {
        delete userData.password;
      }
      
      if (selectedUser) {
        // Update existing user
        await API.put(`/admin/users/${selectedUser._id}`, userData);
        showNotification('User updated successfully');
      } else {
        // Create new user
        await API.post('/admin/users', userData);
        showNotification('User added successfully');
      }
      handleDialogClose();
      fetchUsers();
    } catch (error) {
      console.error('Error saving user:', error);
      showNotification(error.response?.data?.msg || 'Failed to save user', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        await API.delete(`/admin/users/${id}`);
        showNotification('User deleted successfully');
        fetchUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
        showNotification('Failed to delete user', 'error');
      }
    }
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const showNotification = (message, severity = 'success') => {
    setNotification({
      open: true,
      message,
      severity
    });
  };

  const handleCloseNotification = () => {
    setNotification({
      ...notification,
      open: false
    });
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin':
        return <AdminIcon sx={{ color: theme.palette.error.main }} />;
      case 'staff':
        return <StaffIcon sx={{ color: theme.palette.secondary.main }} />;
      case 'student':
        return <StudentIcon sx={{ color: theme.palette.primary.main }} />;
      default:
        return <UserIcon sx={{ color: theme.palette.text.secondary }} />;
    }
  };

  const getRoleBadge = (role) => {
    let color;
    switch (role) {
      case 'admin':
        color = 'error';
        break;
      case 'staff':
        color = 'secondary';
        break;
      case 'student':
        color = 'primary';
        break;
      default:
        color = 'default';
    }
    
    return (
      <Chip 
        icon={getRoleIcon(role)} 
        label={role.charAt(0).toUpperCase() + role.slice(1)} 
        size="small" 
        color={color}
        sx={{ 
          fontWeight: 'bold',
          fontSize: '0.7rem', 
          px: 0.5,
          '& .MuiChip-icon': { 
            fontSize: '1rem',
            ml: 0.5,
            mr: '-4px'
          }
        }}
      />
    );
  };

  const getUserCounts = () => {
    if (!users.length) return { total: 0, students: 0, staff: 0, admins: 0 };
    
    return {
      total: users.length,
      students: users.filter(u => u.role === 'student').length,
      staff: users.filter(u => u.role === 'staff').length,
      admins: users.filter(u => u.role === 'admin').length
    };
  };

  if (!user || user.role !== 'admin') {
    return (
      <Box p={3}>
        <Typography variant="h5" color="error">
          Access Denied: Admin privileges required
        </Typography>
      </Box>
    );
  }

  const counts = getUserCounts();
  
  // Generate header stats
  const headerStats = [
    <HeaderStat key="students" label="Students" value={counts.students} icon={<StudentIcon />} />,
    <HeaderStat key="staff" label="Staff" value={counts.staff} icon={<StaffIcon />} />,
    <HeaderStat key="admins" label="Admins" value={counts.admins} icon={<AdminIcon />} />
  ];

  return (
    <Container maxWidth="xl">
      <AdminPageHeader
        title="Manage Users"
        description="View, add, update and delete users in the laundry management system."
        icon={<GroupIcon />}
        stats={headerStats}
        action={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleDialogOpen()}
            sx={{ 
              bgcolor: 'rgba(255,255,255,0.2)', 
              backdropFilter: 'blur(10px)',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
            }}
          >
            Add New User
          </Button>
        }
      >
        <Box sx={{ mt: 3, display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Button 
            variant={filter === 'all' ? 'contained' : 'outlined'} 
            onClick={() => handleFilterChange('all')}
            sx={{ 
              bgcolor: filter === 'all' ? 'rgba(255,255,255,0.2)' : 'transparent',
              borderColor: 'rgba(255,255,255,0.5)',
              color: 'white',
              '&:hover': { 
                bgcolor: filter === 'all' ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)',
                borderColor: 'white'
              }
            }}
          >
            All Users
          </Button>
          <Button 
            variant={filter === 'student' ? 'contained' : 'outlined'} 
            onClick={() => handleFilterChange('student')}
            startIcon={<StudentIcon />}
            sx={{ 
              bgcolor: filter === 'student' ? 'rgba(255,255,255,0.2)' : 'transparent',
              borderColor: 'rgba(255,255,255,0.5)',
              color: 'white',
              '&:hover': { 
                bgcolor: filter === 'student' ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)',
                borderColor: 'white'
              }
            }}
          >
            Students
          </Button>
          <Button 
            variant={filter === 'staff' ? 'contained' : 'outlined'} 
            onClick={() => handleFilterChange('staff')}
            startIcon={<StaffIcon />}
            sx={{ 
              bgcolor: filter === 'staff' ? 'rgba(255,255,255,0.2)' : 'transparent',
              borderColor: 'rgba(255,255,255,0.5)',
              color: 'white',
              '&:hover': { 
                bgcolor: filter === 'staff' ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)',
                borderColor: 'white'
              }
            }}
          >
            Staff
          </Button>
          <Button 
            variant={filter === 'admin' ? 'contained' : 'outlined'} 
            onClick={() => handleFilterChange('admin')}
            startIcon={<AdminIcon />}
            sx={{ 
              bgcolor: filter === 'admin' ? 'rgba(255,255,255,0.2)' : 'transparent',
              borderColor: 'rgba(255,255,255,0.5)',
              color: 'white',
              '&:hover': { 
                bgcolor: filter === 'admin' ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)',
                borderColor: 'white'
              }
            }}
          >
            Admins
          </Button>
        </Box>
      </AdminPageHeader>
      
      <Paper 
        sx={{ 
          p: 3, 
          mb: 3, 
          borderRadius: '16px',
          boxShadow: '0 5px 20px rgba(0,0,0,0.05)'
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" fontWeight="bold">
            {filter === 'all' ? 'All Users' : 
             filter === 'student' ? 'Students' : 
             filter === 'staff' ? 'Staff Members' : 'Administrators'}
          </Typography>
          
          <TextField
            placeholder="Search users..."
            variant="outlined"
            size="small"
            value={searchQuery}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              sx: { borderRadius: 2 }
            }}
            sx={{ 
              minWidth: 250,
              '& .MuiOutlinedInput-root': {
                '&:hover fieldset': {
                  borderColor: theme.palette.primary.main,
                },
              }
            }}
          />
        </Box>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
            <CircularProgress />
          </Box>
        ) : filteredUsers.length > 0 ? (
          <>
            <TableContainer sx={{ borderRadius: 3, overflow: 'hidden' }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                    <TableCell>User</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Location</TableCell>
                    <TableCell>Wallet Balance</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredUsers
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((user) => (
                      <TableRow 
                        key={user._id}
                        sx={{ 
                          '&:hover': { 
                            bgcolor: alpha(theme.palette.primary.main, 0.03) 
                          },
                          transition: 'background-color 0.2s ease'
                        }}
                      >
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar 
                              sx={{ 
                                mr: 2, 
                                bgcolor: 
                                  user.role === 'admin' ? theme.palette.error.main :
                                  user.role === 'staff' ? theme.palette.secondary.main :
                                  theme.palette.primary.main
                              }}
                            >
                              {user.name.charAt(0).toUpperCase()}
                            </Avatar>
                            <Box>
                              <Typography variant="body1" fontWeight={500}>
                                {user.name}
                                {user.role === 'admin' && (
                                  <VerifiedIcon 
                                    sx={{ 
                                      fontSize: 14, 
                                      verticalAlign: 'text-top', 
                                      ml: 0.5,
                                      color: theme.palette.primary.main 
                                    }} 
                                  />
                                )}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                ID: {user._id.substring(0, 8)}...
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>{getRoleBadge(user.role)}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          {user.role === 'student' ? (
                            <>
                              {user.hostel?.name || 'No Hostel'} - Room {user.roomNumber || 'N/A'}
                            </>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              N/A
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              fontWeight: 500,
                              color: user.walletBalance > 0 ? theme.palette.success.main : theme.palette.text.secondary
                            }}
                          >
                            ₹{user.walletBalance || 0}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <Tooltip title="Edit User">
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => handleDialogOpen(user)}
                                sx={{ 
                                  mr: 1,
                                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                                  '&:hover': {
                                    bgcolor: alpha(theme.palette.primary.main, 0.2),
                                  }  
                                }}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete User">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDelete(user._id)}
                                sx={{ 
                                  bgcolor: alpha(theme.palette.error.main, 0.1),
                                  '&:hover': {
                                    bgcolor: alpha(theme.palette.error.main, 0.2),
                                  }
                                }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
            
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={filteredUsers.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handlePageChange}
              onRowsPerPageChange={handleRowsPerPageChange}
            />
          </>
        ) : (
          <Paper elevation={0} sx={{ p: 5, textAlign: 'center', bgcolor: alpha(theme.palette.background.default, 0.5) }}>
            <Typography variant="h6" color="text.secondary">
              No users found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {searchQuery ? 'Try adjusting your search criteria.' : 'Add a user to get started.'}
            </Typography>
          </Paper>
        )}
      </Paper>
      
      {/* User Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleDialogClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
          }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h5" fontWeight="bold">
            {selectedUser ? 'Edit User' : 'Add New User'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {selectedUser 
              ? `Editing ${selectedUser.name}'s information` 
              : 'Enter details to create a new user account'}
          </Typography>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ mt: 1 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                variant="outlined"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <UserIcon color="primary" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                variant="outlined"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon color="primary" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={selectedUser ? "New Password (leave blank to keep current)" : "Password"}
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                required={!selectedUser}
                variant="outlined"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon color="primary" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Role</InputLabel>
                <Select
                  name="role"
                  value={formData.role}
                  onChange={handleRoleChange}
                  label="Role"
                >
                  <MenuItem value="student">Student</MenuItem>
                  <MenuItem value="staff">Staff</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Contact Number"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleInputChange}
                variant="outlined"
              />
            </Grid>
            
            {formData.role === 'student' && (
              <>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel>Hostel</InputLabel>
                    <Select
                      name="hostel"
                      value={formData.hostel}
                      onChange={handleInputChange}
                      label="Hostel"
                      disabled={formData.role !== 'student'}
                    >
                      {hostels.map((hostel) => (
                        <MenuItem key={hostel._id} value={hostel._id}>
                          {hostel.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Room Number"
                    name="roomNumber"
                    value={formData.roomNumber}
                    onChange={handleInputChange}
                    variant="outlined"
                    disabled={formData.role !== 'student'}
                  />
                </Grid>
              </>
            )}
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Wallet Balance (₹)"
                name="walletBalance"
                type="number"
                value={formData.walletBalance}
                onChange={handleInputChange}
                variant="outlined"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <WalletIcon color="primary" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button 
            onClick={handleDialogClose}
            variant="outlined"
            color="inherit"
            startIcon={<CancelIcon />}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            startIcon={<SaveIcon />}
          >
            {selectedUser ? 'Update User' : 'Create User'}
          </Button>
        </DialogActions>
      </Dialog>
      
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ManageUsers; 