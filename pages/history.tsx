import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useAuth } from '../src/lib/useAuth';

/**
 * Generation History Page
 *
 * Browse and search all past ad generations
 */

interface Generation {
  id: string;
  product: string;
  audience: string;
  tone: string;
  headline: string;
  body: string;
  image_prompt: string;
  model: string;
  created_at: string;
}

export default function History() {
  const { user, loading: authLoading, logout } = useAuth(true);
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 20,
    offset: 0,
    hasMore: false,
  });

  useEffect(() => {
    if (user) {
      fetchHistory();
    }
  }, [user, pagination.offset, search]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const session = localStorage.getItem('session');
      if (!session) return;

      const { access_token } = JSON.parse(session);

      const params = new URLSearchParams({
        limit: pagination.limit.toString(),
        offset: pagination.offset.toString(),
        search,
      });

      const response = await fetch(`/api/generations/history?${params}`, {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setGenerations(data.generations || []);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('History fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    alert(`${label} copied to clipboard!`);
  };

  const handleExport = () => {
    const csv = [
      ['Date', 'Product', 'Audience', 'Tone', 'Headline', 'Body', 'Image Prompt', 'Model'],
      ...generations.map((g) => [
        new Date(g.created_at).toLocaleString(),
        g.product,
        g.audience,
        g.tone,
        g.headline,
        g.body,
        g.image_prompt,
        g.model,
      ]),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `adgenxai-history-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center">
        <div className="loading-spinner w-12 h-12 border-4 border-white border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <>
      <Head>
        <title>Generation History - AdGenXAI</title>
        <meta name="description" content="Your generation history" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
        {/* Header */}
        <nav className="bg-black/20 backdrop-blur-lg border-b border-white/10">
          <div className="container mx-auto px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center">
              <Link href="/" className="flex items-center space-x-2">
                <span className="text-3xl">🐝</span>
                <span className="text-2xl font-bold text-white">AdGenXAI</span>
              </Link>
              <div className="flex items-center space-x-4">
                <Link
                  href="/"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Generate
                </Link>
                <Link
                  href="/dashboard"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  href="/history"
                  className="text-white font-semibold"
                >
                  History
                </Link>
                <button
                  onClick={logout}
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </nav>

        <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                Generation History
              </h1>
              <p className="text-gray-300">
                {pagination.total} total generations
              </p>
            </div>
            <button
              onClick={handleExport}
              className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
            >
              📥 Export CSV
            </button>
          </div>

          {/* Search */}
          <div className="mb-8">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by product, audience, or headline..."
              className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Generations List */}
          {generations.length === 0 ? (
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-12 border border-white/20 text-center">
              <div className="text-6xl mb-4">📭</div>
              <p className="text-gray-300 mb-4">
                {search ? 'No results found' : 'No generations yet'}
              </p>
              {!search && (
                <Link
                  href="/"
                  className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Generate Your First Ad
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {generations.map((gen) => (
                <div
                  key={gen.id}
                  className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-1">
                        {gen.product}
                      </h3>
                      <p className="text-gray-400 text-sm">
                        {new Date(gen.created_at).toLocaleString()} • {gen.audience}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <span className="px-3 py-1 bg-blue-500/20 text-blue-300 text-sm rounded">
                        {gen.tone}
                      </span>
                      <span className="px-3 py-1 bg-purple-500/20 text-purple-300 text-sm rounded">
                        {gen.model}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Headline */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="text-sm font-semibold text-blue-300">
                          HEADLINE
                        </h4>
                        <button
                          onClick={() => handleCopy(gen.headline, 'Headline')}
                          className="text-xs text-gray-400 hover:text-white transition-colors"
                        >
                          📋 Copy
                        </button>
                      </div>
                      <p className="text-white text-lg font-semibold">
                        {gen.headline}
                      </p>
                    </div>

                    {/* Body */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="text-sm font-semibold text-purple-300">
                          BODY COPY
                        </h4>
                        <button
                          onClick={() => handleCopy(gen.body, 'Body copy')}
                          className="text-xs text-gray-400 hover:text-white transition-colors"
                        >
                          📋 Copy
                        </button>
                      </div>
                      <p className="text-gray-300">{gen.body}</p>
                    </div>

                    {/* Image Prompt */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="text-sm font-semibold text-pink-300">
                          IMAGE PROMPT
                        </h4>
                        <button
                          onClick={() =>
                            handleCopy(gen.image_prompt, 'Image prompt')
                          }
                          className="text-xs text-gray-400 hover:text-white transition-colors"
                        >
                          📋 Copy
                        </button>
                      </div>
                      <p className="text-gray-400 text-sm font-mono">
                        {gen.image_prompt}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.hasMore && (
            <div className="mt-8 text-center">
              <button
                onClick={() =>
                  setPagination((prev) => ({
                    ...prev,
                    offset: prev.offset + prev.limit,
                  }))
                }
                className="px-8 py-3 bg-white/20 text-white font-semibold rounded-lg hover:bg-white/30 transition-colors"
              >
                Load More
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
