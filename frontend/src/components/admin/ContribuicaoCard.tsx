'use client';

import { useState } from 'react';
import { Badge } from './Badge';
import type { ContribuicaoAdmin, StatusModeracao } from '@/types';

interface ContribuicaoCardProps {
  contribuicao: ContribuicaoAdmin;
  onAprovar: (id: number) => void;
  onRejeitar: (id: number, motivo: string) => void;
  isLoading?: boolean;
}

export function ContribuicaoCard({ contribuicao, onAprovar, onRejeitar, isLoading }: ContribuicaoCardProps) {
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [motivo, setMotivo] = useState('');

  const handleReject = () => {
    if (!motivo.trim()) {
      alert('Por favor, informe o motivo da rejeição');
      return;
    }
    onRejeitar(contribuicao.id, motivo);
    setShowRejectModal(false);
    setMotivo('');
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

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium text-gray-500">Protocolo:</span>
              <span className="text-sm font-mono text-gray-900">{contribuicao.protocolo}</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">{contribuicao.titulo_capitulo}</h3>
          </div>
          <Badge variant={getStatusBadgeVariant(contribuicao.status_moderacao)}>
            {getStatusLabel(contribuicao.status_moderacao)}
          </Badge>
        </div>

        {/* Details */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <span className="text-sm font-medium text-gray-500">Documento:</span>
            <p className="text-sm text-gray-900">{contribuicao.documento}</p>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-500">Tipo:</span>
            <p className="text-sm text-gray-900">{contribuicao.tipo}</p>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-500">Artigo:</span>
            <p className="text-sm text-gray-900">{contribuicao.artigo}</p>
          </div>
          {contribuicao.secao && (
            <div>
              <span className="text-sm font-medium text-gray-500">Seção:</span>
              <p className="text-sm text-gray-900">{contribuicao.secao}</p>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="mb-4">
          <span className="text-sm font-medium text-gray-500">Texto Proposto:</span>
          <p className="text-sm text-gray-700 mt-1 p-3 bg-gray-50 rounded border border-gray-200">
            {contribuicao.texto_proposto}
          </p>
        </div>

        <div className="mb-4">
          <span className="text-sm font-medium text-gray-500">Fundamentação:</span>
          <p className="text-sm text-gray-700 mt-1 p-3 bg-gray-50 rounded border border-gray-200">
            {contribuicao.fundamentacao}
          </p>
        </div>

        {/* Participant Info */}
        {contribuicao.participante && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
            <span className="text-sm font-medium text-blue-900">Participante:</span>
            <p className="text-sm text-blue-800 mt-1">
              {contribuicao.participante.nome_completo || contribuicao.participante.razao_social}
              {' - '}
              {contribuicao.participante.cpf || contribuicao.participante.cnpj}
              {' - '}
              {contribuicao.participante.uf}
            </p>
          </div>
        )}

        {/* Actions - Only show for pending contributions */}
        {contribuicao.status_moderacao === 'PENDENTE' && (
          <div className="flex gap-3 mt-4 pt-4 border-t border-gray-200">
            <button
              onClick={() => onAprovar(contribuicao.id)}
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md font-medium hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Aprovar
            </button>
            <button
              onClick={() => setShowRejectModal(true)}
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md font-medium hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Rejeitar
            </button>
          </div>
        )}

        {/* Show rejection reason if rejected */}
        {contribuicao.status_moderacao === 'REJEITADA' && contribuicao.motivo_rejeicao && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
            <span className="text-sm font-medium text-red-900">Motivo da Rejeição:</span>
            <p className="text-sm text-red-800 mt-1">{contribuicao.motivo_rejeicao}</p>
          </div>
        )}

        {/* Moderation info */}
        {contribuicao.moderado_em && (
          <div className="mt-4 text-xs text-gray-500">
            Moderado em {new Date(contribuicao.moderado_em).toLocaleString('pt-BR')}
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Rejeitar Contribuição</h3>

            <div className="mb-4">
              <label htmlFor="motivo" className="block text-sm font-medium text-gray-700 mb-2">
                Motivo da Rejeição *
              </label>
              <textarea
                id="motivo"
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Explique o motivo da rejeição..."
                required
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setMotivo('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md font-medium hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleReject}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md font-medium hover:bg-red-700 transition-colors"
              >
                Confirmar Rejeição
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
