import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AdGenXAI - AI-Powered Advertising Creative Platform',
  description: 'Transform your advertising with AI-generated creative in seconds.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
