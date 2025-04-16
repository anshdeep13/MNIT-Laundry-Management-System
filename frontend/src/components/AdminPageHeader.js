import React from 'react';
import {
  Box,
  Typography,
  Paper,
  useTheme,
  alpha,
  Avatar
} from '@mui/material';
import { styled } from '@mui/material/styles';
import PropTypes from 'prop-types';

/**
 * AdminPageHeader component provides a consistent header styling for admin pages
 * 
 * @param {Object} props
 * @param {string} props.title - The title of the page
 * @param {string} props.description - A short description of the page
 * @param {React.ReactNode} props.icon - An icon component to display
 * @param {React.ReactNode} props.action - A component for the action area (usually a button)
 * @param {Object} props.sx - Additional style properties for the main container
 */
const AdminPageHeader = ({ title, description, icon, action, sx = {} }) => {
  const theme = useTheme();
  
  const IconWrapper = styled(Avatar)(({ theme }) => ({
    width: 48,
    height: 48,
    backgroundColor: theme.palette.primary.lighter || theme.palette.primary.light,
    color: theme.palette.primary.main,
    marginRight: theme.spacing(2)
  }));

  return (
    <Paper
      elevation={0}
      sx={{
        display: 'flex',
        alignItems: 'center', 
        justifyContent: 'space-between',
        p: 3,
        mb: 3,
        borderRadius: 2,
        background: 'transparent',
        border: `1px solid ${theme.palette.divider}`,
        ...sx
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        {icon && (
          <Box
            sx={{
              mr: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 56,
              height: 56,
              borderRadius: '12px',
              background: theme.palette.background.paper,
              color: theme.palette.primary.main,
              boxShadow: theme.customShadows?.z8 || '0 3px 14px 2px rgba(0,0,0,0.12)',
            }}
          >
            {React.cloneElement(icon, { fontSize: 'large' })}
          </Box>
        )}
        
        <Box>
          <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom={!!description}>
            {title}
          </Typography>
          
          {description && (
            <Typography variant="subtitle1" color="text.secondary">
              {description}
            </Typography>
          )}
        </Box>
      </Box>
      
      {action && (
        <Box>
          {action}
        </Box>
      )}
    </Paper>
  );
};

AdminPageHeader.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  icon: PropTypes.node,
  action: PropTypes.node
};

// Quick stat component for use in headers
export const HeaderStat = ({ label, value, icon }) => {
  const theme = useTheme();
  
  return (
    <Box sx={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: 1,
      bgcolor: alpha('#fff', 0.1),
      backdropFilter: 'blur(10px)',
      borderRadius: 2,
      px: 2,
      py: 1,
      border: `1px solid ${alpha('#fff', 0.1)}`,
    }}>
      {icon && React.cloneElement(icon, {
        sx: {
          color: 'white',
          fontSize: '1.25rem',
          ...icon.props.sx
        }
      })}
      <Box>
        <Typography variant="h6" fontWeight="bold" sx={{ lineHeight: 1.2 }}>
          {value}
        </Typography>
        <Typography variant="caption" sx={{ opacity: 0.9 }}>
          {label}
        </Typography>
      </Box>
    </Box>
  );
};

export default AdminPageHeader; 