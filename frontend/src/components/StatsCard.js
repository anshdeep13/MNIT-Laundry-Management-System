import React from 'react';
import PropTypes from 'prop-types';
import { Box, Card, Typography, useTheme, Skeleton } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

/**
 * StatsCard component
 * 
 * Displays a statistic with icon, title, value, and optional trend
 * 
 * @param {Object} props - Component props
 * @param {string} props.title - Card title
 * @param {string|number} props.value - Main statistic value
 * @param {React.ReactNode} props.icon - Icon to display
 * @param {string} props.iconColor - Color for the icon background
 * @param {string} props.trend - Trend direction ('up', 'down', or null)
 * @param {string|number} props.trendValue - Value for the trend (e.g., "+5%" or "-10%")
 * @param {boolean} props.loading - Whether the card is in loading state
 * @returns {React.ReactElement}
 */
const StatsCard = ({
  title,
  value,
  icon,
  iconColor = 'primary.main',
  trend = null,
  trendValue = null,
  loading = false
}) => {
  const theme = useTheme();

  return (
    <Card
      sx={{
        p: 3,
        borderRadius: 2,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        boxShadow: theme.customShadows?.z8 || '0 3px 14px 2px rgba(0,0,0,0.12)',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: theme.customShadows?.z16 || '0 6px 20px 4px rgba(0,0,0,0.14)',
        }
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Box>
          <Typography 
            variant="subtitle2" 
            color="text.secondary" 
            sx={{ mb: 0.5, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: 0.5 }}
          >
            {loading ? <Skeleton width={80} /> : title}
          </Typography>

          <Typography variant="h4" fontWeight="bold">
            {loading ? <Skeleton width={60} height={40} /> : value}
          </Typography>
        </Box>

        {icon && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 48,
              height: 48,
              borderRadius: '12px',
              bgcolor: iconColor,
              color: 'white',
              boxShadow: `0 4px 12px 0 ${theme.palette.mode === 'light' 
                ? `rgba(${parseInt(iconColor.slice(1, 3), 16)}, ${parseInt(iconColor.slice(3, 5), 16)}, ${parseInt(iconColor.slice(5, 7), 16)}, 0.25)` 
                : 'rgba(0,0,0,0.2)'}`
            }}
          >
            {loading ? (
              <Skeleton variant="circular" width={24} height={24} />
            ) : (
              React.cloneElement(icon, { fontSize: 'medium' })
            )}
          </Box>
        )}
      </Box>

      {(trend || trendValue) && (
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
          {loading ? (
            <Skeleton width={100} height={24} />
          ) : (
            <>
              {trend && (
                <Box
                  component="span"
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    color: trend === 'up' ? 'success.main' : 'error.main',
                    mr: 1,
                  }}
                >
                  {trend === 'up' ? <TrendingUpIcon fontSize="small" /> : <TrendingDownIcon fontSize="small" />}
                </Box>
              )}
              {trendValue && (
                <Typography 
                  variant="body2" 
                  component="span" 
                  sx={{ 
                    color: trend === 'up' ? 'success.main' : trend === 'down' ? 'error.main' : 'text.secondary',
                  }}
                >
                  {trendValue}
                  <Typography 
                    component="span" 
                    variant="body2" 
                    color="text.secondary" 
                    sx={{ ml: 0.5 }}
                  >
                    from last month
                  </Typography>
                </Typography>
              )}
            </>
          )}
        </Box>
      )}
    </Card>
  );
};

StatsCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  icon: PropTypes.node,
  iconColor: PropTypes.string,
  trend: PropTypes.oneOf(['up', 'down', null]),
  trendValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  loading: PropTypes.bool
};

export default StatsCard; 