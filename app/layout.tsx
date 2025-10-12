// app/layout.tsx
import { ThemeProvider } from 'next-themes';
import '../styles/globals.css';

export const metadata = {
  title: 'BeeHive: AdGenXAI - The Swarm Awakens',
  description: 'AdGenAI and BeeReel unite. A new era of creative intelligence is here.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="dark">
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
