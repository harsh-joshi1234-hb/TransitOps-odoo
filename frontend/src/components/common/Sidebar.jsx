import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  Divider,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import PersonIcon from '@mui/icons-material/Person';
import RouteIcon from '@mui/icons-material/Route';
import BuildIcon from '@mui/icons-material/Build';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import ReceiptIcon from '@mui/icons-material/Receipt';
import AssessmentIcon from '@mui/icons-material/Assessment';
import SettingsIcon from '@mui/icons-material/Settings';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard', roles: ['Admin', 'Fleet Manager', 'Dispatcher', 'Safety Officer', 'Financial Analyst'] },
  { text: 'Vehicles', icon: <DirectionsCarIcon />, path: '/vehicles', roles: ['Admin', 'Fleet Manager', 'Dispatcher', 'Safety Officer', 'Financial Analyst'] },
  { text: 'Drivers', icon: <PersonIcon />, path: '/drivers', roles: ['Admin', 'Fleet Manager', 'Dispatcher', 'Safety Officer'] },
  { text: 'Trips', icon: <RouteIcon />, path: '/trips', roles: ['Admin', 'Fleet Manager', 'Dispatcher'] },
  { text: 'Maintenance', icon: <BuildIcon />, path: '/maintenance', roles: ['Admin', 'Fleet Manager', 'Safety Officer'] },
  { text: 'Fuel Logs', icon: <LocalGasStationIcon />, path: '/fuel', roles: ['Admin', 'Fleet Manager', 'Financial Analyst'] },
  { text: 'Expenses', icon: <ReceiptIcon />, path: '/expenses', roles: ['Admin', 'Financial Analyst'] },
  { text: 'Reports', icon: <AssessmentIcon />, path: '/reports', roles: ['Admin', 'Fleet Manager', 'Financial Analyst'] },
  { text: 'Settings', icon: <SettingsIcon />, path: '/settings', roles: ['Admin'] },
];

export default function Sidebar({ drawerWidth, mobileOpen, handleDrawerToggle }) {
  const { user } = useAuth();
  const location = useLocation();

  const drawer = (
    <div>
      <Box sx={{ display: 'flex', alignItems: 'center', p: 2, height: 64 }}>
        <DirectionsBusIcon color="primary" sx={{ mr: 1, fontSize: 32 }} />
        <Typography variant="h6" fontWeight="bold" color="primary">
          TransitOps
        </Typography>
      </Box>
      <Divider />
      <List sx={{ px: 2, py: 2 }}>
        {menuItems.map((item) => {
          // Role Based Filtering
          if (user && item.roles && !item.roles.includes(user.role?.name)) {
            return null;
          }

          const isActive = location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);

          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                component={NavLink}
                to={item.path}
                sx={{
                  borderRadius: 2,
                  bgcolor: isActive ? 'primary.main' : 'transparent',
                  color: isActive ? 'primary.contrastText' : 'text.primary',
                  '&:hover': {
                    bgcolor: isActive ? 'primary.dark' : 'action.hover',
                  },
                }}
              >
                <ListItemIcon 
                  sx={{ 
                    minWidth: 40,
                    color: isActive ? 'primary.contrastText' : 'text.secondary' 
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text} 
                  primaryTypographyProps={{ 
                    fontWeight: isActive ? 600 : 500 
                  }} 
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </div>
  );

  return (
    <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
        }}
      >
        {drawer}
      </Drawer>
      
      {/* Desktop Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, borderRight: 'none', boxShadow: '2px 0 8px rgba(0,0,0,0.05)' },
        }}
        open
      >
        {drawer}
      </Drawer>
    </Box>
  );
}
