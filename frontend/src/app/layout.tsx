import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Consulta Pública CFO - Conselho Federal de Odontologia',
  description: 'Sistema de contribuições públicas para o Código de Ética e Código de Processo Ético Odontológico',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
