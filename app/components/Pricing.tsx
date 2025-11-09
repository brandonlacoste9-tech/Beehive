"use client";

import CheckoutButton from "./CheckoutButton";
import CryptoButton from "./CryptoButton";

const plans = [
  {
    name: "Creator",
    price: "$19",
    period: "/month",
    features: [
      "100 AI generations/month",
      "Generate ads & reels",
      "Personas & variants",
      "One-click export"
    ],
    plan: "monthly" as const,
    amount: 1900
  },
  {
    name: "Pro",
    price: "$39",
    period: "/month",
    popular: true,
    features: [
      "Unlimited AI generations",
      "All Creator features",
      "Team seats",
      "Priority support",
      "Advanced analytics",
      "API access"
    ],
    plan: "monthly" as const,
    amount: 3900
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    features: [
      "Everything in Pro",
      "Unlimited users",
      "Custom integrations",
      "Dedicated support",
      "SLA guarantee",
      "On-premise option"
    ],
    plan: "yearly" as const,
    amount: 0
  }
];

export default function Pricing() {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8" id="pricing">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg opacity-70">
            Simple subscription. Cancel anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative p-8 border rounded-2xl ${
                plan.popular 
                  ? "border-primary-500 shadow-lg scale-105" 
                  : "border-border"
              }`}
              style={{ background: "var(--card)", borderColor: plan.popular ? "var(--accent-violet)" : "var(--border)" }}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary-500 text-white text-sm font-medium rounded-full">
                  Most Popular
                </div>
              )}

              <div className="text-center mb-8">
                <div className="text-sm uppercase tracking-wider opacity-60 mb-2">{plan.name}</div>
                <div className="text-4xl font-extrabold mb-1">
                  {plan.price}
                  <span className="text-lg font-normal opacity-60 align-top">
                    {plan.period}
                  </span>
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm">
                    <svg
                      className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="opacity-80">{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="space-y-3">
                {plan.price !== "Custom" ? (
                  <>
                    <CheckoutButton 
                      plan={plan.plan}
                      className="w-full px-6 py-3 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-500 focus-visible:outline-offset-2 transition-colors"
                    >
                      Start with Card / Apple / Google Pay
                    </CheckoutButton>

                    <CryptoButton
                      plan={plan.plan}
                      className="w-full px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm"
                    />
                  </>
                ) : (
                  <a
                    href="mailto:sales@adgenxai.com"
                    className="block w-full px-6 py-3 bg-transparent border-2 border-primary-500 text-primary-500 rounded-lg font-medium hover:bg-primary-500/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-500 focus-visible:outline-offset-2 transition-colors text-center"
                  >
                    Contact Sales
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-sm opacity-60 mt-12">
          All plans include a 14-day free trial. No credit card required.
        </p>
      </div>
    </section>
  );
}
