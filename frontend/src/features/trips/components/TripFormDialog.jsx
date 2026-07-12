import React, { useEffect } from 'react';
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, 
  Button, TextField, Grid, CircularProgress, MenuItem
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { tripSchema } from '../schemas/trip.schema';
import dayjs from 'dayjs';
import { useVehicles } from '../../vehicles/api/useVehicles';
import { useDrivers } from '../../drivers/api/useDrivers';

export default function TripFormDialog({ open, onClose, onSubmit, initialData, isPending }) {
  const { data: vehiclesData, isLoading: isLoadingVehicles } = useVehicles({ limit: 100 });
  const { data: driversData, isLoading: isLoadingDrivers } = useDrivers({ limit: 100 });

  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(tripSchema),
    defaultValues: {
      source: '',
      destination: '',
      vehicleId: '',
      driverId: '',
      cargoWeight: '',
      plannedDistance: '',
      plannedStartTime: '',
      plannedEndTime: ''
    }
  });

  useEffect(() => {
    if (initialData) {
      reset({
        source: initialData.source || '',
        destination: initialData.destination || '',
        vehicleId: initialData.vehicleId || '',
        driverId: initialData.driverId || '',
        cargoWeight: initialData.cargoWeight || '',
        plannedDistance: initialData.plannedDistance || '',
        plannedStartTime: initialData.plannedStartTime ? dayjs(initialData.plannedStartTime).format('YYYY-MM-DDTHH:mm') : '',
        plannedEndTime: initialData.plannedEndTime ? dayjs(initialData.plannedEndTime).format('YYYY-MM-DDTHH:mm') : '',
      });
    } else {
      reset({
        source: '', destination: '', vehicleId: '', driverId: '', 
        cargoWeight: '', plannedDistance: '', plannedStartTime: '', plannedEndTime: ''
      });
    }
  }, [initialData, reset, open]);

  const handleFormSubmit = (data) => {
    const submitData = { 
      ...data, 
      plannedStartTime: new Date(data.plannedStartTime).toISOString(),
      plannedEndTime: new Date(data.plannedEndTime).toISOString()
    };
    if (data.cargoWeight === '') delete submitData.cargoWeight;
    else submitData.cargoWeight = Number(data.cargoWeight);
    
    onSubmit(submitData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{initialData ? 'Edit Trip Draft' : 'Create New Trip'}</DialogTitle>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Controller
                name="source"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Source Location" fullWidth error={!!errors.source} helperText={errors.source?.message} />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="destination"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Destination Location" fullWidth error={!!errors.destination} helperText={errors.destination?.message} />
                )}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Controller
                name="vehicleId"
                control={control}
                render={({ field }) => (
                  <TextField 
                    {...field} 
                    select 
                    label="Assign Vehicle" 
                    fullWidth 
                    error={!!errors.vehicleId} 
                    helperText={errors.vehicleId?.message}
                    disabled={isLoadingVehicles}
                  >
                    {vehiclesData?.data?.map(v => (
                      <MenuItem key={v.id} value={v.id}>{v.registrationNumber}</MenuItem>
                    )) || <MenuItem value="">Loading...</MenuItem>}
                  </TextField>
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="driverId"
                control={control}
                render={({ field }) => (
                  <TextField 
                    {...field} 
                    select 
                    label="Assign Driver" 
                    fullWidth 
                    error={!!errors.driverId} 
                    helperText={errors.driverId?.message}
                    disabled={isLoadingDrivers}
                  >
                    {driversData?.data?.map(d => (
                      <MenuItem key={d.id} value={d.id}>{d.firstName} {d.lastName}</MenuItem>
                    )) || <MenuItem value="">Loading...</MenuItem>}
                  </TextField>
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="plannedDistance"
                control={control}
                render={({ field: { onChange, value, ...rest } }) => (
                  <TextField 
                    {...rest} 
                    value={value}
                    onChange={(e) => onChange(e.target.value ? Number(e.target.value) : '')}
                    label="Planned Distance (km)" 
                    type="number" 
                    fullWidth 
                    error={!!errors.plannedDistance} 
                    helperText={errors.plannedDistance?.message} 
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="cargoWeight"
                control={control}
                render={({ field: { onChange, value, ...rest } }) => (
                  <TextField 
                    {...rest}
                    value={value}
                    onChange={(e) => onChange(e.target.value ? Number(e.target.value) : '')}
                    label="Cargo Weight (kg)" 
                    type="number" 
                    fullWidth 
                    error={!!errors.cargoWeight} 
                    helperText={errors.cargoWeight?.message} 
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="plannedStartTime"
                control={control}
                render={({ field }) => (
                  <TextField 
                    {...field} 
                    label="Planned Start" 
                    type="datetime-local" 
                    fullWidth 
                    InputLabelProps={{ shrink: true }}
                    error={!!errors.plannedStartTime} 
                    helperText={errors.plannedStartTime?.message} 
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="plannedEndTime"
                control={control}
                render={({ field }) => (
                  <TextField 
                    {...field} 
                    label="Planned End" 
                    type="datetime-local" 
                    fullWidth 
                    InputLabelProps={{ shrink: true }}
                    error={!!errors.plannedEndTime} 
                    helperText={errors.plannedEndTime?.message} 
                  />
                )}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={isPending}>Cancel</Button>
          <Button 
            type="submit" 
            variant="contained" 
            disabled={isPending}
            startIcon={isPending && <CircularProgress size={20} />}
          >
            {initialData ? 'Update Draft' : 'Create Trip'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
