import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'JD INTERNACIONAL',
  description: 'Plataforma Oficial - JD INTERNACIONAL',
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className="min-h-screen">
        {children}
      </body>
    </html>
  )
}
