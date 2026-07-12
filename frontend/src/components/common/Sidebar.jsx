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
import AssessmentIcon from '@mui/icons-material/Assessment';
import AnalyticsIcon from '@mui/icons-material/TrendingUp';
import SettingsIcon from '@mui/icons-material/Settings';

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard', roles: ['Admin', 'Fleet Manager', 'Dispatcher', 'Safety Officer', 'Financial Analyst'] },
  { text: 'Fleet', icon: <DirectionsCarIcon />, path: '/vehicles', roles: ['Admin', 'Fleet Manager', 'Dispatcher', 'Safety Officer', 'Financial Analyst'] },
  { text: 'Drivers', icon: <PersonIcon />, path: '/drivers', roles: ['Admin', 'Fleet Manager', 'Dispatcher', 'Safety Officer'] },
  { text: 'Trips', icon: <RouteIcon />, path: '/trips', roles: ['Admin', 'Fleet Manager', 'Dispatcher'] },
  { text: 'Maintenance', icon: <BuildIcon />, path: '/maintenance', roles: ['Admin', 'Fleet Manager', 'Safety Officer'] },
  { text: 'Fuel & Expenses', icon: <LocalGasStationIcon />, path: '/expenses', roles: ['Admin', 'Fleet Manager', 'Financial Analyst'] },
  { text: 'Analytics', icon: <AnalyticsIcon />, path: '/reports', roles: ['Admin', 'Fleet Manager', 'Financial Analyst'] },
  { text: 'Settings', icon: <SettingsIcon />, path: '/settings', roles: ['Admin'] },
];

export default function Sidebar({ drawerWidth, mobileOpen, handleDrawerToggle }) {
  const { user } = useAuth();
  const location = useLocation();

  const drawerPaperSx = {
    boxSizing: 'border-box',
    width: drawerWidth,
    backgroundColor: '#111122',
    borderRight: '1px solid rgba(255, 255, 255, 0.06)',
    backgroundImage: 'none',
  };

  const drawer = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Brand */}
      <Box sx={{ display: 'flex', alignItems: 'center', px: 2.5, py: 2.5, gap: 1.5 }}>
        <Box
          sx={{
            width: 36, height: 36, borderRadius: 2,
            background: 'linear-gradient(135deg, #e67e22 0%, #d35400 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.1rem', fontWeight: 800, color: '#fff',
          }}
        >
          T
        </Box>
        <Typography variant="h6" fontWeight={700} sx={{ color: '#e0e0e0', letterSpacing: '-0.02em' }}>
          TransitOps
        </Typography>
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)', mx: 2 }} />

      {/* Navigation */}
      <List sx={{ px: 1.5, py: 2, flexGrow: 1 }}>
        {menuItems.map((item) => {
          if (user && item.roles && !item.roles.includes(user.role?.name)) {
            return null;
          }

          const isActive = location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);

          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                component={NavLink}
                to={item.path}
                sx={{
                  borderRadius: 2,
                  py: 1,
                  px: 2,
                  bgcolor: isActive ? 'rgba(230, 126, 34, 0.12)' : 'transparent',
                  borderLeft: isActive ? '3px solid #e67e22' : '3px solid transparent',
                  color: isActive ? '#e67e22' : '#9e9e9e',
                  '&:hover': {
                    bgcolor: isActive ? 'rgba(230, 126, 34, 0.16)' : 'rgba(255, 255, 255, 0.04)',
                    color: isActive ? '#e67e22' : '#e0e0e0',
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 36,
                    color: isActive ? '#e67e22' : '#757575',
                    transition: 'color 0.2s ease',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontWeight: isActive ? 600 : 400,
                    fontSize: '0.875rem',
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      {/* Footer */}
      <Box sx={{ px: 2.5, py: 2, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <Typography variant="caption" sx={{ color: '#555', fontSize: '0.7rem' }}>
          TRANSITOPS © 2026 · RBAC ERP
        </Typography>
      </Box>
    </Box>
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
          '& .MuiDrawer-paper': drawerPaperSx,
        }}
      >
        {drawer}
      </Drawer>

      {/* Desktop Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': drawerPaperSx,
        }}
        open
      >
        {drawer}
      </Drawer>
    </Box>
  );
}
