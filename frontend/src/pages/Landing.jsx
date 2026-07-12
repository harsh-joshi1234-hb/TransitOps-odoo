import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Typography, Button, Container, Stack } from '@mui/material';

export default function Landing() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0d0d0d',
        textAlign: 'center',
        px: 3,
      }}
    >
      <Container maxWidth="sm">
        {/* Logo */}
        <Box
          sx={{
            width: 64, height: 64, borderRadius: 3,
            background: 'linear-gradient(135deg, #e67e22 0%, #d35400 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2rem', fontWeight: 800, color: '#fff',
            mx: 'auto', mb: 3,
          }}
        >
          T
        </Box>

        <Typography variant="h2" sx={{ fontWeight: 800, color: '#e0e0e0', mb: 1, letterSpacing: '-0.03em' }}>
          TransitOps
        </Typography>
        <Typography variant="h6" sx={{ color: '#888', fontWeight: 400, mb: 5 }}>
          Smart Transport Operations Platform
        </Typography>

        <Box
          sx={{
            backgroundColor: 'rgba(46, 204, 113, 0.08)',
            border: '1px solid rgba(46, 204, 113, 0.2)',
            borderRadius: 2,
            px: 3, py: 1.5,
            mb: 5,
          }}
        >
          <Typography variant="body1" sx={{ color: '#2ecc71', fontWeight: 500 }}>
            🚀 Project Initialized Successfully
          </Typography>
        </Box>

        <Stack direction="row" spacing={2} justifyContent="center">
          <Button
            component={RouterLink}
            to="/login"
            variant="contained"
            size="large"
            sx={{
              borderRadius: 6,
              px: 5, py: 1.5,
              fontWeight: 700,
            }}
          >
            Login
          </Button>
          <Button
            component={RouterLink}
            to="/dashboard"
            variant="outlined"
            size="large"
            sx={{
              borderRadius: 6,
              px: 4, py: 1.5,
              fontWeight: 600,
              borderColor: 'rgba(255,255,255,0.15)',
              color: '#e0e0e0',
              '&:hover': {
                borderColor: '#e67e22',
                backgroundColor: 'rgba(230, 126, 34, 0.06)',
              },
            }}
          >
            Dashboard Demo
          </Button>
        </Stack>
      </Container>
    </Box>
  );
}
