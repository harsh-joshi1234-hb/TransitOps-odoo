import React from 'react';
import { Box, Typography } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';

export default function Settings() {
  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" sx={{ mb: 3 }}>System Settings</Typography>
      <Box
        sx={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', py: 10, borderRadius: 3,
          border: '1px dashed rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.02)',
        }}
      >
        <SettingsIcon sx={{ fontSize: 48, color: '#555', mb: 2 }} />
        <Typography variant="body1" sx={{ color: '#888' }}>System settings module coming soon</Typography>
      </Box>
    </Box>
  );
}
