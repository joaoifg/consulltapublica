'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { formatApiError } from '@/lib/utils'
import { TIPOS_CONTRIBUICAO } from '@/types'
import type { Contribuicao, ContribuicaoResponse, Protocolo } from '@/types'

export default function ContribuicaoPage() {
  const router = useRouter()
  const [documento, setDocumento] = useState<string>('')
  const [contribuicoes, setContribuicoes] = useState<ContribuicaoResponse[]>([])
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [protocolo, setProtocolo] = useState<Protocolo | null>(null)

  const [form, setForm] = useState<Contribuicao>({
    documento: 'CEO',
    titulo_capitulo: '',
    secao: '',
    artigo: '',
    paragrafo_inciso_alinea: '',
    tipo: 'ALTERACAO',
    texto_proposto: '',
    fundamentacao: '',
  })

  useEffect(() => {
    const doc = localStorage.getItem('cfo_documento')
    const token = localStorage.getItem('cfo_token')

    if (!doc || !token) {
      router.push('/')
      return
    }

    setDocumento(doc)
    setForm({...form, documento: doc as any})
    carregarContribuicoes()
  }, [])

  const carregarContribuicoes = async () => {
    try {
      const response = await api.get('/contribuicoes/minhas')
      setContribuicoes(response.data)
    } catch (err) {
      console.error('Erro ao carregar contribuições:', err)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      await api.post('/contribuicoes', form)

      // Limpa formulário
      setForm({
        ...form,
        titulo_capitulo: '',
        secao: '',
        artigo: '',
        paragrafo_inciso_alinea: '',
        texto_proposto: '',
        fundamentacao: '',
      })

      // Recarrega lista
      await carregarContribuicoes()
      setMostrarFormulario(false)

      alert('Contribuição adicionada com sucesso!')
    } catch (err: any) {
      setError(formatApiError(err) || 'Erro ao enviar contribuição')
    } finally {
      setLoading(false)
    }
  }

  const handleFinalizar = async () => {
    if (contribuicoes.length === 0) {
      alert('Você precisa adicionar pelo menos uma contribuição antes de finalizar')
      return
    }

    if (!confirm('Deseja finalizar e gerar o protocolo? Após finalizar, não será possível adicionar mais contribuições.')) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await api.post(`/protocolos/finalizar?documento=${documento}`)
      setProtocolo(response.data)
    } catch (err: any) {
      setError(formatApiError(err) || 'Erro ao finalizar contribuições')
    } finally {
      setLoading(false)
    }
  }

  // Tela de protocolo gerado
  if (protocolo) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-gradient-to-r from-green-700 to-green-800 text-white py-6 shadow-lg">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl font-bold">Contribuição Enviada com Sucesso!</h1>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-lg shadow-xl p-8">
              <div className="text-center mb-8">
                <div className="inline-block p-4 bg-green-100 rounded-full mb-4">
                  <svg className="w-16 h-16 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Contribuições Registradas!
                </h2>
                <p className="text-gray-600">
                  Suas contribuições foram recebidas e registradas com sucesso.
                </p>
              </div>

              <div className="border-t border-b border-gray-200 py-6 mb-6">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">Número do Protocolo:</p>
                  <p className="text-3xl font-bold text-cfo-700">{protocolo.numero_protocolo}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    {new Date(protocolo.criado_em).toLocaleString('pt-BR')}
                  </p>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <p className="text-sm font-medium text-gray-700">Documento:</p>
                  <p className="text-lg text-gray-900">{protocolo.documento}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700">Total de Contribuições:</p>
                  <p className="text-lg text-gray-900">{protocolo.total_contribuicoes}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700">Participante:</p>
                  <p className="text-lg text-gray-900">{protocolo.participante.nome} - {protocolo.participante.uf}</p>
                </div>
              </div>

              <div className="bg-cfo-50 border-l-4 border-cfo-600 p-4 mb-6">
                <p className="text-sm text-cfo-900">
                  <strong>Importante:</strong> Um e-mail de confirmação será enviado com os detalhes
                  do protocolo e suas contribuições. Guarde o número do protocolo para futuras consultas.
                </p>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => window.print()}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Imprimir Comprovante
                </button>
                <button
                  onClick={() => router.push('/')}
                  className="flex-1 bg-gradient-to-r from-cfo-600 to-cfo-700 text-white py-3 px-6 rounded-lg font-semibold hover:from-cfo-700 hover:to-cfo-800 transition-all"
                >
                  Voltar ao Início
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  // Tela de contribuição
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-cfo-900 to-cfo-950 text-white py-6 shadow-lg">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold">Enviar Contribuições</h1>
          <p className="text-cfo-100 mt-1">
            Documento: {documento === 'CEO' ? 'Código de Ética Odontológica' : 'Código de Processo Ético Odontológico'}
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
              {error}
            </div>
          )}

          {/* Contribuições Adicionadas */}
          {contribuicoes.length > 0 && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Contribuições Adicionadas ({contribuicoes.length})
              </h2>

              <div className="space-y-4">
                {contribuicoes.map((contrib, index) => (
                  <div key={contrib.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm font-medium text-cfo-700">
                        Contribuição #{index + 1}
                      </span>
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {contrib.tipo}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-900">{contrib.artigo}</p>
                    <p className="text-sm text-gray-600 mt-1">{contrib.titulo_capitulo}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Botões Ação */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            {!mostrarFormulario ? (
              <div className="flex gap-4">
                <button
                  onClick={() => setMostrarFormulario(true)}
                  className="flex-1 bg-gradient-to-r from-cfo-600 to-cfo-700 text-white py-3 px-6 rounded-lg font-semibold hover:from-cfo-700 hover:to-cfo-800 transition-all"
                >
                  Adicionar Nova Contribuição
                </button>

                {contribuicoes.length > 0 && (
                  <button
                    onClick={handleFinalizar}
                    disabled={loading}
                    className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-300"
                  >
                    {loading ? 'Processando...' : 'Finalizar e Gerar Protocolo'}
                  </button>
                )}
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Nova Contribuição</h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Título / Capítulo *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.titulo_capitulo}
                    onChange={(e) => setForm({...form, titulo_capitulo: e.target.value})}
                    placeholder="Ex: Capítulo III - Dos Deveres Fundamentais"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cfo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Seção (Opcional)
                  </label>
                  <input
                    type="text"
                    value={form.secao}
                    onChange={(e) => setForm({...form, secao: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cfo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Artigo *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.artigo}
                    onChange={(e) => setForm({...form, artigo: e.target.value})}
                    placeholder="Ex: Art. 7º"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cfo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Parágrafo / Inciso / Alínea (Opcional)
                  </label>
                  <input
                    type="text"
                    value={form.paragrafo_inciso_alinea}
                    onChange={(e) => setForm({...form, paragrafo_inciso_alinea: e.target.value})}
                    placeholder="Ex: inciso IV ou § 2º"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cfo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de Contribuição *
                  </label>
                  <select
                    required
                    value={form.tipo}
                    onChange={(e) => setForm({...form, tipo: e.target.value as any})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cfo-500"
                  >
                    {TIPOS_CONTRIBUICAO.map(tipo => (
                      <option key={tipo.value} value={tipo.value}>
                        {tipo.label} - {tipo.description}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Texto Proposto * (máx. 5.000 caracteres)
                  </label>
                  <textarea
                    required
                    value={form.texto_proposto}
                    onChange={(e) => setForm({...form, texto_proposto: e.target.value})}
                    maxLength={5000}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cfo-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {form.texto_proposto.length} / 5.000 caracteres
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fundamentação * (máx. 5.000 caracteres)
                  </label>
                  <textarea
                    required
                    value={form.fundamentacao}
                    onChange={(e) => setForm({...form, fundamentacao: e.target.value})}
                    maxLength={5000}
                    rows={4}
                    placeholder="Justifique sua contribuição, apresentando argumentos técnicos, jurídicos ou práticos"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cfo-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {form.fundamentacao.length} / 5.000 caracteres
                  </p>
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setMostrarFormulario(false)}
                    className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-cfo-600 to-cfo-700 text-white py-3 px-6 rounded-lg font-semibold hover:from-cfo-700 hover:to-cfo-800 transition-all disabled:bg-gray-300"
                  >
                    {loading ? 'Salvando...' : 'Adicionar Contribuição'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
