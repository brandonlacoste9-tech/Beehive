import type { ReactNode } from 'react';

export const metadata = {
  title: 'BeeHive Codex',
  description: 'Swarm rituals and persona pipelines',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
