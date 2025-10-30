import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';

/**
 * AdGenXAI Pricing Page
 *
 * Three-tier pricing model:
 * - Free: 10 generations/day
 * - Pro: $97/month - 100 generations/day
 * - Enterprise: $497/month - Unlimited + priority support
 */

interface PricingTier {
  name: string;
  price: string;
  priceId: string;
  interval: string;
  description: string;
  features: string[];
  cta: string;
  popular?: boolean;
  limits: {
    daily: number | 'unlimited';
    monthly: number | 'unlimited';
  };
}

const pricingTiers: PricingTier[] = [
  {
    name: 'Free',
    price: '$0',
    priceId: 'free',
    interval: 'forever',
    description: 'Perfect for trying out AdGenXAI',
    features: [
      '10 ad generations per day',
      'Basic AI models',
      'Email support',
      'Newsletter access',
      'Community forum',
    ],
    cta: 'Start Free',
    limits: {
      daily: 10,
      monthly: 300,
    },
  },
  {
    name: 'Pro',
    price: '$97',
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO || 'price_pro',
    interval: 'per month',
    description: 'For professional marketers and agencies',
    features: [
      '100 ad generations per day',
      'Advanced AI models (GPT-4, Claude)',
      'Bulk generation (CSV upload)',
      'A/B testing (5 variations)',
      'Generation history',
      'Export to PDF/CSV',
      'Priority email support',
      'API access',
    ],
    cta: 'Start Pro Trial',
    popular: true,
    limits: {
      daily: 100,
      monthly: 3000,
    },
  },
  {
    name: 'Enterprise',
    price: '$497',
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ENTERPRISE || 'price_enterprise',
    interval: 'per month',
    description: 'For Fortune 500 and high-volume teams',
    features: [
      'Unlimited ad generations',
      'All AI models + custom fine-tuning',
      'White-label branding',
      'Team management (unlimited seats)',
      'Custom domain',
      'SSO integration',
      'Dedicated account manager',
      '24/7 priority support',
      'SLA guarantee (99.9% uptime)',
      'Custom integrations',
    ],
    cta: 'Contact Sales',
    limits: {
      daily: 'unlimited',
      monthly: 'unlimited',
    },
  },
];

export default function Pricing() {
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'annual'>('monthly');
  const [loading, setLoading] = useState<string | null>(null);

  const handleCheckout = async (priceId: string, tierName: string) => {
    if (priceId === 'free') {
      window.location.href = '/signup?plan=free';
      return;
    }

    if (tierName === 'Enterprise') {
      window.location.href = 'mailto:sales@adgenxai.pro?subject=Enterprise%20Plan%20Inquiry';
      return;
    }

    setLoading(priceId);

    try {
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          successUrl: `${window.location.origin}/dashboard?success=true`,
          cancelUrl: `${window.location.origin}/pricing?canceled=true`,
        }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert('Failed to create checkout session. Please try again.');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <>
      <Head>
        <title>Pricing - AdGenXAI</title>
        <meta name="description" content="Choose the perfect plan for your AI advertising needs. From free to enterprise." />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
        {/* Header */}
        <nav className="container mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-3xl">🐝</span>
              <span className="text-2xl font-bold text-white">AdGenXAI</span>
            </Link>
            <div className="flex space-x-4">
              <Link href="/" className="text-gray-300 hover:text-white transition-colors">
                Home
              </Link>
              <Link href="/pricing" className="text-white font-semibold">
                Pricing
              </Link>
              <Link href="/login" className="text-gray-300 hover:text-white transition-colors">
                Sign In
              </Link>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl sm:text-6xl font-extrabold text-white mb-6">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-12">
            Start free, upgrade as you grow. No hidden fees, cancel anytime.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center space-x-4 mb-16">
            <button
              onClick={() => setBillingInterval('monthly')}
              className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                billingInterval === 'monthly'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingInterval('annual')}
              className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                billingInterval === 'annual'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              Annual
              <span className="ml-2 px-2 py-1 bg-green-500 text-white text-xs rounded">
                Save 20%
              </span>
            </button>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {pricingTiers.map((tier) => (
              <div
                key={tier.name}
                className={`relative bg-white/10 backdrop-blur-lg rounded-2xl p-8 border-2 transition-all hover:scale-105 ${
                  tier.popular
                    ? 'border-blue-500 shadow-2xl shadow-blue-500/50'
                    : 'border-white/20 hover:border-white/40'
                }`}
              >
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="px-4 py-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-bold rounded-full">
                      MOST POPULAR
                    </span>
                  </div>
                )}

                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-white mb-2">{tier.name}</h3>
                  <p className="text-gray-400 text-sm mb-4">{tier.description}</p>
                  <div className="flex items-baseline justify-center">
                    <span className="text-5xl font-extrabold text-white">{tier.price}</span>
                    <span className="text-gray-400 ml-2">/{tier.interval}</span>
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  {tier.features.map((feature, index) => (
                    <li key={index} className="flex items-start text-gray-300">
                      <svg
                        className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span className="text-left">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleCheckout(tier.priceId, tier.name)}
                  disabled={loading === tier.priceId}
                  className={`w-full py-4 rounded-lg font-bold transition-all ${
                    tier.popular
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
                      : 'bg-white/20 text-white hover:bg-white/30'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {loading === tier.priceId ? (
                    <span className="flex items-center justify-center">
                      <div className="loading-spinner w-5 h-5 border-2 border-white border-t-transparent mr-2"></div>
                      Loading...
                    </span>
                  ) : (
                    tier.cta
                  )}
                </button>
              </div>
            ))}
          </div>

          {/* FAQ Section */}
          <div className="mt-24 max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-white mb-12">Frequently Asked Questions</h2>
            <div className="space-y-6 text-left">
              <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-2">
                  Can I change plans anytime?
                </h3>
                <p className="text-gray-300">
                  Yes! You can upgrade, downgrade, or cancel your subscription at any time. Changes take effect at the start of your next billing cycle.
                </p>
              </div>
              <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-2">
                  What payment methods do you accept?
                </h3>
                <p className="text-gray-300">
                  We accept all major credit cards (Visa, Mastercard, Amex) via Stripe. Enterprise plans can also pay via invoice.
                </p>
              </div>
              <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-2">
                  Do you offer refunds?
                </h3>
                <p className="text-gray-300">
                  We offer a 14-day money-back guarantee on all paid plans. If you're not satisfied, contact us for a full refund.
                </p>
              </div>
              <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-2">
                  What happens if I hit my generation limit?
                </h3>
                <p className="text-gray-300">
                  Free users will need to wait until the next day or upgrade. Pro users can purchase additional credits. Enterprise plans have no limits.
                </p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="mt-24 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Transform Your Advertising?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Join thousands of marketers generating legendary ad creative with AI
            </p>
            <Link
              href="/"
              className="inline-block px-8 py-4 bg-white text-blue-600 font-bold rounded-lg hover:bg-gray-100 transition-colors"
            >
              Try It Free Now
            </Link>
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-white/10 py-12 mt-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center text-gray-400">
              <p className="mb-4">© 2025 AdGenXAI. All rights reserved.</p>
              <div className="flex justify-center space-x-6">
                <Link href="/terms" className="hover:text-white transition-colors">
                  Terms
                </Link>
                <Link href="/privacy" className="hover:text-white transition-colors">
                  Privacy
                </Link>
                <Link href="mailto:support@adgenxai.pro" className="hover:text-white transition-colors">
                  Support
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
