import React, { useEffect } from 'react';
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, 
  Button, TextField, Box, Typography, Select, MenuItem, InputAdornment 
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateVehicle, useUpdateVehicle } from '../api/useVehicles';
import toast from 'react-hot-toast';

const vehicleSchema = z.object({
  registrationNumber: z.string().min(2, 'Registration number is required'),
  name: z.string().min(2, 'Name is required'),
  type: z.string().min(1, 'Type is required'),
  fuelType: z.string().min(1, 'Fuel type is required'),
  maxLoadCapacity: z.number().min(0, 'Must be positive'),
  fuelTankCapacity: z.number().min(0, 'Must be positive'),
  currentOdometer: z.number().min(0, 'Must be positive'),
  status: z.string().optional()
});

export default function VehicleFormDialog({ open, onClose, vehicle = null }) {
  const createMutation = useCreateVehicle();
  const updateMutation = useUpdateVehicle();

  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      registrationNumber: '',
      name: '',
      type: 'FLATBED',
      fuelType: 'DIESEL',
      maxLoadCapacity: 0,
      fuelTankCapacity: 0,
      currentOdometer: 0,
      status: 'AVAILABLE'
    }
  });

  useEffect(() => {
    if (vehicle) {
      reset({
        registrationNumber: vehicle.registrationNumber,
        name: vehicle.name,
        type: vehicle.type,
        fuelType: vehicle.fuelType,
        maxLoadCapacity: vehicle.maxLoadCapacity || 0,
        fuelTankCapacity: vehicle.fuelTankCapacity || 0,
        currentOdometer: vehicle.currentOdometer || 0,
        status: vehicle.status || 'AVAILABLE'
      });
    } else {
      reset({
        registrationNumber: '',
        name: '',
        type: 'FLATBED',
        fuelType: 'DIESEL',
        maxLoadCapacity: 0,
        fuelTankCapacity: 0,
        currentOdometer: 0,
        status: 'AVAILABLE'
      });
    }
  }, [vehicle, reset]);

  const onSubmit = async (data) => {
    try {
      if (vehicle) {
        await updateMutation.mutateAsync({ id: vehicle.id, data: { name: data.name, status: data.status, currentOdometer: data.currentOdometer } });
        toast.success('Vehicle updated successfully');
      } else {
        await createMutation.mutateAsync(data);
        toast.success('Vehicle created successfully');
      }
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save vehicle');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3, backgroundColor: '#1E293B', color: '#fff', backgroundImage: 'none' } }}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle sx={{ borderBottom: '1px solid rgba(255,255,255,0.1)', pb: 2 }}>
          <Typography variant="h6" fontWeight="bold">{vehicle ? 'Edit Vehicle' : 'Add Vehicle'}</Typography>
        </DialogTitle>
        <DialogContent sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="caption" sx={{ color: '#888', fontWeight: 600, mb: 1, display: 'block' }}>Registration Number</Typography>
              <Controller
                name="registrationNumber"
                control={control}
                render={({ field }) => (
                  <TextField {...field} fullWidth size="small" disabled={!!vehicle} error={!!errors.registrationNumber} helperText={errors.registrationNumber?.message} sx={{ '& .MuiOutlinedInput-root': { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 2, color: '#fff' } }} />
                )}
              />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="caption" sx={{ color: '#888', fontWeight: 600, mb: 1, display: 'block' }}>Vehicle Name</Typography>
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <TextField {...field} fullWidth size="small" error={!!errors.name} helperText={errors.name?.message} sx={{ '& .MuiOutlinedInput-root': { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 2, color: '#fff' } }} />
                )}
              />
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="caption" sx={{ color: '#888', fontWeight: 600, mb: 1, display: 'block' }}>Type</Typography>
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <Select {...field} fullWidth size="small" disabled={!!vehicle} sx={{ backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 2, color: '#fff' }}>
                    <MenuItem value="FLATBED">Flatbed</MenuItem>
                    <MenuItem value="REFRIGERATED">Refrigerated</MenuItem>
                    <MenuItem value="TANKER">Tanker</MenuItem>
                    <MenuItem value="DRY_VAN">Dry Van</MenuItem>
                    <MenuItem value="BOX_TRUCK">Box Truck</MenuItem>
                  </Select>
                )}
              />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="caption" sx={{ color: '#888', fontWeight: 600, mb: 1, display: 'block' }}>Fuel Type</Typography>
              <Controller
                name="fuelType"
                control={control}
                render={({ field }) => (
                  <Select {...field} fullWidth size="small" disabled={!!vehicle} sx={{ backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 2, color: '#fff' }}>
                    <MenuItem value="DIESEL">Diesel</MenuItem>
                    <MenuItem value="GASOLINE">Gasoline</MenuItem>
                    <MenuItem value="ELECTRIC">Electric</MenuItem>
                    <MenuItem value="HYBRID">Hybrid</MenuItem>
                  </Select>
                )}
              />
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="caption" sx={{ color: '#888', fontWeight: 600, mb: 1, display: 'block' }}>Max Load Capacity (kg)</Typography>
              <Controller
                name="maxLoadCapacity"
                control={control}
                render={({ field }) => (
                  <TextField {...field} type="number" onChange={(e) => field.onChange(parseFloat(e.target.value))} fullWidth size="small" disabled={!!vehicle} error={!!errors.maxLoadCapacity} helperText={errors.maxLoadCapacity?.message} sx={{ '& .MuiOutlinedInput-root': { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 2, color: '#fff' } }} />
                )}
              />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="caption" sx={{ color: '#888', fontWeight: 600, mb: 1, display: 'block' }}>Fuel Tank Capacity (L)</Typography>
              <Controller
                name="fuelTankCapacity"
                control={control}
                render={({ field }) => (
                  <TextField {...field} type="number" onChange={(e) => field.onChange(parseFloat(e.target.value))} fullWidth size="small" disabled={!!vehicle} error={!!errors.fuelTankCapacity} helperText={errors.fuelTankCapacity?.message} sx={{ '& .MuiOutlinedInput-root': { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 2, color: '#fff' } }} />
                )}
              />
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="caption" sx={{ color: '#888', fontWeight: 600, mb: 1, display: 'block' }}>Current Odometer</Typography>
              <Controller
                name="currentOdometer"
                control={control}
                render={({ field }) => (
                  <TextField {...field} type="number" onChange={(e) => field.onChange(parseFloat(e.target.value))} fullWidth size="small" error={!!errors.currentOdometer} helperText={errors.currentOdometer?.message} sx={{ '& .MuiOutlinedInput-root': { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 2, color: '#fff' } }} />
                )}
              />
            </Box>
            {vehicle && (
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" sx={{ color: '#888', fontWeight: 600, mb: 1, display: 'block' }}>Status</Typography>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <Select {...field} fullWidth size="small" sx={{ backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 2, color: '#fff' }}>
                      <MenuItem value="AVAILABLE">Available</MenuItem>
                      <MenuItem value="ON_TRIP">On Trip</MenuItem>
                      <MenuItem value="MAINTENANCE">Maintenance</MenuItem>
                      <MenuItem value="OUT_OF_SERVICE">Out of Service</MenuItem>
                      <MenuItem value="RETIRED">Retired</MenuItem>
                    </Select>
                  )}
                />
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 1, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <Button onClick={onClose} sx={{ color: '#888', textTransform: 'none', fontWeight: 600 }}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={createMutation.isPending || updateMutation.isPending} sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}>{vehicle ? 'Update' : 'Create'}</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
