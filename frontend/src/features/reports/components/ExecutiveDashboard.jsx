import React from 'react';
import { Box, Typography, Card, CardContent, CircularProgress } from '@mui/material';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import RouteIcon from '@mui/icons-material/Route';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import BuildIcon from '@mui/icons-material/Build';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import ReceiptIcon from '@mui/icons-material/Receipt';

export default function ExecutiveDashboard({ data, isLoading }) {
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!data) return null;

  const { fleet, driver, trip, finance } = data;

  const kpis = [
    { title: 'Total Operating Cost', value: `$${(finance?.totalOperatingCost || 0).toLocaleString()}`, icon: <AttachMoneyIcon />, color: '#e74c3c' },
    { title: 'Total Trips', value: trip?.totalTrips || 0, icon: <RouteIcon />, color: '#3498db' },
    { title: 'Fuel Cost', value: `$${(finance?.breakdown?.fuel || 0).toLocaleString()}`, icon: <LocalGasStationIcon />, color: '#f1c40f' },
    { title: 'Maintenance Cost', value: `$${(finance?.breakdown?.maintenance || 0).toLocaleString()}`, icon: <BuildIcon />, color: '#e67e22' },
    { title: 'Expenses', value: `$${(finance?.breakdown?.expenses || 0).toLocaleString()}`, icon: <ReceiptIcon />, color: '#9b59b6' },
    { title: 'Active Fleet', value: fleet?.available || 0, icon: <DirectionsCarIcon />, color: '#2ecc71' }
  ];

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(6, 1fr)' }, gap: 2, mb: 4 }}>
      {kpis.map((kpi, index) => (
        <Card key={index} sx={{ backgroundColor: '#1E293B', borderRadius: 3, borderLeft: `4px solid ${kpi.color}`, boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
          <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="caption" sx={{ color: '#888', fontWeight: 600, textTransform: 'uppercase' }}>
                {kpi.title}
              </Typography>
              <Box sx={{ color: kpi.color, opacity: 0.8, display: 'flex' }}>
                {kpi.icon}
              </Box>
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#fff' }}>
              {kpi.value}
            </Typography>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
}
