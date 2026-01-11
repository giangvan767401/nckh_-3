
import axios from 'axios';
import { toast } from 'react-toastify';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Mock data for preview when backend is not running
const MOCK_COURSES = {
  items: [
    { id: '1', title: 'Advanced React Architecture', instructor: { name: 'Sarah Drasner' }, price: 19.99, level: 'Advanced', thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800' },
    { id: '2', title: 'Machine Learning for Engineers', instructor: { name: 'Andrew Ng' }, price: 24.99, level: 'Intermediate', thumbnail: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800' },
    { id: '3', title: 'Modern UI/UX Systems', instructor: { name: 'Gary Simon' }, price: 14.99, level: 'Beginner', thumbnail: 'https://images.unsplash.com/photo-1586717791821-3f44a563eb4c?w=800' }
  ]
};

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // If connection refused (backend offline), return mock data for specific endpoints to allow preview
    if (!error.response && error.config.url.includes('/courses')) {
      console.warn("Backend offline: Serving mock courses for preview.");
      return { data: MOCK_COURSES };
    }

    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) throw new Error('No refresh token');
        const res = await axios.post(`${api.defaults.baseURL}/auth/refresh`, { refreshToken });
        const { access_token } = res.data;
        localStorage.setItem('access_token', access_token);
        api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.clear();
        return Promise.reject(refreshError);
      }
    }

    const message = error.response?.data?.message || 'Check connection or login';
    return Promise.reject(error);
  }
);

export default api;
