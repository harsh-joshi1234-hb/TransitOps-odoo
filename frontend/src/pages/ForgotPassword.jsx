import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { TextField, Button, Box, Typography, Link, CircularProgress } from '@mui/material';

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [isPending, setIsPending] = React.useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' }
  });

  const onSubmit = (data) => {
    setIsPending(true);
    // Mocking API call for now
    setTimeout(() => {
      toast.success('Password reset link sent to your email');
      setIsPending(false);
      navigate('/login');
    }, 1500);
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
        Enter your email address and we'll send you a link to reset your password.
      </Typography>

      <Controller
        name="email"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label="Email Address"
            variant="outlined"
            fullWidth
            autoComplete="email"
            error={!!errors.email}
            helperText={errors.email?.message}
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
        {isPending ? 'Sending...' : 'Send Reset Link'}
      </Button>

      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
        <Link component={RouterLink} to="/login" variant="body2" underline="hover">
          Back to login
        </Link>
      </Box>
    </Box>
  );
}
