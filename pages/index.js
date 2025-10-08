export default function Home() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ color: '#0070f3', marginBottom: '1rem' }}>
        Welcome to AdGen AI! 🚀
      </h1>
      <p>Homepage live and kicking. 404? What 404?</p>
      <p>Built with Next.js on Netlify — {new Date().toLocaleDateString()}</p>
    </div>
  );
}
