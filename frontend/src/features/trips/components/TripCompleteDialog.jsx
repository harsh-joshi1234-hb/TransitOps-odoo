import React, { useEffect } from 'react';
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, 
  Button, TextField, CircularProgress
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { completeTripSchema } from '../schemas/trip.schema';

export default function TripCompleteDialog({ open, onClose, onSubmit, isPending }) {
  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(completeTripSchema),
    defaultValues: { actualDistance: '' }
  });

  useEffect(() => {
    if (open) {
      reset({ actualDistance: '' });
    }
  }, [open, reset]);

  const handleFormSubmit = (data) => {
    onSubmit({ actualDistance: Number(data.actualDistance) });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Complete Trip</DialogTitle>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogContent dividers>
          <Controller
            name="actualDistance"
            control={control}
            render={({ field: { onChange, value, ...rest } }) => (
              <TextField 
                {...rest}
                value={value}
                onChange={(e) => onChange(e.target.value ? Number(e.target.value) : '')}
                label="Actual Distance (km)" 
                type="number" 
                fullWidth 
                error={!!errors.actualDistance} 
                helperText={errors.actualDistance?.message} 
              />
            )}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={isPending}>Cancel</Button>
          <Button 
            type="submit" 
            variant="contained" 
            color="success"
            disabled={isPending}
            startIcon={isPending && <CircularProgress size={20} />}
          >
            Mark Completed
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
