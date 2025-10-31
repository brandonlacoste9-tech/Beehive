// app/components/GoogleApplePay.tsx
"use client";

import { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentRequestButtonElement } from "@stripe/react-stripe-js";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

function InnerButton() {
  const [paymentRequest, setPR] = useState<any | null>(null);

  useEffect(() => {
    (async () => {
      const stripe = await stripePromise;
      if (!stripe) return;

      const pr = stripe.paymentRequest({
        country: "US",
        currency: "usd",
        total: { label: "AdGenXAI Monthly", amount: 1900 },
        requestPayerName: true,
        requestPayerEmail: true,
      });

      const result = await pr.canMakePayment();
      if (result) setPR(pr);

      pr.on("paymentmethod", async (ev: any) => {
        const res = await fetch("/api/checkout", { method: "POST", body: JSON.stringify({ plan: "monthly" }) });
        const { url } = await res.json();
        ev.complete("success");
        if (url) location.href = url;
      });
    })();
  }, []);

  if (!paymentRequest) return null;
  return (
    <PaymentRequestButtonElement
      options={{ paymentRequest, style: { paymentRequestButton: { type: "default", theme: "dark", height: "44px" } } }}
    />
  );
}

export default function GoogleApplePay() {
  return (
    <Elements stripe={stripePromise}>
      <InnerButton />
    </Elements>
  );
}
