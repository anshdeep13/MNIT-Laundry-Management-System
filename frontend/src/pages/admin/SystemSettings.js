import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  TextField,
  FormControlLabel,
  Switch,
  Divider,
  Container,
  IconButton,
  useTheme,
  alpha,
  Skeleton,
  Snackbar,
  Alert,
  Card,
  CardContent,
  CardHeader,
  Tabs,
  Tab,
  ListItem,
  ListItemIcon,
  ListItemText,
  List,
  Tooltip,
  CircularProgress
} from '@mui/material';
import {
  Save as SaveIcon,
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  Email as EmailIcon,
  Palette as PaletteIcon,
  Storage as StorageIcon,
  Security as SecurityIcon,
  Refresh as RefreshIcon,
  Check as CheckIcon,
  Language as LanguageIcon,
  Update as UpdateIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import API from '../../services/api';
import AdminPageHeader from '../../components/AdminPageHeader';

const SystemSettings = () => {
  const { user } = useAuth();
  const theme = useTheme();
  const [settings, setSettings] = useState({
    notificationsEnabled: true,
    emailNotificationsEnabled: true,
    maintenanceMode: false,
    bookingLeadTime: 30,
    maxBookingsPerDay: 2,
    walletEnabled: true,
    walletTopupMinimum: 50,
    cancelationTimeLimit: 60,
    systemVersion: '1.0.0',
    lastBackupDate: new Date().toISOString(),
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      // In a real application, we would fetch settings from the API
      // const response = await API.get('/admin/settings');
      // setSettings(response.data);
      
      // Simulate API call for demo
      setTimeout(() => {
        setSettings({
          notificationsEnabled: true,
          emailNotificationsEnabled: true,
          maintenanceMode: false,
          bookingLeadTime: 30,
          maxBookingsPerDay: 2,
          walletEnabled: true,
          walletTopupMinimum: 50,
          cancelationTimeLimit: 60,
          systemVersion: '1.0.0',
          lastBackupDate: new Date().toISOString(),
        });
        setLoading(false);
      }, 800);
    } catch (error) {
      console.error('Error fetching settings:', error);
      showNotification('Failed to load settings', 'error');
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings({
      ...settings,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSwitchChange = (name) => (event) => {
    setSettings({
      ...settings,
      [name]: event.target.checked
    });
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      // In a real application, we would save settings to the API
      // await API.put('/admin/settings', settings);
      
      // Simulate API call for demo
      setTimeout(() => {
        showNotification('Settings saved successfully');
        setSaving(false);
      }, 800);
    } catch (error) {
      console.error('Error saving settings:', error);
      showNotification('Failed to save settings', 'error');
      setSaving(false);
    }
  };

  const handleBackup = async () => {
    try {
      showNotification('System backup initiated');
      // Simulate backup
      setTimeout(() => {
        setSettings({
          ...settings,
          lastBackupDate: new Date().toISOString()
        });
        showNotification('System backup completed successfully');
      }, 2000);
    } catch (error) {
      console.error('Error creating backup:', error);
      showNotification('Failed to create backup', 'error');
    }
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

  if (!user || user.role !== 'admin') {
    return (
      <Box p={3}>
        <Typography variant="h5" color="error">
          Access Denied: Admin privileges required
        </Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="xl">
      <AdminPageHeader
        title="System Settings"
        description="Configure system preferences and manage global settings for the laundry management platform."
        icon={<SettingsIcon />}
        action={
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSubmit}
            disabled={saving || loading}
            sx={{ 
              bgcolor: 'rgba(255,255,255,0.2)', 
              backdropFilter: 'blur(10px)',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
            }}
          >
            {saving ? 'Saving...' : 'Save Changes'}
            {saving && <CircularProgress size={20} sx={{ ml: 1, color: 'white' }} />}
          </Button>
        }
      />
      
      <Paper 
        sx={{
          p: 0,
          mb: 3,
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 5px 20px rgba(0,0,0,0.05)'
        }}
      >
        <Box 
          sx={{ 
            borderBottom: 1, 
            borderColor: 'divider',
            bgcolor: alpha(theme.palette.primary.main, 0.03)
          }}
        >
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            aria-label="settings tabs"
            textColor="primary"
            indicatorColor="primary"
            sx={{ px: 2 }}
          >
            <Tab 
              icon={<NotificationsIcon />} 
              iconPosition="start" 
              label="Notifications" 
              id="tab-0" 
              aria-controls="tabpanel-0" 
            />
            <Tab 
              icon={<SecurityIcon />} 
              iconPosition="start" 
              label="Bookings" 
              id="tab-1" 
              aria-controls="tabpanel-1" 
            />
            <Tab 
              icon={<StorageIcon />} 
              iconPosition="start" 
              label="System" 
              id="tab-2" 
              aria-controls="tabpanel-2" 
            />
          </Tabs>
        </Box>

        <Box role="tabpanel" hidden={tabValue !== 0} id="tabpanel-0" aria-labelledby="tab-0" p={3}>
          {loading ? (
            <Box sx={{ p: 2 }}>
              <Skeleton variant="rectangular" height={60} sx={{ mb: 2, borderRadius: 1 }} />
              <Skeleton variant="rectangular" height={60} sx={{ borderRadius: 1 }} />
            </Box>
          ) : (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card elevation={0} sx={{ border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                  <CardHeader 
                    title="Push Notifications" 
                    subheader="Configure in-app notification settings"
                    avatar={<NotificationsIcon color="primary" />}
                    sx={{ pb: 0 }}
                  />
                  <CardContent>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.notificationsEnabled}
                          onChange={handleSwitchChange('notificationsEnabled')}
                          name="notificationsEnabled"
                          color="primary"
                        />
                      }
                      label="Enable push notifications"
                    />
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Users will receive in-app notifications for booking status updates, reminders, and system announcements.
                    </Typography>
                    
                    <List dense sx={{ mt: 2 }}>
                      <ListItem>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <CheckIcon fontSize="small" color="success" />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Booking confirmations" 
                          secondary="When a booking is successfully placed"
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <CheckIcon fontSize="small" color="success" />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Reminders" 
                          secondary="15 minutes before scheduled booking time"
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <CheckIcon fontSize="small" color="success" />
                        </ListItemIcon>
                        <ListItemText 
                          primary="System alerts" 
                          secondary="Maintenance and service announcements"
                        />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card elevation={0} sx={{ border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                  <CardHeader 
                    title="Email Notifications" 
                    subheader="Configure email delivery settings"
                    avatar={<EmailIcon color="primary" />}
                    sx={{ pb: 0 }}
                  />
                  <CardContent>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.emailNotificationsEnabled}
                          onChange={handleSwitchChange('emailNotificationsEnabled')}
                          name="emailNotificationsEnabled"
                          color="primary"
                        />
                      }
                      label="Enable email notifications"
                    />
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Users will receive email notifications for important updates and booking receipts.
                    </Typography>
                    
                    <TextField
                      margin="normal"
                      fullWidth
                      label="Default Reply-To Email"
                      defaultValue="laundry-support@mnit.ac.in"
                      variant="outlined"
                      size="small"
                      disabled={!settings.emailNotificationsEnabled}
                      sx={{ mt: 3 }}
                    />
                    
                    <TextField
                      margin="normal"
                      fullWidth
                      label="Email Template"
                      select
                      defaultValue="default"
                      variant="outlined"
                      size="small"
                      disabled={!settings.emailNotificationsEnabled}
                      SelectProps={{
                        native: true,
                      }}
                    >
                      <option value="default">Default MNIT Template</option>
                      <option value="minimal">Minimal Template</option>
                      <option value="branded">Branded Template</option>
                    </TextField>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </Box>

        <Box role="tabpanel" hidden={tabValue !== 1} id="tabpanel-1" aria-labelledby="tab-1" p={3}>
          {loading ? (
            <Box sx={{ p: 2 }}>
              <Skeleton variant="rectangular" height={60} sx={{ mb: 2, borderRadius: 1 }} />
              <Skeleton variant="rectangular" height={60} sx={{ mb: 2, borderRadius: 1 }} />
              <Skeleton variant="rectangular" height={60} sx={{ borderRadius: 1 }} />
            </Box>
          ) : (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card elevation={0} sx={{ border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                  <CardHeader 
                    title="Booking Rules" 
                    subheader="Configure booking limitations and rules"
                    avatar={<SecurityIcon color="primary" />}
                    sx={{ pb: 0 }}
                  />
                  <CardContent>
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Booking Lead Time (minutes)"
                          name="bookingLeadTime"
                          type="number"
                          value={settings.bookingLeadTime}
                          onChange={handleInputChange}
                          variant="outlined"
                          helperText="Minimum time in advance for booking a machine"
                          InputProps={{ inputProps: { min: 0 } }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Maximum Bookings Per Day"
                          name="maxBookingsPerDay"
                          type="number"
                          value={settings.maxBookingsPerDay}
                          onChange={handleInputChange}
                          variant="outlined"
                          helperText="Maximum number of bookings allowed per student per day"
                          InputProps={{ inputProps: { min: 1 } }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Cancellation Time Limit (minutes)"
                          name="cancelationTimeLimit"
                          type="number"
                          value={settings.cancelationTimeLimit}
                          onChange={handleInputChange}
                          variant="outlined"
                          helperText="How long before a booking students can cancel without penalty"
                          InputProps={{ inputProps: { min: 0 } }}
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card elevation={0} sx={{ border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                  <CardHeader 
                    title="Wallet Settings" 
                    subheader="Configure digital wallet functionality"
                    avatar={<PaletteIcon color="primary" />}
                    sx={{ pb: 0 }}
                  />
                  <CardContent>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.walletEnabled}
                          onChange={handleSwitchChange('walletEnabled')}
                          name="walletEnabled"
                          color="primary"
                        />
                      }
                      label="Enable digital wallet system"
                    />
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 3 }}>
                      Students can add funds to their wallet and use it for laundry services.
                    </Typography>
                    
                    <TextField
                      fullWidth
                      label="Minimum Top-up Amount (₹)"
                      name="walletTopupMinimum"
                      type="number"
                      value={settings.walletTopupMinimum}
                      onChange={handleInputChange}
                      variant="outlined"
                      disabled={!settings.walletEnabled}
                      InputProps={{ inputProps: { min: 0 } }}
                    />
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </Box>

        <Box role="tabpanel" hidden={tabValue !== 2} id="tabpanel-2" aria-labelledby="tab-2" p={3}>
          {loading ? (
            <Box sx={{ p: 2 }}>
              <Skeleton variant="rectangular" height={60} sx={{ mb: 2, borderRadius: 1 }} />
              <Skeleton variant="rectangular" height={60} sx={{ borderRadius: 1 }} />
            </Box>
          ) : (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card elevation={0} sx={{ border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                  <CardHeader 
                    title="System Status" 
                    subheader="View and manage system status"
                    avatar={<LanguageIcon color="primary" />}
                    sx={{ pb: 0 }}
                  />
                  <CardContent>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.maintenanceMode}
                          onChange={handleSwitchChange('maintenanceMode')}
                          name="maintenanceMode"
                          color="warning"
                        />
                      }
                      label="Enable maintenance mode"
                    />
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      When enabled, only administrators can access the system. All other users will see a maintenance message.
                    </Typography>
                    
                    <Box sx={{ mt: 3 }}>
                      <Typography variant="subtitle2">System Information</Typography>
                      <List dense>
                        <ListItem sx={{ px: 0 }}>
                          <ListItemText 
                            primary="Version" 
                            secondary={settings.systemVersion} 
                            primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                            secondaryTypographyProps={{ variant: 'body2', fontWeight: 'medium' }}
                          />
                          <Tooltip title="Check for updates">
                            <IconButton size="small" color="primary">
                              <UpdateIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </ListItem>
                        <ListItem sx={{ px: 0 }}>
                          <ListItemText 
                            primary="Last Backup" 
                            secondary={new Date(settings.lastBackupDate).toLocaleString()} 
                            primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                            secondaryTypographyProps={{ variant: 'body2', fontWeight: 'medium' }}
                          />
                          <Tooltip title="Create backup">
                            <IconButton size="small" color="primary" onClick={handleBackup}>
                              <RefreshIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </ListItem>
                        <ListItem sx={{ px: 0 }}>
                          <ListItemText 
                            primary="Server Status" 
                            secondary="Online" 
                            primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                            secondaryTypographyProps={{ 
                              variant: 'body2', 
                              fontWeight: 'medium',
                              color: 'success.main'
                            }}
                          />
                          <Tooltip title="Check server status">
                            <IconButton size="small" color="primary">
                              <RefreshIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </ListItem>
                      </List>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card elevation={0} sx={{ border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                  <CardHeader 
                    title="Database Maintenance" 
                    subheader="Manage database operations"
                    avatar={<StorageIcon color="primary" />}
                    sx={{ pb: 0 }}
                  />
                  <CardContent>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      Perform database maintenance operations. Use with caution as these actions may affect system performance.
                    </Typography>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Button 
                          variant="outlined" 
                          color="primary" 
                          fullWidth
                          startIcon={<RefreshIcon />}
                          onClick={() => showNotification('Database optimization completed')}
                        >
                          Optimize DB
                        </Button>
                      </Grid>
                      <Grid item xs={6}>
                        <Button 
                          variant="outlined" 
                          color="secondary" 
                          fullWidth
                          startIcon={<StorageIcon />}
                          onClick={() => showNotification('Data cleanup completed')}
                        >
                          Clean Old Data
                        </Button>
                      </Grid>
                      <Grid item xs={12}>
                        <Button 
                          variant="outlined" 
                          color="error" 
                          fullWidth
                          startIcon={<RefreshIcon />}
                          onClick={() => {
                            if (window.confirm('Are you sure? This will reset all system settings to default values.')) {
                              showNotification('System reset to defaults');
                              fetchSettings();
                            }
                          }}
                          sx={{ mt: 1 }}
                        >
                          Reset to Defaults
                        </Button>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </Box>
      </Paper>
      
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

export default SystemSettings; 