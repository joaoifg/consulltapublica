'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import api from '@/lib/api'
import type { ContribuicaoResponse, Documento, TipoContribuicao, StatusModeracao } from '@/types'

interface Filtros {
  documento?: Documento | ''
  tipo?: TipoContribuicao | ''
  busca?: string
}

export default function ContribuicoesPublicasPage() {
  const [contribuicoes, setContribuicoes] = useState<ContribuicaoResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [filtros, setFiltros] = useState<Filtros>({
    documento: '',
    tipo: '',
    busca: '',
  })
  const [selectedContribuicao, setSelectedContribuicao] = useState<ContribuicaoResponse | null>(null)

  // Pagination
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const limit = 20

  useEffect(() => {
    loadContribuicoes()
  }, [page, filtros.documento, filtros.tipo])

  const loadContribuicoes = async () => {
    try {
      setLoading(true)
      const params: any = {
        skip: (page - 1) * limit,
        limit,
      }

      if (filtros.documento) params.documento = filtros.documento
      if (filtros.tipo) params.tipo = filtros.tipo

      const response = await api.get('/contribuicoes/publicas', { params })
      setContribuicoes(response.data.items || response.data)

      if (response.data.total) {
        setTotalPages(Math.ceil(response.data.total / limit))
      }
    } catch (error) {
      console.error('Erro ao carregar contribuições:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBuscar = () => {
    setPage(1)
    loadContribuicoes()
  }

  const limparFiltros = () => {
    setFiltros({ documento: '', tipo: '', busca: '' })
    setPage(1)
  }

  const getTipoLabel = (tipo: TipoContribuicao) => {
    const labels: Record<TipoContribuicao, string> = {
      ALTERACAO: 'Alteração',
      INCLUSAO: 'Inclusão',
      EXCLUSAO: 'Exclusão',
      COMENTARIO: 'Comentário',
    }
    return labels[tipo] || tipo
  }

  const getTipoBadgeColor = (tipo: TipoContribuicao) => {
    const colors: Record<TipoContribuicao, string> = {
      ALTERACAO: 'bg-blue-100 text-blue-800',
      INCLUSAO: 'bg-green-100 text-green-800',
      EXCLUSAO: 'bg-red-100 text-red-800',
      COMENTARIO: 'bg-yellow-100 text-yellow-800',
    }
    return colors[tipo] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-cfo-900 via-cfo-800 to-cfo-900 text-white shadow-2xl">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Image
                src="/logo.png"
                alt="CFO Logo"
                  width={80}
                  height={80}
                className="object-contain"
                style={{ filter: 'brightness(0) invert(1)' }}
              />
              <div>
                <h1 className="text-3xl font-bold mb-2">Contribuições Públicas</h1>
                <p className="text-cfo-100">
                  Todas as contribuições aprovadas enviadas à Consulta Pública do CFO
                </p>
              </div>
            </div>
            <Link
              href="/"
              className="px-6 py-3 bg-white/20 hover:bg-white/30 rounded-lg transition-colors font-semibold border border-white/30"
            >
              Voltar ao Início
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Info */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded-lg">
            <div className="flex items-start">
              <svg className="w-6 h-6 text-blue-600 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-sm text-blue-800 font-medium mb-1">
                  Transparência e Participação Social
                </p>
                <p className="text-sm text-blue-700">
                  Estas são as contribuições aprovadas pela equipe de moderação do CFO.
                  Dados pessoais como CPF, CNPJ e e-mail não são exibidos, conforme a LGPD.
                </p>
              </div>
            </div>
          </div>

          {/* Filtros */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Filtros de Busca</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="documento" className="block text-sm font-medium text-gray-700 mb-2">
                  Documento
                </label>
                <select
                  id="documento"
                  value={filtros.documento}
                  onChange={(e) => setFiltros({ ...filtros, documento: e.target.value as Documento | '' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cfo-500 focus:border-transparent"
                >
                  <option value="">Todos</option>
                  <option value="CEO">CEO - Código de Ética</option>
                  <option value="CPEO">CPEO - Código de Processo Ético</option>
                </select>
              </div>

              <div>
                <label htmlFor="tipo" className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Contribuição
                </label>
                <select
                  id="tipo"
                  value={filtros.tipo}
                  onChange={(e) => setFiltros({ ...filtros, tipo: e.target.value as TipoContribuicao | '' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cfo-500 focus:border-transparent"
                >
                  <option value="">Todos</option>
                  <option value="ALTERACAO">Alteração</option>
                  <option value="INCLUSAO">Inclusão</option>
                  <option value="EXCLUSAO">Exclusão</option>
                  <option value="COMENTARIO">Comentário</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={limparFiltros}
                  className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Limpar Filtros
                </button>
              </div>
            </div>
          </div>

          {/* Lista de Contribuições */}
          {loading ? (
            <div className="bg-white rounded-lg shadow-lg p-12 text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cfo-600 mx-auto mb-4"></div>
              <p className="text-gray-600 text-lg">Carregando contribuições...</p>
            </div>
          ) : contribuicoes.length === 0 ? (
            <div className="bg-white rounded-lg shadow-lg p-12 text-center">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-gray-500 text-lg mb-2">Nenhuma contribuição encontrada</p>
              <p className="text-gray-400 text-sm">Tente ajustar os filtros de busca</p>
            </div>
          ) : (
            <>
              {/* Cards de Contribuições */}
              <div className="space-y-4 mb-6">
                {contribuicoes.map((contrib) => (
                  <div
                    key={contrib.id}
                    className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow p-6 border border-gray-200"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="px-3 py-1 bg-cfo-100 text-cfo-800 rounded-full text-sm font-semibold">
                            {contrib.documento}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getTipoBadgeColor(contrib.tipo)}`}>
                            {getTipoLabel(contrib.tipo)}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">
                          {contrib.artigo}
                          {contrib.paragrafo_inciso_alinea && ` - ${contrib.paragrafo_inciso_alinea}`}
                        </h3>
                        <p className="text-sm text-gray-600">{contrib.titulo_capitulo}</p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-1">Texto Proposto:</p>
                      <p className="text-gray-800 bg-gray-50 p-3 rounded border border-gray-200 line-clamp-3">
                        {contrib.texto_proposto}
                      </p>
                    </div>

                    {/* Participante Info (sem dados sensíveis) */}
                    {contrib.participante && (
                      <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                        <div className="flex items-center text-sm text-gray-600">
                          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                          </svg>
                          <span>
                            {contrib.participante.nome_completo || contrib.participante.razao_social}
                            {' - '}
                            <span className="font-semibold">{contrib.participante.uf}</span>
                          </span>
                        </div>
                        <button
                          onClick={() => setSelectedContribuicao(contrib)}
                          className="text-cfo-600 hover:text-cfo-800 font-semibold text-sm flex items-center"
                        >
                          Ver Detalhes
                          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Paginação */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 bg-white rounded-lg shadow-md p-4">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md font-medium hover:bg-gray-50 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-400"
                  >
                    Anterior
                  </button>
                  <span className="text-sm text-gray-600 px-4">
                    Página {page} de {totalPages}
                  </span>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md font-medium hover:bg-gray-50 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-400"
                  >
                    Próxima
                  </button>
                </div>
              )}
            </>
          )}

          {/* Modal de Detalhes */}
          {selectedContribuicao && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
              <div className="bg-white rounded-xl p-6 max-w-3xl w-full my-8 shadow-2xl">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-2xl font-bold text-gray-900">Detalhes da Contribuição</h3>
                  <button
                    onClick={() => setSelectedContribuicao(null)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="flex gap-3">
                    <span className="px-3 py-1 bg-cfo-100 text-cfo-800 rounded-full text-sm font-semibold">
                      {selectedContribuicao.documento}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getTipoBadgeColor(selectedContribuicao.tipo)}`}>
                      {getTipoLabel(selectedContribuicao.tipo)}
                    </span>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-500">Título/Capítulo:</p>
                    <p className="text-gray-900 font-medium">{selectedContribuicao.titulo_capitulo}</p>
                  </div>

                  {selectedContribuicao.secao && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Seção:</p>
                      <p className="text-gray-900">{selectedContribuicao.secao}</p>
                    </div>
                  )}

                  <div>
                    <p className="text-sm font-medium text-gray-500">Artigo:</p>
                    <p className="text-gray-900 font-medium">{selectedContribuicao.artigo}</p>
                  </div>

                  {selectedContribuicao.paragrafo_inciso_alinea && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Parágrafo/Inciso/Alínea:</p>
                      <p className="text-gray-900">{selectedContribuicao.paragrafo_inciso_alinea}</p>
                    </div>
                  )}

                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-2">Texto Proposto:</p>
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-gray-800 whitespace-pre-wrap">{selectedContribuicao.texto_proposto}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-2">Fundamentação:</p>
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-gray-800 whitespace-pre-wrap">{selectedContribuicao.fundamentacao}</p>
                    </div>
                  </div>

                  {selectedContribuicao.participante && (
                    <div className="p-4 bg-cfo-50 border border-cfo-200 rounded-lg">
                      <p className="text-sm font-medium text-cfo-900 mb-1">Participante:</p>
                      <p className="text-cfo-800">
                        {selectedContribuicao.participante.nome_completo || selectedContribuicao.participante.razao_social}
                        {' - '}
                        <span className="font-semibold">{selectedContribuicao.participante.uf}</span>
                      </p>
                    </div>
                  )}

                  <div className="text-xs text-gray-500 pt-3 border-t border-gray-200">
                    Publicado em {new Date(selectedContribuicao.criado_em).toLocaleString('pt-BR')}
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => setSelectedContribuicao(null)}
                    className="px-6 py-3 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-cfo-900 via-cfo-800 to-cfo-900 text-white py-8 mt-12 border-t-4 border-cfo-600">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p className="text-sm text-cfo-100">
              © {new Date().getFullYear()} Conselho Federal de Odontologia - Todos os direitos reservados
            </p>
            <p className="text-xs text-cfo-200 mt-2">
              Sistema em conformidade com a LGPD e Lei de Acesso à Informação
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
