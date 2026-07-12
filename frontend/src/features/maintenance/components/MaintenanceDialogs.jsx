import React, { useEffect } from 'react';
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, 
  Button, TextField, Box, Typography, Select, MenuItem 
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRequestMaintenance, useUpdateMaintenance, useTransitionMaintenance } from '../api/useMaintenance';
import { useVehicles } from '../../fleet/api/useVehicles';
import toast from 'react-hot-toast';

const requestSchema = z.object({
  vehicleId: z.string().min(1, 'Vehicle is required'),
  maintenanceType: z.string().min(1, 'Type is required'),
  description: z.string().min(1, 'Description is required')
});

const scheduleSchema = z.object({
  serviceDate: z.string().min(1, 'Date is required'),
  vendorName: z.string().min(1, 'Vendor is required'),
  estimatedCost: z.number().min(0, 'Must be positive')
});

const completeSchema = z.object({
  actualCost: z.number().min(0, 'Must be positive'),
  resolutionNotes: z.string().min(1, 'Notes required')
});

export default function MaintenanceDialogs({ open, onClose, mode, record }) {
  const { data: vehiclesRes } = useVehicles({});
  const vehicles = vehiclesRes?.data?.vehicles || [];

  const requestMutation = useRequestMaintenance();
  const transitionMutation = useTransitionMaintenance();

  // Determine schema based on mode
  let schema = requestSchema;
  if (mode === 'SCHEDULE') schema = scheduleSchema;
  if (mode === 'COMPLETE') schema = completeSchema;

  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      vehicleId: '',
      maintenanceType: 'ROUTINE',
      description: '',
      serviceDate: new Date().toISOString().slice(0, 16),
      vendorName: '',
      estimatedCost: 0,
      actualCost: 0,
      resolutionNotes: ''
    }
  });

  useEffect(() => {
    if (open) {
      if (mode === 'REQUEST') {
        reset({ vehicleId: '', maintenanceType: 'ROUTINE', description: '' });
      } else if (mode === 'SCHEDULE' && record) {
        reset({ serviceDate: new Date().toISOString().slice(0, 16), vendorName: record.vendorName || '', estimatedCost: record.estimatedCost || 0 });
      } else if (mode === 'COMPLETE' && record) {
        reset({ actualCost: record.estimatedCost || 0, resolutionNotes: '' });
      }
    }
  }, [open, mode, record, reset]);

  const onSubmit = async (data) => {
    try {
      if (mode === 'REQUEST') {
        await requestMutation.mutateAsync(data);
        toast.success('Maintenance requested');
      } else if (mode === 'SCHEDULE') {
        await transitionMutation.mutateAsync({ id: record.id, action: 'schedule', data: { serviceDate: new Date(data.serviceDate).toISOString(), vendorName: data.vendorName, estimatedCost: data.estimatedCost } });
        toast.success('Maintenance scheduled');
      } else if (mode === 'COMPLETE') {
        await transitionMutation.mutateAsync({ id: record.id, action: 'complete', data: { actualCost: data.actualCost, resolutionNotes: data.resolutionNotes } });
        toast.success('Maintenance completed');
      } else if (mode === 'START') {
        await transitionMutation.mutateAsync({ id: record.id, action: 'start' });
        toast.success('Maintenance started');
      }
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Action failed');
    }
  };

  const titles = {
    REQUEST: 'Request Maintenance',
    SCHEDULE: 'Schedule Maintenance',
    COMPLETE: 'Complete Maintenance',
    START: 'Start Maintenance'
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3, backgroundColor: '#1E293B', color: '#fff', backgroundImage: 'none' } }}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle sx={{ borderBottom: '1px solid rgba(255,255,255,0.1)', pb: 2 }}>
          <Typography variant="h6" fontWeight="bold">{titles[mode]}</Typography>
        </DialogTitle>
        <DialogContent sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
          
          {mode === 'REQUEST' && (
            <>
              <Box>
                <Typography variant="caption" sx={{ color: '#888', fontWeight: 600, mb: 1, display: 'block' }}>Vehicle</Typography>
                <Controller
                  name="vehicleId"
                  control={control}
                  render={({ field }) => (
                    <Select {...field} fullWidth size="small" error={!!errors.vehicleId} sx={{ backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 2, color: '#fff' }}>
                      {vehicles.map(v => (
                        <MenuItem key={v.id} value={v.id}>{v.registrationNumber} - {v.name}</MenuItem>
                      ))}
                    </Select>
                  )}
                />
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#888', fontWeight: 600, mb: 1, display: 'block' }}>Maintenance Type</Typography>
                <Controller
                  name="maintenanceType"
                  control={control}
                  render={({ field }) => (
                    <Select {...field} fullWidth size="small" sx={{ backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 2, color: '#fff' }}>
                      <MenuItem value="ROUTINE">Routine</MenuItem>
                      <MenuItem value="REPAIR">Repair</MenuItem>
                      <MenuItem value="INSPECTION">Inspection</MenuItem>
                      <MenuItem value="EMERGENCY">Emergency</MenuItem>
                    </Select>
                  )}
                />
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#888', fontWeight: 600, mb: 1, display: 'block' }}>Description</Typography>
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} multiline rows={3} fullWidth size="small" error={!!errors.description} helperText={errors.description?.message} sx={{ '& .MuiOutlinedInput-root': { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 2, color: '#fff' } }} />
                  )}
                />
              </Box>
            </>
          )}

          {mode === 'SCHEDULE' && (
            <>
              <Box>
                <Typography variant="caption" sx={{ color: '#888', fontWeight: 600, mb: 1, display: 'block' }}>Service Date & Time</Typography>
                <Controller
                  name="serviceDate"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} type="datetime-local" fullWidth size="small" error={!!errors.serviceDate} sx={{ '& .MuiOutlinedInput-root': { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 2, color: '#fff' }, '& input': { colorScheme: 'dark' } }} />
                  )}
                />
              </Box>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" sx={{ color: '#888', fontWeight: 600, mb: 1, display: 'block' }}>Vendor Name</Typography>
                  <Controller
                    name="vendorName"
                    control={control}
                    render={({ field }) => (
                      <TextField {...field} fullWidth size="small" error={!!errors.vendorName} helperText={errors.vendorName?.message} sx={{ '& .MuiOutlinedInput-root': { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 2, color: '#fff' } }} />
                    )}
                  />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" sx={{ color: '#888', fontWeight: 600, mb: 1, display: 'block' }}>Estimated Cost ($)</Typography>
                  <Controller
                    name="estimatedCost"
                    control={control}
                    render={({ field }) => (
                      <TextField {...field} type="number" onChange={(e) => field.onChange(parseFloat(e.target.value))} fullWidth size="small" error={!!errors.estimatedCost} sx={{ '& .MuiOutlinedInput-root': { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 2, color: '#fff' } }} />
                    )}
                  />
                </Box>
              </Box>
            </>
          )}

          {mode === 'COMPLETE' && (
            <>
              <Box>
                <Typography variant="caption" sx={{ color: '#888', fontWeight: 600, mb: 1, display: 'block' }}>Actual Cost ($)</Typography>
                <Controller
                  name="actualCost"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} type="number" onChange={(e) => field.onChange(parseFloat(e.target.value))} fullWidth size="small" error={!!errors.actualCost} sx={{ '& .MuiOutlinedInput-root': { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 2, color: '#fff' } }} />
                  )}
                />
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#888', fontWeight: 600, mb: 1, display: 'block' }}>Resolution Notes</Typography>
                <Controller
                  name="resolutionNotes"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} multiline rows={3} fullWidth size="small" error={!!errors.resolutionNotes} helperText={errors.resolutionNotes?.message} sx={{ '& .MuiOutlinedInput-root': { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 2, color: '#fff' } }} />
                  )}
                />
              </Box>
            </>
          )}

          {mode === 'START' && (
            <Typography variant="body1">Are you sure you want to mark this maintenance as In Progress?</Typography>
          )}

        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 1, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <Button onClick={onClose} sx={{ color: '#888', textTransform: 'none', fontWeight: 600 }}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={requestMutation.isPending || transitionMutation.isPending} sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}>
            Submit
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
