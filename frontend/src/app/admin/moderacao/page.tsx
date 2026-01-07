'use client';

import { useEffect, useState } from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import { adminApi } from '@/services/adminApi';
import { ContribuicaoCard } from '@/components/admin/ContribuicaoCard';
import type { ContribuicaoAdmin, Documento, TipoContribuicao } from '@/types';

export default function ModeracaoPage() {
  const { canModerate } = usePermissions();
  const [contribuicoes, setContribuicoes] = useState<ContribuicaoAdmin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Filters
  const [documento, setDocumento] = useState<Documento | ''>('');
  const [tipo, setTipo] = useState<TipoContribuicao | ''>('');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  useEffect(() => {
    if (!canModerate) {
      return;
    }
    loadContribuicoes();
  }, [canModerate, page, documento, tipo, dataInicio, dataFim]);

  const loadContribuicoes = async () => {
    try {
      setIsLoading(true);
      const filtros: any = {
        skip: (page - 1) * limit,
        limit,
      };

      if (documento) filtros.documento = documento;
      if (tipo) filtros.tipo = tipo;
      if (dataInicio) filtros.data_inicio = dataInicio;
      if (dataFim) filtros.data_fim = dataFim;

      const response = await adminApi.moderacao.listarPendentes(filtros);
      setContribuicoes(response.items || response);

      // Calculate total pages if we have pagination data
      if (response.total) {
        setTotalPages(Math.ceil(response.total / limit));
      }
    } catch (error) {
      console.error('Erro ao carregar contribuições:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAprovar = async (id: number) => {
    try {
      setIsActionLoading(true);
      await adminApi.moderacao.aprovar(id);
      // Remove from list
      setContribuicoes(prev => prev.filter(c => c.id !== id));
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Erro ao aprovar contribuição');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleRejeitar = async (id: number, motivo: string) => {
    try {
      setIsActionLoading(true);
      await adminApi.moderacao.rejeitar(id, motivo);
      // Remove from list
      setContribuicoes(prev => prev.filter(c => c.id !== id));
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Erro ao rejeitar contribuição');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleAprovarTodas = async () => {
    if (!confirm(`Deseja aprovar todas as ${contribuicoes.length} contribuições pendentes?`)) {
      return;
    }

    try {
      setIsActionLoading(true);
      const ids = contribuicoes.map(c => c.id);
      await adminApi.moderacao.aprovarEmLote(ids);
      setContribuicoes([]);
      loadContribuicoes();
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Erro ao aprovar contribuições em lote');
    } finally {
      setIsActionLoading(false);
    }
  };

  const clearFilters = () => {
    setDocumento('');
    setTipo('');
    setDataInicio('');
    setDataFim('');
    setPage(1);
  };

  if (!canModerate) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          Você não tem permissão para acessar esta página.
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Moderação de Contribuições</h1>
        <p className="text-gray-600">
          Analise e aprove ou rejeite as contribuições pendentes
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Filtros</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label htmlFor="documento" className="block text-sm font-medium text-gray-700 mb-2">
              Documento
            </label>
            <select
              id="documento"
              value={documento}
              onChange={(e) => setDocumento(e.target.value as Documento | '')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-cfo-blue-500 focus:border-transparent"
            >
              <option value="">Todos</option>
              <option value="CEO">CEO</option>
              <option value="CPEO">CPEO</option>
            </select>
          </div>

          <div>
            <label htmlFor="tipo" className="block text-sm font-medium text-gray-700 mb-2">
              Tipo
            </label>
            <select
              id="tipo"
              value={tipo}
              onChange={(e) => setTipo(e.target.value as TipoContribuicao | '')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-cfo-blue-500 focus:border-transparent"
            >
              <option value="">Todos</option>
              <option value="ALTERACAO">Alteração</option>
              <option value="INCLUSAO">Inclusão</option>
              <option value="EXCLUSAO">Exclusão</option>
              <option value="COMENTARIO">Comentário</option>
            </select>
          </div>

          <div>
            <label htmlFor="dataInicio" className="block text-sm font-medium text-gray-700 mb-2">
              Data Início
            </label>
            <input
              id="dataInicio"
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-cfo-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="dataFim" className="block text-sm font-medium text-gray-700 mb-2">
              Data Fim
            </label>
            <input
              id="dataFim"
              type="date"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-cfo-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-4">
          <button
            onClick={clearFilters}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md font-medium hover:bg-gray-50 transition-colors"
          >
            Limpar Filtros
          </button>
          {contribuicoes.length > 0 && (
            <button
              onClick={handleAprovarTodas}
              disabled={isActionLoading}
              className="px-4 py-2 bg-green-600 text-white rounded-md font-medium hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Aprovar Todas ({contribuicoes.length})
            </button>
          )}
        </div>
      </div>

      {/* Contributions List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 bg-gray-200 rounded-lg animate-pulse"></div>
          ))}
        </div>
      ) : contribuicoes.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
          <p className="text-gray-500 text-lg">
            Nenhuma contribuição pendente encontrada
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-4 mb-6">
            {contribuicoes.map((contribuicao) => (
              <ContribuicaoCard
                key={contribuicao.id}
                contribuicao={contribuicao}
                onAprovar={handleAprovar}
                onRejeitar={handleRejeitar}
                isLoading={isActionLoading}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md font-medium hover:bg-gray-50 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              <span className="text-sm text-gray-600">
                Página {page} de {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md font-medium hover:bg-gray-50 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                Próxima
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
