import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Container, Paper, Typography } from '@mui/material';

export default function AuthLayout() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'background.default',
        py: 12,
        px: { xs: 2, sm: 3, lg: 4 },
      }}
    >
      <Container maxWidth="sm">
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h3" component="h1" color="primary" gutterBottom>
            TransitOps
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Smart Transport Operations Platform
          </Typography>
        </Box>
        <Paper elevation={1} sx={{ p: { xs: 3, sm: 5 }, borderRadius: 2 }}>
          <Outlet />
        </Paper>
      </Container>
    </Box>
  );
}
