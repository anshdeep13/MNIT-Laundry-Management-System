import React from 'react';
import PropTypes from 'prop-types';
import { 
  PieChart as RechartsPieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { Card, CardHeader, CardContent, Box, Typography, useTheme } from '@mui/material';

/**
 * A pie chart component for displaying percentage distributions
 * 
 * @param {Object} props - Component props
 * @param {String} props.title - Chart title
 * @param {String} props.subheader - Chart subheader/description
 * @param {Array} props.data - Data for the chart in format [{name: 'Label', value: 100}]
 * @param {String} props.nameKey - The key in data objects for segment names (default: 'name')
 * @param {String} props.valueKey - The key in data objects for segment values (default: 'value')
 * @param {Number} props.height - Chart height in pixels
 * @param {Boolean} props.showLegend - Whether to show the legend
 * @param {Array} props.colors - Custom colors for pie segments
 * @param {Boolean} props.donut - Whether to render as a donut chart
 * @param {Number} props.innerRadius - Inner radius percentage for donut charts (0-100)
 * @param {Number} props.outerRadius - Outer radius percentage (0-100)
 * @param {String} props.dataLabels - 'none', 'value', 'percent', or 'name'
 * @param {Object} props.sx - Additional styles for the Card component
 */
const PieChart = ({
  title,
  subheader,
  data = [],
  nameKey = 'name',
  valueKey = 'value',
  height = 340,
  showLegend = true,
  colors,
  donut = false,
  innerRadius = 60,
  outerRadius = 80,
  dataLabels = 'none',
  sx = {},
}) => {
  const theme = useTheme();
  
  // Default colors if none provided
  const defaultColors = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.success.main,
    theme.palette.warning.main,
    theme.palette.error.main,
    theme.palette.info.main,
    theme.palette.primary.light,
    theme.palette.secondary.light,
    theme.palette.success.light,
    theme.palette.warning.light,
  ];
  
  // Use provided colors or generate from theme
  const pieColors = colors || defaultColors;
  
  // Calculate total for percentage calculations
  const total = data.reduce((sum, item) => sum + item[valueKey], 0);
  
  // Custom label renderer
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name, value }) => {
    const RADIAN = Math.PI / 180;
    const radius = outerRadius * 0.8;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    
    if (dataLabels === 'none') return null;
    
    let label = '';
    switch (dataLabels) {
      case 'value':
        label = value;
        break;
      case 'percent':
        label = `${(percent * 100).toFixed(0)}%`;
        break;
      case 'name':
        label = name;
        break;
      default:
        return null;
    }
    
    return (
      <text 
        x={x} 
        y={y} 
        fill={theme.palette.common.white}
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={12}
        fontWeight="medium"
      >
        {label}
      </text>
    );
  };
  
  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const name = data.name;
      const value = data.value;
      const color = data.payload.fill;
      const percentage = ((value / total) * 100).toFixed(1);
      
      return (
        <Card
          sx={{
            p: 2,
            boxShadow: theme.customShadows?.z8 || '0 8px 16px 0 rgba(0,0,0,0.14)',
            border: `1px solid ${theme.palette.divider}`,
            backgroundColor: theme.palette.background.paper,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Box
              sx={{
                width: 12,
                height: 12,
                borderRadius: '2px',
                backgroundColor: color,
                mr: 1,
              }}
            />
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
              {name}
            </Typography>
          </Box>
          <Box sx={{ pl: 3 }}>
            <Typography variant="body2">
              Value: <strong>{value}</strong>
            </Typography>
            <Typography variant="body2">
              Percentage: <strong>{percentage}%</strong>
            </Typography>
          </Box>
        </Card>
      );
    }
    
    return null;
  };
  
  // Define center label for donut chart
  const CenterLabel = ({ viewBox, data }) => {
    if (!donut) return null;
    
    const { cx, cy } = viewBox;
    const totalValue = data.reduce((sum, entry) => sum + entry[valueKey], 0);
    
    return (
      <g>
        <text
          x={cx}
          y={cy - 5}
          textAnchor="middle"
          dominantBaseline="central"
          style={{
            fontSize: '24px',
            fontWeight: 'bold',
            fill: theme.palette.text.primary,
          }}
        >
          {totalValue}
        </text>
        <text
          x={cx}
          y={cy + 15}
          textAnchor="middle"
          dominantBaseline="central"
          style={{
            fontSize: '12px',
            fill: theme.palette.text.secondary,
          }}
        >
          Total
        </text>
      </g>
    );
  };
  
  return (
    <Card sx={{ height: '100%', ...sx }}>
      <CardHeader title={title} subheader={subheader} />
      <CardContent sx={{ pt: 0, pb: 0 }}>
        <ResponsiveContainer width="100%" height={height}>
          <RechartsPieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={dataLabels !== 'none'}
              label={renderCustomizedLabel}
              outerRadius={`${outerRadius}%`}
              innerRadius={donut ? `${innerRadius}%` : 0}
              dataKey={valueKey}
              nameKey={nameKey}
              paddingAngle={2}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={pieColors[index % pieColors.length]} 
                  stroke={theme.palette.background.paper}
                  strokeWidth={1}
                />
              ))}
            </Pie>
            
            {donut && <CenterLabel viewBox={{ cx: "50%", cy: "50%" }} data={data} />}
            
            <Tooltip content={<CustomTooltip />} />
            
            {showLegend && (
              <Legend
                layout="horizontal"
                verticalAlign="bottom"
                align="center"
                wrapperStyle={{ paddingTop: 20 }}
                formatter={(value) => (
                  <span style={{ color: theme.palette.text.primary, fontSize: '0.875rem' }}>
                    {value}
                  </span>
                )}
              />
            )}
          </RechartsPieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

PieChart.propTypes = {
  title: PropTypes.string,
  subheader: PropTypes.string,
  data: PropTypes.array,
  nameKey: PropTypes.string,
  valueKey: PropTypes.string,
  height: PropTypes.number,
  showLegend: PropTypes.bool,
  colors: PropTypes.array,
  donut: PropTypes.bool,
  innerRadius: PropTypes.number,
  outerRadius: PropTypes.number,
  dataLabels: PropTypes.oneOf(['none', 'value', 'percent', 'name']),
  sx: PropTypes.object,
};

export default PieChart; 