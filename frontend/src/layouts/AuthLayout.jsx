import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Typography } from '@mui/material';

export default function AuthLayout() {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#0d0d0d' }}>
      {/* Left Panel - Branding */}
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          justifyContent: 'space-between',
          width: '42%',
          backgroundColor: '#16213e',
          p: 5,
        }}
      >
        <Box>
          {/* Logo */}
          <Box
            sx={{
              width: 48, height: 48, borderRadius: 2,
              background: 'linear-gradient(135deg, #e67e22 0%, #d35400 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.4rem', fontWeight: 800, color: '#fff', mb: 2,
            }}
          >
            T
          </Box>
          <Typography variant="h4" sx={{ color: '#e0e0e0', fontWeight: 700, mb: 0.5 }}>
            TransitOps
          </Typography>
          <Typography variant="body2" sx={{ color: '#888', mb: 6 }}>
            Smart Transport Operations Platform
          </Typography>

          {/* Role Info */}
          <Typography variant="body1" sx={{ color: '#ccc', fontWeight: 600, mb: 2 }}>
            One login, four roles:
          </Typography>
          {['Fleet Manager', 'Dispatcher', 'Safety Officer', 'Financial Analyst'].map((role) => (
            <Box key={role} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.2 }}>
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#e67e22' }} />
              <Typography variant="body2" sx={{ color: '#bbb' }}>{role}</Typography>
            </Box>
          ))}
        </Box>

        <Typography variant="caption" sx={{ color: '#555' }}>
          TRANSITOPS © 2026 · RBAC ERP
        </Typography>
      </Box>

      {/* Right Panel - Form */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0d0d0d',
          px: { xs: 3, sm: 6 },
        }}
      >
        <Box sx={{ width: '100%', maxWidth: 420 }}>
          <Typography variant="h5" sx={{ color: '#e0e0e0', fontWeight: 700, mb: 0.5 }}>
            Sign in to your account
          </Typography>
          <Typography variant="body2" sx={{ color: '#888', mb: 4 }}>
            Enter your credentials to continue
          </Typography>
          <Outlet />

          {/* Role Access Guide */}
          <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <Typography variant="caption" sx={{ color: '#666', display: 'block', mb: 1 }}>
              Access is scoped by role after login:
            </Typography>
            {[
              { role: 'Fleet Manager', scope: 'Fleet, Maintenance' },
              { role: 'Dispatcher', scope: 'Dashboard, Trips' },
              { role: 'Safety Officer', scope: 'Drivers, Compliance' },
              { role: 'Financial Analyst', scope: 'Fuel & Expenses, Analytics' },
            ].map(({ role, scope }) => (
              <Typography key={role} variant="caption" sx={{ color: '#555', display: 'block', lineHeight: 1.6 }}>
                • {role} → {scope}
              </Typography>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
