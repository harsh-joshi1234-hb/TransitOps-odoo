import React from 'react';
import { Card, CardContent, Typography, Box, Skeleton } from '@mui/material';

export default function KpiCard({ title, value, icon, color, isLoading }) {
  if (isLoading) {
    return (
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Skeleton variant="text" width="60%" />
            <Skeleton variant="circular" width={40} height={40} />
          </Box>
          <Skeleton variant="text" width="40%" height={60} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography variant="subtitle2" color="text.secondary" fontWeight="bold">
            {title}
          </Typography>
          <Box 
            sx={{ 
              backgroundColor: `${color}.light`, 
              color: `${color}.dark`,
              p: 1, 
              borderRadius: '50%',
              display: 'flex',
              opacity: 0.8
            }}
          >
            {icon}
          </Box>
        </Box>
        <Typography variant="h4" fontWeight="bold" color="text.primary">
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
}
