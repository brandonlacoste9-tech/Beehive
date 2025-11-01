import dynamic from 'next/dynamic';

const AuroraEngine = dynamic(() => import('./components/AuroraEngine'), { ssr: false });

export default function Home() {
  return <AuroraEngine />;
}
