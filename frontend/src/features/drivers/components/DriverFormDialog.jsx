import React, { useEffect } from 'react';
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, 
  Button, TextField, Grid, CircularProgress, MenuItem
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { driverSchema } from '../schemas/driver.schema';
import dayjs from 'dayjs';

export default function DriverFormDialog({ open, onClose, onSubmit, initialData, isPending }) {
  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(driverSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      licenseNumber: '',
      licenseExpiry: '',
      email: '',
      contactNumber: '',
      address: '',
      status: 'AVAILABLE'
    }
  });

  useEffect(() => {
    if (initialData) {
      reset({
        firstName: initialData.firstName || '',
        lastName: initialData.lastName || '',
        licenseNumber: initialData.licenseNumber || '',
        licenseExpiry: initialData.licenseExpiry ? dayjs(initialData.licenseExpiry).format('YYYY-MM-DD') : '',
        email: initialData.email || '',
        contactNumber: initialData.contactNumber || '',
        address: initialData.address || '',
        status: initialData.status || 'AVAILABLE'
      });
    } else {
      reset({
        firstName: '', lastName: '', licenseNumber: '', licenseExpiry: '', 
        email: '', contactNumber: '', address: '', status: 'AVAILABLE'
      });
    }
  }, [initialData, reset, open]);

  const handleFormSubmit = (data) => {
    // Convert to ISO string for backend
    const submitData = { ...data, licenseExpiry: new Date(data.licenseExpiry).toISOString() };
    onSubmit(submitData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{initialData ? 'Edit Driver' : 'Add New Driver'}</DialogTitle>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Controller
                name="firstName"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="First Name" fullWidth error={!!errors.firstName} helperText={errors.firstName?.message} />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="lastName"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Last Name" fullWidth error={!!errors.lastName} helperText={errors.lastName?.message} />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Email" type="email" fullWidth error={!!errors.email} helperText={errors.email?.message} />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="contactNumber"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Contact Number" fullWidth error={!!errors.contactNumber} helperText={errors.contactNumber?.message} />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="licenseNumber"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="License Number" fullWidth error={!!errors.licenseNumber} helperText={errors.licenseNumber?.message} />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="licenseExpiry"
                control={control}
                render={({ field }) => (
                  <TextField 
                    {...field} 
                    label="License Expiry" 
                    type="date" 
                    fullWidth 
                    InputLabelProps={{ shrink: true }}
                    error={!!errors.licenseExpiry} 
                    helperText={errors.licenseExpiry?.message} 
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="address"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Address" multiline rows={2} fullWidth error={!!errors.address} helperText={errors.address?.message} />
                )}
              />
            </Grid>
            {initialData && (
              <Grid item xs={12}>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} select label="Status" fullWidth>
                      <MenuItem value="AVAILABLE">Available</MenuItem>
                      <MenuItem value="ON_TRIP">On Trip</MenuItem>
                      <MenuItem value="ON_LEAVE">On Leave</MenuItem>
                      <MenuItem value="SUSPENDED">Suspended</MenuItem>
                    </TextField>
                  )}
                />
              </Grid>
            )}
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
            {initialData ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
