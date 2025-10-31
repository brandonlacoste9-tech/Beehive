import { useState, useEffect } from 'react';
import Head from 'next/head';
import Layout from '../components/Layout';
import type { Repository } from '../lib/repositories';

export default function Repositories() {
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('');

  useEffect(() => {
    fetchRepositories();
  }, []);

  const fetchRepositories = async () => {
    try {
      // Fetch directly from GitHub API since we're using static export
      const response = await fetch(
        'https://api.github.com/users/brandonlacoste9-tech/repos?per_page=100&sort=updated',
        {
          headers: {
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'Portfolio-Website'
          }
        }
      );
      if (!response.ok) throw new Error('Failed to fetch repositories');
      const data = await response.json();
      // Filter out archived repos
      const activeRepos = data.filter((repo: Repository) => !repo.archived);
      setRepositories(activeRepos);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const filteredRepos = repositories.filter(repo =>
    repo.name.toLowerCase().includes(filter.toLowerCase()) ||
    (repo.description?.toLowerCase().includes(filter.toLowerCase()))
  );

  const languageColors: Record<string, string> = {
    TypeScript: 'bg-blue-500',
    JavaScript: 'bg-yellow-500',
    Python: 'bg-green-500',
    HTML: 'bg-red-500',
    Shell: 'bg-gray-500',
    Astro: 'bg-purple-500'
  };

  return (
    <Layout>
      <Head>
        <title>Repositories - Brandon's Portfolio</title>
        <meta 
          name="description" 
          content="Browse all of my GitHub repositories and open source contributions" 
        />
      </Head>

      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-5xl font-bold mb-4">All Repositories</h1>
          <p className="text-xl text-blue-100">
            Explore {repositories.length} repositories showcasing various technologies and solutions
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Search/Filter */}
        <div className="mb-8">
          <input
            type="text"
            placeholder="Search repositories..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading repositories...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-6 py-4 rounded-lg">
            <p className="font-semibold">Error loading repositories</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="mb-6 text-gray-600">
              Showing {filteredRepos.length} of {repositories.length} repositories
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRepos.map((repo) => (
                <div key={repo.id} className="card">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-xl font-bold text-blue-600 hover:text-blue-700">
                      <a 
                        href={repo.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {repo.name}
                      </a>
                    </h3>
                  </div>

                  {repo.description && (
                    <p className="text-gray-600 mb-4 text-sm overflow-hidden" style={{ 
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical'
                    }}>
                      {repo.description}
                    </p>
                  )}

                  <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
                    {repo.language && (
                      <div className="flex items-center gap-1">
                        <span className={`w-3 h-3 rounded-full ${languageColors[repo.language] || 'bg-gray-400'}`}></span>
                        <span>{repo.language}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <span>⭐</span>
                      <span>{repo.stargazers_count}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>🔀</span>
                      <span>{repo.forks_count}</span>
                    </div>
                  </div>

                  <div className="text-xs text-gray-500 mb-4">
                    Updated {new Date(repo.updated_at).toLocaleDateString()}
                  </div>

                  <a
                    href={repo.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full bg-blue-600 text-white px-4 py-2 rounded text-center hover:bg-blue-700 transition-colors font-semibold"
                  >
                    View on GitHub
                  </a>
                </div>
              ))}
            </div>

            {filteredRepos.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No repositories found matching your search.</p>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
