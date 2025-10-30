import { Html, Head, Main, NextScript } from 'next/document';

/**
 * AdGenXAI Custom Document
 *
 * Customizes the HTML document structure
 */

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@600;700;800&display=swap"
          rel="stylesheet"
        />

        {/* Meta Tags */}
        <meta name="theme-color" content="#0ea5e9" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="AdGenXAI" />
        <meta property="og:title" content="AdGenXAI - AI-Powered Advertising Creative Platform" />
        <meta property="og:description" content="Generate compelling ad creative with AI. Powered by Google Gemini and AI Sensory Cortex." />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="AdGenXAI - AI Ad Creative Generator" />
        <meta name="twitter:description" content="Generate compelling ad creative in seconds with AI" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
