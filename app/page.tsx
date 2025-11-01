import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header/Navigation */}
      <header className="border-b border-gray-200 bg-white">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-2xl font-bold">
            <span>🐝</span>
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              AdGenXAI
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/creative-studio"
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors font-medium"
            >
              Launch Studio
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h1 className="text-5xl sm:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            AI-Powered Ad Generation
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Generate high-converting ad copy in seconds with our multi-persona targeting system.
            Powered by Claude AI with streaming generation and real-time evaluation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/creative-studio"
              className="px-8 py-4 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors font-semibold text-lg"
            >
              Start Generating →
            </Link>
            <a
              href="#features"
              className="px-8 py-4 rounded-lg border-2 border-gray-300 text-gray-700 hover:border-blue-600 hover:text-blue-600 transition-colors font-semibold text-lg"
            >
              Learn More
            </a>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="rounded-lg bg-white p-6 shadow-sm border border-gray-100 text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">5</div>
            <p className="text-gray-600 font-medium">Buyer Personas</p>
            <p className="text-sm text-gray-500 mt-1">Tailored to different audience segments</p>
          </div>
          <div className="rounded-lg bg-white p-6 shadow-sm border border-gray-100 text-center">
            <div className="text-4xl font-bold text-purple-600 mb-2">5+</div>
            <p className="text-gray-600 font-medium">Ad Types</p>
            <p className="text-sm text-gray-500 mt-1">Social, email, search, blogs, video</p>
          </div>
          <div className="rounded-lg bg-white p-6 shadow-sm border border-gray-100 text-center">
            <div className="text-4xl font-bold text-pink-600 mb-2">8</div>
            <p className="text-gray-600 font-medium">Tone Modifiers</p>
            <p className="text-sm text-gray-500 mt-1">Playful, urgent, formal, casual, more...</p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-4xl font-bold text-center mb-16">
          Powerful Features
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="rounded-lg bg-white p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="text-3xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold mb-2">Multi-Persona Targeting</h3>
            <p className="text-gray-600">
              Generate ads tailored to 5 distinct buyer personas with unique tones, goals, and messaging strategies.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="rounded-lg bg-white p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="text-3xl mb-4">⚡</div>
            <h3 className="text-xl font-semibold mb-2">Real-Time Streaming</h3>
            <p className="text-gray-600">
              See ads generate in real-time with live streaming responses. Get feedback as Claude creates your copy.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="rounded-lg bg-white p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="text-3xl mb-4">📊</div>
            <h3 className="text-xl font-semibold mb-2">AI Quality Evaluation</h3>
            <p className="text-gray-600">
              Automatically score ads (1-100) with strengths, weaknesses, and actionable recommendations.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="rounded-lg bg-white p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="text-3xl mb-4">🔄</div>
            <h3 className="text-xl font-semibold mb-2">Instant Variations</h3>
            <p className="text-gray-600">
              Generate variations with different tones, lengths, approaches, and audience angles in seconds.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="rounded-lg bg-white p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="text-3xl mb-4">📋</div>
            <h3 className="text-xl font-semibold mb-2">Flexible Format Support</h3>
            <p className="text-gray-600">
              Support for social posts, search ads, emails, blog headlines, and video scripts with custom constraints.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="rounded-lg bg-white p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="text-3xl mb-4">📱</div>
            <h3 className="text-xl font-semibold mb-2">Easy Export</h3>
            <p className="text-gray-600">
              Copy to clipboard, download as text, or share directly. Built-in ad statistics and metrics.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 p-12 text-center text-white">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Ready to Transform Your Ad Copy?
          </h2>
          <p className="text-lg text-blue-100 mb-8">
            Generate high-converting ads powered by AI and multi-persona targeting. No credit card required.
          </p>
          <Link
            href="/creative-studio"
            className="inline-block px-8 py-4 rounded-lg bg-white text-blue-600 hover:bg-gray-100 transition-colors font-semibold text-lg"
          >
            Launch Creative Studio →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-gray-50 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Product</h4>
              <ul className="space-y-2 text-gray-600 text-sm">
                <li>
                  <Link href="/creative-studio" className="hover:text-blue-600">
                    Creative Studio
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Personas</h4>
              <ul className="space-y-2 text-gray-600 text-sm">
                <li>Small Business Owner</li>
                <li>Marketing Manager</li>
                <li>Influencer/Creator</li>
                <li>Enterprise Brand</li>
                <li>Startup Founder</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Ad Types</h4>
              <ul className="space-y-2 text-gray-600 text-sm">
                <li>Social Posts</li>
                <li>Search Engine Ads</li>
                <li>Email Marketing</li>
                <li>Blog Headlines</li>
                <li>Video Scripts</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">About</h4>
              <p className="text-gray-600 text-sm">
                Powered by Claude AI. Built for marketers who want to work smarter, not harder.
              </p>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-8 text-center text-gray-600 text-sm">
            <p>
              AdGenXAI © 2024. All rights reserved. |{' '}
              <a href="https://github.com" className="text-blue-600 hover:underline">
                GitHub
              </a>
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
