import React from 'react';
import {
  Box,
  Typography,
  Paper,
  useTheme
} from '@mui/material';

/**
 * StaffPageHeader - A consistent header component for staff pages
 * 
 * @param {Object} props Component props
 * @param {string} props.title The main heading text
 * @param {string} props.description Secondary description text
 * @param {React.ReactNode} props.icon Icon component to display next to the title
 * @param {React.ReactNode} props.action Optional action component (button, etc.) to display in header
 * @param {React.ReactNode} props.children Optional additional content
 * @param {Object} props.sx Additional styles to apply to the paper component
 */
const StaffPageHeader = ({ 
  title, 
  description, 
  icon, 
  action,
  children,
  sx = {} 
}) => {
  const theme = useTheme();

  return (
    <Paper
      elevation={0}
      sx={{
        mb: 4,
        overflow: 'hidden',
        borderRadius: '16px',
        background: theme.palette.background.headerGradient,
        ...sx
      }}
    >
      <Box
        sx={{
          p: 4,
          color: 'white',
          position: 'relative',
        }}
      >
        {/* Background decoration */}
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
        
        {/* Title and icon */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          {icon && React.cloneElement(icon, { 
            sx: { 
              mr: 1, 
              fontSize: '2rem',
              ...icon.props.sx
            } 
          })}
          <Typography variant="h4" fontWeight="bold">
            {title}
          </Typography>
        </Box>
        
        {/* Description */}
        {description && (
          <Typography variant="body1" sx={{ maxWidth: '700px', opacity: 0.9, mb: 2 }}>
            {description}
          </Typography>
        )}
        
        {/* Action buttons */}
        {action && (
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
            {action}
          </Box>
        )}
        
        {/* Additional content */}
        {children}
      </Box>
    </Paper>
  );
};

export default StaffPageHeader; 