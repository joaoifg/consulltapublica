'use client';

import { useAdminAuth } from '@/hooks/useAdminAuth';
import { Badge } from './Badge';

export function AdminHeader() {
  const { admin, logout } = useAdminAuth();

  const roleColors = {
    SUPER_ADMIN: 'danger' as const,
    MODERADOR: 'warning' as const,
    ANALISTA: 'info' as const,
  };

  const roleLabels = {
    SUPER_ADMIN: 'Super Admin',
    MODERADOR: 'Moderador',
    ANALISTA: 'Analista',
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Painel Administrativo</h2>
        </div>

        <div className="flex items-center gap-4">
          {admin && (
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{admin.nome}</p>
                <Badge variant={roleColors[admin.role]}>
                  {roleLabels[admin.role]}
                </Badge>
              </div>

              <button
                onClick={logout}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Sair
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
