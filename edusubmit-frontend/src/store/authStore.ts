import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'STUDENT' | 'TEACHER' | 'ADMIN';
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
  setToken: (token: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        try {
          // Mock authentication for testing
          if ((email === 'student@gmail.com' || email === 'teacher@gmail.com' || email === 'admin@gmail.com') && password === '123') {
            const mockUser = {
              id: '1',
              email: email,
              name: email === 'student@gmail.com' ? 'Student User' : email === 'teacher@gmail.com' ? 'Teacher User' : 'Admin User',
              role: (email === 'student@gmail.com' ? 'STUDENT' : email === 'teacher@gmail.com' ? 'TEACHER' : 'ADMIN') as 'STUDENT' | 'TEACHER' | 'ADMIN'
            };
            
            const mockToken = 'mock-jwt-token-' + Date.now();
            
            set({
              user: mockUser,
              token: mockToken,
              isAuthenticated: true,
            });
            return;
          }

          // Try actual API if mock doesn't match
          const response = await fetch('http://localhost:8082/api/auth/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
          });

          if (!response.ok) {
            throw new Error('Login failed');
          }

          const data = await response.json();
          set({
            user: data.user,
            token: data.token,
            isAuthenticated: true,
          });
        } catch (error) {
          console.error('Login error:', error);
          throw error;
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },

      setUser: (user: User) => set({ user }),
      setToken: (token: string) => set({ token }),
    }),
    {
      name: 'auth-storage',
    }
  )
);
