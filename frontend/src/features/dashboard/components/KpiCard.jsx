import React, { memo } from 'react';
import { Card, CardContent, Typography, Box, Skeleton } from '@mui/material';

const colorMap = {
  primary: { bg: 'rgba(230, 126, 34, 0.1)', border: 'rgba(230, 126, 34, 0.25)', accent: '#e67e22' },
  secondary: { bg: 'rgba(52, 152, 219, 0.1)', border: 'rgba(52, 152, 219, 0.25)', accent: '#3498db' },
  success: { bg: 'rgba(46, 204, 113, 0.1)', border: 'rgba(46, 204, 113, 0.25)', accent: '#2ecc71' },
  warning: { bg: 'rgba(230, 126, 34, 0.1)', border: 'rgba(230, 126, 34, 0.25)', accent: '#e67e22' },
  error: { bg: 'rgba(231, 76, 60, 0.1)', border: 'rgba(231, 76, 60, 0.25)', accent: '#e74c3c' },
  info: { bg: 'rgba(52, 152, 219, 0.1)', border: 'rgba(52, 152, 219, 0.25)', accent: '#3498db' },
};

const KpiCard = memo(function KpiCard({ title, value, icon, color = 'primary', isLoading, trend }) {
  const scheme = colorMap[color] || colorMap.primary;

  if (isLoading) {
    return (
      <Card sx={{ height: '100%', borderRadius: 4, borderLeft: '3px solid rgba(255,255,255,0.08)' }}>
        <CardContent sx={{ py: 2, px: 2.5 }}>
          <Skeleton variant="text" width="75%" sx={{ mb: 1 }} />
          <Skeleton variant="text" width="40%" height={42} />
        </CardContent>
      </Card>
    );
  }

  const isPositive = trend && trend.startsWith('+');

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 4,
        borderLeft: `4px solid ${scheme.accent}`,
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: `0 8px 24px rgba(0, 0, 0, 0.4)`,
        },
      }}
    >
      <CardContent sx={{ flexGrow: 1, py: 2, px: 2.5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
          <Typography
            variant="caption"
            sx={{
              color: '#9e9e9e',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              fontSize: '0.65rem',
            }}
          >
            {title}
          </Typography>
          <Box
            sx={{
              backgroundColor: scheme.bg,
              color: scheme.accent,
              p: 0.8,
              borderRadius: 2,
              display: 'flex',
              '& svg': { fontSize: '1.2rem' },
            }}
          >
            {icon}
          </Box>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#e0e0e0', lineHeight: 1.1 }}>
            {value}
          </Typography>
          {trend && (
            <Typography 
              variant="caption" 
              sx={{ 
                fontWeight: 600, 
                color: isPositive ? '#2ecc71' : (trend.startsWith('-') ? '#e74c3c' : '#9e9e9e'),
                bgcolor: isPositive ? 'rgba(46, 204, 113, 0.1)' : (trend.startsWith('-') ? 'rgba(231, 76, 60, 0.1)' : 'rgba(255,255,255,0.05)'),
                px: 0.8,
                py: 0.2,
                borderRadius: 1
              }}
            >
              {trend}
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
});

export default KpiCard;
