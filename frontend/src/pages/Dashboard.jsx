import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Card, CardContent, CardHeader, Skeleton, IconButton, Button, Chip } from '@mui/material';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import PersonIcon from '@mui/icons-material/Person';
import RouteIcon from '@mui/icons-material/Route';
import ReceiptIcon from '@mui/icons-material/Receipt';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import BuildIcon from '@mui/icons-material/Build';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import FilterListIcon from '@mui/icons-material/FilterList';
import AddIcon from '@mui/icons-material/Add';
import HistoryIcon from '@mui/icons-material/History';
import KpiCard from '../features/dashboard/components/KpiCard';
import {
  useDashboardOverview,
  useDashboardCharts
} from '../features/dashboard/hooks/useDashboard';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

const COLORS = ['#2ecc71', '#3498db', '#e67e22', '#e74c3c', '#9b59b6'];

export default function Dashboard() {
  const navigate = useNavigate();
  const { data: overviewData, isLoading: isOverviewLoading } = useDashboardOverview();
  const { data: chartsData, isLoading: isChartsLoading } = useDashboardCharts();

  return (
    <Box sx={{ pb: 4, p: { xs: 2, sm: 3 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="800" sx={{ color: '#fff', letterSpacing: '-0.02em' }}>
          Overview
        </Typography>
        
        {/* Quick Actions */}
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button variant="contained" color="primary" onClick={() => navigate('/trips')} startIcon={<AddIcon />} sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}>
            Trip
          </Button>
          <Button variant="outlined" onClick={() => navigate('/vehicles')} sx={{ color: '#fff', borderColor: 'rgba(255,255,255,0.2)', borderRadius: 2, textTransform: 'none', fontWeight: 600, '&:hover': { borderColor: '#fff' } }} startIcon={<AddIcon />}>
            Vehicle
          </Button>
          <Button variant="outlined" onClick={() => navigate('/expenses')} sx={{ color: '#fff', borderColor: 'rgba(255,255,255,0.2)', borderRadius: 2, textTransform: 'none', fontWeight: 600, display: { xs: 'none', sm: 'inline-flex' }, '&:hover': { borderColor: '#fff' } }} startIcon={<AddIcon />}>
            Fuel
          </Button>
        </Box>
      </Box>
      
      {/* KPI Section */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(6, 1fr)' }, 
        gap: 2.5, 
        mb: 3 
      }}>
        <KpiCard 
          title="Total Vehicles" 
          value={overviewData?.vehicles?.totalVehicles || 0} 
          icon={<DirectionsCarIcon />} 
          color="primary"
          trend="+2%"
          isLoading={isOverviewLoading}
        />
        <KpiCard 
          title="Active Drivers" 
          value={overviewData?.drivers?.available || 0} 
          icon={<PersonIcon />} 
          color="success"
          trend="+5%"
          isLoading={isOverviewLoading}
        />
        <KpiCard 
          title="Ongoing Trips" 
          value={overviewData?.trips?.active || 0} 
          icon={<RouteIcon />} 
          color="warning"
          trend="+12%"
          isLoading={isOverviewLoading}
        />
        <KpiCard 
          title="Pending Maintenance" 
          value={overviewData?.maintenance?.pending || 0} 
          icon={<BuildIcon />} 
          color="error"
          trend="-1%"
          isLoading={isOverviewLoading}
        />
        <KpiCard 
          title="Fuel (Liters)" 
          value={overviewData?.fuel?.totalLiters || 0} 
          icon={<LocalGasStationIcon />} 
          color="info"
          trend="+8%"
          isLoading={isOverviewLoading}
        />
        <KpiCard 
          title="Total Expenses" 
          value={`$${overviewData?.expense?.totalCost?.toFixed(2) || '0.00'}`} 
          icon={<ReceiptIcon />} 
          color="secondary"
          trend="-4%"
          isLoading={isOverviewLoading}
        />
      </Box>

      {/* Charts Section */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, 1fr)' }, 
        gap: 2.5,
        mb: 3
      }}>
        {/* Expenses Trend Chart */}
        <Card sx={{ backgroundColor: '#16213e', borderRadius: 4, display: 'flex', flexDirection: 'column' }}>
          <CardHeader 
            title="Expenses By Category" 
            subheader="Last 30 days breakdown"
            titleTypographyProps={{ color: '#fff', fontWeight: 600 }} 
            subheaderTypographyProps={{ color: '#888', fontSize: '0.75rem' }}
            action={
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                <IconButton size="small" sx={{ color: '#888' }}><FilterListIcon fontSize="small" /></IconButton>
                <IconButton size="small" sx={{ color: '#888' }}><MoreVertIcon fontSize="small" /></IconButton>
              </Box>
            }
          />
          <CardContent sx={{ flexGrow: 1, p: 0, px: 2, pb: 2 }}>
            {isChartsLoading ? (
              <Skeleton variant="rectangular" height={280} sx={{ bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 2 }} />
            ) : chartsData?.expenses?.expensesByCategory?.length === 0 ? (
              <Box sx={{ height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>
                No expense data available
              </Box>
            ) : (
              <Box sx={{ height: 280 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartsData?.expenses?.expensesByCategory?.map(e => ({ category: e.type, amount: e._sum.amount })) || []}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                    <XAxis dataKey="category" stroke="#666" tick={{ fill: '#888', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis stroke="#666" tick={{ fill: '#888', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <RechartsTooltip cursor={{ fill: 'rgba(255,255,255,0.04)' }} contentStyle={{ backgroundColor: '#1E293B', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff' }} />
                    <Bar dataKey="amount" fill="#3498db" name="Amount ($)" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Trips Trend Chart */}
        <Card sx={{ backgroundColor: '#16213e', borderRadius: 4, display: 'flex', flexDirection: 'column' }}>
          <CardHeader 
            title="Trips By Status" 
            subheader="Current active and completed trips"
            titleTypographyProps={{ color: '#fff', fontWeight: 600 }} 
            subheaderTypographyProps={{ color: '#888', fontSize: '0.75rem' }}
            action={
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                <IconButton size="small" sx={{ color: '#888' }}><FilterListIcon fontSize="small" /></IconButton>
                <IconButton size="small" sx={{ color: '#888' }}><MoreVertIcon fontSize="small" /></IconButton>
              </Box>
            }
          />
          <CardContent sx={{ flexGrow: 1, p: 0, px: 2, pb: 2 }}>
            {isChartsLoading ? (
              <Skeleton variant="rectangular" height={280} sx={{ bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 2 }} />
            ) : chartsData?.trips?.dailyTrips?.length === 0 ? (
              <Box sx={{ height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>
                No trip data available
              </Box>
            ) : (
              <Box sx={{ height: 280 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartsData?.trips?.dailyTrips?.map(t => ({ status: t.status, count: t._count.id })) || []}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                    <XAxis dataKey="status" stroke="#666" tick={{ fill: '#888', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis stroke="#666" tick={{ fill: '#888', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <RechartsTooltip cursor={{ fill: 'rgba(255,255,255,0.04)' }} contentStyle={{ backgroundColor: '#1E293B', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff' }} />
                    <Bar dataKey="count" fill="#2ecc71" name="Trips" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>

      {/* Bottom Row */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, 1fr)' }, 
        gap: 2.5 
      }}>
        {/* Vehicle Status Chart */}
        <Card sx={{ backgroundColor: '#16213e', borderRadius: 4 }}>
          <CardHeader 
            title="Fleet Composition" 
            subheader="Distribution by vehicle type"
            titleTypographyProps={{ color: '#fff', fontWeight: 600 }} 
            subheaderTypographyProps={{ color: '#888', fontSize: '0.75rem' }}
            action={
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                <IconButton size="small" sx={{ color: '#888' }}><FilterListIcon fontSize="small" /></IconButton>
                <IconButton size="small" sx={{ color: '#888' }}><MoreVertIcon fontSize="small" /></IconButton>
              </Box>
            }
          />
          <CardContent sx={{ p: 0, px: 2, pb: 2 }}>
            {isChartsLoading ? (
              <Skeleton variant="rectangular" height={280} sx={{ bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 2 }} />
            ) : chartsData?.fleet?.vehiclesByType?.length === 0 ? (
              <Box sx={{ height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>
                No vehicle data available
              </Box>
            ) : (
              <Box sx={{ height: 280 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartsData?.fleet?.vehiclesByType?.map(v => ({ name: v.type, count: v._count.id })) || []}
                      cx="50%"
                      cy="45%"
                      innerRadius={75}
                      outerRadius={100}
                      paddingAngle={4}
                      cornerRadius={6}
                      dataKey="count"
                      nameKey="name"
                      stroke="none"
                    >
                      {(chartsData?.fleet?.vehiclesByType || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: '#1E293B', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff' }} 
                      itemStyle={{ color: '#fff' }} 
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      height={36} 
                      wrapperStyle={{ color: '#94A3B8', fontSize: '0.85rem', paddingTop: '10px' }} 
                      iconType="circle"
                    />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity Timeline */}
        <Card sx={{ backgroundColor: '#16213e', borderRadius: 4 }}>
          <CardHeader 
            title="Recent Activity" 
            subheader="Latest fleet and system events"
            titleTypographyProps={{ color: '#fff', fontWeight: 600 }} 
            subheaderTypographyProps={{ color: '#888', fontSize: '0.75rem' }}
            action={
              <IconButton size="small" sx={{ color: '#888' }}><MoreVertIcon fontSize="small" /></IconButton>
            }
          />
          <CardContent sx={{ p: 3, pt: 1 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              {[
                { time: '10 mins ago', title: 'Trip TRP-2023 completed', desc: 'Driver John Doe arrived at Destination B', icon: <RouteIcon fontSize="small" />, color: '#2ecc71' },
                { time: '1 hour ago', title: 'Maintenance request created', desc: 'Vehicle V-1002 needs oil change', icon: <BuildIcon fontSize="small" />, color: '#e74c3c' },
                { time: '2 hours ago', title: 'New expense approved', desc: 'Fuel expense EXP-042 approved by Admin', icon: <ReceiptIcon fontSize="small" />, color: '#3498db' },
                { time: '3 hours ago', title: 'Vehicle assigned', desc: 'Vehicle V-1005 assigned to Driver Jane Smith', icon: <DirectionsCarIcon fontSize="small" />, color: '#9b59b6' },
                { time: '5 hours ago', title: 'Fuel log added', desc: '40 Liters added to Vehicle V-1001', icon: <LocalGasStationIcon fontSize="small" />, color: '#e67e22' },
              ].map((act, i) => (
                <Box key={i} sx={{ display: 'flex', gap: 2 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Box sx={{ 
                      width: 32, height: 32, borderRadius: '50%', 
                      bgcolor: `${act.color}15`, color: act.color,
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      {act.icon}
                    </Box>
                    {i !== 4 && <Box sx={{ width: '2px', flexGrow: 1, bgcolor: 'rgba(255,255,255,0.05)', my: 0.5 }} />}
                  </Box>
                  <Box sx={{ pb: i !== 4 ? 1 : 0 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#e0e0e0' }}>{act.title}</Typography>
                    <Typography variant="caption" sx={{ color: '#888', display: 'block', mb: 0.5 }}>{act.desc}</Typography>
                    <Typography variant="caption" sx={{ color: '#555', fontSize: '0.65rem' }}>{act.time}</Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
