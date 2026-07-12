import React from 'react';
import { Box, Typography, Button, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import SecurityIcon from '@mui/icons-material/Security';

export default function Unauthorized() {
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm">
      <Box 
        sx={{ 
          minHeight: '100vh', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center',
          textAlign: 'center'
        }}
      >
        <SecurityIcon color="error" sx={{ fontSize: 80, mb: 2 }} />
        <Typography variant="h3" gutterBottom color="text.primary">
          Unauthorized Access
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          You do not have the necessary permissions to view this page. If you believe this is a mistake, please contact your system administrator.
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => navigate('/dashboard')}
          sx={{ mt: 3 }}
        >
          Return to Dashboard
        </Button>
      </Box>
    </Container>
  );
}
