// app/page.tsx
import HomeHero from "../components/HomeHero";
import { Navigation } from "../components/Navigation";

export default function HomePage() {
  return (
    <>
      <Navigation />
      <main>
        <HomeHero />
        {/* The rest of your homepage sections will go here */}
      </main>
    </>
  );
}
