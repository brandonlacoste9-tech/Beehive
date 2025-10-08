import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function AdminSubmissions() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.push('/admin/login');
      return;
    }

    // Fetch submissions with Bearer token
    fetchSubmissions(token);
  }, [router]);

  const fetchSubmissions = async (token) => {
    try {
      setLoading(true);
      setError('');

      // Try Netlify function first, fallback to Next.js API route for dev
      let response = await fetch('/.netlify/functions/submissions', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      // If Netlify function doesn't exist (404), try Next.js API route
      if (response.status === 404) {
        response = await fetch('/api/.netlify/functions/submissions', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      }

      if (response.status === 401) {
        // Token is invalid, redirect to login
        localStorage.removeItem('admin_token');
        router.push('/admin/login');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch submissions');
      }

      const data = await response.json();
      setSubmissions(data.submissions || []);
    } catch (err) {
      setError(err.message || 'Failed to load submissions');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    router.push('/admin/login');
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <>
      <Head>
        <title>Admin Submissions - AdGen XAI</title>
        <meta name="description" content="Admin submissions dashboard" />
      </Head>
      <main className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
              <p className="text-white/80">Manage your ad generation submissions</p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-500 text-white font-semibold py-2 px-6 rounded-lg transition duration-200 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              Logout
            </button>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="bg-white/10 backdrop-blur-lg rounded-lg p-8 text-center">
              <div className="animate-pulse">Loading submissions...</div>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-6 py-4 rounded-lg mb-6">
              <strong>Error:</strong> {error}
            </div>
          )}

          {/* Submissions Table */}
          {!loading && !error && (
            <div className="bg-white/10 backdrop-blur-lg rounded-lg overflow-hidden shadow-2xl">
              {submissions.length === 0 ? (
                <div className="p-8 text-center text-white/70">
                  No submissions found
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-white/5 border-b border-white/10">
                        <th className="px-6 py-4 text-left text-sm font-semibold">ID</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold">Email</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold">Product</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold">Description</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {submissions.map((submission, index) => (
                        <tr
                          key={submission.id}
                          className={`border-b border-white/5 hover:bg-white/5 transition ${
                            index % 2 === 0 ? 'bg-white/0' : 'bg-white/[0.02]'
                          }`}
                        >
                          <td className="px-6 py-4 text-sm">{submission.id}</td>
                          <td className="px-6 py-4 text-sm">{submission.email}</td>
                          <td className="px-6 py-4 text-sm font-medium">{submission.product}</td>
                          <td className="px-6 py-4 text-sm text-white/80">
                            {submission.description}
                          </td>
                          <td className="px-6 py-4 text-sm text-white/70">
                            {formatDate(submission.timestamp)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Footer */}
          {!loading && !error && submissions.length > 0 && (
            <div className="mt-6 text-center text-white/60 text-sm">
              Showing {submissions.length} submission{submissions.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
