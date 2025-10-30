import { useState } from 'react';
import Head from 'next/head';
import NewsletterSubscribe from '../src/components/NewsletterSubscribe';

interface AdResult {
  headline: string;
  body: string;
  imagePrompt: string;
}

export default function Home() {
  const [formData, setFormData] = useState({
    product: '',
    audience: '',
    tone: 'professional',
  });
  const [result, setResult] = useState<AdResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/generateAd', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setResult(data.data);
      } else {
        setError(data.error || 'Failed to generate ad creative');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Ad generation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <>
      <Head>
        <title>AdGenXAI - AI-Powered Advertising Creative Platform</title>
        <meta name="description" content="Generate compelling ad creative with AI. Powered by Google Gemini and AI Sensory Cortex." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          {/* Animated background */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse-slow"></div>
            <div className="absolute top-0 -right-4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse-slow animation-delay-2000"></div>
            <div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse-slow animation-delay-4000"></div>
          </div>

          <div className="relative container mx-auto px-4 py-16 sm:px-6 lg:px-8">
            {/* Header */}
            <nav className="flex justify-between items-center mb-16">
              <div className="flex items-center space-x-2">
                <div className="text-4xl">🐝</div>
                <span className="text-2xl font-bold text-white">AdGenXAI</span>
              </div>
              <div className="flex space-x-4">
                <a href="/.netlify/functions/health" className="text-gray-300 hover:text-white transition-colors">
                  Health
                </a>
                <a href="#features" className="text-gray-300 hover:text-white transition-colors">
                  Features
                </a>
                <a href="#newsletter" className="text-gray-300 hover:text-white transition-colors">
                  Newsletter
                </a>
              </div>
            </nav>

            {/* Hero Content */}
            <div className="text-center mb-16 animate-fade-in">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white mb-6">
                AI-Powered
                <span className="block gradient-text">Ad Creative Generator</span>
              </h1>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
                Generate compelling advertising creative in seconds with Google Gemini AI.
                Perfect headlines, persuasive copy, and stunning image prompts.
              </p>
              <div className="flex items-center justify-center space-x-4">
                <div className="px-4 py-2 bg-green-500/20 border border-green-500 rounded-full text-green-400 text-sm">
                  🟢 AI Sensory Cortex Online
                </div>
                <div className="px-4 py-2 bg-blue-500/20 border border-blue-500 rounded-full text-blue-400 text-sm">
                  ⚡ Powered by Gemini 1.5 Pro
                </div>
              </div>
            </div>

            {/* Generator Form */}
            <div className="max-w-4xl mx-auto">
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20">
                <h2 className="text-3xl font-bold text-white mb-6">Generate Your Ad Creative</h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="product" className="block text-sm font-medium text-gray-200 mb-2">
                      Product or Service
                    </label>
                    <input
                      type="text"
                      id="product"
                      name="product"
                      value={formData.product}
                      onChange={handleInputChange}
                      placeholder="e.g., AI Marketing Platform, Fitness App, Coffee Subscription"
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="audience" className="block text-sm font-medium text-gray-200 mb-2">
                      Target Audience
                    </label>
                    <input
                      type="text"
                      id="audience"
                      name="audience"
                      value={formData.audience}
                      onChange={handleInputChange}
                      placeholder="e.g., Small business owners, Fitness enthusiasts, Coffee lovers"
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="tone" className="block text-sm font-medium text-gray-200 mb-2">
                      Tone
                    </label>
                    <select
                      id="tone"
                      name="tone"
                      value={formData.tone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="professional">Professional</option>
                      <option value="casual">Casual</option>
                      <option value="exciting">Exciting</option>
                      <option value="friendly">Friendly</option>
                      <option value="urgent">Urgent</option>
                      <option value="luxury">Luxury</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {loading ? (
                      <>
                        <div className="loading-spinner w-5 h-5 border-2 border-white border-t-transparent"></div>
                        <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <span>✨ Generate Ad Creative</span>
                      </>
                    )}
                  </button>
                </form>

                {/* Error Display */}
                {error && (
                  <div className="mt-6 p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-200">
                    <strong>Error:</strong> {error}
                  </div>
                )}

                {/* Results Display */}
                {result && (
                  <div className="mt-8 space-y-6 animate-slide-up">
                    <h3 className="text-2xl font-bold text-white">Your AI-Generated Ad Creative 🎉</h3>

                    <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/20 rounded-xl p-6">
                      <h4 className="text-sm font-semibold text-blue-300 mb-2">HEADLINE</h4>
                      <p className="text-2xl font-bold text-white">{result.headline}</p>
                    </div>

                    <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-white/20 rounded-xl p-6">
                      <h4 className="text-sm font-semibold text-purple-300 mb-2">BODY COPY</h4>
                      <p className="text-lg text-gray-200 leading-relaxed">{result.body}</p>
                    </div>

                    <div className="bg-gradient-to-br from-pink-500/20 to-orange-500/20 border border-white/20 rounded-xl p-6">
                      <h4 className="text-sm font-semibold text-pink-300 mb-2">IMAGE PROMPT</h4>
                      <p className="text-base text-gray-200 font-mono">{result.imagePrompt}</p>
                      <p className="text-sm text-gray-400 mt-2">Use this prompt with DALL-E, Midjourney, or Stable Diffusion</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div id="features" className="container mx-auto px-4 py-24 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white text-center mb-12">Legendary Features</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white/5 backdrop-blur-lg rounded-xl p-8 border border-white/10 hover:border-white/30 transition-all">
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="text-xl font-bold text-white mb-4">AI-Powered</h3>
              <p className="text-gray-300">Leverages Google Gemini 1.5 Pro for cutting-edge creative generation</p>
            </div>
            <div className="bg-white/5 backdrop-blur-lg rounded-xl p-8 border border-white/10 hover:border-white/30 transition-all">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-bold text-white mb-4">Lightning Fast</h3>
              <p className="text-gray-300">Generate professional ad creative in seconds, not hours</p>
            </div>
            <div className="bg-white/5 backdrop-blur-lg rounded-xl p-8 border border-white/10 hover:border-white/30 transition-all">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-bold text-white mb-4">Targeted</h3>
              <p className="text-gray-300">Customized messaging for your specific audience and tone</p>
            </div>
          </div>
        </div>

        {/* Newsletter Section */}
        <div id="newsletter" className="container mx-auto px-4 py-24 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-white mb-4">Stay Updated</h2>
            <p className="text-gray-300 mb-8">Get the latest AI advertising insights and platform updates</p>
            <NewsletterSubscribe
              utmSource="homepage"
              utmCampaign="hero-signup"
              className="max-w-md mx-auto"
            />
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-white/10 py-12">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center text-gray-400">
              <p className="mb-4">© 2025 AdGenXAI. Powered by AI Sensory Cortex.</p>
              <div className="flex justify-center space-x-6">
                <a href="/.netlify/functions/health" className="hover:text-white transition-colors">
                  System Health
                </a>
                <a href="/.netlify/functions/webhook" className="hover:text-white transition-colors">
                  API Status
                </a>
                <a href="/scrolls/beehiv-integration.md" className="hover:text-white transition-colors">
                  Docs
                </a>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
