import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { auth, firebaseSignUp, firebaseSignIn, firebaseSignOut, onAuthStateChanged } from '@/lib/firebase';
import type { User as FirebaseUser } from 'firebase/auth';

const API_URL = import.meta.env.VITE_API_URL || '';

interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  accessToken: string | null;
  isLoading: boolean;
  authLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(() => {
    return localStorage.getItem('accessToken');
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Try to fetch user on mount if we have a token
    if (accessToken) {
      fetchMe();
    } else {
      // Try to auto-login with demo user
      autoLogin();
    }
  }, []);

  const autoLogin = async () => {
    try {
      // Try to login as existing demo user
      await login('demo@flowspace.app', 'demo123');
    } catch (err) {
      console.error('Auto-login failed:', err);
      setIsLoading(false);
    }
  };

  const fetchMe = async () => {
    try {
      const response = await fetch(`${API_URL}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        // Token expired, try to refresh
        await refreshToken();
      }
    } catch (err) {
      console.error('Failed to fetch user:', err);
      setAccessToken(null);
      localStorage.removeItem('accessToken');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshToken = async () => {
    try {
      const response = await fetch(`${API_URL}/api/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setAccessToken(data.access);
        localStorage.setItem('accessToken', data.access);
        await fetchMe();
      } else {
        throw new Error('Failed to refresh token');
      }
    } catch (err) {
      setAccessToken(null);
      localStorage.removeItem('accessToken');
      setUser(null);
      throw err;
    }
  };

  const login = async (email: string, password: string) => {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || 'Login failed');
    }
    const data = await response.json();
    setAccessToken(data.access);
    localStorage.setItem('accessToken', data.access);
    setUser(data.user);
    setIsLoading(false);
  };

  const register = async (name: string, email: string, password: string) => {
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ name, email, password }),
    });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || 'Registration failed');
    }
    const data = await response.json();
    setAccessToken(data.access);
    localStorage.setItem('accessToken', data.access);
    setUser(data.user);
    setIsLoading(false);
  };

  const logout = async () => {
    try {
      await fetch(`${API_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (err) {
      console.error('Logout error:', err);
    }
    setAccessToken(null);
    localStorage.removeItem('accessToken');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isLoading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function getAccessToken(): string | null {
  return localStorage.getItem('accessToken');
}
