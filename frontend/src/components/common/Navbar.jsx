import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  AppBar, 
  Toolbar, 
  IconButton, 
  Typography, 
  Button, 
  Box, 
  Chip, 
  Avatar
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';

export default function Navbar({ drawerWidth, handleDrawerToggle }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        width: { sm: `calc(100% - ${drawerWidth}px)` },
        ml: { sm: `${drawerWidth}px` },
        backgroundColor: 'background.paper',
        color: 'text.primary',
        boxShadow: '0px 1px 4px rgba(0,0,0,0.05)',
      }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={handleDrawerToggle}
          sx={{ mr: 2, display: { sm: 'none' } }}
        >
          <MenuIcon />
        </IconButton>

        {/* Mobile Logo */}
        <Box sx={{ display: { xs: 'flex', sm: 'none' }, alignItems: 'center', flexGrow: 1 }}>
          <DirectionsBusIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="h6" noWrap component="div" fontWeight="bold">
            TransitOps
          </Typography>
        </Box>

        <Box sx={{ flexGrow: 1, display: { xs: 'none', sm: 'block' } }} />

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {user && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.light', fontSize: '0.875rem' }}>
                {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
              </Avatar>
              <Box sx={{ display: { xs: 'none', md: 'flex' }, flexDirection: 'column' }}>
                <Typography variant="body2" fontWeight="bold">
                  {user.firstName} {user.lastName}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mt: -0.5 }}>
                  {user.role?.name || 'User'}
                </Typography>
              </Box>
            </Box>
          )}
          
          <Button 
            color="error" 
            variant="outlined" 
            size="small"
            onClick={handleLogout}
            startIcon={<LogoutIcon />}
            sx={{ display: { xs: 'none', sm: 'flex' } }}
          >
            Logout
          </Button>
          <IconButton 
            color="error" 
            onClick={handleLogout}
            sx={{ display: { xs: 'flex', sm: 'none' } }}
          >
            <LogoutIcon />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
