import React from 'react';
import { Box, Typography } from '@mui/material';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';

export default function Vehicles() {
  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" sx={{ mb: 3 }}>Fleet Registry</Typography>
      <Box
        sx={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', py: 10, borderRadius: 3,
          border: '1px dashed rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.02)',
        }}
      >
        <DirectionsCarIcon sx={{ fontSize: 48, color: '#555', mb: 2 }} />
        <Typography variant="body1" sx={{ color: '#888' }}>Vehicle management module coming soon</Typography>
      </Box>
    </Box>
  );
}
