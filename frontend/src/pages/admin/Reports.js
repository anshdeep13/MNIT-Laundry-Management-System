import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Divider,
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import API from '../../services/api';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';

const Reports = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [reportType, setReportType] = useState('bookings');
  const [timeRange, setTimeRange] = useState('week');
  const [data, setData] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    fetchReportData();
  }, [reportType, timeRange]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const response = await API.get(`/admin/reports/${reportType}`, {
        params: { timeRange }
      });
      setData(response.data);
    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const renderReportContent = () => {
    if (loading) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      );
    }

    if (!data) {
      return (
        <Typography color="error">
          No data available for the selected report type.
        </Typography>
      );
    }

    switch (reportType) {
      case 'bookings':
        return (
          <>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Booking Statistics
                    </Typography>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={data.bookingStats}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="bookings" fill="#8884d8" />
                        <Bar dataKey="completed" fill="#82ca9d" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Revenue Overview
                    </Typography>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={data.revenueStats}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="revenue" stroke="#8884d8" />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Paper sx={{ mt: 3 }}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Total Bookings</TableCell>
                      <TableCell>Completed</TableCell>
                      <TableCell>Revenue</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data.bookingStats
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((row, index) => (
                        <TableRow key={index}>
                          <TableCell>{row.date}</TableCell>
                          <TableCell>{row.bookings}</TableCell>
                          <TableCell>{row.completed}</TableCell>
                          <TableCell>₹{row.revenue}</TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={data.bookingStats.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </Paper>
          </>
        );

      case 'machines':
        return (
          <>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Machine Utilization
                    </Typography>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={data.machineStats}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="machineId" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="utilization" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Machine Status
                    </Typography>
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Machine ID</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Last Maintenance</TableCell>
                            <TableCell>Total Bookings</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {data.machineStatus.map((machine, index) => (
                            <TableRow key={index}>
                              <TableCell>{machine.machineId}</TableCell>
                              <TableCell>{machine.status}</TableCell>
                              <TableCell>{machine.lastMaintenance}</TableCell>
                              <TableCell>{machine.totalBookings}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </>
        );

      case 'users':
        return (
          <>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      User Activity
                    </Typography>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={data.userActivity}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="activeUsers" stroke="#8884d8" />
                        <Line type="monotone" dataKey="newUsers" stroke="#82ca9d" />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      User Distribution
                    </Typography>
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Role</TableCell>
                            <TableCell>Count</TableCell>
                            <TableCell>Active Users</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {data.userDistribution.map((role, index) => (
                            <TableRow key={index}>
                              <TableCell>{role.role}</TableCell>
                              <TableCell>{role.count}</TableCell>
                              <TableCell>{role.activeUsers}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </>
        );

      default:
        return (
          <Typography color="error">
            Invalid report type selected.
          </Typography>
        );
    }
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
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Reports & Analytics
      </Typography>

      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Report Type</InputLabel>
          <Select
            value={reportType}
            label="Report Type"
            onChange={(e) => setReportType(e.target.value)}
          >
            <MenuItem value="bookings">Bookings Report</MenuItem>
            <MenuItem value="machines">Machines Report</MenuItem>
            <MenuItem value="users">Users Report</MenuItem>
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Time Range</InputLabel>
          <Select
            value={timeRange}
            label="Time Range"
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <MenuItem value="day">Last 24 Hours</MenuItem>
            <MenuItem value="week">Last Week</MenuItem>
            <MenuItem value="month">Last Month</MenuItem>
            <MenuItem value="year">Last Year</MenuItem>
          </Select>
        </FormControl>

        <Button
          variant="contained"
          onClick={fetchReportData}
          sx={{ ml: 'auto' }}
        >
          Refresh Data
        </Button>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {renderReportContent()}
    </Box>
  );
};

export default Reports; 