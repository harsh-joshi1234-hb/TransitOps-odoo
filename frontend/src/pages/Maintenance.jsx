import React from 'react';
import { Box, Typography } from '@mui/material';
import BuildIcon from '@mui/icons-material/Build';

export default function Maintenance() {
  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" sx={{ mb: 3 }}>Maintenance</Typography>
      <Box
        sx={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', py: 10, borderRadius: 3,
          border: '1px dashed rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.02)',
        }}
      >
        <BuildIcon sx={{ fontSize: 48, color: '#555', mb: 2 }} />
        <Typography variant="body1" sx={{ color: '#888' }}>Maintenance management module coming soon</Typography>
      </Box>
    </Box>
  );
}
