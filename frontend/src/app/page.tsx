'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import type { Documento } from '@/types'

export default function Home() {
  const router = useRouter()
  const [documento, setDocumento] = useState<Documento | null>(null)
  const [mostrarMinuta, setMostrarMinuta] = useState(false)
  const [documentoMinuta, setDocumentoMinuta] = useState<Documento | null>(null)

  const handleIniciar = () => {
    if (documento) {
      localStorage.setItem('cfo_documento', documento)
      router.push('/identificacao')
    }
  }

  const handleVerMinuta = (doc: Documento) => {
    setDocumentoMinuta(doc)
    setMostrarMinuta(true)
  }

  const documentos = {
    CEO: {
      nome: 'Código de Ética Odontológica (CEO)',
      descricao: 'Normas e princípios éticos que regem o exercício da profissão odontológica',
      arquivo: '/minutas/CEO.pdf',
      docx: '/minutas/CEO.docx'
    },
    CPEO: {
      nome: 'Código de Processo Ético Odontológico (CPEO)',
      descricao: 'Procedimentos para apuração de infrações éticas, garantindo o devido processo legal',
      arquivo: '/minutas/CPEO.pdf',
      docx: '/minutas/CPEO.docx'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header CFO Moderno */}
      <header className="bg-gradient-to-r from-cfo-900 via-cfo-800 to-cfo-900 text-white shadow-2xl sticky top-0 z-50 backdrop-blur-sm bg-opacity-95">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Logo CFO */}
              <div className="flex items-center">
                <Image
                  src="/logo.png"
                  alt="CFO Logo"
                  width={80}
                  height={80}
                  className="object-contain"
                  style={{ filter: 'brightness(0) invert(1)' }}
                />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold">Conselho Federal de Odontologia</h1>
                <p className="text-cfo-200 text-xs md:text-sm mt-0.5">Consulta Pública</p>
              </div>
            </div>
            <div className="hidden lg:flex items-center space-x-6 text-sm">
              <a href="mailto:ouvidoria@cfo.org.br" className="flex items-center space-x-2 hover:text-cfo-200 transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                </svg>
                <span>ouvidoria@cfo.org.br</span>
              </a>
              <a href="tel:08000004499" className="flex items-center space-x-2 hover:text-cfo-200 transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
                </svg>
                <span>0800 000 4499</span>
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section Moderno */}
      <section className="relative bg-gradient-to-br from-cfo-900 via-cfo-800 to-cfo-900 text-white py-20 md:py-28 overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-70 h-70 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-70 h-70 bg-white rounded-full blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-block mb-6 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full border border-white/30">
              <span className="text-sm font-semibold">Consulta Pública Nacional</span>
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              Sua Opinião
              <span className="block text-cfo-200">Transforma a Odontologia</span>
            </h1>
            <p className="text-xl md:text-2xl text-cfo-100 mb-8 max-w-2xl mx-auto leading-relaxed">
              Participe da construção dos novos Códigos de Ética e Processo Ético Odontológico.
              <span className="block mt-2 text-lg">Sua contribuição é fundamental para o futuro da profissão.</span>
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={() => handleVerMinuta('CEO')}
                className="px-8 py-4 bg-white text-cfo-900 rounded-xl font-bold text-lg hover:bg-cfo-50 transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-1"
              >
                Ver Minuta CEO
              </button>
              <button
                onClick={() => handleVerMinuta('CPEO')}
                className="px-8 py-4 bg-cfo-700 text-white rounded-xl font-bold text-lg hover:bg-cfo-600 transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-1 border border-white/20"
              >
                Ver Minuta CPEO
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Seção de Visualização da Minuta */}
      {mostrarMinuta && documentoMinuta && (
        <section className="bg-white py-12 border-y-4 border-cfo-600">
          <div className="container mx-auto px-4">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                    {documentos[documentoMinuta as keyof typeof documentos].nome}
                  </h2>
                  <p className="text-gray-600">{documentos[documentoMinuta as keyof typeof documentos].descricao}</p>
                </div>
                <button
                  onClick={() => setMostrarMinuta(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  aria-label="Fechar visualização"
                >
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Ações Rápidas */}
              <div className="flex flex-wrap gap-4 mb-6">
                <a
                  href={documentos[documentoMinuta as keyof typeof documentos].arquivo}
                  download
                  className="inline-flex items-center px-6 py-3 bg-cfo-600 text-white rounded-lg hover:bg-cfo-700 transition-all shadow-lg hover:shadow-xl"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Baixar PDF
                </a>
                <button
                  onClick={() => {
                    setDocumento(documentoMinuta)
                    setMostrarMinuta(false)
                    setTimeout(() => {
                      document.getElementById('contribuir-section')?.scrollIntoView({ behavior: 'smooth' })
                    }, 100)
                  }}
                  className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all shadow-lg hover:shadow-xl"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Dar Minha Opinião
                </button>
              </div>

              {/* Visualizador de PDF */}
              <div className="bg-gray-100 rounded-xl shadow-2xl overflow-hidden border-4 border-gray-200">
                <div className="bg-gray-200 px-4 py-2 flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-700">Visualização da Minuta</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-600">Documento: {documentoMinuta}</span>
                  </div>
                </div>
                <div className="bg-white" style={{ minHeight: '700px', height: '70vh' }}>
                  <iframe
                    src={`${documentos[documentoMinuta as keyof typeof documentos].arquivo}#toolbar=1&navpanes=1&scrollbar=1`}
                    className="w-full h-full"
                    style={{ minHeight: '700px', height: '70vh' }}
                    title={`Visualização da minuta - ${documentos[documentoMinuta as keyof typeof documentos].nome}`}
                  >
                    <div className="p-8 text-center">
                      <p className="text-gray-600 mb-4">
                        Seu navegador não suporta visualização de PDFs.
                      </p>
                      <a
                        href={documentos[documentoMinuta as keyof typeof documentos].arquivo}
                        download
                        className="inline-flex items-center px-6 py-3 bg-cfo-600 text-white rounded-lg hover:bg-cfo-700 transition-colors"
                      >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Clique aqui para baixar o arquivo
                      </a>
                    </div>
                  </iframe>
                </div>
              </div>

              {/* Aviso */}
              <div className="mt-6 bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>💡 Dica:</strong> Após ler a minuta, você pode enviar suas contribuições específicas vinculadas aos artigos. 
                  Todas as contribuições são públicas e transparentes, respeitando a LGPD.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">

          {/* Cards Informativos Modernos */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="group bg-white rounded-2xl shadow-xl p-8 border-t-4 border-cfo-600 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
              <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-cfo-100 to-cfo-200 rounded-2xl mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-cfo-700" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"/>
                </svg>
              </div>
              <h3 className="font-bold text-xl text-gray-900 mb-3">Contribuições Estruturadas</h3>
              <p className="text-gray-600 leading-relaxed">
                Envie sugestões específicas vinculadas a artigos, com fundamentação técnica e jurídica sólida.
              </p>
            </div>

            <div className="group bg-white rounded-2xl shadow-xl p-8 border-t-4 border-cfo-600 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
              <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-cfo-100 to-cfo-200 rounded-2xl mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-cfo-700" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
              </div>
              <h3 className="font-bold text-xl text-gray-900 mb-3">Segurança LGPD</h3>
              <p className="text-gray-600 leading-relaxed">
                Dados pessoais protegidos por criptografia. Contribuições públicas sem exposição de informações sensíveis.
              </p>
            </div>

            <div className="group bg-white rounded-2xl shadow-xl p-8 border-t-4 border-cfo-600 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
              <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-cfo-100 to-cfo-200 rounded-2xl mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-cfo-700" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
                </svg>
              </div>
              <h3 className="font-bold text-xl text-gray-900 mb-3">Protocolo Único</h3>
              <p className="text-gray-600 leading-relaxed">
                Receba protocolo de confirmação para acompanhar suas contribuições e garantir total transparência.
              </p>
            </div>
          </div>

          {/* Seção Principal - Escolha do Documento */}
          <div id="contribuir-section" className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 border border-gray-100">
            <div className="text-center mb-10">
              <div className="inline-block mb-4 px-4 py-2 bg-cfo-100 text-cfo-900 rounded-full font-semibold">
                Participe Agora
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Como Participar?
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Escolha o documento que deseja comentar e siga os passos para enviar suas contribuições.
                <span className="block mt-2">Todo o processo é seguro, rastreável e transparente.</span>
              </p>
            </div>

            {/* Passos Modernos */}
            <div className="grid md:grid-cols-4 gap-6 mb-12">
              <div className="text-center group">
                <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-cfo-600 to-cfo-700 text-white rounded-2xl mx-auto mb-4 font-bold text-2xl shadow-lg group-hover:scale-110 transition-transform">
                  1
                </div>
                <p className="text-base font-semibold text-gray-800">Escolha o documento</p>
                <p className="text-sm text-gray-500 mt-1">Selecione CEO ou CPEO</p>
              </div>
              <div className="text-center group">
                <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-cfo-600 to-cfo-700 text-white rounded-2xl mx-auto mb-4 font-bold text-2xl shadow-lg group-hover:scale-110 transition-transform">
                  2
                </div>
                <p className="text-base font-semibold text-gray-800">Identifique-se</p>
                <p className="text-sm text-gray-500 mt-1">Dados seguros e protegidos</p>
              </div>
              <div className="text-center group">
                <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-cfo-600 to-cfo-700 text-white rounded-2xl mx-auto mb-4 font-bold text-2xl shadow-lg group-hover:scale-110 transition-transform">
                  3
                </div>
                <p className="text-base font-semibold text-gray-800">Envie contribuições</p>
                <p className="text-sm text-gray-500 mt-1">Sugestões fundamentadas</p>
              </div>
              <div className="text-center group">
                <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-cfo-600 to-cfo-700 text-white rounded-2xl mx-auto mb-4 font-bold text-2xl shadow-lg group-hover:scale-110 transition-transform">
                  4
                </div>
                <p className="text-base font-semibold text-gray-800">Receba protocolo</p>
                <p className="text-sm text-gray-500 mt-1">Acompanhe sua participação</p>
              </div>
            </div>

            <div className="border-t-2 border-gray-100 pt-10">
              <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
                Selecione o documento para contribuir:
              </h3>

              <div className="grid md:grid-cols-2 gap-6 mb-10">
                {/* CEO */}
                <label
                  className="relative block cursor-pointer group"
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
                    className={`p-8 rounded-2xl border-2 transition-all duration-300 ${
                      documento === 'CEO'
                        ? 'border-cfo-600 bg-gradient-to-br from-cfo-50 to-white shadow-2xl scale-105'
                        : 'border-gray-200 bg-white hover:border-cfo-400 hover:shadow-xl hover:scale-[1.02]'
                    }`}
                  >
                    <div className="flex items-start">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full border-2 mr-5 mt-1 flex items-center justify-center transition-all ${
                        documento === 'CEO'
                          ? 'border-cfo-600 bg-cfo-600 shadow-lg'
                          : 'border-gray-300 bg-white group-hover:border-cfo-400'
                      }`}>
                        {documento === 'CEO' && (
                          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                          </svg>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-xl text-gray-900 mb-3 flex items-center">
                          Código de Ética Odontológica (CEO)
                          {documento === 'CEO' && (
                            <span className="ml-2 px-2 py-1 bg-cfo-600 text-white text-xs rounded-full">Selecionado</span>
                          )}
                        </div>
                        <div className="text-sm text-gray-600 leading-relaxed">
                          Normas e princípios éticos que regem o exercício da profissão odontológica,
                          estabelecendo direitos e deveres dos profissionais.
                        </div>
                        <button
                          type="button"
                          onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                            e.preventDefault()
                            handleVerMinuta('CEO')
                          }}
                          className="mt-4 text-cfo-600 hover:text-cfo-700 font-semibold text-sm flex items-center"
                        >
                          Ver minuta completa
                          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </label>

                {/* CPEO */}
                <label
                  className="relative block cursor-pointer group"
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
                    className={`p-8 rounded-2xl border-2 transition-all duration-300 ${
                      documento === 'CPEO'
                        ? 'border-cfo-600 bg-gradient-to-br from-cfo-50 to-white shadow-2xl scale-105'
                        : 'border-gray-200 bg-white hover:border-cfo-400 hover:shadow-xl hover:scale-[1.02]'
                    }`}
                  >
                    <div className="flex items-start">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full border-2 mr-5 mt-1 flex items-center justify-center transition-all ${
                        documento === 'CPEO'
                          ? 'border-cfo-600 bg-cfo-600 shadow-lg'
                          : 'border-gray-300 bg-white group-hover:border-cfo-400'
                      }`}>
                        {documento === 'CPEO' && (
                          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                          </svg>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-xl text-gray-900 mb-3 flex items-center">
                          Código de Processo Ético Odontológico (CPEO)
                          {documento === 'CPEO' && (
                            <span className="ml-2 px-2 py-1 bg-cfo-600 text-white text-xs rounded-full">Selecionado</span>
                          )}
                        </div>
                        <div className="text-sm text-gray-600 leading-relaxed">
                          Procedimentos para apuração de infrações éticas, garantindo o devido processo
                          legal e a defesa dos profissionais.
                        </div>
                        <button
                          type="button"
                          onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                            e.preventDefault()
                            handleVerMinuta('CPEO')
                          }}
                          className="mt-4 text-cfo-600 hover:text-cfo-700 font-semibold text-sm flex items-center"
                        >
                          Ver minuta completa
                          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </label>
              </div>

              {/* Botão Iniciar */}
              <button
                onClick={handleIniciar}
                disabled={!documento}
                className={`w-full py-5 px-8 rounded-2xl font-bold text-xl transition-all duration-300 ${
                  documento
                    ? 'bg-gradient-to-r from-cfo-600 via-cfo-700 to-cfo-600 hover:from-cfo-700 hover:via-cfo-800 hover:to-cfo-700 text-white shadow-2xl hover:shadow-2xl transform hover:-translate-y-1 hover:scale-[1.02]'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                {documento ? (
                  <span className="flex items-center justify-center">
                    <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                    Iniciar Contribuição
                  </span>
                ) : (
                  'Selecione um documento para continuar'
                )}
              </button>
            </div>

            {/* Seção LGPD Moderna e Visual */}
            <div className="mt-10 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-2xl shadow-xl border-2 border-blue-200 overflow-hidden">
              <div className="p-8 md:p-10">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                  {/* Ícone Principal - Escudo de Proteção */}
                  <div className="flex-shrink-0">
                    <div className="relative">
                      <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg transform rotate-[-5deg] hover:rotate-0 transition-transform duration-300">
                        <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      </div>
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-md">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Conteúdo */}
                  <div className="flex-1 text-center md:text-left">
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-4">
                      <h3 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
                        <span className="text-3xl">🔒</span>
                        Proteção de Dados
                      </h3>
                      <span className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-full uppercase tracking-wide">
                        LGPD
                      </span>
                    </div>
                    
                    <div className="space-y-3 text-gray-700">
                      <p className="text-base leading-relaxed">
                        Seus dados estão <strong className="text-blue-700">protegidos e criptografados</strong> conforme a 
                        <strong className="text-indigo-700"> Lei Geral de Proteção de Dados (LGPD)</strong>.
                      </p>
                      
                      <div className="grid md:grid-cols-2 gap-4 mt-6">
                        <div className="flex items-start gap-3 p-4 bg-white/60 rounded-xl backdrop-blur-sm">
                          <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 text-sm mb-1">Contribuições Públicas</p>
                            <p className="text-xs text-gray-600">Suas sugestões serão visíveis publicamente</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3 p-4 bg-white/60 rounded-xl backdrop-blur-sm">
                          <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 text-sm mb-1">Dados Protegidos</p>
                            <p className="text-xs text-gray-600">CPF, CNPJ e e-mail não serão divulgados</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Barra Inferior com Badge de Conformidade */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-4 flex flex-wrap items-center justify-center gap-4 text-white text-sm">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  <span className="font-semibold">100% Conforme LGPD</span>
                </div>
                <span className="hidden md:inline">•</span>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
                  </svg>
                  <span>Criptografia AES-256</span>
                </div>
                <span className="hidden md:inline">•</span>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  <span>Uso exclusivo desta consulta</span>
                </div>
              </div>
            </div>
          </div>

          {/* Links Úteis */}
          <div className="mt-12 bg-gradient-to-br from-gray-50 to-white rounded-3xl shadow-xl p-8 border border-gray-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Links Úteis</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <Link
                href="/contribuicoes"
                className="flex items-center justify-center px-6 py-4 bg-white border-2 border-cfo-200 text-cfo-700 rounded-xl hover:bg-cfo-50 hover:border-cfo-400 transition-all font-semibold shadow-md hover:shadow-lg"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
                Ver Contribuições Públicas
              </Link>
              
              <a
                href="https://cfo.org.br"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center px-6 py-4 bg-white border-2 border-cfo-200 text-cfo-700 rounded-xl hover:bg-cfo-50 hover:border-cfo-400 transition-all font-semibold shadow-md hover:shadow-lg"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd"/>
                </svg>
                Site Oficial do CFO
              </a>

              <Link
                href="/minuta?documento=CEO"
                className="flex items-center justify-center px-6 py-4 bg-white border-2 border-cfo-200 text-cfo-700 rounded-xl hover:bg-cfo-50 hover:border-cfo-400 transition-all font-semibold shadow-md hover:shadow-lg"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Página de Minutas
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Moderno */}
      <footer className="bg-gradient-to-br from-cfo-900 via-cfo-800 to-cfo-900 text-white py-12 mt-20 border-t-4 border-cfo-600">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-10 mb-8">
            <div>
              <h3 className="font-bold text-xl mb-4 flex items-center">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mr-3">
                  <span className="text-cfo-900 font-bold">CFO</span>
                </div>
                Conselho Federal de Odontologia
              </h3>
              <p className="text-cfo-100 text-sm leading-relaxed">
                Autarquia federal que regulamenta e fiscaliza o exercício da odontologia no Brasil,
                promovendo a ética e a qualidade dos serviços odontológicos.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">Contato</h3>
              <ul className="text-cfo-100 text-sm space-y-3">
                <li className="flex items-center">
                  <svg className="w-5 h-5 mr-3 text-cfo-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
                  </svg>
                  Brasília - DF
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 mr-3 text-cfo-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
                  </svg>
                  <a href="tel:08000004499" className="hover:text-white">0800 000 4499</a>
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 mr-3 text-cfo-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                  </svg>
                  <a href="mailto:ouvidoria@cfo.org.br" className="hover:text-white">ouvidoria@cfo.org.br</a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">Transparência</h3>
              <ul className="text-cfo-100 text-sm space-y-3">
                <li>
                  <Link href="/contribuicoes" className="hover:text-white flex items-center">
                    <svg className="w-5 h-5 mr-3 text-cfo-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                      <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                    </svg>
                    Contribuições públicas
                  </Link>
                </li>
                <li>
                  <a href="https://cfo.org.br" target="_blank" rel="noopener noreferrer" className="hover:text-white flex items-center">
                    <svg className="w-5 h-5 mr-3 text-cfo-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd"/>
                    </svg>
                    Portal CFO
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-cfo-700 pt-8 text-center">
            <p className="text-sm text-cfo-100 mb-2">
              © {new Date().getFullYear()} Conselho Federal de Odontologia - Todos os direitos reservados
            </p>
            <p className="text-xs text-cfo-200">
              Sistema desenvolvido em conformidade com a LGPD e Lei de Acesso à Informação
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
