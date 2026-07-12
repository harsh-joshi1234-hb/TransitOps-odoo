import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Chip,
  Avatar,
  TextField,
  InputAdornment,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import SearchIcon from '@mui/icons-material/Search';

export default function Navbar({ drawerWidth, handleDrawerToggle }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = `${user?.firstName?.charAt(0) || ''}${user?.lastName?.charAt(0) || ''}`;
  const roleName = user?.role?.name || 'User';

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        width: { sm: `calc(100% - ${drawerWidth}px)` },
        ml: { sm: `${drawerWidth}px` },
        backgroundColor: '#111122',
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
        backgroundImage: 'none',
      }}
    >
      <Toolbar sx={{ minHeight: '56px !important', px: { xs: 2, sm: 3 } }}>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={handleDrawerToggle}
          sx={{ mr: 2, display: { sm: 'none' } }}
        >
          <MenuIcon />
        </IconButton>

        {/* Global Search */}
        <TextField
          size="small"
          placeholder="Search..."
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#666', fontSize: 20 }} />
              </InputAdornment>
            ),
          }}
          sx={{
            width: { xs: 180, sm: 280 },
            '& .MuiOutlinedInput-root': {
              height: 36,
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              borderRadius: 2,
              '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.1)' },
              '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
            },
            '& .MuiInputBase-input': {
              fontSize: '0.85rem',
              color: '#aaa',
              '&::placeholder': { color: '#666', opacity: 1 },
            },
          }}
        />

        <Box sx={{ flexGrow: 1 }} />

        {/* User Profile */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {user && (
            <>
              <Typography
                variant="body2"
                sx={{
                  color: '#ccc',
                  fontWeight: 500,
                  display: { xs: 'none', md: 'block' },
                  fontSize: '0.85rem',
                }}
              >
                {user.firstName} {user.lastName?.charAt(0)}.
              </Typography>

              <Chip
                avatar={
                  <Avatar sx={{ bgcolor: '#e67e22', width: 26, height: 26, fontSize: '0.7rem' }}>
                    {initials}
                  </Avatar>
                }
                label={roleName}
                size="small"
                sx={{
                  backgroundColor: 'rgba(230, 126, 34, 0.12)',
                  color: '#e67e22',
                  border: '1px solid rgba(230, 126, 34, 0.3)',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  height: 30,
                  '& .MuiChip-avatar': { ml: 0.3 },
                }}
              />
            </>
          )}

          <IconButton
            onClick={handleLogout}
            size="small"
            aria-label="logout"
            sx={{
              color: '#777',
              '&:hover': { color: '#e74c3c', backgroundColor: 'rgba(231, 76, 60, 0.08)' },
            }}
          >
            <LogoutIcon fontSize="small" />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
