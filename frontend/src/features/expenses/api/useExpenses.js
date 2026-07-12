import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../services/api';

export const useExpenses = (params) => {
  return useQuery({
    queryKey: ['expenses', params],
    queryFn: async () => {
      const response = await api.get('/expenses', { params });
      return response.data;
    }
  });
};

export const useExpenseKPIs = () => {
  return useQuery({
    queryKey: ['expenses', 'kpis'],
    queryFn: async () => {
      const response = await api.get('/expenses/kpis');
      return response.data;
    }
  });
};

export const useExpenseTimeline = (id) => {
  return useQuery({
    queryKey: ['expenses', id, 'timeline'],
    queryFn: async () => {
      const response = await api.get(`/expenses/${id}/timeline`);
      return response.data;
    },
    enabled: !!id
  });
};

export const useCreateExpense = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data) => {
      const response = await api.post('/expenses', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
    }
  });
};

export const useTransitionExpense = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, action }) => {
      const response = await api.post(`/expenses/${id}/${action}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
    }
  });
};
