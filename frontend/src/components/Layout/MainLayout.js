import React, { useState, useEffect } from 'react';
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
  Container,
  Collapse,
  Paper,
  Fade,
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
  ChevronRight as ChevronRightIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Brightness4 as DarkModeIcon,
  NightsStay as NightIcon,
  LightMode as LightIcon,
} from '@mui/icons-material';
import { keyframes } from '@mui/system';

// Define animations
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const drawerWidth = 280;

const MainLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [expandedSections, setExpandedSections] = useState({});
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    // Close mobile drawer when route changes
    setMobileOpen(false);
    
    // Animate menu items when component mounts or route changes
    setAnimate(true);
    
    // Reset animation after a delay to ensure it plays on route changes
    const timer = setTimeout(() => {
      setAnimate(false);
      setTimeout(() => setAnimate(true), 50);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [location.pathname]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationMenuOpen = (event) => {
    setNotificationAnchorEl(event.currentTarget);
  };

  const handleNotificationMenuClose = () => {
    setNotificationAnchorEl(null);
  };

  const handleLogout = async () => {
    handleProfileMenuClose();
    await logout();
    navigate('/login');
  };

  const toggleSectionExpand = (section) => {
    setExpandedSections({
      ...expandedSections,
      [section]: !expandedSections[section]
    });
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
        roles: ['student'],
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
          isSection: true,
          section: 'staff',
          roles: ['staff', 'admin'],
          children: [
            {
              text: 'Staff Dashboard',
              icon: <AdminIcon />,
              path: '/staff',
              roles: ['staff', 'admin'],
            },
            {
              text: 'Staff Messages',
              icon: <MessageIcon />,
              path: '/staff/messages',
              roles: ['staff', 'admin'],
            }
          ]
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
          isSection: true,
          section: 'admin',
          roles: ['admin'],
          children: [
            {
              text: 'Admin Dashboard',
              icon: <AdminIcon />,
              path: '/admin',
              roles: ['admin'],
            },
            {
              text: 'Manage Staff',
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
            }
          ]
        }
      );
    }

    return items;
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box 
        sx={{ 
          py: 2, 
          px: 2, 
          display: 'flex', 
          alignItems: 'center',
          background: theme.palette.background.headerGradient,
          mb: 1.5
        }}
      >
        <Avatar 
          sx={{ 
            bgcolor: 'rgba(255, 255, 255, 0.2)', 
            color: 'white',
            mr: 2,
            width: 40,
            height: 40
          }}
        >
          <LaundryIcon />
        </Avatar>
        <Typography variant="h6" color="white" fontWeight={600}>
          MNIT Laundry
        </Typography>
      </Box>
      
      {user && (
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          px: 2, 
          py: 2,
          mb: 1.5,
          background: alpha(theme.palette.primary.main, 0.05),
          backdropFilter: 'blur(10px)',
          borderRadius: 2,
          mx: 2
        }}>
          <Avatar 
            sx={{ 
              bgcolor: theme.palette.primary.main, 
              color: 'white',
              width: 42, 
              height: 42,
              boxShadow: '0 3px 10px rgba(0,0,0,0.1)',
              border: '2px solid white'
            }}
          >
            {user?.name ? user.name.charAt(0).toUpperCase() : <PersonIcon />}
          </Avatar>
          <Box sx={{ ml: 1.5 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
              {user?.name || 'User'}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1 }}>
              {user?.role === 'student'
                ? `${user?.hostel?.name || 'Hostel'}, Room ${user?.roomNumber}`
                : `${user?.role.charAt(0).toUpperCase() + user?.role.slice(1)}`}
            </Typography>
          </Box>
        </Box>
      )}
      
      <Divider sx={{ mb: 2, mx: 2 }} />
      
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          flexGrow: 1, 
          overflow: 'auto',
          px: 2
        }}
      >
        <List component="nav" disablePadding sx={{ width: '100%' }}>
          {getMenuItems().map((item, index) => {
            if (!item.roles || !item.roles.includes(user?.role)) {
              return null;
            }

            if (item.divider) {
              return (
                <React.Fragment key={`section-${index}`}>
                  {index > 0 && <Divider sx={{ my: 2 }} />}
                  
                  {item.isSection ? (
                    <Box>
                      <ListItemButton 
                        onClick={() => toggleSectionExpand(item.section)}
                        sx={{ 
                          borderRadius: 2,
                          py: 1.5,
                          mb: 1,
                          bgcolor: alpha(theme.palette.primary.main, 0.08)
                        }}
                      >
                        <ListItemText 
                          primary={
                            <Typography variant="body2" fontWeight={600} color="text.secondary">
                              {item.text}
                            </Typography>
                          } 
                        />
                        {expandedSections[item.section] ? 
                          <ExpandLessIcon fontSize="small" color="action" /> : 
                          <ExpandMoreIcon fontSize="small" color="action" />
                        }
                      </ListItemButton>
                      
                      <Collapse in={expandedSections[item.section] !== false} timeout="auto" unmountOnExit>
                        <List component="div" disablePadding>
                          {item.children?.map((child, childIndex) => {
                            if (!child.roles || !child.roles.includes(user?.role)) {
                              return null;
                            }
                            
                            const isSelected = child.path && location.pathname === child.path;
                            
                            return (
                              <Fade 
                                key={`${item.section}-child-${childIndex}`} 
                                in={animate} 
                                timeout={300} 
                                style={{ transitionDelay: `${50 * childIndex}ms` }}
                              >
                                <ListItemButton
                                  component={Link}
                                  to={child.path}
                                  selected={isSelected}
                                  sx={{ 
                                    mb: 0.5, 
                                    borderRadius: 2,
                                    pl: 4,
                                    py: 1,
                                    transition: 'all 0.2s ease-in-out',
                                    '&:hover': {
                                      transform: 'translateX(5px)'
                                    },
                                    animation: animate ? `${fadeIn} 0.4s ease-out` : 'none',
                                    animationDelay: `${50 * childIndex}ms`,
                                  }}
                                >
                                  <ListItemIcon sx={{ minWidth: 36 }}>
                                    {child.icon}
                                  </ListItemIcon>
                                  <ListItemText
                                    primary={
                                      <Typography variant="body2" fontWeight={isSelected ? 600 : 400}>
                                        {child.text}
                                      </Typography>
                                    }
                                  />
                                  {isSelected && (
                                    <Box 
                                      sx={{ 
                                        width: 4,
                                        height: 20,
                                        borderRadius: 4,
                                        bgcolor: theme.palette.primary.main,
                                        ml: 1
                                      }} 
                                    />
                                  )}
                                </ListItemButton>
                              </Fade>
                            );
                          })}
                        </List>
                      </Collapse>
                    </Box>
                  ) : (
                    <Typography
                      variant="overline"
                      sx={{
                        color: 'text.secondary',
                        px: 2,
                        display: 'block',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        letterSpacing: '0.08em',
                      }}
                    >
                      {item.text}
                    </Typography>
                  )}
                </React.Fragment>
              );
            }

            const isSelected = item.path && location.pathname === item.path;

            return (
              <Fade 
                key={index} 
                in={animate} 
                timeout={300} 
                style={{ transitionDelay: `${50 * index}ms` }}
              >
                <ListItemButton
                  component={Link}
                  to={item.path}
                  selected={isSelected}
                  sx={{ 
                    mb: 1, 
                    borderRadius: 2,
                    py: 1.2,
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'translateX(5px)'
                    },
                    animation: animate ? `${fadeIn} 0.4s ease-out` : 'none',
                    animationDelay: `${50 * index}ms`,
                  }}
                >
                  <ListItemIcon>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={
                      <Typography variant="body1" fontWeight={isSelected ? 600 : 400}>
                        {item.text}
                      </Typography>
                    } 
                  />
                  {isSelected && (
                    <Box 
                      sx={{ 
                        width: 4,
                        height: 20,
                        borderRadius: 4,
                        bgcolor: theme.palette.primary.main,
                        ml: 1
                      }} 
                    />
                  )}
                </ListItemButton>
              </Fade>
            );
          })}
        </List>
      </Box>
      
      <Box 
        sx={{ 
          p: 2, 
          mt: 'auto',
          borderTop: `1px solid ${alpha(theme.palette.divider, 0.5)}`
        }}
      >
        <Box sx={{ 
          p: 2, 
          borderRadius: 2, 
          bgcolor: alpha(theme.palette.primary.main, 0.05),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 1
        }}>
          <Button
            variant="contained"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
            fullWidth
            sx={{ 
              py: 1.2,
              fontWeight: 600
            }}
          >
            Sign Out
          </Button>
        </Box>
        
        <Typography variant="caption" color="text.secondary" align="center" sx={{ display: 'block', mt: 1 }}>
          MNIT Laundry Management &copy; {new Date().getFullYear()}
        </Typography>
      </Box>
    </Box>
  );

  const profileMenu = (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={handleProfileMenuClose}
      transformOrigin={{ horizontal: 'right', vertical: 'top' }}
      anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      PaperProps={{
        elevation: 3,
        sx: {
          width: 200,
          borderRadius: 2,
          overflow: 'hidden',
          mt: 1.5,
          backdropFilter: 'blur(10px)',
          '& .MuiMenuItem-root': {
            px: 2,
            py: 1.5,
            gap: 1.5,
            borderRadius: 1,
            mx: 0.5
          },
        },
      }}
    >
      <MenuItem onClick={() => { handleProfileMenuClose(); navigate('/profile'); }}>
        <PersonIcon fontSize="small" />
        <Typography variant="body2">Profile</Typography>
      </MenuItem>
      <MenuItem onClick={() => { handleProfileMenuClose(); navigate('/wallet'); }}>
        <WalletIcon fontSize="small" />
        <Typography variant="body2">My Wallet</Typography>
      </MenuItem>
      <MenuItem onClick={() => { handleProfileMenuClose(); navigate('/settings'); }}>
        <SettingsIcon fontSize="small" />
        <Typography variant="body2">Settings</Typography>
      </MenuItem>
      <Divider sx={{ my: 1 }} />
      <MenuItem onClick={handleLogout} sx={{ color: theme.palette.error.main }}>
        <LogoutIcon fontSize="small" />
        <Typography variant="body2">Sign Out</Typography>
      </MenuItem>
    </Menu>
  );

  const notificationsMenu = (
    <Menu
      anchorEl={notificationAnchorEl}
      open={Boolean(notificationAnchorEl)}
      onClose={handleNotificationMenuClose}
      transformOrigin={{ horizontal: 'right', vertical: 'top' }}
      anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      PaperProps={{
        elevation: 3,
        sx: {
          width: 320,
          borderRadius: 2,
          overflow: 'hidden',
          mt: 1.5,
          backdropFilter: 'blur(10px)',
        },
      }}
    >
      <Box sx={{ p: 2, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}` }}>
        <Typography variant="subtitle1" fontWeight={600}>Notifications</Typography>
      </Box>
      
      <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
        <MenuItem sx={{ px: 2, py: 1.5 }}>
          <Box>
            <Typography variant="body2" fontWeight={500}>Your booking has been confirmed</Typography>
            <Typography variant="caption" color="text.secondary">5 minutes ago</Typography>
          </Box>
        </MenuItem>
        <MenuItem sx={{ px: 2, py: 1.5 }}>
          <Box>
            <Typography variant="body2" fontWeight={500}>Payment received successfully</Typography>
            <Typography variant="caption" color="text.secondary">2 hours ago</Typography>
          </Box>
        </MenuItem>
        <MenuItem sx={{ px: 2, py: 1.5 }}>
          <Box>
            <Typography variant="body2" fontWeight={500}>Your laundry is ready for pickup</Typography>
            <Typography variant="caption" color="text.secondary">Yesterday</Typography>
          </Box>
        </MenuItem>
      </Box>
      
      <Box sx={{ p: 2, borderTop: `1px solid ${alpha(theme.palette.divider, 0.5)}`, textAlign: 'center' }}>
        <Button 
          size="small" 
          variant="text" 
          sx={{ fontWeight: 600, fontSize: '0.75rem' }}
          onClick={() => {
            handleNotificationMenuClose();
            navigate('/notifications');
          }}
        >
          View All Notifications
        </Button>
      </Box>
    </Menu>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <CssBaseline />
      <AppBar 
        position="fixed" 
        sx={{ 
          width: { md: `calc(100% - ${drawerWidth}px)` }, 
          ml: { md: `${drawerWidth}px` },
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              flexGrow: 1, 
              fontWeight: 600,
              display: { xs: 'none', sm: 'block' } 
            }}
          >
            {user?.role === 'student' ? 'Student Dashboard' : 
             user?.role === 'staff' ? 'Staff Dashboard' : 
             user?.role === 'admin' ? 'Admin Dashboard' : 'Dashboard'}
          </Typography>
          
          <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center' }}>
            <Tooltip title="Notifications">
              <IconButton 
                size="large" 
                onClick={handleNotificationMenuOpen}
                color="inherit"
                sx={{ mr: { xs: 1, sm: 2 } }}
              >
                <Badge badgeContent={3} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Account">
              <IconButton
                size="large"
                onClick={handleProfileMenuOpen}
                color="inherit"
                sx={{ 
                  border: '2px solid rgba(255,255,255,0.2)',
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
                }}
              >
                <Avatar 
                  alt={user?.name || 'User'} 
                  src="/static/images/avatar/2.jpg"
                  sx={{ 
                    width: 30, 
                    height: 30,
                    bgcolor: 'primary.dark',
                    color: 'white',
                    fontSize: '0.875rem',
                    fontWeight: 'bold',
                  }}
                >
                  {user?.name ? user.name.charAt(0).toUpperCase() : <PersonIcon />}
                </Avatar>
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>
      
      {profileMenu}
      {notificationsMenu}
      
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
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
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              border: 'none',
            },
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
          width: { md: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Toolbar />
        <Box component="div" sx={{ flexGrow: 1, py: 2 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default MainLayout; 