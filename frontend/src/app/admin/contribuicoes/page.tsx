'use client';

import { useEffect, useState } from 'react';
import { adminApi } from '@/services/adminApi';
import { Badge } from '@/components/admin/Badge';
import type { ContribuicaoAdmin, StatusModeracao, Documento, TipoContribuicao } from '@/types';

export default function ContribuicoesPage() {
  const [contribuicoes, setContribuicoes] = useState<ContribuicaoAdmin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedContribuicao, setSelectedContribuicao] = useState<ContribuicaoAdmin | null>(null);

  // Filters
  const [status, setStatus] = useState<StatusModeracao | ''>('');
  const [documento, setDocumento] = useState<Documento | ''>('');
  const [tipo, setTipo] = useState<TipoContribuicao | ''>('');
  const [searchProtocolo, setSearchProtocolo] = useState('');

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 20;

  useEffect(() => {
    loadContribuicoes();
  }, [page, status, documento, tipo]);

  const loadContribuicoes = async () => {
    try {
      setIsLoading(true);
      const filtros: any = {
        skip: (page - 1) * limit,
        limit,
      };

      if (status) filtros.status_moderacao = status;
      if (documento) filtros.documento = documento;
      if (tipo) filtros.tipo = tipo;
      if (searchProtocolo) filtros.protocolo = searchProtocolo;

      const response = await adminApi.contribuicoes.listar(filtros);
      setContribuicoes(response.items || response);

      if (response.total) {
        setTotalPages(Math.ceil(response.total / limit));
      }
    } catch (error) {
      console.error('Erro ao carregar contribuições:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    loadContribuicoes();
  };

  const clearFilters = () => {
    setStatus('');
    setDocumento('');
    setTipo('');
    setSearchProtocolo('');
    setPage(1);
  };

  const getStatusBadgeVariant = (statusValue: StatusModeracao) => {
    switch (statusValue) {
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

  const getStatusLabel = (statusValue: StatusModeracao) => {
    switch (statusValue) {
      case 'APROVADA':
        return 'Aprovada';
      case 'PENDENTE':
        return 'Pendente';
      case 'REJEITADA':
        return 'Rejeitada';
      default:
        return statusValue;
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Contribuições</h1>
        <p className="text-gray-600">
          Visualize todas as contribuições recebidas
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Filtros</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value as StatusModeracao | '')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-cfo-blue-500 focus:border-transparent"
            >
              <option value="">Todos</option>
              <option value="PENDENTE">Pendente</option>
              <option value="APROVADA">Aprovada</option>
              <option value="REJEITADA">Rejeitada</option>
            </select>
          </div>

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
            <label htmlFor="protocolo" className="block text-sm font-medium text-gray-700 mb-2">
              Protocolo
            </label>
            <input
              id="protocolo"
              type="text"
              value={searchProtocolo}
              onChange={(e) => setSearchProtocolo(e.target.value)}
              placeholder="Digite o protocolo..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-cfo-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-cfo-blue-600 text-white rounded-md font-medium hover:bg-cfo-blue-700 transition-colors"
          >
            Buscar
          </button>
          <button
            onClick={clearFilters}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md font-medium hover:bg-gray-50 transition-colors"
          >
            Limpar Filtros
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cfo-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando...</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Protocolo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Documento
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Artigo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {contribuicoes.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                        Nenhuma contribuição encontrada
                      </td>
                    </tr>
                  ) : (
                    contribuicoes.map((contrib) => (
                      <tr key={contrib.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {contrib.protocolo}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {contrib.documento}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {contrib.tipo}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {contrib.artigo}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <Badge variant={getStatusBadgeVariant(contrib.status_moderacao)}>
                            {getStatusLabel(contrib.status_moderacao)}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {new Date(contrib.criado_em).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <button
                            onClick={() => setSelectedContribuicao(contrib)}
                            className="text-cfo-blue-600 hover:text-cfo-blue-800 font-medium"
                          >
                            Ver Detalhes
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 px-6 py-4 border-t border-gray-200">
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

      {/* Details Modal */}
      {selectedContribuicao && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 max-w-3xl w-full my-8">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">Detalhes da Contribuição</h3>
              <button
                onClick={() => setSelectedContribuicao(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="text-2xl">&times;</span>
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-gray-500">Protocolo:</span>
                  <p className="text-sm text-gray-900">{selectedContribuicao.protocolo}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Status:</span>
                  <div className="mt-1">
                    <Badge variant={getStatusBadgeVariant(selectedContribuicao.status_moderacao)}>
                      {getStatusLabel(selectedContribuicao.status_moderacao)}
                    </Badge>
                  </div>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Documento:</span>
                  <p className="text-sm text-gray-900">{selectedContribuicao.documento}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Tipo:</span>
                  <p className="text-sm text-gray-900">{selectedContribuicao.tipo}</p>
                </div>
              </div>

              <div>
                <span className="text-sm font-medium text-gray-500">Título/Capítulo:</span>
                <p className="text-sm text-gray-900">{selectedContribuicao.titulo_capitulo}</p>
              </div>

              <div>
                <span className="text-sm font-medium text-gray-500">Artigo:</span>
                <p className="text-sm text-gray-900">{selectedContribuicao.artigo}</p>
              </div>

              <div>
                <span className="text-sm font-medium text-gray-500">Texto Proposto:</span>
                <p className="text-sm text-gray-700 mt-1 p-3 bg-gray-50 rounded border border-gray-200">
                  {selectedContribuicao.texto_proposto}
                </p>
              </div>

              <div>
                <span className="text-sm font-medium text-gray-500">Fundamentação:</span>
                <p className="text-sm text-gray-700 mt-1 p-3 bg-gray-50 rounded border border-gray-200">
                  {selectedContribuicao.fundamentacao}
                </p>
              </div>

              {selectedContribuicao.participante && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                  <span className="text-sm font-medium text-blue-900">Participante:</span>
                  <p className="text-sm text-blue-800 mt-1">
                    {selectedContribuicao.participante.nome_completo || selectedContribuicao.participante.razao_social}
                    {' - '}
                    {selectedContribuicao.participante.cpf || selectedContribuicao.participante.cnpj}
                    {' - '}
                    {selectedContribuicao.participante.uf}
                  </p>
                </div>
              )}

              {selectedContribuicao.status_moderacao === 'REJEITADA' && selectedContribuicao.motivo_rejeicao && (
                <div className="p-3 bg-red-50 border border-red-200 rounded">
                  <span className="text-sm font-medium text-red-900">Motivo da Rejeição:</span>
                  <p className="text-sm text-red-800 mt-1">{selectedContribuicao.motivo_rejeicao}</p>
                </div>
              )}

              <div className="text-xs text-gray-500">
                Criado em {new Date(selectedContribuicao.criado_em).toLocaleString('pt-BR')}
                {selectedContribuicao.moderado_em && (
                  <> • Moderado em {new Date(selectedContribuicao.moderado_em).toLocaleString('pt-BR')}</>
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedContribuicao(null)}
                className="px-4 py-2 bg-gray-600 text-white rounded-md font-medium hover:bg-gray-700 transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
