import React from 'react';
import { Box, Typography, Grid, Card, CardContent, CardHeader, Skeleton } from '@mui/material';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import PersonIcon from '@mui/icons-material/Person';
import RouteIcon from '@mui/icons-material/Route';
import ReceiptIcon from '@mui/icons-material/Receipt';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import BuildIcon from '@mui/icons-material/Build';
import KpiCard from '../features/dashboard/components/KpiCard';
import {
  useDashboardOverview,
  useDashboardCharts
} from '../features/dashboard/hooks/useDashboard';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function Dashboard() {
  const { data: overviewData, isLoading: isOverviewLoading } = useDashboardOverview();
  const { data: chartsData, isLoading: isChartsLoading } = useDashboardCharts();

  return (
    <Box sx={{ pb: 4 }}>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Dashboard
      </Typography>
      
      {/* KPI Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <KpiCard 
            title="Total Vehicles" 
            value={overviewData?.fleet?.totalVehicles || 0} 
            icon={<DirectionsCarIcon />} 
            color="primary"
            isLoading={isOverviewLoading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <KpiCard 
            title="Active Drivers" 
            value={overviewData?.drivers?.activeDrivers || 0} 
            icon={<PersonIcon />} 
            color="success"
            isLoading={isOverviewLoading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <KpiCard 
            title="Ongoing Trips" 
            value={overviewData?.trips?.ongoingTrips || 0} 
            icon={<RouteIcon />} 
            color="warning"
            isLoading={isOverviewLoading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <KpiCard 
            title="Pending Maintenance" 
            value={overviewData?.maintenance?.pendingRequests || 0} 
            icon={<BuildIcon />} 
            color="error"
            isLoading={isOverviewLoading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <KpiCard 
            title="Fuel Logs" 
            value={overviewData?.fuel?.totalLogs || 0} 
            icon={<LocalGasStationIcon />} 
            color="info"
            isLoading={isOverviewLoading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <KpiCard 
            title="Total Expenses" 
            value={`$${overviewData?.expenses?.totalAmount?.toFixed(2) || '0.00'}`} 
            icon={<ReceiptIcon />} 
            color="secondary"
            isLoading={isOverviewLoading}
          />
        </Grid>
      </Grid>

      {/* Charts Section */}
      <Grid container spacing={3}>
        {/* Vehicle Status Chart */}
        <Grid item xs={12} md={6} lg={4}>
          <Card sx={{ height: '100%' }}>
            <CardHeader title="Vehicle Status" />
            <CardContent>
              {isChartsLoading ? (
                <Skeleton variant="rectangular" height={300} />
              ) : (
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartsData?.fleet || []}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="count"
                        nameKey="status"
                      >
                        {chartsData?.fleet?.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Expenses Trend Chart */}
        <Grid item xs={12} md={6} lg={8}>
          <Card sx={{ height: '100%' }}>
            <CardHeader title="Expenses Trend" />
            <CardContent>
              {isChartsLoading ? (
                <Skeleton variant="rectangular" height={300} />
              ) : (
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={chartsData?.expenses || []}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <RechartsTooltip />
                      <Legend />
                      <Bar dataKey="amount" fill="#1976d2" name="Amount ($)" />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Trips Trend Chart */}
        <Grid item xs={12}>
          <Card>
            <CardHeader title="Trips Trend (Last 7 Days)" />
            <CardContent>
              {isChartsLoading ? (
                <Skeleton variant="rectangular" height={300} />
              ) : (
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={chartsData?.trips || []}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <RechartsTooltip />
                      <Legend />
                      <Line type="monotone" dataKey="count" stroke="#2e7d32" activeDot={{ r: 8 }} name="Completed Trips" />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
