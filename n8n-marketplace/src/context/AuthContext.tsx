"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import { identify, resetAnalytics, track, EVENTS } from '@/lib/analytics';

interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  picture?: string;
  subscriptionTier: string;
  emailVerified: boolean;
  roles: string[];
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (token: string, refreshToken: string, redirectPath?: string | null) => void;
  loginWithPassword: (email: string, pass: string) => Promise<boolean>;
  register: (firstName: string, lastName: string, email: string, pass: string, newsletter?: boolean, autoLogin?: boolean) => Promise<boolean>;
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
          if (response.data?._id) {
            identify(response.data._id, {
              tier: response.data.subscriptionTier,
              email_verified: response.data.emailVerified,
              roles: response.data.roles,
            });
          }
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
    console.log(token, refreshToken);
    Cookies.set('token', token, { expires: 1, path: '/' }); // 1 day
    Cookies.set('refreshToken', refreshToken, { expires: 7, path: '/' }); // 7 days
    
    // Fetch user profile immediately after setting token
    api.get('/users/profile')
      .then(response => {
        setUser(response.data);
        if (response.data?._id) {
          identify(response.data._id, {
            tier: response.data.subscriptionTier,
            email_verified: response.data.emailVerified,
            roles: response.data.roles,
          });
        }
        track(EVENTS.loginCompleted, { method: 'session' });
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
      console.log(response.data);
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

  const register = async (firstName: string, lastName: string, email: string, pass: string, newsletter = false, autoLogin = true) => {
    try {
      const response = await api.post('/auth/register', { 
        firstName, 
        lastName, 
        email, 
        password: pass,
        newsletterSubscribed: newsletter
      });
      if (!response.data.access_token || !response.data.refresh_token) {
        throw new Error('Registration failed');
      }

      track(EVENTS.signupCompleted, { newsletter, auto_login: autoLogin });

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
    track(EVENTS.logout);
    resetAnalytics();
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
