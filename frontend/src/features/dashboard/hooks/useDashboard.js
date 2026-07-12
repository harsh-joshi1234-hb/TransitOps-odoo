import { useQuery } from '@tanstack/react-query';
import api from '../../../services/api';

export const useDashboardOverview = () => {
  return useQuery({
    queryKey: ['dashboard', 'overview'],
    queryFn: async () => {
      const response = await api.get('/dashboard/overview');
      return response.data.data;
    }
  });
};

export const useDashboardCharts = () => {
  return useQuery({
    queryKey: ['dashboard', 'charts'],
    queryFn: async () => {
      const response = await api.get('/dashboard/charts');
      return response.data.data;
    }
  });
};

export const useDashboardFleet = () => {
  return useQuery({
    queryKey: ['dashboard', 'fleet'],
    queryFn: async () => {
      const response = await api.get('/dashboard/fleet');
      return response.data.data;
    }
  });
};

export const useDashboardTrips = () => {
  return useQuery({
    queryKey: ['dashboard', 'trips'],
    queryFn: async () => {
      const response = await api.get('/dashboard/trips');
      return response.data.data;
    }
  });
};

export const useDashboardMaintenance = () => {
  return useQuery({
    queryKey: ['dashboard', 'maintenance'],
    queryFn: async () => {
      const response = await api.get('/dashboard/maintenance');
      return response.data.data;
    }
  });
};

export const useDashboardFuel = () => {
  return useQuery({
    queryKey: ['dashboard', 'fuel'],
    queryFn: async () => {
      const response = await api.get('/dashboard/fuel');
      return response.data.data;
    }
  });
};

export const useDashboardExpenses = () => {
  return useQuery({
    queryKey: ['dashboard', 'expenses'],
    queryFn: async () => {
      const response = await api.get('/dashboard/expenses');
      return response.data.data;
    }
  });
};
