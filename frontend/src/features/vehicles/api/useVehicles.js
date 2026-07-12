import { useQuery } from '@tanstack/react-query';
import api from '../../../services/api';

export const useVehicles = (params) => {
  return useQuery({
    queryKey: ['vehicles', params],
    queryFn: async () => {
      const response = await api.get('/vehicles', { params });
      return response.data;
    }
  });
};
