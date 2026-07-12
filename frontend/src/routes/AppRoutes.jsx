import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import AuthLayout from '../layouts/AuthLayout';
import Landing from '../pages/Landing';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import Vehicles from '../pages/Vehicles';
import Drivers from '../pages/Drivers';
import Trips from '../pages/Trips';
import Maintenance from '../pages/Maintenance';
import Fuel from '../pages/Fuel';
import Expenses from '../pages/Expenses';
import Reports from '../pages/Reports';
import Settings from '../pages/Settings';
import PageNotFound from '../components/common/PageNotFound';

export default function AppRoutes() { return (
  <Router>
    <Routes>
      <Route path='/' element={<Landing />} />
      <Route element={<AuthLayout />}>
        <Route path='/login' element={<Login />} />
      </Route>
      <Route element={<MainLayout />}>
        <Route path='/dashboard' element={<Dashboard />} />
        <Route path='/vehicles' element={<Vehicles />} />
        <Route path='/drivers' element={<Drivers />} />
        <Route path='/trips' element={<Trips />} />
        <Route path='/maintenance' element={<Maintenance />} />
        <Route path='/fuel' element={<Fuel />} />
        <Route path='/expenses' element={<Expenses />} />
        <Route path='/reports' element={<Reports />} />
        <Route path='/settings' element={<Settings />} />
      </Route>
      <Route path='*' element={<PageNotFound />} />
    </Routes>
  </Router>
); }
