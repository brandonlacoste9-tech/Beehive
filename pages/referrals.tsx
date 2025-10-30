import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useAuth } from '../src/lib/useAuth';

interface ReferralStats {
  totalReferrals: number;
  successfulReferrals: number;
  totalRewards: number;
}

interface ReferredUser {
  email: string;
  created_at: string;
  converted: boolean;
  reward_claimed: boolean;
}

interface ReferralData {
  code: string;
  stats: ReferralStats;
  referredUsers: ReferredUser[];
  shareUrl: string;
}

export default function Referrals() {
  const { user, loading } = useAuth(true);
  const [referralData, setReferralData] = useState<ReferralData | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (user) {
      fetchReferralData();
    }
  }, [user]);

  const fetchReferralData = async () => {
    try {
      const session = localStorage.getItem('session');
      if (!session) return;

      const { token } = JSON.parse(session);

      const response = await fetch('/api/referrals/code', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setReferralData(data);
      }
    } catch (error) {
      console.error('Failed to fetch referral data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareViaEmail = () => {
    if (!referralData) return;

    const subject = 'Join AdGenXAI - AI-Powered Ad Creative Platform';
    const body = `I've been using AdGenXAI to create amazing ad creatives with AI, and I think you'd love it too!

Sign up with my referral link and get 50 bonus generations:
${referralData.shareUrl}

AdGenXAI helps you generate compelling ad headlines, body copy, and image prompts in seconds.`;

    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const shareViaTwitter = () => {
    if (!referralData) return;

    const text = `I'm using AdGenXAI to create amazing ad creatives with AI! Join me and get 50 bonus generations: ${referralData.shareUrl}`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
  };

  if (loading || loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Referral Program - AdGenXAI</title>
      </Head>

      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Referral Program
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Share AdGenXAI with friends and earn bonus generations for every successful referral!
          </p>
        </div>

        {/* Referral Code Card */}
        {referralData && (
          <>
            <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                Your Referral Code
              </h2>

              <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white mb-6">
                <p className="text-sm font-medium mb-2 opacity-90">Your unique code:</p>
                <div className="flex items-center justify-between">
                  <p className="text-4xl font-bold tracking-wider">{referralData.code}</p>
                  <button
                    onClick={() => copyToClipboard(referralData.code)}
                    className="px-4 py-2 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
                  >
                    {copied ? '✓ Copied!' : 'Copy Code'}
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-gray-600 font-medium">Share your link:</p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={referralData.shareUrl}
                    readOnly
                    className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => copyToClipboard(referralData.shareUrl)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors"
                  >
                    {copied ? '✓ Copied!' : 'Copy Link'}
                  </button>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={shareViaEmail}
                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                  >
                    Share via Email
                  </button>
                  <button
                    onClick={shareViaTwitter}
                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                  >
                    Share on Twitter
                  </button>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <p className="text-gray-600 text-sm font-medium mb-2">Total Referrals</p>
                <p className="text-3xl font-bold text-gray-900">{referralData.stats.totalReferrals}</p>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <p className="text-gray-600 text-sm font-medium mb-2">Successful Conversions</p>
                <p className="text-3xl font-bold text-green-600">{referralData.stats.successfulReferrals}</p>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <p className="text-gray-600 text-sm font-medium mb-2">Total Rewards Earned</p>
                <p className="text-3xl font-bold text-purple-600">{referralData.stats.totalRewards}</p>
                <p className="text-sm text-gray-500 mt-1">bonus generations</p>
              </div>
            </div>

            {/* How it Works */}
            <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                How It Works
              </h2>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                    1
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Share Your Link</h3>
                  <p className="text-gray-600 text-sm">
                    Send your unique referral link to friends who might benefit from AdGenXAI
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                    2
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">They Sign Up</h3>
                  <p className="text-gray-600 text-sm">
                    Your friend signs up and gets 50 bonus generations automatically
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                    3
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Earn Rewards</h3>
                  <p className="text-gray-600 text-sm">
                    When they upgrade to Pro or Enterprise, you both get 100 bonus generations!
                  </p>
                </div>
              </div>
            </div>

            {/* Referred Users */}
            {referralData.referredUsers.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                  Your Referrals
                </h2>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-gray-600 font-medium">Email</th>
                        <th className="text-left py-3 px-4 text-gray-600 font-medium">Joined Date</th>
                        <th className="text-left py-3 px-4 text-gray-600 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {referralData.referredUsers.map((user, index) => (
                        <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 text-gray-900">{user.email}</td>
                          <td className="py-3 px-4 text-gray-600">
                            {new Date(user.created_at).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4">
                            {user.converted ? (
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700">
                                Converted
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
                                Signed Up
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
