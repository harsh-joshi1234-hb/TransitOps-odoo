import React from 'react';
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Chip, IconButton, Typography, Skeleton
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const STATUS_COLORS = {
  AVAILABLE: 'success',
  ON_TRIP: 'info',
  MAINTENANCE: 'warning',
  OUT_OF_SERVICE: 'error',
  RETIRED: 'default'
};

export default function VehicleTable({ vehicles, isLoading, onEdit, onDelete }) {
  if (isLoading) {
    return (
      <TableContainer>
        <Table sx={{ minWidth: 800 }}>
          <TableBody>
            <TableRow>
              <TableCell colSpan={7} sx={{ py: 6, borderBottom: 'none' }}>
                <Skeleton variant="rectangular" width="100%" height={200} sx={{ bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 2 }} />
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    );
  }

  return (
    <TableContainer>
      <Table sx={{ minWidth: 800 }}>
        <TableHead>
          <TableRow sx={{ backgroundColor: 'rgba(255,255,255,0.02)' }}>
            <TableCell sx={{ color: '#888', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>Reg No.</TableCell>
            <TableCell sx={{ color: '#888', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>Name</TableCell>
            <TableCell sx={{ color: '#888', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>Type</TableCell>
            <TableCell sx={{ color: '#888', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>Capacity</TableCell>
            <TableCell sx={{ color: '#888', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>Odometer</TableCell>
            <TableCell sx={{ color: '#888', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>Status</TableCell>
            <TableCell align="right" sx={{ color: '#888', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {vehicles.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} align="center" sx={{ py: 6, color: '#666', borderBottom: 'none' }}>
                No vehicles found in the fleet.
              </TableCell>
            </TableRow>
          ) : (
            vehicles.map((v) => (
              <TableRow key={v.id} hover sx={{ '& td': { borderBottom: '1px solid rgba(255,255,255,0.04)' } }}>
                <TableCell sx={{ fontWeight: 600, color: '#3498db' }}>{v.registrationNumber}</TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ color: '#e0e0e0', fontWeight: 500 }}>{v.name}</Typography>
                  <Typography variant="caption" sx={{ color: '#777' }}>{v.fuelType}</Typography>
                </TableCell>
                <TableCell>
                  <Chip label={v.type} size="small" sx={{ backgroundColor: 'rgba(255,255,255,0.08)', color: '#ccc', borderRadius: 1.5, fontSize: '0.7rem', fontWeight: 600 }} />
                </TableCell>
                <TableCell sx={{ color: '#ccc' }}>{v.maxLoadCapacity || 0} kg</TableCell>
                <TableCell sx={{ color: '#ccc' }}>{(v.currentOdometer || 0).toLocaleString()} km</TableCell>
                <TableCell>
                  <Chip 
                    label={(v.status || 'UNKNOWN').replace(/_/g, ' ')} 
                    color={STATUS_COLORS[v.status] || 'default'}
                    size="small" 
                    sx={{ fontWeight: 600, borderRadius: 1.5 }}
                  />
                </TableCell>
                <TableCell align="right">
                  <IconButton size="small" onClick={() => onEdit(v)} sx={{ color: '#888', '&:hover': { color: '#3498db', backgroundColor: 'rgba(52,152,219,0.1)' } }}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" onClick={() => onDelete(v)} sx={{ color: '#888', '&:hover': { color: '#e74c3c', backgroundColor: 'rgba(231,76,60,0.1)' } }}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
