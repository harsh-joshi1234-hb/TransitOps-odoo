import React from 'react';
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Chip, IconButton, Typography, Skeleton
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import EventIcon from '@mui/icons-material/Event';

const STATUS_COLORS = {
  PENDING: 'default',
  SCHEDULED: 'info',
  IN_PROGRESS: 'warning',
  COMPLETED: 'success',
  CANCELLED: 'error'
};

export default function MaintenanceTable({ records, isLoading, onAction }) {
  if (isLoading) {
    return (
      <TableContainer>
        <Table sx={{ minWidth: 900 }}>
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
      <Table sx={{ minWidth: 900 }}>
        <TableHead>
          <TableRow sx={{ backgroundColor: 'rgba(255,255,255,0.02)' }}>
            <TableCell sx={{ color: '#888', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>Log ID</TableCell>
            <TableCell sx={{ color: '#888', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>Vehicle</TableCell>
            <TableCell sx={{ color: '#888', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>Issue Description</TableCell>
            <TableCell sx={{ color: '#888', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>Service Date</TableCell>
            <TableCell sx={{ color: '#888', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>Cost</TableCell>
            <TableCell sx={{ color: '#888', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>Status</TableCell>
            <TableCell align="right" sx={{ color: '#888', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {records.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} align="center" sx={{ py: 6, color: '#666', borderBottom: 'none' }}>
                No maintenance records found.
              </TableCell>
            </TableRow>
          ) : (
            records.map((r) => (
              <TableRow key={r.id} hover sx={{ '& td': { borderBottom: '1px solid rgba(255,255,255,0.04)' } }}>
                <TableCell sx={{ fontWeight: 600, color: '#e67e22' }}>
                  #{r.id.substring(0, 8)}
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ color: '#e0e0e0', fontWeight: 500 }}>
                    {r.vehicle?.name || 'Unknown'}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#777' }}>
                    {r.vehicle?.registrationNumber || 'N/A'}
                  </Typography>
                </TableCell>
                <TableCell sx={{ maxWidth: 200 }}>
                  <Typography variant="body2" noWrap sx={{ color: '#ccc' }}>
                    {r.description || 'No description'}
                  </Typography>
                  <Chip label={r.maintenanceType || 'N/A'} size="small" sx={{ backgroundColor: 'rgba(255,255,255,0.08)', color: '#aaa', borderRadius: 1.5, fontSize: '0.65rem', mt: 0.5 }} />
                </TableCell>
                <TableCell sx={{ color: '#ccc' }}>
                  {r.serviceDate ? new Date(r.serviceDate).toLocaleDateString() : <Typography variant="caption" color="#666">Not Scheduled</Typography>}
                </TableCell>
                <TableCell sx={{ color: '#ccc', fontWeight: 500 }}>
                  ${(r.actualCost || r.estimatedCost || 0).toLocaleString()}
                </TableCell>
                <TableCell>
                  <Chip 
                    label={(r.status || 'UNKNOWN').replace(/_/g, ' ')} 
                    color={STATUS_COLORS[r.status] || 'default'}
                    size="small" 
                    sx={{ fontWeight: 600, borderRadius: 1.5 }}
                  />
                </TableCell>
                <TableCell align="right">
                  {r.status === 'PENDING' && (
                    <IconButton size="small" onClick={() => onAction('SCHEDULE', r)} title="Schedule" sx={{ color: '#3498db' }}>
                      <EventIcon fontSize="small" />
                    </IconButton>
                  )}
                  {r.status === 'SCHEDULED' && (
                    <IconButton size="small" onClick={() => onAction('START', r)} title="Start" sx={{ color: '#f1c40f' }}>
                      <PlayArrowIcon fontSize="small" />
                    </IconButton>
                  )}
                  {r.status === 'IN_PROGRESS' && (
                    <IconButton size="small" onClick={() => onAction('COMPLETE', r)} title="Complete" sx={{ color: '#2ecc71' }}>
                      <CheckCircleIcon fontSize="small" />
                    </IconButton>
                  )}
                  {['PENDING', 'SCHEDULED'].includes(r.status) && (
                    <IconButton size="small" onClick={() => onAction('CANCEL', r)} title="Cancel" sx={{ color: '#e74c3c' }}>
                      <CancelIcon fontSize="small" />
                    </IconButton>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
