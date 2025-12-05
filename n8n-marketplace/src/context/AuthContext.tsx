"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';

interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  picture?: string;
  subscriptionTier: string;
  emailVerified: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (token: string, refreshToken: string, redirectPath?: string | null) => void;
  loginWithPassword: (email: string, pass: string) => Promise<boolean>;
  register: (firstName: string, lastName: string, email: string, pass: string, autoLogin?: boolean) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const initAuth = async () => {
      const token = Cookies.get('token');
      if (token) {
        try {
          const response = await api.get('/users/profile');
          setUser(response.data);
        } catch (error) {
          console.error('Failed to fetch user profile:', error);
          Cookies.remove('token');
          Cookies.remove('refreshToken');
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = (token: string, refreshToken: string, redirectPath: string | null = '/') => {
    Cookies.set('token', token, { expires: 1 }); // 1 day
    Cookies.set('refreshToken', refreshToken, { expires: 7 }); // 7 days
    
    // Fetch user profile immediately after setting token
    api.get('/users/profile')
      .then(response => {
        setUser(response.data);
        if (redirectPath) {
          router.push(redirectPath);
        }
      })
      .catch(error => {
        console.error('Login failed:', error);
      });
  };

  const loginWithPassword = async (email: string, pass: string) => {
    try {
      const response = await api.post('/auth/login', { email, password: pass });
      if (!response.data.access_token || !response.data.refresh_token) {
        throw new Error('Login failed');
      }
      const { access_token, refresh_token } = response.data;
      login(access_token, refresh_token);
      return true;
    } catch (error) {
      console.error('Password login failed:', error);
      throw error;
    }
  };

  const register = async (firstName: string, lastName: string, email: string, pass: string, autoLogin = true) => {
    try {
      const response = await api.post('/auth/register', { 
        firstName, 
        lastName, 
        email, 
        password: pass 
      });
      if (!response.data.access_token || !response.data.refresh_token) {
        throw new Error('Registration failed');
      }
      
      if (autoLogin) {
        const { access_token, refresh_token } = response.data;
        login(access_token, refresh_token);
      }
      return true;
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const logout = () => {
    Cookies.remove('token');
    Cookies.remove('refreshToken');
    setUser(null);
    router.push('/auth/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, loginWithPassword, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
