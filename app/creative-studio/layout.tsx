/**
 * Layout for Creative Studio
 */

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Creative Studio | AdGenXAI',
  description: 'AI-powered ad generation with multi-persona targeting',
};

export default function CreativeStudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
