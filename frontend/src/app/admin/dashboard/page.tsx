'use client';

import { useEffect, useState } from 'react';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { adminApi } from '@/services/adminApi';
import { DashboardCard } from '@/components/admin/DashboardCard';
import { Badge } from '@/components/admin/Badge';
import type { Estatisticas, ContribuicaoResponse, StatusModeracao } from '@/types';

export default function DashboardPage() {
  const { admin } = useAdminAuth();
  const [stats, setStats] = useState<Estatisticas | null>(null);
  const [recentContributions, setRecentContributions] = useState<ContribuicaoResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const [statsData, recentData] = await Promise.all([
        adminApi.dashboard.obterEstatisticas(),
        adminApi.dashboard.obterContribuicoesRecentes(10),
      ]);
      setStats(statsData);
      setRecentContributions(recentData);
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadgeVariant = (status: StatusModeracao) => {
    switch (status) {
      case 'APROVADA':
        return 'success';
      case 'PENDENTE':
        return 'warning';
      case 'REJEITADA':
        return 'danger';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: StatusModeracao) => {
    switch (status) {
      case 'APROVADA':
        return 'Aprovada';
      case 'PENDENTE':
        return 'Pendente';
      case 'REJEITADA':
        return 'Rejeitada';
      default:
        return status;
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Bem-vindo, {admin?.nome}</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <DashboardCard
          title="Total de Contribuições"
          value={stats?.total_contribuicoes || 0}
          icon="📝"
          variant="default"
        />
        <DashboardCard
          title="Pendentes"
          value={stats?.pendentes || 0}
          icon="⏳"
          variant="warning"
        />
        <DashboardCard
          title="Aprovadas"
          value={stats?.aprovadas || 0}
          icon="✅"
          variant="success"
        />
        <DashboardCard
          title="Rejeitadas"
          value={stats?.rejeitadas || 0}
          icon="❌"
          variant="danger"
        />
      </div>

      {/* Statistics by Type and Document */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* By Type */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Por Tipo</h2>
          <div className="space-y-3">
            {stats?.por_tipo && Object.entries(stats.por_tipo).map(([tipo, count]) => (
              <div key={tipo} className="flex items-center justify-between">
                <span className="text-sm text-gray-700">{tipo}</span>
                <span className="font-semibold text-gray-900">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* By Document */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Por Documento</h2>
          <div className="space-y-3">
            {stats?.por_documento && Object.entries(stats.por_documento).map(([doc, count]) => (
              <div key={doc} className="flex items-center justify-between">
                <span className="text-sm text-gray-700">{doc}</span>
                <span className="font-semibold text-gray-900">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Contributions */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Contribuições Recentes</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Protocolo
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Documento
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {recentContributions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    Nenhuma contribuição encontrada
                  </td>
                </tr>
              ) : (
                recentContributions.map((contrib) => (
                  <tr key={contrib.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {contrib.protocolo}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {contrib.tipo}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {contrib.documento}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <Badge variant={getStatusBadgeVariant(contrib.status_moderacao)}>
                        {getStatusLabel(contrib.status_moderacao)}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {new Date(contrib.criado_em).toLocaleDateString('pt-BR')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
