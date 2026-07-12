import axios from 'axios';
import { toast } from 'react-hot-toast';
import { API_BASE_URL } from '../constants/api';

const api = axios.create({ 
  baseURL: API_BASE_URL, 
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('transitops_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('transitops_token');
      localStorage.removeItem('transitops_user');
      window.location.href = '/login';
    } else if (error.response?.status === 403) {
      toast.error('You do not have permission to perform this action');
    }
    return Promise.reject(error);
  }
);

export default api;
