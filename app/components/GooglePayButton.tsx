"use client";

import { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null;

interface GooglePayButtonProps {
  plan: "monthly" | "yearly";
  amount: number; // in cents
  className?: string;
}

export default function GooglePayButton({ 
  plan, 
  amount,
  className = "px-6 py-3 bg-white border-2 border-gray-300 rounded-lg font-medium hover:border-gray-400 transition-colors"
}: GooglePayButtonProps) {
  const [available, setAvailable] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkAvailability = async () => {
      if (!stripePromise) return;

      const stripe = await stripePromise;
      if (!stripe) return;

      const paymentRequest = stripe.paymentRequest({
        country: "US",
        currency: "usd",
        total: {
          label: `AdGenXAI ${plan} plan`,
          amount
        },
        requestPayerName: true,
        requestPayerEmail: true
      });

      const canMakePayment = await paymentRequest.canMakePayment();
      setAvailable(!!canMakePayment?.googlePay);
    };

    checkAvailability();
  }, [plan, amount]);

  const handleClick = async () => {
    setLoading(true);
    // Redirect to regular checkout for now
    // Full PaymentRequest implementation would go here
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan })
      });

      const data = await response.json();
      if (data.url) window.location.href = data.url;
    } catch (error) {
      console.error("Google Pay error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!available) return null;

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={className}
      aria-label="Pay with Google Pay"
    >
      <span className="flex items-center gap-2">
        <svg width="41" height="16" viewBox="0 0 41 16" fill="none">
          <path d="M19.526 8.633h-2.432V15.3h-.952V8.633h-2.433V7.8h5.817v.833z" fill="#5F6368"/>
          <path d="M24.399 11.667c0 1.066-.4 1.933-1.2 2.6-.8.666-1.766 1-2.9 1-.866 0-1.65-.2-2.35-.6v-.933c.766.533 1.533.8 2.3.8.9 0 1.633-.25 2.2-.75.566-.5.85-1.15.85-1.95v-.35c-.6.566-1.333.85-2.2.85-1 0-1.833-.333-2.5-1-.666-.667-1-1.5-1-2.5s.334-1.833 1-2.5c.667-.667 1.5-1 2.5-1 .867 0 1.6.284 2.2.85V7.8h.9v3.867h.2zm-3.55 2.65c.7 0 1.283-.233 1.75-.7.467-.467.7-1.05.7-1.75 0-.7-.233-1.283-.7-1.75-.467-.467-1.05-.7-1.75-.7-.7 0-1.283.233-1.75.7-.467.467-.7 1.05-.7 1.75 0 .7.233 1.283.7 1.75.467.467 1.05.7 1.75.7z" fill="#5F6368"/>
        </svg>
        {loading ? "Loading..." : "Google Pay"}
      </span>
    </button>
  );
}
