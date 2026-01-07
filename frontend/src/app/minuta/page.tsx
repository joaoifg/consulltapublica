'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function MinutaPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const documento = searchParams.get('documento') || 'CPEO'
  
  const [loading, setLoading] = useState(false)

  const documentos = {
    CEO: {
      nome: 'Código de Ética Odontológica (CEO)',
      descricao: 'Normas e princípios éticos da profissão odontológica',
      arquivo: '/minutas/CEO.pdf', // Você pode converter o DOCX para PDF
      docx: '/minutas/CEO.docx'
    },
    CPEO: {
      nome: 'Código de Processo Ético Odontológico (CPEO)',
      descricao: 'Procedimentos para apuração de infrações éticas',
      arquivo: '/minutas/CPEO.pdf',
      docx: '/minutas/CPEO.docx'
    }
  }

  const doc = documentos[documento as keyof typeof documentos] || documentos.CPEO

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-cfo-800 to-cfo-900 text-white py-6 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Consulta da Minuta</h1>
              <p className="text-cfo-100 mt-1">{doc.nome}</p>
            </div>
            <Link
              href="/"
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
            >
              Voltar ao Início
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Informações do Documento */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{doc.nome}</h2>
            <p className="text-gray-600 mb-4">{doc.descricao}</p>
            
            <div className="flex flex-wrap gap-4">
              {/* Download PDF */}
              <a
                href={doc.arquivo}
                download
                className="inline-flex items-center px-6 py-3 bg-cfo-600 text-white rounded-lg hover:bg-cfo-700 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Baixar PDF
              </a>
              
              {/* Download DOCX */}
              <a
                href={doc.docx}
                download
                className="inline-flex items-center px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Baixar DOCX Original
              </a>

              {/* Botão para Contribuir */}
              <Link
                href={`/?documento=${documento}`}
                className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Enviar Contribuição
              </Link>
            </div>
          </div>

          {/* Visualizador de PDF */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Visualização da Minuta</h3>
            
            <div className="border-2 border-gray-200 rounded-lg overflow-hidden" style={{ minHeight: '600px' }}>
              <iframe
                src={doc.arquivo}
                className="w-full h-full"
                style={{ minHeight: '600px', border: 'none' }}
                title={`Visualização da minuta - ${doc.nome}`}
              />
            </div>
            <p className="mt-2 text-sm text-gray-600 text-center">
              Seu navegador não suporta visualização de PDFs?{' '}
              <a href={doc.arquivo} download className="text-cfo-600 underline hover:text-cfo-700">
                Clique aqui para baixar o arquivo
              </a>
            </p>
          </div>

          {/* Aviso */}
          <div className="mt-6 bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Importante:</strong> Esta é a minuta em consulta pública. 
              Para enviar contribuições, você precisa se identificar e seguir o fluxo de contribuição.
            </p>
          </div>

          {/* Seleção de Documento */}
          <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Consultar Outro Documento</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <Link
                href="/minuta?documento=CEO"
                className={`p-4 border-2 rounded-lg transition-colors ${
                  documento === 'CEO'
                    ? 'border-cfo-600 bg-cfo-50'
                    : 'border-gray-200 hover:border-cfo-300'
                }`}
              >
                <h4 className="font-semibold text-gray-900">Código de Ética Odontológica</h4>
                <p className="text-sm text-gray-600 mt-1">Normas e princípios éticos</p>
              </Link>
              
              <Link
                href="/minuta?documento=CPEO"
                className={`p-4 border-2 rounded-lg transition-colors ${
                  documento === 'CPEO'
                    ? 'border-cfo-600 bg-cfo-50'
                    : 'border-gray-200 hover:border-cfo-300'
                }`}
              >
                <h4 className="font-semibold text-gray-900">Código de Processo Ético Odontológico</h4>
                <p className="text-sm text-gray-600 mt-1">Procedimentos para apuração</p>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

