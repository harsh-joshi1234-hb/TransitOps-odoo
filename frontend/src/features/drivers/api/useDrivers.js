import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../services/api';

export const useDrivers = (params) => {
  return useQuery({
    queryKey: ['drivers', params],
    queryFn: async () => {
      const response = await api.get('/drivers', { params });
      return response.data;
    }
  });
};

export const useDriver = (id) => {
  return useQuery({
    queryKey: ['drivers', id],
    queryFn: async () => {
      const response = await api.get(`/drivers/${id}`);
      return response.data.data;
    },
    enabled: !!id
  });
};

export const useCreateDriver = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data) => {
      const response = await api.post('/drivers', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
    }
  });
};

export const useUpdateDriver = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await api.put(`/drivers/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
    }
  });
};

export const useUpdateSafetyScore = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, safetyScore }) => {
      const response = await api.patch(`/drivers/${id}/safety-score`, { safetyScore });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
    }
  });
};

export const useDeleteDriver = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const response = await api.delete(`/drivers/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
    }
  });
};
