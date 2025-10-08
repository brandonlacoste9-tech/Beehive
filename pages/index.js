import Head from "next/head";

export default function Home() {
  return (
    <>
      <Head>
        <title>AdGen XAI – Aurora Edition</title>
        <meta name="description" content="Aurora-themed intelligence for ads, growth, and swarm rituals" />
      </Head>
      <main className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 text-white">
        <section className="flex flex-col items-center justify-center py-24 px-6 text-center">
          <h1 className="text-5xl font-extrabold mb-6 animate-pulse">
            Welcome to AdGen XAI 🚀
          </h1>
          <p className="text-lg max-w-2xl mb-8">
            Aurora‑themed intelligence for ads, growth, and swarm rituals.
          </p>
          <a
            href="/pricing"
            className="bg-pink-600 hover:bg-pink-500 px-6 py-3 rounded-lg font-semibold transition"
          >
            View Plans
          </a>
        </section>

        <section className="px-6 py-16 max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold mb-8">See It in Action</h2>
          <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden shadow-lg">
            <iframe
              src="https://www.youtube.com/embed/dQw4w9WgXcQ"
              title="Ad showcase"
              allowFullScreen
              className="w-full h-full"
            />
          </div>
        </section>

        <footer className="py-8 text-center text-sm opacity-75">
          © {new Date().getFullYear()} AdGen XAI. All rights reserved.
        </footer>
      </main>
    </>
  );
}