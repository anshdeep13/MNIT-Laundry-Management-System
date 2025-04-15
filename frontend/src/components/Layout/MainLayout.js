import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  AppBar,
  Box,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Button,
  Avatar,
  Menu,
  MenuItem,
  Tooltip,
  Badge,
  useMediaQuery,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  LocalLaundryService as LaundryIcon,
  EventNote as BookingIcon,
  People as UsersIcon,
  ExitToApp as LogoutIcon,
  AdminPanelSettings as AdminIcon,
  Home as HomeIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  AccountCircle as AccountCircleIcon,
  AccountBalanceWallet as WalletIcon,
  Message as MessageIcon,
  CalendarToday as CalendarTodayIcon,
  Apartment as ApartmentIcon,
  Assessment as AssessmentIcon,
} from '@mui/icons-material';

const drawerWidth = 280;

const MainLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    handleProfileMenuClose();
    await logout();
    navigate('/login');
  };

  // Menu items based on user role
  const getMenuItems = () => {
    const items = [
      {
        text: 'Dashboard',
        icon: <DashboardIcon />,
        path: '/dashboard',
        roles: ['student', 'staff', 'admin'],
      },
    ];

    // Add normal user items
    items.push(
      {
        text: 'Machines',
        icon: <LaundryIcon />,
        path: '/machines',
        roles: ['student', 'staff', 'admin'],
      },
      {
        text: 'My Bookings',
        icon: <BookingIcon />,
        path: '/bookings',
        roles: ['student', 'staff', 'admin'],
      },
      {
        text: 'Messages',
        icon: <MessageIcon />,
        path: '/messages',
        roles: ['student', 'staff', 'admin'],
      },
      {
        text: 'My Wallet',
        icon: <WalletIcon />,
        path: '/wallet',
        roles: ['student'],
      }
    );

    // Add staff-only items
    if (user?.role === 'staff' || user?.role === 'admin') {
      items.push(
        {
          text: 'STAFF SECTION',
          icon: null,
          path: null,
          divider: true,
          roles: ['staff', 'admin'],
        },
        {
          text: 'Staff Dashboard',
          icon: <AdminIcon />,
          path: '/staff',
          roles: ['staff', 'admin'],
        },
        {
          text: 'Manage Bookings',
          icon: <CalendarTodayIcon />,
          path: '/staff/bookings',
          roles: ['staff'],
        },
        {
          text: 'Manage Machines',
          icon: <LaundryIcon />,
          path: '/staff/machines',
          roles: ['staff'],
        },
        {
          text: 'Manage Hostels',
          icon: <ApartmentIcon />,
          path: '/staff/hostels',
          roles: ['staff'],
        },
        {
          text: 'Manage Users',
          icon: <UsersIcon />,
          path: '/staff/users',
          roles: ['staff'],
        },
        {
          text: 'Reports',
          icon: <AssessmentIcon />,
          path: '/staff/reports',
          roles: ['staff'],
        }
      );
    }

    // Add admin-only items
    if (user?.role === 'admin') {
      items.push(
        {
          text: 'ADMIN SECTION',
          icon: null,
          path: null,
          divider: true,
          roles: ['admin'],
        },
        {
          text: 'Admin Dashboard',
          icon: <AdminIcon />,
          path: '/admin',
          roles: ['admin'],
        },
        {
          text: 'Manage Users',
          icon: <UsersIcon />,
          path: '/admin/staff',
          roles: ['admin'],
        },
        {
          text: 'Manage Hostels',
          icon: <ApartmentIcon />,
          path: '/admin/hostels',
          roles: ['admin'],
        },
        {
          text: 'Manage Machines',
          icon: <LaundryIcon />,
          path: '/admin/machines',
          roles: ['admin'],
        },
        {
          text: 'System Settings',
          icon: <SettingsIcon />,
          path: '/admin/settings',
          roles: ['admin'],
        },
        {
          text: 'Reports',
          icon: <AssessmentIcon />,
          path: '/admin/reports',
          roles: ['admin'],
        }
      );
    }

    return items;
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 3,
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          color: 'white',
          borderRadius: '0 0 16px 16px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <LaundryIcon sx={{ fontSize: 32, mr: 1 }} />
          <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
            MNIT Laundry
          </Typography>
        </Box>
      </Box>
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            p: 1.5, 
            borderRadius: 2,
            bgcolor: alpha(theme.palette.primary.main, 0.08),
            width: '100%',
          }}
        >
          <Avatar 
            sx={{ 
              width: 40, 
              height: 40, 
              bgcolor: theme.palette.primary.main,
              mr: 1.5,
            }}
          >
            {user?.name?.charAt(0) || <AccountCircleIcon />}
          </Avatar>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {user?.name || 'User'}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'capitalize' }}>
              {user?.role || 'Role'}
            </Typography>
          </Box>
        </Box>
      </Box>
      <Divider sx={{ mx: 2 }} />
      <List sx={{ flexGrow: 1, px: 2, py: 1 }}>
        {getMenuItems().map((item, index) => {
          // If it's a divider, render a divider
          if (item.divider) {
            return (
              <React.Fragment key={index}>
                <Divider sx={{ my: 1.5 }} />
                <Typography
                  variant="caption"
                  sx={{ 
                    px: 2, 
                    py: 1, 
                    color: 'text.secondary', 
                    fontWeight: 600,
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                  }}
                >
                  {item.text}
                </Typography>
              </React.Fragment>
            );
          }

          // Skip if user role doesn't have access
          if (!item.roles.includes(user?.role)) {
            return null;
          }

          const isActive = location.pathname === item.path;
          
          return (
            <ListItem key={index} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                component={Link}
                to={item.path}
                selected={isActive}
                sx={{
                  borderRadius: 2,
                  mb: 0.5,
                  '&.Mui-selected': {
                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                    '&:hover': {
                      bgcolor: alpha(theme.palette.primary.main, 0.12),
                    },
                    '& .MuiListItemIcon-root': {
                      color: theme.palette.primary.main,
                    },
                    '& .MuiListItemText-primary': {
                      color: theme.palette.primary.main,
                      fontWeight: 600,
                    },
                  },
                }}
              >
                <ListItemIcon 
                  sx={{ 
                    minWidth: 40,
                    color: isActive ? theme.palette.primary.main : 'text.secondary',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text} 
                  sx={{ 
                    '& .MuiListItemText-primary': {
                      fontWeight: isActive ? 600 : 400,
                    },
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
      <Divider sx={{ mx: 2 }} />
      <Box sx={{ p: 2 }}>
        <Button
          fullWidth
          variant="outlined"
          color="error"
          startIcon={<LogoutIcon />}
          onClick={handleLogout}
          sx={{ 
            borderRadius: 2,
            py: 1,
            borderColor: alpha(theme.palette.error.main, 0.5),
            color: theme.palette.error.main,
            '&:hover': {
              borderColor: theme.palette.error.main,
              bgcolor: alpha(theme.palette.error.main, 0.05),
            },
          }}
        >
          Logout
        </Button>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          bgcolor: 'background.paper',
          color: 'text.primary',
          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.05)',
        }}
        elevation={0}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
            {getMenuItems().find(item => item.path === location.pathname)?.text || 'Dashboard'}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Tooltip title="Notifications">
              <IconButton color="inherit" sx={{ mr: 1 }}>
                <Badge badgeContent={3} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Tooltip>
            <Tooltip title="Account settings">
              <IconButton
                edge="end"
                aria-label="account of current user"
                aria-haspopup="true"
                onClick={handleProfileMenuOpen}
                color="inherit"
              >
                <Avatar 
                  sx={{ 
                    width: 32, 
                    height: 32, 
                    bgcolor: theme.palette.primary.main,
                  }}
                >
                  {user?.name?.charAt(0) || <AccountCircleIcon />}
                </Avatar>
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="mailbox folders"
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          bgcolor: 'background.default',
          minHeight: '100vh',
        }}
      >
        <Toolbar />
        <Box sx={{ 
          p: { xs: 1, sm: 2, md: 3 },
          borderRadius: 2,
          bgcolor: 'background.paper',
          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.05)',
        }}>
          <Outlet />
        </Box>
      </Box>
      <Menu
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        keepMounted
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
      >
        <MenuItem onClick={handleProfileMenuClose}>
          <ListItemIcon>
            <PersonIcon fontSize="small" />
          </ListItemIcon>
          Profile
        </MenuItem>
        <MenuItem onClick={handleProfileMenuClose}>
          <ListItemIcon>
            <SettingsIcon fontSize="small" />
          </ListItemIcon>
          Settings
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default MainLayout; 