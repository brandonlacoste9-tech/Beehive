import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AdGenXAI - AI-Powered Advertising Creative Platform',
  description: 'Transform your advertising with AI-generated creative in seconds. Multi-persona targeting, streaming generation, and autonomous publishing.',
  keywords: [
    'AI advertising',
    'creative generation',
    'marketing automation',
    'ad copy generator',
    'social media marketing',
  ],
  authors: [{ name: 'AdGenXAI Team' }],
  openGraph: {
    title: 'AdGenXAI - AI-Powered Advertising Creative Platform',
    description: 'Generate high-converting ads with AI and multi-persona targeting',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='75' font-size='75'>🐝</text></svg>" />
      </head>
      <body className="bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-50">
        {children}
      </body>
    </html>
  );
}
