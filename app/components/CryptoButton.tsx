"use client";

import { useState } from "react";

interface CryptoButtonProps {
  plan: "monthly" | "yearly";
  className?: string;
  emailHint?: string;
}

export default function CryptoButton({ 
  plan,
  emailHint = "",
  className = "px-6 py-3 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors"
}: CryptoButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleCrypto() {
    setLoading(true);
    
    try {
      const response = await fetch("/api/crypto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, email: emailHint })
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("Failed to create crypto checkout");
      }
    } catch (error) {
      console.error("Crypto checkout error:", error);
      alert("Crypto checkout is temporarily unavailable");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleCrypto}
      disabled={loading}
      className={className}
    >
      {loading ? "Opening…" : "Pay with Crypto (Coinbase)"}
    </button>
  );
}
