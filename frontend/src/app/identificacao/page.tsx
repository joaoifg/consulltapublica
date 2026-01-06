'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { UFS, CATEGORIAS_PF, NATUREZAS_PJ } from '@/types'
import type { ParticipantePF, ParticipantePJ, TipoParticipante } from '@/types'
import { formatCPF, formatCNPJ, validarCPF, validarCNPJ, formatApiError } from '@/lib/utils'

export default function Identificacao() {
  const router = useRouter()
  const [tipoParticipante, setTipoParticipante] = useState<TipoParticipante | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Estados para PF
  const [pf, setPF] = useState<ParticipantePF>({
    nome_completo: '',
    cpf: '',
    email: '',
    uf: '',
    categoria: '',
    consentimento_lgpd: false,
  })

  // Estados para PJ
  const [pj, setPJ] = useState<ParticipantePJ>({
    razao_social: '',
    cnpj: '',
    natureza_entidade: '',
    nome_responsavel_legal: '',
    cpf_responsavel: '',
    email: '',
    uf: '',
    consentimento_lgpd: false,
  })

  const handleSubmitPF = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validações
    if (!validarCPF(pf.cpf)) {
      setError('CPF inválido')
      return
    }

    if (!pf.consentimento_lgpd) {
      setError('É necessário consentir com os termos LGPD')
      return
    }

    setLoading(true)

    try {
      const response = await api.post('/identificacao/pessoa-fisica', {
        ...pf,
        cpf: pf.cpf.replace(/\D/g, ''),
      })

      // Salva token e informações
      localStorage.setItem('cfo_token', response.data.token)
      localStorage.setItem('cfo_participante', JSON.stringify({
        id: response.data.participante_id,
        nome: response.data.nome,
        tipo: 'PESSOA_FISICA'
      }))

      router.push('/contribuicao')
    } catch (err: any) {
      setError(formatApiError(err) || 'Erro ao realizar identificação')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitPJ = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validações
    if (!validarCNPJ(pj.cnpj)) {
      setError('CNPJ inválido')
      return
    }

    if (!validarCPF(pj.cpf_responsavel)) {
      setError('CPF do responsável legal inválido')
      return
    }

    if (!pj.consentimento_lgpd) {
      setError('É necessário consentir com os termos LGPD')
      return
    }

    setLoading(true)

    try {
      const response = await api.post('/identificacao/pessoa-juridica', {
        ...pj,
        cnpj: pj.cnpj.replace(/\D/g, ''),
        cpf_responsavel: pj.cpf_responsavel.replace(/\D/g, ''),
      })

      localStorage.setItem('cfo_token', response.data.token)
      localStorage.setItem('cfo_participante', JSON.stringify({
        id: response.data.participante_id,
        razao_social: response.data.razao_social,
        tipo: 'PESSOA_JURIDICA'
      }))

      router.push('/contribuicao')
    } catch (err: any) {
      setError(formatApiError(err) || 'Erro ao realizar identificação')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-cfo-900 to-cfo-950 text-white py-6 shadow-lg">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold">Identificação do Participante</h1>
          <p className="text-cfo-100 mt-1">Etapa obrigatória para envio de contribuições</p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Seleção de Tipo */}
          {!tipoParticipante && (
            <div className="bg-white rounded-lg shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Você é Pessoa Física ou Jurídica?
              </h2>

              <div className="space-y-4">
                <button
                  onClick={() => setTipoParticipante('PESSOA_FISICA')}
                  className="w-full p-6 border-2 border-gray-300 rounded-lg hover:border-cfo-500 hover:bg-cfo-50 transition-colors text-left"
                >
                  <div className="font-bold text-lg text-gray-900">Pessoa Física</div>
                  <div className="text-sm text-gray-600 mt-1">
                    Cirurgião-dentista, estudante, pesquisador, cidadão
                  </div>
                </button>

                <button
                  onClick={() => setTipoParticipante('PESSOA_JURIDICA')}
                  className="w-full p-6 border-2 border-gray-300 rounded-lg hover:border-cfo-500 hover:bg-cfo-50 transition-colors text-left"
                >
                  <div className="font-bold text-lg text-gray-900">Pessoa Jurídica</div>
                  <div className="text-sm text-gray-600 mt-1">
                    Conselho, associação, instituição, empresa, órgão público
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Formulário Pessoa Física */}
          {tipoParticipante === 'PESSOA_FISICA' && (
            <div className="bg-white rounded-lg shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Identificação - Pessoa Física
              </h2>

              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded text-red-700">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmitPF} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    required
                    value={pf.nome_completo}
                    onChange={(e) => setPF({...pf, nome_completo: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cfo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CPF *
                  </label>
                  <input
                    type="text"
                    required
                    value={pf.cpf}
                    onChange={(e) => setPF({...pf, cpf: formatCPF(e.target.value)})}
                    placeholder="000.000.000-00"
                    maxLength={14}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cfo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    E-mail *
                  </label>
                  <input
                    type="email"
                    required
                    value={pf.email}
                    onChange={(e) => setPF({...pf, email: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cfo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    UF *
                  </label>
                  <select
                    required
                    value={pf.uf}
                    onChange={(e) => setPF({...pf, uf: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cfo-500 focus:border-transparent"
                  >
                    <option value="">Selecione...</option>
                    {UFS.map(uf => (
                      <option key={uf} value={uf}>{uf}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Categoria (Opcional)
                  </label>
                  <select
                    value={pf.categoria}
                    onChange={(e) => setPF({...pf, categoria: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cfo-500 focus:border-transparent"
                  >
                    <option value="">Não informar</option>
                    {CATEGORIAS_PF.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>

                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <label className="flex items-start">
                    <input
                      type="checkbox"
                      required
                      checked={pf.consentimento_lgpd}
                      onChange={(e) => setPF({...pf, consentimento_lgpd: e.target.checked})}
                      className="mt-1 mr-3"
                    />
                    <span className="text-sm text-gray-700">
                      Declaro que as informações prestadas são verdadeiras e estou ciente de que
                      <strong> minha contribuição será pública</strong>, nos termos da Consulta Pública do CFO.
                      Meus dados pessoais (CPF e e-mail) não serão divulgados, conforme LGPD. *
                    </span>
                  </label>
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setTipoParticipante(null)}
                    className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Voltar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-cfo-600 to-cfo-700 text-white py-3 px-6 rounded-lg font-semibold hover:from-cfo-700 hover:to-cfo-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all"
                  >
                    {loading ? 'Processando...' : 'Confirmar identificação e prosseguir'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Formulário Pessoa Jurídica */}
          {tipoParticipante === 'PESSOA_JURIDICA' && (
            <div className="bg-white rounded-lg shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Identificação - Pessoa Jurídica
              </h2>

              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded text-red-700">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmitPJ} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Razão Social *
                  </label>
                  <input
                    type="text"
                    required
                    value={pj.razao_social}
                    onChange={(e) => setPJ({...pj, razao_social: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cfo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CNPJ *
                  </label>
                  <input
                    type="text"
                    required
                    value={pj.cnpj}
                    onChange={(e) => setPJ({...pj, cnpj: formatCNPJ(e.target.value)})}
                    placeholder="00.000.000/0000-00"
                    maxLength={18}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cfo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Natureza da Entidade *
                  </label>
                  <select
                    required
                    value={pj.natureza_entidade}
                    onChange={(e) => setPJ({...pj, natureza_entidade: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cfo-500 focus:border-transparent"
                  >
                    <option value="">Selecione...</option>
                    {NATUREZAS_PJ.map(nat => (
                      <option key={nat.value} value={nat.value}>{nat.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome do Responsável Legal *
                  </label>
                  <input
                    type="text"
                    required
                    value={pj.nome_responsavel_legal}
                    onChange={(e) => setPJ({...pj, nome_responsavel_legal: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cfo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CPF do Responsável Legal *
                  </label>
                  <input
                    type="text"
                    required
                    value={pj.cpf_responsavel}
                    onChange={(e) => setPJ({...pj, cpf_responsavel: formatCPF(e.target.value)})}
                    placeholder="000.000.000-00"
                    maxLength={14}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cfo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    E-mail do Responsável Legal *
                  </label>
                  <input
                    type="email"
                    required
                    value={pj.email}
                    onChange={(e) => setPJ({...pj, email: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cfo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    UF da Sede *
                  </label>
                  <select
                    required
                    value={pj.uf}
                    onChange={(e) => setPJ({...pj, uf: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cfo-500 focus:border-transparent"
                  >
                    <option value="">Selecione...</option>
                    {UFS.map(uf => (
                      <option key={uf} value={uf}>{uf}</option>
                    ))}
                  </select>
                </div>

                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <label className="flex items-start">
                    <input
                      type="checkbox"
                      required
                      checked={pj.consentimento_lgpd}
                      onChange={(e) => setPJ({...pj, consentimento_lgpd: e.target.checked})}
                      className="mt-1 mr-3"
                    />
                    <span className="text-sm text-gray-700">
                      Declaro que as informações prestadas são verdadeiras e estou ciente de que
                      <strong> as contribuições serão públicas</strong>, nos termos da Consulta Pública do CFO.
                      Dados pessoais (CNPJ, CPF e e-mail) não serão divulgados, conforme LGPD. *
                    </span>
                  </label>
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setTipoParticipante(null)}
                    className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Voltar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-cfo-600 to-cfo-700 text-white py-3 px-6 rounded-lg font-semibold hover:from-cfo-700 hover:to-cfo-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all"
                  >
                    {loading ? 'Processando...' : 'Confirmar identificação e prosseguir'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
