// app/layout.tsx
import { ThemeProvider } from 'next-themes';
import { AuthContext } from '../components/AuthContext';
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
        <AuthContext>
          <ThemeProvider attribute="class" defaultTheme="dark">
            {children}
          </ThemeProvider>
        </AuthContext>
      </body>
    </html>
  );
}
