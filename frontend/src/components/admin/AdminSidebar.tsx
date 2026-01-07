'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { usePermissions } from '@/hooks/usePermissions';

export function AdminSidebar() {
  const pathname = usePathname();
  const { isSuperAdmin, canModerate, canViewLogs } = usePermissions();

  const menuItems = [
    {
      label: 'Dashboard',
      href: '/admin/dashboard',
      icon: '📊',
      show: true,
    },
    {
      label: 'Moderação',
      href: '/admin/moderacao',
      icon: '✅',
      show: canModerate,
    },
    {
      label: 'Contribuições',
      href: '/admin/contribuicoes',
      icon: '📝',
      show: true,
    },
    {
      label: 'Participantes',
      href: '/admin/participantes',
      icon: '👥',
      show: true,
    },
    {
      label: 'Consultas',
      href: '/admin/consultas',
      icon: '📋',
      show: isSuperAdmin,
    },
    {
      label: 'Admins',
      href: '/admin/admins',
      icon: '👑',
      show: isSuperAdmin,
    },
    {
      label: 'Logs',
      href: '/admin/logs',
      icon: '📜',
      show: canViewLogs,
    },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-cfo-blue-600">CFO Admin</h1>
        <p className="text-sm text-gray-500 mt-1">Painel Administrativo</p>
      </div>

      <nav className="px-3">
        {menuItems.map((item) => {
          if (!item.show) return null;

          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-colors ${
                isActive
                  ? 'bg-cfo-blue-50 text-cfo-blue-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          Sistema de Consulta Pública CFO
        </p>
      </div>
    </aside>
  );
}
