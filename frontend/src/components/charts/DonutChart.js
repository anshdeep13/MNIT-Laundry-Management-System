import React from 'react';
import PropTypes from 'prop-types';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Box, Card, CardHeader, CardContent, Typography, useTheme } from '@mui/material';

/**
 * A donut chart component for data visualization
 * 
 * @param {Object} props - Component props
 * @param {String} props.title - Chart title
 * @param {String} props.subheader - Chart subheader/description
 * @param {Array} props.data - Data for the chart in format [{name: 'Name', value: 100, color: '#fff'}]
 * @param {Number} props.height - Chart height in pixels
 * @param {Boolean} props.showLegend - Whether to show the legend
 * @param {Object} props.sx - Additional styles for the Card component
 */
const DonutChart = ({
  title,
  subheader,
  data = [],
  height = 300,
  showLegend = true,
  sx = {},
}) => {
  const theme = useTheme();

  // Calculate total for center text
  const total = data.reduce((sum, item) => sum + item.value, 0);

  // Format legend label with percentage
  const renderLegend = (props) => {
    const { payload } = props;
    
    return (
      <Box sx={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        justifyContent: 'center',
        gap: 2, 
        mt: 2 
      }}>
        {payload.map((entry, index) => {
          const percentage = ((entry.value / total) * 100).toFixed(1);
          
          return (
            <Box 
              key={`legend-${index}`}
              sx={{ 
                display: 'flex', 
                alignItems: 'center',
                minWidth: 120
              }}
            >
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  backgroundColor: entry.color,
                  mr: 1,
                }}
              />
              <Typography variant="body2" sx={{ mr: 0.5 }}>
                {entry.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {percentage}%
              </Typography>
            </Box>
          );
        })}
      </Box>
    );
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const percentage = ((payload[0].value / total) * 100).toFixed(1);
      
      return (
        <Card sx={{ 
          p: 1.5, 
          boxShadow: theme.customShadows?.z8 || '0 8px 16px 0 rgba(0,0,0,0.14)',
          minWidth: 120 
        }}>
          <Typography variant="subtitle2">{payload[0].name}</Typography>
          <Typography variant="body2" sx={{ color: payload[0].color }}>
            {payload[0].value} ({percentage}%)
          </Typography>
        </Card>
      );
    }
    return null;
  };

  return (
    <Card sx={{ height: '100%', ...sx }}>
      <CardHeader title={title} subheader={subheader} />
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius="60%"
              outerRadius="80%"
              paddingAngle={2}
              dataKey="value"
              stroke={theme.palette.background.paper}
              strokeWidth={2}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color || theme.palette.primary.main} 
                />
              ))}
            </Pie>
            
            <Tooltip content={<CustomTooltip />} />
            
            {showLegend && (
              <Legend 
                content={renderLegend}
                verticalAlign="bottom"
                align="center"
              />
            )}
          </PieChart>
        </ResponsiveContainer>
        
        {/* Center text showing total */}
        <Box 
          sx={{ 
            position: 'absolute', 
            top: '50%', 
            left: '50%', 
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            mt: -2 // Offset to compensate for the header
          }}
        >
          <Typography variant="h4" fontWeight="bold">
            {total}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Total
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

DonutChart.propTypes = {
  title: PropTypes.string,
  subheader: PropTypes.string,
  data: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      value: PropTypes.number.isRequired,
      color: PropTypes.string,
    })
  ),
  height: PropTypes.number,
  showLegend: PropTypes.bool,
  sx: PropTypes.object,
};

export default DonutChart; 