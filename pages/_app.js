import '../styles/globals.css';

/**
 * AdGenXAI Custom App Component
 *
 * Wraps all pages with global styles and providers
 */

export default function App({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />

      {/* Global Analytics Script Placeholder */}
      {process.env.NEXT_PUBLIC_ANALYTICS_ID && (
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Analytics initialization would go here
              console.log('Analytics ID:', '${process.env.NEXT_PUBLIC_ANALYTICS_ID}');
            `,
          }}
        />
      )}
    </>
  );
}
