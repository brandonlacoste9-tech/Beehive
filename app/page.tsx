export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-center font-mono text-sm">
        <div className="text-center mb-8">
          <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            🐝 AdGenXAI
          </h1>
          <p className="text-2xl text-gray-700 dark:text-gray-300 mb-8">
            AI-Powered Advertising Creative Platform
          </p>
        </div>

        <div className="mb-32 grid text-center lg:max-w-5xl lg:w-full lg:mb-0 lg:grid-cols-3 lg:text-left gap-4">
          <div className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30">
            <h2 className="mb-3 text-2xl font-semibold">
              🎨 AI Generation
            </h2>
            <p className="m-0 max-w-[30ch] text-sm opacity-50">
              Generate compelling headlines, body copy, and image prompts with multiple AI models.
            </p>
          </div>

          <div className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30">
            <h2 className="mb-3 text-2xl font-semibold">
              💰 Monetization
            </h2>
            <p className="m-0 max-w-[30ch] text-sm opacity-50">
              3-tier pricing with Stripe integration and automated subscription management.
            </p>
          </div>

          <div className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30">
            <h2 className="mb-3 text-2xl font-semibold">
              🔐 Secure
            </h2>
            <p className="m-0 max-w-[30ch] text-sm opacity-50">
              Supabase authentication, JWT sessions, and row-level security policies.
            </p>
          </div>
        </div>

        <div className="mt-16 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            Ready to deploy to Netlify 🚀
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
            Configure environment variables and start generating!
          </p>
        </div>
      </div>
    </main>
  )
}
