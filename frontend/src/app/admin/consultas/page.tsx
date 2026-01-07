'use client';

import { useEffect, useState } from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import { adminApi } from '@/services/adminApi';
import { Badge } from '@/components/admin/Badge';
import type { ConsultaPublica, StatusConsulta, Documento } from '@/types';

export default function ConsultasPage() {
  const { isSuperAdmin } = usePermissions();
  const [consultas, setConsultas] = useState<ConsultaPublica[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingConsulta, setEditingConsulta] = useState<ConsultaPublica | null>(null);

  // Form state
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [documentosDisponiveis, setDocumentosDisponiveis] = useState<Documento[]>(['CEO', 'CPEO']);

  useEffect(() => {
    if (!isSuperAdmin) return;
    loadConsultas();
  }, [isSuperAdmin]);

  const loadConsultas = async () => {
    try {
      setIsLoading(true);
      const data = await adminApi.consultas.listar();
      setConsultas(data);
    } catch (error) {
      console.error('Erro ao carregar consultas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingConsulta(null);
    setTitulo('');
    setDescricao('');
    setDataInicio('');
    setDataFim('');
    setDocumentosDisponiveis(['CEO', 'CPEO']);
    setShowModal(true);
  };

  const openEditModal = (consulta: ConsultaPublica) => {
    setEditingConsulta(consulta);
    setTitulo(consulta.titulo);
    setDescricao(consulta.descricao || '');
    setDataInicio(consulta.data_inicio.split('T')[0]);
    setDataFim(consulta.data_fim.split('T')[0]);
    setDocumentosDisponiveis(consulta.documentos_disponiveis);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      titulo,
      descricao,
      data_inicio: new Date(dataInicio).toISOString(),
      data_fim: new Date(dataFim).toISOString(),
      documentos_disponiveis: documentosDisponiveis,
    };

    try {
      if (editingConsulta) {
        await adminApi.consultas.atualizar(editingConsulta.id, payload);
      } else {
        await adminApi.consultas.criar(payload);
      }
      setShowModal(false);
      loadConsultas();
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Erro ao salvar consulta');
    }
  };

  const handleEncerrar = async (id: number) => {
    if (!confirm('Deseja encerrar esta consulta pública? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      await adminApi.consultas.encerrar(id);
      loadConsultas();
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Erro ao encerrar consulta');
    }
  };

  const toggleDocumento = (doc: Documento) => {
    setDocumentosDisponiveis(prev =>
      prev.includes(doc) ? prev.filter(d => d !== doc) : [...prev, doc]
    );
  };

  const getStatusBadgeVariant = (status: StatusConsulta) => {
    switch (status) {
      case 'ATIVA':
        return 'success';
      case 'RASCUNHO':
        return 'gray';
      case 'ENCERRADA':
        return 'danger';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: StatusConsulta) => {
    switch (status) {
      case 'ATIVA':
        return 'Ativa';
      case 'RASCUNHO':
        return 'Rascunho';
      case 'ENCERRADA':
        return 'Encerrada';
      default:
        return status;
    }
  };

  if (!isSuperAdmin) {
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Consultas Públicas</h1>
          <p className="text-gray-600">
            Gerencie os períodos de consulta pública
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="px-4 py-2 bg-cfo-blue-600 text-white rounded-md font-medium hover:bg-cfo-blue-700 transition-colors"
        >
          Nova Consulta
        </button>
      </div>

      {isLoading ? (
        <div className="p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cfo-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {consultas.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
              <p className="text-gray-500 text-lg">Nenhuma consulta pública cadastrada</p>
            </div>
          ) : (
            consultas.map((consulta) => (
              <div key={consulta.id} className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{consulta.titulo}</h3>
                    {consulta.descricao && (
                      <p className="text-sm text-gray-600 mb-3">{consulta.descricao}</p>
                    )}
                  </div>
                  <Badge variant={getStatusBadgeVariant(consulta.status)}>
                    {getStatusLabel(consulta.status)}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Data Início:</span>
                    <p className="text-sm text-gray-900">
                      {new Date(consulta.data_inicio).toLocaleString('pt-BR')}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Data Fim:</span>
                    <p className="text-sm text-gray-900">
                      {new Date(consulta.data_fim).toLocaleString('pt-BR')}
                    </p>
                  </div>
                </div>

                <div className="mb-4">
                  <span className="text-sm font-medium text-gray-500">Documentos Disponíveis:</span>
                  <div className="flex gap-2 mt-1">
                    {consulta.documentos_disponiveis.map((doc) => (
                      <Badge key={doc} variant="info">{doc}</Badge>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  {consulta.status !== 'ENCERRADA' && (
                    <>
                      <button
                        onClick={() => openEditModal(consulta)}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md font-medium hover:bg-gray-50 transition-colors"
                      >
                        Editar
                      </button>
                      {consulta.status === 'ATIVA' && (
                        <button
                          onClick={() => handleEncerrar(consulta.id)}
                          className="px-4 py-2 bg-red-600 text-white rounded-md font-medium hover:bg-red-700 transition-colors"
                        >
                          Encerrar
                        </button>
                      )}
                    </>
                  )}
                </div>

                <div className="text-xs text-gray-500 mt-4">
                  Criado em {new Date(consulta.criado_em).toLocaleString('pt-BR')}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              {editingConsulta ? 'Editar Consulta Pública' : 'Nova Consulta Pública'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="titulo" className="block text-sm font-medium text-gray-700 mb-2">
                  Título *
                </label>
                <input
                  id="titulo"
                  type="text"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-cfo-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="descricao" className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição
                </label>
                <textarea
                  id="descricao"
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-cfo-blue-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="dataInicio" className="block text-sm font-medium text-gray-700 mb-2">
                    Data Início *
                  </label>
                  <input
                    id="dataInicio"
                    type="date"
                    value={dataInicio}
                    onChange={(e) => setDataInicio(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-cfo-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="dataFim" className="block text-sm font-medium text-gray-700 mb-2">
                    Data Fim *
                  </label>
                  <input
                    id="dataFim"
                    type="date"
                    value={dataFim}
                    onChange={(e) => setDataFim(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-cfo-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Documentos Disponíveis *
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={documentosDisponiveis.includes('CEO')}
                      onChange={() => toggleDocumento('CEO')}
                      className="mr-2"
                    />
                    CEO
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={documentosDisponiveis.includes('CPEO')}
                      onChange={() => toggleDocumento('CPEO')}
                      className="mr-2"
                    />
                    CPEO
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-cfo-blue-600 text-white rounded-md font-medium hover:bg-cfo-blue-700 transition-colors"
                >
                  {editingConsulta ? 'Salvar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
