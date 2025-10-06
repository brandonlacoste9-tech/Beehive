import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />
        {/* SEO */}
        <meta name="description" content="AI-powered ad creative generator for marketers and brands." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#10B981" />
        {/* Open Graph */}
        <meta property="og:image" content="/og-image.png" />
        <meta property="og:title" content="AdGenXAI" />
        <meta property="og:description" content="Generate high-converting ad creatives with AI." />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}