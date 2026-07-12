import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../services/api';

export const useMaintenance = (params) => {
  return useQuery({
    queryKey: ['maintenance', params],
    queryFn: async () => {
      const response = await api.get('/maintenance', { params });
      return response.data;
    }
  });
};

export const useMaintenanceTimeline = (id) => {
  return useQuery({
    queryKey: ['maintenance', id, 'timeline'],
    queryFn: async () => {
      const response = await api.get(`/maintenance/${id}/timeline`);
      return response.data;
    },
    enabled: !!id
  });
};

export const useRequestMaintenance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data) => {
      const response = await api.post('/maintenance', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance'] });
    }
  });
};

export const useUpdateMaintenance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await api.put(`/maintenance/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance'] });
    }
  });
};

export const useTransitionMaintenance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, action, data }) => {
      const response = await api.patch(`/maintenance/${id}/${action}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance'] });
    }
  });
};
