import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function AdminLogin() {
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Check if user is already logged in
    const existingToken = localStorage.getItem('admin_token');
    if (existingToken) {
      router.push('/admin/submissions');
    }
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!token.trim()) {
      setError('Please enter an access token');
      return;
    }

    // Store the token in localStorage
    localStorage.setItem('admin_token', token);
    
    // Redirect to submissions page
    router.push('/admin/submissions');
  };

  return (
    <>
      <Head>
        <title>Admin Login - AdGen XAI</title>
        <meta name="description" content="Admin login for AdGen XAI" />
      </Head>
      <main className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 text-white flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-8 shadow-2xl">
            <h1 className="text-3xl font-bold mb-6 text-center">Admin Login</h1>
            <p className="text-sm text-white/80 mb-6 text-center">
              Enter your admin access token to continue
            </p>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="token" className="block text-sm font-medium mb-2">
                  Access Token
                </label>
                <input
                  type="password"
                  id="token"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="Enter your admin token"
                  autoFocus
                />
              </div>

              {error && (
                <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-pink-600 hover:bg-pink-500 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 focus:ring-offset-purple-900"
              >
                Login
              </button>
            </form>

            <div className="mt-6 text-center">
              <a
                href="/"
                className="text-sm text-white/60 hover:text-white/90 transition"
              >
                ← Back to Home
              </a>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
