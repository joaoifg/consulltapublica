'use client';

import { useEffect, useState } from 'react';
import { adminApi } from '@/services/adminApi';
import { Badge } from '@/components/admin/Badge';
import type { ParticipanteDescriptografado, TipoParticipante } from '@/types';

export default function ParticipantesPage() {
  const [participantes, setParticipantes] = useState<ParticipanteDescriptografado[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedParticipante, setSelectedParticipante] = useState<ParticipanteDescriptografado | null>(null);

  // Filters
  const [tipo, setTipo] = useState<TipoParticipante | ''>('');
  const [uf, setUf] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 20;

  useEffect(() => {
    loadParticipantes();
  }, [page, tipo, uf]);

  const loadParticipantes = async () => {
    try {
      setIsLoading(true);
      const filtros: any = {
        skip: (page - 1) * limit,
        limit,
      };

      if (tipo) filtros.tipo = tipo;
      if (uf) filtros.uf = uf;

      const response = await adminApi.participantes.listar(filtros);
      setParticipantes(response.items || response);

      if (response.total) {
        setTotalPages(Math.ceil(response.total / limit));
      }
    } catch (error) {
      console.error('Erro ao carregar participantes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      loadParticipantes();
      return;
    }

    try {
      setIsLoading(true);
      // Try to determine if it's CPF or CNPJ based on length
      const cleanTerm = searchTerm.replace(/\D/g, '');

      let result;
      if (cleanTerm.length === 11) {
        // CPF
        result = await adminApi.participantes.buscarPorCpf(cleanTerm);
      } else if (cleanTerm.length === 14) {
        // CNPJ
        result = await adminApi.participantes.buscarPorCnpj(cleanTerm);
      } else {
        alert('Digite um CPF (11 dígitos) ou CNPJ (14 dígitos) válido');
        return;
      }

      setParticipantes(result ? [result] : []);
      setTotalPages(1);
    } catch (error: any) {
      if (error.response?.status === 404) {
        setParticipantes([]);
        alert('Participante não encontrado');
      } else {
        console.error('Erro ao buscar participante:', error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const clearFilters = () => {
    setTipo('');
    setUf('');
    setSearchTerm('');
    setPage(1);
  };

  const UFS = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
    'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
    'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Participantes</h1>
        <p className="text-gray-600">
          Visualize todos os participantes cadastrados
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Filtros</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label htmlFor="tipo" className="block text-sm font-medium text-gray-700 mb-2">
              Tipo
            </label>
            <select
              id="tipo"
              value={tipo}
              onChange={(e) => setTipo(e.target.value as TipoParticipante | '')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-cfo-blue-500 focus:border-transparent"
            >
              <option value="">Todos</option>
              <option value="PESSOA_FISICA">Pessoa Física</option>
              <option value="PESSOA_JURIDICA">Pessoa Jurídica</option>
            </select>
          </div>

          <div>
            <label htmlFor="uf" className="block text-sm font-medium text-gray-700 mb-2">
              UF
            </label>
            <select
              id="uf"
              value={uf}
              onChange={(e) => setUf(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-cfo-blue-500 focus:border-transparent"
            >
              <option value="">Todos</option>
              {UFS.map(ufOption => (
                <option key={ufOption} value={ufOption}>{ufOption}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
              Buscar por CPF/CNPJ
            </label>
            <input
              id="search"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Digite CPF ou CNPJ..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-cfo-blue-500 focus:border-transparent"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
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
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nome/Razão Social
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      CPF/CNPJ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      UF
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data Cadastro
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {participantes.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                        Nenhum participante encontrado
                      </td>
                    </tr>
                  ) : (
                    participantes.map((part) => (
                      <tr key={part.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm">
                          <Badge variant={part.tipo === 'PESSOA_FISICA' ? 'info' : 'warning'}>
                            {part.tipo === 'PESSOA_FISICA' ? 'PF' : 'PJ'}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {part.nome_completo || part.razao_social}
                        </td>
                        <td className="px-6 py-4 text-sm font-mono text-gray-700">
                          {part.cpf || part.cnpj}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {part.uf}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {part.email}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {new Date(part.criado_em).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <button
                            onClick={() => setSelectedParticipante(part)}
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
      {selectedParticipante && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">Detalhes do Participante</h3>
              <button
                onClick={() => setSelectedParticipante(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="text-2xl">&times;</span>
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-gray-500">Tipo:</span>
                  <div className="mt-1">
                    <Badge variant={selectedParticipante.tipo === 'PESSOA_FISICA' ? 'info' : 'warning'}>
                      {selectedParticipante.tipo === 'PESSOA_FISICA' ? 'Pessoa Física' : 'Pessoa Jurídica'}
                    </Badge>
                  </div>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">UF:</span>
                  <p className="text-sm text-gray-900">{selectedParticipante.uf}</p>
                </div>
              </div>

              <div>
                <span className="text-sm font-medium text-gray-500">
                  {selectedParticipante.tipo === 'PESSOA_FISICA' ? 'Nome Completo:' : 'Razão Social:'}
                </span>
                <p className="text-sm text-gray-900">
                  {selectedParticipante.nome_completo || selectedParticipante.razao_social}
                </p>
              </div>

              <div>
                <span className="text-sm font-medium text-gray-500">
                  {selectedParticipante.tipo === 'PESSOA_FISICA' ? 'CPF:' : 'CNPJ:'}
                </span>
                <p className="text-sm font-mono text-gray-900">
                  {selectedParticipante.cpf || selectedParticipante.cnpj}
                </p>
              </div>

              <div>
                <span className="text-sm font-medium text-gray-500">Email:</span>
                <p className="text-sm text-gray-900">{selectedParticipante.email}</p>
              </div>

              <div className="text-xs text-gray-500">
                Cadastrado em {new Date(selectedParticipante.criado_em).toLocaleString('pt-BR')}
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedParticipante(null)}
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
