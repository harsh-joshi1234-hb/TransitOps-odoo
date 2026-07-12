import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Typography, Button } from '@mui/material';
import SearchOffIcon from '@mui/icons-material/SearchOff';

export default function PageNotFound() {
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
      <SearchOffIcon sx={{ fontSize: 72, color: '#555', mb: 2 }} />
      <Typography variant="h2" sx={{ fontWeight: 800, color: '#e0e0e0', mb: 1 }}>
        404
      </Typography>
      <Typography variant="body1" sx={{ color: '#888', mb: 4 }}>
        The page you're looking for doesn't exist.
      </Typography>
      <Button
        component={RouterLink}
        to="/"
        variant="contained"
        size="large"
        sx={{ borderRadius: 6, px: 5 }}
      >
        Go Home
      </Button>
    </Box>
  );
}
