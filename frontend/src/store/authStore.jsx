import { create } from 'zustand';
import { authService } from '../services/api';

const useAuthStore = create((set) => ({

  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token') || null,
  isLoading: false,
  error: null,
  
  login: async (username, password) => {
    set({ isLoading: true, error: null });
    try {
      const data = await authService.login({ username, password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      set({ user: data.user, token: data.token, isLoading: false });
      return data;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Giriş yapılamadı', 
        isLoading: false 
      });
      throw error;
    }
  },
  
  logout: () => {
    authService.logout();
    set({ user: null, token: null });
  },
  
  checkAuth: async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      set({ user: null, token: null });
      return false;
    }
    
    try {
      const user = await authService.getCurrentUser();
      set({ user });
      return true;
    } catch (error) {
      set({ user: null, token: null });
      return false;
    }
  }
}));

export default useAuthStore;