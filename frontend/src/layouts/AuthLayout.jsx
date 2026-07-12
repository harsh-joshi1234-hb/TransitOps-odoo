import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Typography, Grid, Paper, Fade } from '@mui/material';
import authBg from '../assets/auth-bg.png';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import PersonIcon from '@mui/icons-material/Person';
import RouteIcon from '@mui/icons-material/Route';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

const metrics = [
  { icon: <LocalShippingIcon />, value: '250+', label: 'Vehicles Managed' },
  { icon: <PersonIcon />, value: '140+', label: 'Professional Drivers' },
  { icon: <RouteIcon />, value: '80+', label: 'Active Trips' },
  { icon: <TrendingUpIcon />, value: '99.9%', label: 'System Uptime' }
];

export default function AuthLayout() {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#0F172A' }}>
      {/* Left Panel - Branding */}
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          justifyContent: 'space-between',
          width: '45%',
          backgroundImage: `linear-gradient(to bottom, rgba(15, 23, 42, 0.7), rgba(15, 23, 42, 0.8)), url(${authBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          p: 6,
          position: 'relative',
        }}
      >
        <Fade in timeout={1000}>
          <Box>
            {/* Logo & Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 6 }}>
              <Box
                sx={{
                  width: 40, height: 40, borderRadius: 2,
                  background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.2rem', fontWeight: 800, color: '#fff',
                }}
              >
                T
              </Box>
              <Typography variant="h5" sx={{ color: '#ffffff', fontWeight: 700 }}>
                TransitOps
              </Typography>
            </Box>

            <Typography variant="h3" sx={{ color: '#ffffff', fontWeight: 800, mb: 2, lineHeight: 1.2 }}>
              Smart Transport<br />Operations Platform
            </Typography>
            <Typography variant="body1" sx={{ color: '#94A3B8', mb: 8, maxWidth: '80%', fontSize: '1.1rem' }}>
              Manage vehicles, drivers, trips, maintenance and operational analytics from one centralized platform.
            </Typography>

            {/* Metric Cards */}
            <Grid container spacing={3}>
              {metrics.map((metric, index) => (
                <Grid item xs={6} key={index}>
                  <Fade in timeout={1000 + (index * 400)}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2.5,
                        background: 'rgba(30, 41, 59, 0.4)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '16px',
                        transition: 'transform 0.3s ease, background 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          background: 'rgba(30, 41, 59, 0.6)',
                        }
                      }}
                    >
                      <Box sx={{ color: '#F59E0B', mb: 1 }}>{metric.icon}</Box>
                      <Typography variant="h5" sx={{ color: '#fff', fontWeight: 700, mb: 0.5 }}>
                        {metric.value}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#94A3B8' }}>
                        {metric.label}
                      </Typography>
                    </Paper>
                  </Fade>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Fade>

        <Typography variant="caption" sx={{ color: '#64748B' }}>
          © TransitOps ERP 2026
        </Typography>
      </Box>

      {/* Right Panel - Form */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0F172A',
          px: { xs: 3, sm: 6 },
        }}
      >
        <Fade in timeout={800}>
          <Box sx={{ width: '100%', maxWidth: 480 }}>
            <Outlet />
          </Box>
        </Fade>
      </Box>
    </Box>
  );
}
