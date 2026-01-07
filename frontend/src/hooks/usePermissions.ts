import { useAdminAuth } from './useAdminAuth';
import type { AdminRole } from '@/types';

export function usePermissions() {
  const { admin } = useAdminAuth();

  const hasRole = (roles: AdminRole[]): boolean => {
    if (!admin) return false;
    return roles.includes(admin.role);
  };

  const isSuperAdmin = admin?.role === 'SUPER_ADMIN';
  const isModerador = admin?.role === 'MODERADOR' || isSuperAdmin;
  const isAnalista = admin?.role === 'ANALISTA' || isModerador;

  const canModerate = isModerador;
  const canManageAdmins = isSuperAdmin;
  const canManageConsultas = isSuperAdmin;
  const canViewLogs = isAnalista;

  return {
    hasRole,
    isSuperAdmin,
    isModerador,
    isAnalista,
    canModerate,
    canManageAdmins,
    canManageConsultas,
    canViewLogs,
  };
}
