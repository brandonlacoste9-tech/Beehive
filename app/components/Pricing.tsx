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
    <section className="relative z-40 py-20 px-4 sm:px-6 lg:px-8" id="pricing">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Simple, Transparent <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">Pricing</span>
          </h2>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            Choose the perfect plan for your creative journey. Cancel anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative backdrop-blur-2xl bg-gradient-to-br from-white/10 to-white/5 border rounded-3xl p-8 transition-all duration-300 hover:scale-105 ${
                plan.popular 
                  ? "border-cyan-400/50 shadow-2xl shadow-cyan-500/20 scale-105" 
                  : "border-white/20 hover:border-white/30"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-6 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white text-sm font-semibold rounded-full shadow-lg">
                  Most Popular
                </div>
              )}

              <div className="text-center mb-8">
                <div className="text-sm uppercase tracking-wider text-white/60 mb-3 font-medium">{plan.name}</div>
                <div className="flex items-baseline justify-center gap-2 mb-2">
                  <span className="text-5xl font-extrabold text-white">
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className="text-lg text-white/60">
                      {plan.period}
                    </span>
                  )}
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <svg
                      className="w-6 h-6 text-cyan-400 flex-shrink-0 mt-0.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="text-white/90 text-base">{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="space-y-3">
                {plan.price !== "Custom" ? (
                  <>
                    <CheckoutButton 
                      plan={plan.plan}
                      className="w-full px-6 py-4 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-xl font-semibold hover:from-cyan-600 hover:to-purple-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400 focus-visible:outline-offset-2 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                    >
                      Start with Card / Apple / Google Pay
                    </CheckoutButton>

                    <CryptoButton
                      plan={plan.plan}
                      className="w-full px-4 py-3 backdrop-blur-xl bg-white/10 border border-white/20 text-white rounded-xl hover:bg-white/20 transition-all duration-300 text-sm font-medium hover:scale-105"
                    />
                  </>
                ) : (
                  <a
                    href="mailto:sales@adgenxai.com"
                    className="block w-full px-6 py-4 backdrop-blur-xl bg-white/10 border-2 border-cyan-400/50 text-white rounded-xl font-semibold hover:bg-white/20 hover:border-cyan-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400 focus-visible:outline-offset-2 transition-all duration-300 text-center hover:scale-105"
                  >
                    Contact Sales
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-white/60 mt-16 text-lg">
          All plans include a 14-day free trial. No credit card required.
        </p>
      </div>
    </section>
  );
}
