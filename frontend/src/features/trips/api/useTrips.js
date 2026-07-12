import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../services/api';

export const useTrips = (params) => {
  return useQuery({
    queryKey: ['trips', params],
    queryFn: async () => {
      const response = await api.get('/trips', { params });
      return response.data;
    }
  });
};

export const useCreateTrip = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data) => {
      const response = await api.post('/trips', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
    }
  });
};

export const useUpdateTrip = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await api.put(`/trips/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
    }
  });
};

export const useDispatchTrip = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const response = await api.patch(`/trips/${id}/dispatch`);
      return response.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['trips'] })
  });
};

export const useStartTrip = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const response = await api.patch(`/trips/${id}/start`);
      return response.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['trips'] })
  });
};

export const useCompleteTrip = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, actualDistance }) => {
      const response = await api.patch(`/trips/${id}/complete`, { actualDistance });
      return response.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['trips'] })
  });
};

export const useCancelTrip = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const response = await api.patch(`/trips/${id}/cancel`);
      return response.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['trips'] })
  });
};
