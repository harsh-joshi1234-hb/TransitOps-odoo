import React from 'react';
import { Box, Typography, Card, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Skeleton } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';

export default function Settings() {
  const { data: res, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const response = await api.get('/settings');
      return response.data;
    }
  });

  const settings = res?.data?.settings || res?.data?.items || (Array.isArray(res?.data) ? res?.data : []);

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, pb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
        <Typography variant="h4" fontWeight="bold" sx={{ color: '#fff' }}>
          System Settings
        </Typography>
      </Box>

      <Card sx={{ backgroundColor: '#16213e', borderRadius: 4 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'rgba(255,255,255,0.02)' }}>
                <TableCell sx={{ color: '#888', fontWeight: 600 }}>Key</TableCell>
                <TableCell sx={{ color: '#888', fontWeight: 600 }}>Value</TableCell>
                <TableCell sx={{ color: '#888', fontWeight: 600 }}>Description</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={3} align="center" sx={{ py: 3 }}><Skeleton variant="text" width="100%" /></TableCell>
                </TableRow>
              ) : settings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} align="center" sx={{ py: 6, color: '#666', borderBottom: 'none' }}>No settings found.</TableCell>
                </TableRow>
              ) : (
                settings.map(setting => (
                  <TableRow key={setting.key} hover sx={{ '& td': { borderBottom: '1px solid rgba(255,255,255,0.04)' } }}>
                    <TableCell sx={{ color: '#3498db', fontWeight: 'bold' }}>{setting.key}</TableCell>
                    <TableCell sx={{ color: '#fff' }}>{setting.value}</TableCell>
                    <TableCell sx={{ color: '#aaa' }}>{setting.description || 'N/A'}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  );
}
