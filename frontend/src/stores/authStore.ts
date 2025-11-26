import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  loginModalOpen: boolean;
  registerModalOpen: boolean;
  login: (user: User, accessToken: string) => void;
  logout: () => void;
  setToken: (accessToken: string) => void;
  setUser: (user: User) => void;
  openLoginModal: () => void;
  closeLoginModal: () => void;
  openRegisterModal: () => void;
  closeRegisterModal: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      loginModalOpen: false,
      registerModalOpen: false,
      login: (user, accessToken) =>
        set({
          user,
          accessToken,
          isAuthenticated: true,
        }),
      logout: () =>
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
        }),
      setToken: (accessToken) =>
        set({
          accessToken,
        }),
      setUser: (user) => set({ user }),
      openLoginModal: () => set({ loginModalOpen: true, registerModalOpen: false }),
      closeLoginModal: () => set({ loginModalOpen: false }),
      openRegisterModal: () => set({ registerModalOpen: true, loginModalOpen: false }),
      closeRegisterModal: () => set({ registerModalOpen: false }),
    }),
    {
      name: 'auth-storage',
    }
  )
);
