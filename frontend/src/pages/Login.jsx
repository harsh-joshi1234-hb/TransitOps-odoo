  import React from 'react';
  import { useForm, Controller } from 'react-hook-form';
  import { zodResolver } from '@hookform/resolvers/zod';
  import { z } from 'zod';
  import { useMutation } from '@tanstack/react-query';
  import { useNavigate, Link as RouterLink } from 'react-router-dom';
  import { toast } from 'react-hot-toast';
  import api from '../services/api';
  import { useAuth } from '../context/AuthContext';
  import { TextField, Button, Box, Typography, Link, InputAdornment, IconButton, CircularProgress, Paper } from '@mui/material';
  import { Visibility, VisibilityOff } from '@mui/icons-material';

  const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  });

  export default function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [showPassword, setShowPassword] = React.useState(false);
    
    const { control, handleSubmit, formState: { errors } } = useForm({
      resolver: zodResolver(loginSchema),
      defaultValues: { email: '', password: '' }
    });

    const mutation = useMutation({
      mutationFn: async (credentials) => {
        const response = await api.post('/auth/login', credentials);
        return response.data;
      },
      onSuccess: (data) => {
        toast.success('Login successful');
        login(data.data.token, data.data.user);
        navigate('/dashboard');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Login failed');
      }
    });

    const onSubmit = (data) => {
      mutation.mutate(data);
    };

    const handleClickShowPassword = () => setShowPassword((show) => !show);

    return (
      <Paper
        elevation={0}
        sx={{
          p: { xs: 4, sm: 6 },
          backgroundColor: '#1E293B',
          borderRadius: '24px',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        }}
      >
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography variant="h4" sx={{ color: '#FFFFFF', fontWeight: 800, mb: 1 }}>
            Welcome Back
          </Typography>
          <Typography variant="body1" sx={{ color: '#94A3B8' }}>
            Sign in to continue to TransitOps
          </Typography>
        </Box>

        <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
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
                InputLabelProps={{ style: { color: '#94A3B8' } }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#0F172A',
                    borderRadius: '14px',
                    color: '#FFFFFF',
                    '& fieldset': { borderColor: 'rgba(255,255,255,0.08)' },
                    '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.15)' },
                    '&.Mui-focused fieldset': { borderColor: '#F59E0B', borderWidth: '2px' },
                  }
                }}
              />
            )}
          />

          <Controller
            name="password"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Password"
                variant="outlined"
                type={showPassword ? 'text' : 'password'}
                fullWidth
                autoComplete="current-password"
                error={!!errors.password}
                helperText={errors.password?.message}
                InputLabelProps={{ style: { color: '#94A3B8' } }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#0F172A',
                    borderRadius: '14px',
                    color: '#FFFFFF',
                    '& fieldset': { borderColor: 'rgba(255,255,255,0.08)' },
                    '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.15)' },
                    '&.Mui-focused fieldset': { borderColor: '#F59E0B', borderWidth: '2px' },
                  }
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={handleClickShowPassword} edge="end" sx={{ color: '#94A3B8' }}>
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            )}
          />

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {/* Placeholder for Remember Me (Visual Only for now to match spec) */}
            <Typography variant="body2" sx={{ color: '#94A3B8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 1 }}>
              <input type="checkbox" style={{ accentColor: '#F59E0B', width: 16, height: 16 }} /> Remember Me
            </Typography>
            <Link component={RouterLink} to="/forgot-password" variant="body2" sx={{ color: '#F59E0B', fontWeight: 600, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
              Forgot password?
            </Link>
          </Box>

          <Button 
            type="submit" 
            variant="contained" 
            size="large"
            fullWidth
            disabled={mutation.isPending}
            startIcon={mutation.isPending ? <CircularProgress size={20} color="inherit" /> : null}
            sx={{
              backgroundColor: '#F59E0B',
              color: '#FFFFFF',
              borderRadius: '12px',
              py: 1.5,
              fontSize: '1rem',
              fontWeight: 700,
              textTransform: 'none',
              boxShadow: '0 4px 14px 0 rgba(245, 158, 11, 0.39)',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              '&:hover': {
                backgroundColor: '#D97706',
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 20px rgba(245, 158, 11, 0.4)',
              },
              '&.Mui-disabled': {
                backgroundColor: 'rgba(245, 158, 11, 0.5)',
                color: 'rgba(255,255,255,0.5)',
              }
            }}
          >
            {mutation.isPending ? 'Signing in...' : 'Sign In →'}
          </Button>

          <Typography variant="caption" sx={{ color: '#64748B', textAlign: 'center', display: 'block', mt: 2 }}>
            🔒 Protected by enterprise-grade authentication
          </Typography>
        </Box>
      </Paper>
    );
  }
