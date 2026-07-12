import { useQuery } from '@tanstack/react-query';
import api from '../../../services/api';

export const useExecutiveReport = (params) => {
  return useQuery({
    queryKey: ['reports', 'executive', params],
    queryFn: async () => {
      const response = await api.get('/reports/executive', { params });
      return response.data;
    }
  });
};

export const useFleetReport = (params) => {
  return useQuery({
    queryKey: ['reports', 'fleet', params],
    queryFn: async () => {
      const response = await api.get('/reports/fleet', { params });
      return response.data;
    }
  });
};

export const useTripsReport = (params) => {
  return useQuery({
    queryKey: ['reports', 'trips', params],
    queryFn: async () => {
      const response = await api.get('/reports/trips', { params });
      return response.data;
    }
  });
};

export const useMaintenanceReport = (params) => {
  return useQuery({
    queryKey: ['reports', 'maintenance', params],
    queryFn: async () => {
      const response = await api.get('/reports/maintenance', { params });
      return response.data;
    }
  });
};

export const useFuelReport = (params) => {
  return useQuery({
    queryKey: ['reports', 'fuel', params],
    queryFn: async () => {
      const response = await api.get('/reports/fuel', { params });
      return response.data;
    }
  });
};

export const useExpenseReport = (params) => {
  return useQuery({
    queryKey: ['reports', 'expenses', params],
    queryFn: async () => {
      const response = await api.get('/reports/expenses', { params });
      return response.data;
    }
  });
};

export const useFinancialReport = (params) => {
  return useQuery({
    queryKey: ['reports', 'financial', params],
    queryFn: async () => {
      const response = await api.get('/reports/financial', { params });
      return response.data;
    }
  });
};
