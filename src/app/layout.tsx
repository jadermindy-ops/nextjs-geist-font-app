import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Controle de Uniformes',
  description: 'Sistema de gerenciamento de inventário de uniformes com OCR e relatórios',
  generator: 'Next.js',
  manifest: '/manifest.json',
  keywords: ['uniformes', 'inventário', 'estoque', 'OCR', 'relatórios', 'PWA'],
  authors: [
    { name: 'Sistema de Uniformes' }
  ],
  creator: 'Sistema de Uniformes',
  publisher: 'Sistema de Uniformes',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    siteName: 'Controle de Uniformes',
    title: {
      default: 'Controle de Uniformes',
      template: '%s - Controle de Uniformes'
    },
    description: 'Sistema de gerenciamento de inventário de uniformes com OCR e relatórios',
  },
  twitter: {
    card: 'summary',
    title: {
      default: 'Controle de Uniformes',
      template: '%s - Controle de Uniformes'
    },
    description: 'Sistema de gerenciamento de inventário de uniformes com OCR e relatórios',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Controle de Uniformes',
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#8c288a' },
    { media: '(prefers-color-scheme: dark)', color: '#8c288a' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icons/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Controle de Uniformes" />
        <meta name="application-name" content="Controle de Uniformes" />
        <meta name="msapplication-TileColor" content="#8c288a" />
        <meta name="msapplication-tap-highlight" content="no" />
        <meta name="theme-color" content="#8c288a" />
      </head>
      <body className={inter.className}>
        <div className="min-h-screen bg-white">
          {children}
        </div>
      </body>
    </html>
  )
}
