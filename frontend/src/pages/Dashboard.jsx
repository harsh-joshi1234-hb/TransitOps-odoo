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

const COLORS = ['#2ecc71', '#3498db', '#e67e22', '#e74c3c', '#9b59b6'];

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
            value={overviewData?.vehicles?.totalVehicles || 0} 
            icon={<DirectionsCarIcon />} 
            color="primary"
            isLoading={isOverviewLoading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <KpiCard 
            title="Active Drivers" 
            value={overviewData?.drivers?.available || 0} 
            icon={<PersonIcon />} 
            color="success"
            isLoading={isOverviewLoading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <KpiCard 
            title="Ongoing Trips" 
            value={overviewData?.trips?.active || 0} 
            icon={<RouteIcon />} 
            color="warning"
            isLoading={isOverviewLoading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <KpiCard 
            title="Pending Maintenance" 
            value={overviewData?.maintenance?.pending || 0} 
            icon={<BuildIcon />} 
            color="error"
            isLoading={isOverviewLoading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <KpiCard 
            title="Fuel (Liters)" 
            value={overviewData?.fuel?.totalLiters || 0} 
            icon={<LocalGasStationIcon />} 
            color="info"
            isLoading={isOverviewLoading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <KpiCard 
            title="Total Expenses" 
            value={`$${overviewData?.expense?.totalCost?.toFixed(2) || '0.00'}`} 
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
          <Card sx={{ height: '100%', backgroundColor: '#16213e' }}>
            <CardHeader title="Vehicle Types" titleTypographyProps={{ color: '#fff' }} />
            <CardContent>
              {isChartsLoading ? (
                <Skeleton variant="rectangular" height={300} sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />
              ) : (
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartsData?.fleet?.vehiclesByType?.map(v => ({ name: v.type, count: v._count.id })) || []}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="count"
                        nameKey="name"
                      >
                        {(chartsData?.fleet?.vehiclesByType || []).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip contentStyle={{ backgroundColor: '#1E293B', border: 'none', color: '#fff' }} />
                      <Legend wrapperStyle={{ color: '#94A3B8' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Expenses Trend Chart */}
        <Grid item xs={12} md={6} lg={8}>
          <Card sx={{ height: '100%', backgroundColor: '#16213e' }}>
            <CardHeader title="Expenses By Category" titleTypographyProps={{ color: '#fff' }} />
            <CardContent>
              {isChartsLoading ? (
                <Skeleton variant="rectangular" height={300} sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />
              ) : (
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={chartsData?.expenses?.expensesByCategory?.map(e => ({ category: e.type, amount: e._sum.amount })) || []}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                      <XAxis dataKey="category" stroke="#666" tick={{ fill: '#999', fontSize: 12 }} />
                      <YAxis stroke="#666" tick={{ fill: '#999', fontSize: 12 }} />
                      <RechartsTooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: '#1E293B', border: 'none', color: '#fff' }} />
                      <Legend wrapperStyle={{ color: '#94A3B8' }} />
                      <Bar dataKey="amount" fill="#3498db" name="Amount ($)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Trips Trend Chart */}
        <Grid item xs={12}>
          <Card sx={{ backgroundColor: '#16213e' }}>
            <CardHeader title="Trips By Status" titleTypographyProps={{ color: '#fff' }} />
            <CardContent>
              {isChartsLoading ? (
                <Skeleton variant="rectangular" height={300} sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />
              ) : (
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={chartsData?.trips?.dailyTrips?.map(t => ({ status: t.status, count: t._count.id })) || []}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                      <XAxis dataKey="status" stroke="#666" tick={{ fill: '#999', fontSize: 12 }} />
                      <YAxis stroke="#666" tick={{ fill: '#999', fontSize: 12 }} />
                      <RechartsTooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: '#1E293B', border: 'none', color: '#fff' }} />
                      <Legend wrapperStyle={{ color: '#94A3B8' }} />
                      <Bar dataKey="count" fill="#2ecc71" name="Trips" radius={[4, 4, 0, 0]} />
                    </BarChart>
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
