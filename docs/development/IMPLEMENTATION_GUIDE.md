# AdGenXAI Complete Implementation Guide

## 🚀 Quick Start

This guide implements all features from the meta-prompt: payments, usage tracking, crypto feed, theme toggle, SEO, and more.

---

## Step 1: Create Directories

Run in Windows PowerShell:

```powershell
cd C:\Users\north\OneDrive\Documents\GitHub\Beehive

# Create all needed directories
$dirs = @(
    "app\api\checkout",
    "app\api\stripe-webhook",
    "app\api\usage",
    "app\api\crypto-feed",
    "app\api\crypto",
    "app\api\crypto-webhook",
    "app\thanks",
    "data",
    "content\posts",
    "scripts"
)
$dirs | ForEach-Object { New-Item -ItemType Directory -Force -Path $_ | Out-Null }
```

---

## Step 2: Install Dependencies

```powershell
npm install coinbase-commerce-node gray-matter marked @stripe/react-stripe-js
```

---

## Step 3: Create API Routes

### `app/api/checkout/route.ts`

```typescript
import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

export async function POST(req: NextRequest) {
  try {
    const { plan = "monthly" } = await req.json().catch(() => ({}));
    const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const priceId = plan === "monthly" ? process.env.STRIPE_PRICE_MONTHLY : process.env.STRIPE_PRICE_MONTHLY;

    if (!priceId) {
      return NextResponse.json({ error: "Missing price id" }, { status: 500 });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${base}/thanks?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${base}/pricing`,
      automatic_tax: { enabled: true },
      allow_promotion_codes: true,
      payment_method_types: ["card"],
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Checkout error" }, { status: 500 });
  }
}
```

### `app/api/stripe-webhook/route.ts`

```typescript
import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";
import { sendWelcomeEmail } from "@/app/lib/mailer";
import { upsertCustomer } from "@/app/lib/users";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature");
  const whSecret = process.env.STRIPE_WEBHOOK_SECRET!;
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2024-06-20" });

  let event: Stripe.Event;
  try {
    const body = await req.text();
    event = stripe.webhooks.constructEvent(body, sig!, whSecret);
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const email = session.customer_details?.email;
      if (email) {
        await upsertCustomer({ email, status: "active", provider: "stripe", sessionId: session.id });
        await sendWelcomeEmail({ to: email, plan: "monthly" });
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
```

### `app/api/usage/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";

type Stat = { ts: number };
const bucket: Record<string, Stat[]> = {};

export async function GET(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || "local";
  const now = Date.now();
  const hourAgo = now - 60 * 60 * 1000;
  const dayAgo = now - 24 * 60 * 60 * 1000;

  const arr = (bucket[ip] ||= []);
  bucket[ip] = arr.filter((x) => x.ts >= dayAgo);
  const total = bucket[ip].length;
  const last_1h = bucket[ip].filter((x) => x.ts >= hourAgo).length;
  const today = total;

  return NextResponse.json({ total, today, last_1h });
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || "local";
  (bucket[ip] ||= []).push({ ts: Date.now() });
  return NextResponse.json({ ok: true });
}
```

### `app/api/crypto-feed/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";

const API = "https://api.coingecko.com/api/v3/simple/price";

export async function GET(req: NextRequest) {
  const symbols = ["bitcoin", "ethereum", "solana"];
  const url = `${API}?ids=${symbols.join(",")}&vs_currencies=usd&include_24hr_change=true`;

  try {
    const res = await fetch(url, { next: { revalidate: 60 } });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
```

### `app/api/crypto/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import Coinbase from "coinbase-commerce-node";
const { Charge } = Coinbase.resources;

Coinbase.Client.init(process.env.COINBASE_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { plan = "monthly", email } = await req.json().catch(() => ({}));
    const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    const charge = await Charge.create({
      name: "AdGenXAI Subscription",
      description: `Plan: ${plan}`,
      local_price: { amount: "19.00", currency: "USD" },
      pricing_type: "fixed_price",
      metadata: { email, plan },
      redirect_url: `${base}/thanks`,
      cancel_url: `${base}/pricing`,
    });

    return NextResponse.json({ url: charge.hosted_url });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Crypto error" }, { status: 500 });
  }
}
```

### `app/api/crypto-webhook/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import Coinbase from "coinbase-commerce-node";
import { sendWelcomeEmail } from "@/app/lib/mailer";
import { upsertCustomer } from "@/app/lib/users";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const raw = await req.text();
    const sig = req.headers.get("x-cc-webhook-signature")!;
    const event = Coinbase.Webhook.verifyEventBody(raw, sig, process.env.COINBASE_WEBHOOK_SECRET!);

    if (event.type === "charge:confirmed") {
      const email = event?.data?.metadata?.email as string | undefined;
      if (email) {
        await upsertCustomer({ email, status: "active", provider: "coinbase", sessionId: event.id });
        await sendWelcomeEmail({ to: email, plan: "monthly" });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Webhook error" }, { status: 400 });
  }
}
```

---

## Step 4: Create Thanks Page

### `app/thanks/page.tsx`

```typescript
import Stripe from "stripe";

export default async function Page(props: { searchParams: { session_id?: string } }) {
  const sessionId = props.searchParams?.session_id;
  let email = "";
  let status: string | null = null;

  if (sessionId && process.env.STRIPE_SECRET_KEY) {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2024-06-20" });
    const s = await stripe.checkout.sessions.retrieve(sessionId);
    email = s.customer_details?.email || "";
    status = s.status || null;
  }

  return (
    <main className="max-w-2xl mx-auto px-6 py-16">
      <h1 className="text-4xl font-extrabold">You're in 🎉</h1>
      <p className="mt-3 text-black/70">
        {status === "complete"
          ? "Your subscription is active. A welcome email is on its way."
          : "We're finalizing your subscription…"}
      </p>
      {email && <p className="mt-2 text-sm text-black/60">Receipt sent to <b>{email}</b></p>}
      <a href="/" className="inline-block mt-8 rounded-xl border px-4 py-2"
         style={{ background:"var(--card)", borderColor:"var(--border)" }}>
        Back to Home
      </a>
    </main>
  );
}
```

---

## Step 5: Create Component Files

All component files are already in your `app/components` directory. Verify they match the examples in the meta-prompt.

---

## Step 6: Create Data File

```powershell
echo "[]" > data\users.json
```

---

## Step 7: Create Manifest

```powershell
@"
{
  "name": "AdGenXAI",
  "short_name": "AdGenXAI",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#F7FAFF",
  "theme_color": "#7C4DFF",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
"@ | Out-File -FilePath "public\manifest.webmanifest" -Encoding UTF8
```

---

## Step 8: Update Middleware for Security

Check `middleware.ts` - it should include CSP headers. If not, create/update it with the security headers from the meta-prompt.

---

## Step 9: Commit and Deploy

```powershell
git add .
git commit -m "feat(payments+ux): Add Stripe, Coinbase, usage tracking, crypto feed, theme toggle, SEO"
git push
npm run dev
```

---

## Environment Variables

Ensure these are set in Netlify:

```
NEXT_PUBLIC_SITE_URL=https://your-site.netlify.app
STRIPE_SECRET_KEY=sk_live_***
STRIPE_PRICE_MONTHLY=price_***
STRIPE_WEBHOOK_SECRET=whsec_***
COINBASE_API_KEY=***
COINBASE_WEBHOOK_SECRET=***
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=***
SMTP_PASS=***
FROM_EMAIL="AdGenXAI <no-reply@adgenxai.com>"
GITHUB_TOKEN=ghp_***
```

---

## Testing Checklist

- [ ] Stripe checkout flow works
- [ ] Crypto payment option appears
- [ ] Usage badge updates
- [ ] Crypto feed shows live prices
- [ ] Theme toggle switches correctly
- [ ] Welcome emails send
- [ ] Thanks page displays correctly

