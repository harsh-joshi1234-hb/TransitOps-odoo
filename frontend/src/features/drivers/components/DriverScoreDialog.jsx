import React, { useEffect } from 'react';
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, 
  Button, TextField, CircularProgress
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { safetyScoreSchema } from '../schemas/driver.schema';

export default function DriverScoreDialog({ open, onClose, onSubmit, currentScore, isPending }) {
  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(safetyScoreSchema),
    defaultValues: {
      safetyScore: 100
    }
  });

  useEffect(() => {
    if (open) {
      reset({ safetyScore: currentScore || 100 });
    }
  }, [currentScore, reset, open]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Update Safety Score</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent dividers>
          <Controller
            name="safetyScore"
            control={control}
            render={({ field: { onChange, value, ...field } }) => (
              <TextField 
                {...field}
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                label="Safety Score (0-100)" 
                type="number" 
                fullWidth 
                error={!!errors.safetyScore} 
                helperText={errors.safetyScore?.message} 
              />
            )}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={isPending}>Cancel</Button>
          <Button 
            type="submit" 
            variant="contained" 
            color="warning"
            disabled={isPending}
            startIcon={isPending && <CircularProgress size={20} />}
          >
            Update Score
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
