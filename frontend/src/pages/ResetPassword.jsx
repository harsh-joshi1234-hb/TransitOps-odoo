import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { TextField, Button, Box, Typography, CircularProgress } from '@mui/material';

const resetPasswordSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export default function ResetPassword() {
  const navigate = useNavigate();
  const { token } = useParams();
  const [isPending, setIsPending] = React.useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' }
  });

  const onSubmit = (data) => {
    setIsPending(true);
    // Mocking API call for now
    setTimeout(() => {
      toast.success('Password successfully reset');
      setIsPending(false);
      navigate('/login');
    }, 1500);
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
        Create a new strong password for your account.
      </Typography>

      <Controller
        name="password"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label="New Password"
            variant="outlined"
            type="password"
            fullWidth
            error={!!errors.password}
            helperText={errors.password?.message}
          />
        )}
      />

      <Controller
        name="confirmPassword"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label="Confirm New Password"
            variant="outlined"
            type="password"
            fullWidth
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword?.message}
          />
        )}
      />

      <Button 
        type="submit" 
        variant="contained" 
        color="primary" 
        size="large"
        fullWidth
        disabled={isPending}
        startIcon={isPending ? <CircularProgress size={20} color="inherit" /> : null}
      >
        {isPending ? 'Resetting...' : 'Reset Password'}
      </Button>
    </Box>
  );
}
