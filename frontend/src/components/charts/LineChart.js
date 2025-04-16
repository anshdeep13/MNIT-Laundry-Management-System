import React from 'react';
import PropTypes from 'prop-types';
import { alpha, useTheme } from '@mui/material/styles';
import { Card, CardHeader, CardContent, Box } from '@mui/material';
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Brush
} from 'recharts';

/**
 * A line chart component for displaying trends over time
 * 
 * @param {Object} props - Component props
 * @param {String} props.title - Chart title
 * @param {String} props.subheader - Chart subheader/description
 * @param {Array} props.data - Data for the chart
 * @param {Array} props.series - Array of series configurations [{dataKey: 'series1', color: '#0000FF', label: 'Series 1'}]
 * @param {String} props.xAxisDataKey - The key in data objects for X axis values
 * @param {Number} props.height - Chart height in pixels
 * @param {Boolean} props.showGrid - Whether to show grid lines
 * @param {Boolean} props.showBrush - Whether to show the time brush for range selection
 * @param {Boolean} props.showDots - Whether to show dots on the lines
 * @param {String} props.xAxisLabel - Label for X axis
 * @param {String} props.yAxisLabel - Label for Y axis
 * @param {String} props.curveType - Type of curve: 'linear', 'monotone', 'natural', etc.
 * @param {Object} props.sx - Additional styles for the Card component
 */
const LineChart = ({
  title,
  subheader,
  data = [],
  series = [],
  xAxisDataKey = 'name',
  height = 380,
  showGrid = true,
  showBrush = false,
  showDots = true,
  xAxisLabel = '',
  yAxisLabel = '',
  curveType = 'monotone',
  sx = {},
}) => {
  const theme = useTheme();

  // Default colors if not specified in series
  const defaultColors = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.success.main,
    theme.palette.warning.main,
    theme.palette.error.main,
    theme.palette.info.main,
  ];

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Card
          sx={{
            p: 2,
            boxShadow: theme.customShadows?.z8 || '0 8px 16px 0 rgba(0,0,0,0.14)',
            border: `1px solid ${theme.palette.divider}`,
            backgroundColor: theme.palette.background.paper,
          }}
        >
          <Box sx={{ mb: 1 }}>
            <strong>{label}</strong>
          </Box>
          
          {payload.map((entry, index) => (
            <Box 
              key={`item-${index}`} 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                mb: 0.5,
                '&:last-child': { mb: 0 } 
              }}
            >
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: '2px',
                  backgroundColor: entry.color,
                  mr: 1,
                }}
              />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                <Box sx={{ mr: 2 }}>{entry.name}:</Box>
                <Box sx={{ fontWeight: 'bold' }}>{entry.value}</Box>
              </Box>
            </Box>
          ))}
        </Card>
      );
    }
    
    return null;
  };

  return (
    <Card sx={{ height: '100%', ...sx }}>
      <CardHeader title={title} subheader={subheader} />
      <CardContent sx={{ pt: 0, pb: 0 }}>
        <ResponsiveContainer width="100%" height={height}>
          <RechartsLineChart
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: showBrush ? 60 : 30,
            }}
          >
            {showGrid && (
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={theme.palette.divider}
                vertical={false}
              />
            )}
            
            <XAxis 
              dataKey={xAxisDataKey} 
              stroke={theme.palette.text.secondary}
              tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
              axisLine={{ stroke: theme.palette.divider }}
              tickLine={{ stroke: theme.palette.divider }}
              label={
                xAxisLabel ? {
                  value: xAxisLabel,
                  position: 'insideBottomRight',
                  offset: -10,
                  fill: theme.palette.text.primary,
                } : undefined
              }
            />
            
            <YAxis
              stroke={theme.palette.text.secondary}
              tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
              axisLine={{ stroke: theme.palette.divider }}
              tickLine={{ stroke: theme.palette.divider }}
              label={
                yAxisLabel ? {
                  value: yAxisLabel,
                  angle: -90,
                  position: 'insideLeft',
                  fill: theme.palette.text.primary,
                } : undefined
              }
            />
            
            <Tooltip 
              content={<CustomTooltip />} 
              cursor={{ 
                stroke: theme.palette.divider, 
                strokeWidth: 1, 
                strokeDasharray: '3 3' 
              }} 
            />
            
            <Legend 
              wrapperStyle={{ paddingTop: 10 }}  
              formatter={(value) => (
                <span style={{ color: theme.palette.text.primary, fontSize: '0.875rem' }}>
                  {value}
                </span>
              )}
            />
            
            {series.map((item, index) => (
              <Line
                key={item.dataKey || `line-${index}`}
                type={curveType}
                dataKey={item.dataKey}
                name={item.label || item.dataKey}
                stroke={item.color || defaultColors[index % defaultColors.length]}
                strokeWidth={2}
                dot={showDots ? {
                  fill: item.color || defaultColors[index % defaultColors.length],
                  strokeWidth: 2,
                  stroke: theme.palette.background.paper,
                  r: 4,
                } : false}
                activeDot={{
                  fill: theme.palette.background.paper,
                  stroke: item.color || defaultColors[index % defaultColors.length],
                  strokeWidth: 2,
                  r: 6,
                }}
                fillOpacity={0.2}
                fill={item.fill ? alpha(item.color || defaultColors[index % defaultColors.length], 0.1) : 'transparent'}
              />
            ))}
            
            {showBrush && (
              <Brush
                dataKey={xAxisDataKey}
                height={30}
                stroke={theme.palette.primary.main}
                fill={alpha(theme.palette.primary.main, 0.1)}
                travellerWidth={10}
                startIndex={data.length > 30 ? data.length - 30 : 0}
              />
            )}
          </RechartsLineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

LineChart.propTypes = {
  title: PropTypes.string,
  subheader: PropTypes.string,
  data: PropTypes.array,
  series: PropTypes.arrayOf(
    PropTypes.shape({
      dataKey: PropTypes.string.isRequired,
      color: PropTypes.string,
      label: PropTypes.string,
      fill: PropTypes.bool,
    })
  ),
  xAxisDataKey: PropTypes.string,
  height: PropTypes.number,
  showGrid: PropTypes.bool,
  showBrush: PropTypes.bool, 
  showDots: PropTypes.bool,
  xAxisLabel: PropTypes.string,
  yAxisLabel: PropTypes.string,
  curveType: PropTypes.oneOf(['linear', 'monotone', 'basis', 'natural', 'step', 'stepBefore', 'stepAfter']),
  sx: PropTypes.object,
};

export default LineChart; 