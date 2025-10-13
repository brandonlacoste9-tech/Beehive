// app/layout.tsx
import type { ReactNode } from "react";

import "../styles/globals.css";

import FireUIProvider from "@/components/FireUIProvider";

export const metadata = {
  title: "BeeHive: AdGenXAI - The Swarm Awakens",
  description: "AdGenAI and BeeReel unite. A new era of creative intelligence is here.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <FireUIProvider>{children}</FireUIProvider>
      </body>
    </html>
  );
}
