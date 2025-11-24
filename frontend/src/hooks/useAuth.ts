import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../services/api';
import { useAuthStore } from '../stores/authStore';
import type { LoginRequest, RegisterRequest } from '../types';
import toast from 'react-hot-toast';

export const useLogin = () => {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  return useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),
    onSuccess: (response) => {
      if (response.success && response.data) {
        const { user, accessToken, refreshToken } = response.data;
        login(user, accessToken, refreshToken);
        toast.success('Login successful!');
        navigate('/');
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
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: RegisterRequest) => authApi.register(data),
    onSuccess: (response) => {
      if (response.success) {
        toast.success('Registration successful! Please login.');
        navigate('/login');
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

  return () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };
};
