'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { Documento } from '@/types'

export default function Home() {
  const router = useRouter()
  const [documento, setDocumento] = useState<Documento | null>(null)

  const handleIniciar = () => {
    if (documento) {
      localStorage.setItem('cfo_documento', documento)
      router.push('/identificacao')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header CFO */}
      <header className="bg-gradient-to-r from-cfo-900 to-cfo-950 text-white shadow-xl">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Logo CFO Simplificado */}
              <div className="flex items-center">
                <svg className="w-16 h-16" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="50" cy="50" r="45" stroke="white" strokeWidth="3" fill="none"/>
                  <text x="50" y="60" fontSize="40" fill="white" fontWeight="bold" textAnchor="middle" fontFamily="Arial">
                    CFO
                  </text>
                </svg>
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">Conselho Federal de Odontologia</h1>
                <p className="text-cfo-100 text-sm md:text-base mt-1">Sistema de Consulta Pública</p>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                </svg>
                <span>ouvidoria@cfo.org.br</span>
              </div>
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
                </svg>
                <span>0800 000 4499</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Banner Principal */}
      <div className="bg-gradient-to-r from-cfo-800 to-cfo-900 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Consulta Pública
          </h2>
          <p className="text-xl md:text-2xl text-cfo-50 mb-2">
            Novos Códigos de Ética e Processo Ético
          </p>
          <p className="text-lg text-cfo-100 max-w-3xl mx-auto">
            Sua voz é essencial para construir uma odontologia mais justa e ética.
            Participe e contribua para o futuro da profissão.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">

          {/* Cards Informativos */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-cfo-600">
              <div className="flex items-center justify-center w-12 h-12 bg-cfo-100 rounded-full mb-4">
                <svg className="w-6 h-6 text-cfo-700" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"/>
                </svg>
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Contribuições Estruturadas</h3>
              <p className="text-gray-600 text-sm">
                Envie sugestões específicas vinculadas a artigos, com fundamentação técnica e jurídica.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-cfo-600">
              <div className="flex items-center justify-center w-12 h-12 bg-cfo-100 rounded-full mb-4">
                <svg className="w-6 h-6 text-cfo-700" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Segurança LGPD</h3>
              <p className="text-gray-600 text-sm">
                Dados pessoais protegidos por criptografia. Contribuições públicas sem exposição de CPF/CNPJ.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-cfo-600">
              <div className="flex items-center justify-center w-12 h-12 bg-cfo-100 rounded-full mb-4">
                <svg className="w-6 h-6 text-cfo-700" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
                </svg>
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Protocolo Único</h3>
              <p className="text-gray-600 text-sm">
                Receba protocolo de confirmação para acompanhar suas contribuições e garantir transparência.
              </p>
            </div>
          </div>

          {/* Seção Principal - Escolha do Documento */}
          <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Como Participar?
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Escolha o documento que deseja comentar e siga os passos para enviar suas contribuições.
                Todo o processo é seguro, rastreável e transparente.
              </p>
            </div>

            {/* Passos */}
            <div className="grid md:grid-cols-4 gap-4 mb-10">
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-cfo-600 text-white rounded-full mx-auto mb-3 font-bold text-xl">
                  1
                </div>
                <p className="text-sm font-medium text-gray-700">Escolha o documento</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-cfo-600 text-white rounded-full mx-auto mb-3 font-bold text-xl">
                  2
                </div>
                <p className="text-sm font-medium text-gray-700">Identifique-se</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-cfo-600 text-white rounded-full mx-auto mb-3 font-bold text-xl">
                  3
                </div>
                <p className="text-sm font-medium text-gray-700">Envie contribuições</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-cfo-600 text-white rounded-full mx-auto mb-3 font-bold text-xl">
                  4
                </div>
                <p className="text-sm font-medium text-gray-700">Receba protocolo</p>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">
                Selecione o documento para contribuir:
              </h3>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                {/* CEO */}
                <label
                  className="relative block cursor-pointer group"
                  style={{ opacity: documento === 'CEO' ? 1 : 0.85 }}
                >
                  <input
                    type="radio"
                    name="documento"
                    value="CEO"
                    checked={documento === 'CEO'}
                    onChange={(e) => setDocumento(e.target.value as Documento)}
                    className="sr-only"
                  />
                  <div
                    className={`p-6 rounded-xl border-2 transition-all duration-200 ${
                      documento === 'CEO'
                        ? 'border-cfo-600 bg-cfo-50 shadow-lg'
                        : 'border-gray-200 bg-white hover:border-cfo-300 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-start">
                      <div className={`flex-shrink-0 w-6 h-6 rounded-full border-2 mr-4 mt-1 flex items-center justify-center ${
                        documento === 'CEO'
                          ? 'border-cfo-600 bg-cfo-600'
                          : 'border-gray-300 bg-white'
                      }`}>
                        {documento === 'CEO' && (
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                          </svg>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-lg text-gray-900 mb-2">
                          Código de Ética Odontológica (CEO)
                        </div>
                        <div className="text-sm text-gray-600">
                          Normas e princípios éticos que regem o exercício da profissão odontológica,
                          estabelecendo direitos e deveres dos profissionais.
                        </div>
                      </div>
                    </div>
                  </div>
                </label>

                {/* CPEO */}
                <label
                  className="relative block cursor-pointer group"
                  style={{ opacity: documento === 'CPEO' ? 1 : 0.85 }}
                >
                  <input
                    type="radio"
                    name="documento"
                    value="CPEO"
                    checked={documento === 'CPEO'}
                    onChange={(e) => setDocumento(e.target.value as Documento)}
                    className="sr-only"
                  />
                  <div
                    className={`p-6 rounded-xl border-2 transition-all duration-200 ${
                      documento === 'CPEO'
                        ? 'border-cfo-600 bg-cfo-50 shadow-lg'
                        : 'border-gray-200 bg-white hover:border-cfo-300 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-start">
                      <div className={`flex-shrink-0 w-6 h-6 rounded-full border-2 mr-4 mt-1 flex items-center justify-center ${
                        documento === 'CPEO'
                          ? 'border-cfo-600 bg-cfo-600'
                          : 'border-gray-300 bg-white'
                      }`}>
                        {documento === 'CPEO' && (
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                          </svg>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-lg text-gray-900 mb-2">
                          Código de Processo Ético Odontológico (CPEO)
                        </div>
                        <div className="text-sm text-gray-600">
                          Procedimentos para apuração de infrações éticas, garantindo o devido processo
                          legal e a defesa dos profissionais.
                        </div>
                      </div>
                    </div>
                  </div>
                </label>
              </div>

              {/* Botão Iniciar */}
              <button
                onClick={handleIniciar}
                disabled={!documento}
                className={`w-full py-4 px-8 rounded-xl font-bold text-lg transition-all duration-200 ${
                  documento
                    ? 'bg-gradient-to-r from-cfo-600 to-cfo-700 hover:from-cfo-700 hover:to-cfo-800 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                {documento ? 'Iniciar Contribuição' : 'Selecione um documento para continuar'}
              </button>
            </div>

            {/* Aviso LGPD */}
            <div className="mt-8 p-5 bg-amber-50 border-l-4 border-amber-400 rounded-r-lg">
              <div className="flex items-start">
                <svg className="w-6 h-6 text-amber-600 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
                </svg>
                <div>
                  <p className="text-sm font-semibold text-amber-900 mb-1">Proteção de Dados - LGPD</p>
                  <p className="text-xs text-amber-800 leading-relaxed">
                    Os dados fornecidos serão utilizados exclusivamente para esta consulta pública,
                    conforme a Lei Geral de Proteção de Dados (LGPD). Suas contribuições serão públicas,
                    mas dados sensíveis como CPF, CNPJ e e-mail <strong>não serão divulgados</strong>.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Links Adicionais */}
          <div className="mt-8 flex flex-wrap justify-center gap-6 text-center">
            <Link
              href="/contribuicoes"
              className="text-cfo-700 hover:text-cfo-800 font-semibold underline flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
              </svg>
              Ver contribuições públicas
            </Link>
            
            <Link
              href="/minuta?documento=CEO"
              className="text-cfo-700 hover:text-cfo-800 font-semibold underline flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Consultar Minuta CEO
            </Link>
            
            <Link
              href="/minuta?documento=CPEO"
              className="text-cfo-700 hover:text-cfo-800 font-semibold underline flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Consultar Minuta CPEO
            </Link>
            
            {/* Links para Consultar Minutas */}
            <div className="mt-4 flex flex-wrap gap-3 justify-center">
              <Link
                href="/minuta?documento=CEO"
                className="inline-flex items-center px-4 py-2 bg-white text-cfo-700 border border-cfo-300 rounded-lg hover:bg-cfo-50 transition-colors text-sm"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Consultar Minuta CEO
              </Link>
              <Link
                href="/minuta?documento=CPEO"
                className="inline-flex items-center px-4 py-2 bg-white text-cfo-700 border border-cfo-300 rounded-lg hover:bg-cfo-50 transition-colors text-sm"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Consultar Minuta CPEO
              </Link>
            </div>
            
            <Link
              className="inline-flex items-center px-6 py-3 bg-cfo-600 text-white rounded-lg font-semibold hover:bg-cfo-700 transition-colors mt-4"
              href="/contribuicoes"
              className="text-cfo-700 hover:text-cfo-800 font-semibold underline flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
              </svg>
              Ver contribuições públicas
            </a>
            <a
              href="https://cfo.org.br"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cfo-700 hover:text-cfo-800 font-semibold underline flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd"/>
              </svg>
              Site oficial do CFO
            </a>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 mb-6">
            <div>
              <h3 className="font-bold text-lg mb-3">Conselho Federal de Odontologia</h3>
              <p className="text-gray-400 text-sm">
                Autarquia federal que regulamenta e fiscaliza o exercício da odontologia no Brasil.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-3">Contato</h3>
              <ul className="text-gray-400 text-sm space-y-2">
                <li>📍 Brasília - DF</li>
                <li>📞 0800 000 4499</li>
                <li>✉️ ouvidoria@cfo.org.br</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-3">Transparência</h3>
              <ul className="text-gray-400 text-sm space-y-2">
                <li>
                  <a href="/contribuicoes" className="hover:text-white">Contribuições públicas</a>
                </li>
                <li>
                  <a href="https://cfo.org.br" target="_blank" rel="noopener noreferrer" className="hover:text-white">
                    Portal CFO
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6 text-center">
            <p className="text-sm text-gray-400">
              © {new Date().getFullYear()} Conselho Federal de Odontologia - Todos os direitos reservados
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Sistema desenvolvido em conformidade com a LGPD e Lei de Acesso à Informação
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
