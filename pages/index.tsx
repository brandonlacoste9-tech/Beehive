export default function Home() {
  return (
    <main style={{ padding: 24, fontFamily: 'system-ui' }}>
      <h1>BeeHive online</h1>
      <p>Static export + Netlify Functions are wired.</p>
      <ul>
        <li><a href="/.netlify/functions/ritual-badge">ritual-badge</a></li>
        <li><a href="/.netlify/functions/ritual-ping">ritual-ping</a></li>
        <li><a href="/.netlify/functions/ritual-metrics">ritual-metrics</a></li>
      </ul>
    </main>
  );
}
