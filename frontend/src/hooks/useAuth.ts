import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../services/api';
import { useAuthStore } from '../stores/authStore';
import type { LoginRequest, RegisterRequest } from '../types';
import toast from 'react-hot-toast';

export const useLogin = () => {
  const login = useAuthStore((state) => state.login);

  return useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),
    onSuccess: (response) => {
      if (response.success && response.data) {
        const { user, accessToken } = response.data;
        login(user, accessToken);
        toast.success('Login successful!');
      } else {
        toast.error(response.error?.message || 'Login failed');
      }
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Login failed. Please try again.';
      toast.error(message);
    },
  });
};

export const useRegister = () => {
  return useMutation({
    mutationFn: (data: RegisterRequest) => authApi.register(data),
    onSuccess: (response) => {
      if (response.success) {
        toast.success('Registration successful! Please login.');
      } else {
        toast.error(response.error?.message || 'Registration failed');
      }
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Registration failed. Please try again.';
      toast.error(message);
    },
  });
};

export const useLogout = () => {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const queryClient = useQueryClient();

  const cleanup = () => {
    logout();                         // מנקה state
    queryClient.clear();              // מנקה כל cache של react-query
    navigate('/login', { replace: true });
  };

  return useMutation({
    mutationFn: () => authApi.logout(),

    onSuccess: () => {
      toast.success('Logged out successfully');
      cleanup();
    },

    onError: (error: any) => {
      console.error('Logout failed on server:', error);
      toast.error('Logged out locally (server unavailable)');
      cleanup();
    },
  });
};
