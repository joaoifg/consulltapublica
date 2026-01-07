'use client';

import React, { createContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { Admin, AdminLoginRequest } from '@/types';
import { adminApi } from '@/services/adminApi';

interface AdminAuthContextType {
  admin: Admin | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: AdminLoginRequest) => Promise<void>;
  logout: () => void;
  refreshAuth: () => void;
}

export const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Carregar admin do localStorage
  useEffect(() => {
    try {
      const token = localStorage.getItem('admin_token');
      const adminData = localStorage.getItem('admin_user');

      if (token && adminData) {
        setAdmin(JSON.parse(adminData));
      }
    } catch (error) {
      console.error('Erro ao carregar admin:', error);
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_refresh_token');
      localStorage.removeItem('admin_user');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (credentials: AdminLoginRequest) => {
    try {
      setIsLoading(true);
      const response = await adminApi.login(credentials);

      // Salvar no localStorage
      localStorage.setItem('admin_token', response.access_token);
      localStorage.setItem('admin_refresh_token', response.refresh_token);
      localStorage.setItem('admin_user', JSON.stringify(response.admin));

      setAdmin(response.admin);

      // Redirecionar para dashboard
      router.push('/admin/dashboard');
    } catch (error: any) {
      console.error('Erro ao fazer login:', error);
      throw new Error(
        error.response?.data?.detail || 'Erro ao fazer login. Verifique suas credenciais.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const logout = useCallback(async () => {
    try {
      await adminApi.logout();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    } finally {
      // Limpar localStorage
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_refresh_token');
      localStorage.removeItem('admin_user');

      setAdmin(null);

      // Redirecionar para login
      router.push('/admin/login');
    }
  }, [router]);

  const refreshAuth = useCallback(() => {
    try {
      const adminData = localStorage.getItem('admin_user');
      if (adminData) {
        setAdmin(JSON.parse(adminData));
      }
    } catch (error) {
      console.error('Erro ao atualizar auth:', error);
    }
  }, []);

  const value = {
    admin,
    isAuthenticated: !!admin,
    isLoading,
    login,
    logout,
    refreshAuth,
  };

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}
