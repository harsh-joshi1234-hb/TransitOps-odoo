import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import MainLayout from '../layouts/MainLayout';
import AuthLayout from '../layouts/AuthLayout';
import { ProtectedRoute } from './ProtectedRoute';
import PageNotFound from '../components/common/PageNotFound';

// Lazy loaded views
const Login = lazy(() => import('../pages/Login'));
const ForgotPassword = lazy(() => import('../pages/ForgotPassword'));
const ResetPassword = lazy(() => import('../pages/ResetPassword'));
const Dashboard = lazy(() => import('../pages/Dashboard'));
const Vehicles = lazy(() => import('../pages/Vehicles'));
const Drivers = lazy(() => import('../pages/Drivers'));
const Trips = lazy(() => import('../pages/Trips'));
const Maintenance = lazy(() => import('../pages/Maintenance'));
const Fuel = lazy(() => import('../pages/Fuel'));
const Expenses = lazy(() => import('../pages/Expenses'));
const Reports = lazy(() => import('../pages/Reports'));
const Settings = lazy(() => import('../pages/Settings'));
const Unauthorized = lazy(() => import('../pages/Unauthorized'));

const SuspenseLoader = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', minHeight: '200px' }}>
    <CircularProgress />
  </Box>
);

export default function AppRoutes() { return (
  <Router>
    <Suspense fallback={<SuspenseLoader />}>
      <Routes>
        <Route path='/' element={<Navigate to="/login" replace />} />
      <Route element={<AuthLayout />}>
        <Route path='/login' element={<Login />} />
        <Route path='/forgot-password' element={<ForgotPassword />} />
        <Route path='/reset-password/:token' element={<ResetPassword />} />
      </Route>
      <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
        <Route path='/dashboard' element={<Dashboard />} />
        <Route path='/vehicles' element={<Vehicles />} />
        <Route path='/drivers' element={<Drivers />} />
        <Route path='/trips' element={<Trips />} />
        <Route path='/maintenance' element={<Maintenance />} />
        <Route path='/fuel' element={<Fuel />} />
        <Route path='/expenses' element={<Expenses />} />
        <Route path='/reports' element={<Reports />} />
        <Route path='/settings' element={<Settings />} />
        <Route path='/unauthorized' element={<Unauthorized />} />
      </Route>
      <Route path='*' element={<PageNotFound />} />
      </Routes>
    </Suspense>
  </Router>
); }
