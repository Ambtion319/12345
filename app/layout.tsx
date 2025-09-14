import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'UWorld Replica - Medical Exam Preparation Platform',
  description: 'Practice medical exam questions with UWorld-style interface, analytics, and AI-powered explanations.',
  keywords: ['medical exam', 'USMLE', 'PLAB', 'question bank', 'medical education'],
  authors: [{ name: 'Bossx2' }],
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full antialiased`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
