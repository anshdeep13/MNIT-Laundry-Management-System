import React from 'react';
import PropTypes from 'prop-types';
import { alpha, useTheme } from '@mui/material/styles';
import { Card, CardHeader, CardContent, Box } from '@mui/material';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
  Cell
} from 'recharts';

/**
 * A bar chart component for displaying comparative data
 * 
 * @param {Object} props - Component props
 * @param {String} props.title - Chart title
 * @param {String} props.subheader - Chart subheader/description
 * @param {Array} props.data - Data for the chart
 * @param {Array} props.series - Array of series configurations [{dataKey: 'value1', color: '#0000FF', label: 'Value 1'}]
 * @param {String} props.xAxisDataKey - The key in data objects for X axis categories
 * @param {Number} props.height - Chart height in pixels
 * @param {Boolean} props.showGrid - Whether to show grid lines
 * @param {Boolean} props.showLabels - Whether to show data labels on bars
 * @param {Boolean} props.isStacked - Whether bars should be stacked
 * @param {Boolean} props.isVertical - Whether bars should be vertical (true) or horizontal (false)
 * @param {String} props.xAxisLabel - Label for X axis
 * @param {String} props.yAxisLabel - Label for Y axis
 * @param {Object} props.sx - Additional styles for the Card component
 */
const BarChart = ({
  title,
  subheader,
  data = [],
  series = [],
  xAxisDataKey = 'name',
  height = 380,
  showGrid = true,
  showLabels = false,
  isStacked = false,
  isVertical = true,
  xAxisLabel = '',
  yAxisLabel = '',
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

  // Calculate padding based on number of bars and series
  const calculateBarSize = () => {
    const dataLength = data.length;
    const seriesLength = series.length;
    
    if (dataLength <= 3) return 50;
    if (dataLength <= 6) return 35;
    if (dataLength <= 10) return 25;
    return 20;
  };

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

  // Format for data labels
  const renderCustomizedLabel = (props) => {
    const { x, y, width, height, value } = props;
    
    if (!value && value !== 0) return null;
    
    // Don't render small values to avoid overlapping
    if (width < 20 || height < 20) return null;
    
    const formattedValue = typeof value === 'number' 
      ? value.toLocaleString()
      : value;
      
    return isVertical ? (
      <text
        x={x + width / 2}
        y={y + (value >= 0 ? -8 : 15)}
        fill={theme.palette.text.primary}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={12}
      >
        {formattedValue}
      </text>
    ) : (
      <text
        x={x + (value >= 0 ? width + 5 : -5)}
        y={y + height / 2}
        fill={theme.palette.text.primary}
        textAnchor={value >= 0 ? "start" : "end"}
        dominantBaseline="middle"
        fontSize={12}
      >
        {formattedValue}
      </text>
    );
  };

  return (
    <Card sx={{ height: '100%', ...sx }}>
      <CardHeader title={title} subheader={subheader} />
      <CardContent sx={{ pt: 0, pb: 0 }}>
        <ResponsiveContainer width="100%" height={height}>
          <RechartsBarChart
            data={data}
            layout={isVertical ? 'vertical' : 'horizontal'}
            stackOffset={isStacked ? "sign" : "none"}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 30,
            }}
          >
            {showGrid && (
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={theme.palette.divider}
                horizontal={isVertical}
                vertical={!isVertical}
              />
            )}
            
            <XAxis 
              dataKey={isVertical ? null : xAxisDataKey}
              type={isVertical ? "number" : "category"}
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
              dataKey={isVertical ? xAxisDataKey : null}
              type={isVertical ? "category" : "number"}
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
              width={100}
            />
            
            <Tooltip 
              content={<CustomTooltip />} 
              cursor={{ 
                fill: alpha(theme.palette.primary.main, 0.1),
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
            
            {series.map((item, index) => {
              const barColor = item.color || defaultColors[index % defaultColors.length];
              
              return (
                <Bar
                  key={item.dataKey || `bar-${index}`}
                  dataKey={item.dataKey}
                  name={item.label || item.dataKey}
                  fill={barColor}
                  stackId={isStacked ? "stack" : undefined}
                  barSize={calculateBarSize()}
                  maxBarSize={60}
                  radius={[4, 4, 0, 0]}
                >
                  {showLabels && (
                    <LabelList
                      dataKey={item.dataKey}
                      position={isVertical ? "right" : "top"}
                      content={renderCustomizedLabel}
                    />
                  )}
                  
                  {item.useGradient && data.map((entry, entryIndex) => (
                    <Cell
                      key={`cell-${entryIndex}`}
                      fill={`url(#barGradient-${index})`}
                    />
                  ))}
                  
                  {item.useGradient && (
                    <defs>
                      <linearGradient
                        id={`barGradient-${index}`}
                        x1="0"
                        y1="0"
                        x2={isVertical ? "1" : "0"}
                        y2={isVertical ? "0" : "1"}
                      >
                        <stop
                          offset="0%"
                          stopColor={barColor}
                          stopOpacity={1}
                        />
                        <stop
                          offset="100%"
                          stopColor={alpha(barColor, 0.6)}
                          stopOpacity={1}
                        />
                      </linearGradient>
                    </defs>
                  )}
                </Bar>
              );
            })}
          </RechartsBarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

BarChart.propTypes = {
  title: PropTypes.string,
  subheader: PropTypes.string,
  data: PropTypes.array,
  series: PropTypes.arrayOf(
    PropTypes.shape({
      dataKey: PropTypes.string.isRequired,
      color: PropTypes.string,
      label: PropTypes.string,
      useGradient: PropTypes.bool,
    })
  ),
  xAxisDataKey: PropTypes.string,
  height: PropTypes.number,
  showGrid: PropTypes.bool,
  showLabels: PropTypes.bool,
  isStacked: PropTypes.bool,
  isVertical: PropTypes.bool,
  xAxisLabel: PropTypes.string,
  yAxisLabel: PropTypes.string,
  sx: PropTypes.object,
};

export default BarChart; 