# 🚀 Crypto Intel + Aurora Sparklines - Quick Setup Guide

## What You're Getting

✨ **Live crypto price tracking** with animated sparklines  
🌌 **Aurora glow effects** that respond to price volatility  
📊 **Real-time market sentiment** analysis  
📰 **Trending news** integration  
🎨 **Beautiful UI** with dark/light theme support

---

## 1️⃣ Quick Start (3 steps)

### Step 1: Create Directories
```cmd
setup-crypto-dirs.bat
```

### Step 2: Generate API Files
```powershell
powershell -ExecutionPolicy Bypass -File setup-crypto-files.ps1
```

### Step 3: Install Dependencies
```bash
npm install
# Already installed: @stripe/stripe-js, framer-motion, zod, nodemailer
```

---

## 2️⃣ What Got Created

### 🆕 New Components
- **`app/components/Sparkline.tsx`** - Animated SVG sparkline with glow effects
- **`app/components/CryptoIntel.tsx`** - Main crypto dashboard widget

### 🆕 API Routes
- **`app/api/crypto-intel/route.ts`** - Real-time prices + sentiment
- **`app/api/crypto-intel/history/route.ts`** - Historical sparkline data

### 🎨 CSS Enhancements
- **Aurora glow** animations in `app/globals.css`
- Dynamic hue based on price movement (green = up, red = down)
- Intensity tied to volatility (bigger moves = brighter glow)

---

## 3️⃣ Usage in Your App

### Option A: Add to Existing Page

```tsx
// app/page.tsx or any page
import CryptoIntel from "@/components/CryptoIntel";

export default function Page() {
  return (
    <main>
      {/* Your existing content */}
      
      <section aria-label="Crypto Market Intel">
        <h2>Live Market Pulse</h2>
        <CryptoIntel />
      </section>
    </main>
  );
}
```

### Option B: Create Dedicated Dashboard

```tsx
// app/market/page.tsx
import CryptoIntel from "@/components/CryptoIntel";

export default function MarketPage() {
  return (
    <main className="max-w-7xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold">Market Intelligence</h1>
      <CryptoIntel />
    </main>
  );
}
```

---

## 4️⃣ How It Works

### Data Flow
```
CryptoIntel Component
   │
   ├─► /api/crypto-intel (every 10s)
   │     └─► CoinGecko API: BTC/ETH/SOL prices
   │     └─► CryptoPanic API: trending news
   │     └─► Sentiment calculation
   │
   └─► /api/crypto-intel/history (on mount)
         └─► 60 sampled price points for sparklines
```

### Visual Magic
1. **Sparkline** draws price curve with SVG
2. **Aurora** layer intensity = `abs(24h_change) / 6%`
3. **Color hue** = green (150°) if up, red (10°) if down
4. **Animation speed** = faster on higher volatility

---

## 5️⃣ Customization

### Change Tracked Coins
```ts
// app/components/CryptoIntel.tsx (line 18)
const ids = ["bitcoin", "ethereum", "solana"]; // ← Edit this
```

### Adjust Poll Interval
```ts
// app/components/CryptoIntel.tsx (line 59)
const interval = 10_000; // 10s → change to 5000 for 5s, etc.
```

### Tweak Aurora Colors
```css
/* app/globals.css */
.aurora {
  --h: calc(var(--aurora-hue, 150)); /* Change base hue */
  filter: blur(18px) saturate(140%); /* Adjust blur/saturation */
}
```

---

## 6️⃣ API Rate Limits & Caching

### CoinGecko Free Tier
- **50 calls/min** for price data
- **10,000 calls/month** for market charts
- ✅ Built-in caching: `revalidate: 30` (prices), `revalidate: 60` (history)

### Upgrade Path (Optional)
If you hit limits, add to `.env`:
```env
COINGECKO_API_KEY=your_pro_key_here
```

Then update API routes:
```ts
// Add to fetch URL
const apiKey = process.env.COINGECKO_API_KEY;
const url = `${COINGECKO_API}?x_cg_pro_api_key=${apiKey}&...`;
```

---

## 7️⃣ Testing Locally

```bash
# Start dev server
npm run dev

# Visit http://localhost:3000 and add <CryptoIntel />

# Open console to see poll logs:
# "crypto intel load error:" or "poll error:" → check API keys
```

### Debugging Checklist
- ✅ Files created in `app/api/crypto-intel/`?
- ✅ `Sparkline.tsx` and `CryptoIntel.tsx` in `app/components/`?
- ✅ Aurora CSS in `globals.css`?
- ✅ Component imported and rendered in a page?

---

## 8️⃣ Production Deploy (Netlify)

```bash
# Build and test
npm run build
npm run start

# Deploy
git add .
git commit -m "feat(crypto): add live intel dashboard with aurora sparklines"
git push

# Netlify auto-deploys from main branch
# No env vars needed (uses free CoinGecko API)
```

---

## 9️⃣ Next-Level Enhancements

### A) Add More Coins
```ts
const ids = ["bitcoin", "ethereum", "solana", "cardano", "polygon"];
```

### B) Price Alerts
```tsx
useEffect(() => {
  if (intel?.prices?.bitcoin?.usd > 50000) {
    new Notification("BTC crossed $50k!");
  }
}, [intel]);
```

### C) Chart.js Integration
```tsx
import { Line } from 'react-chartjs-2';

<Line data={{ labels: timestamps, datasets: [{ data: prices }] }} />
```

### D) Websocket Streaming (Advanced)
Replace polling with real-time updates via Coinbase WebSocket:
```ts
const ws = new WebSocket("wss://ws-feed.pro.coinbase.com");
ws.send(JSON.stringify({ type: "subscribe", channels: ["ticker"] }));
```

---

## 🔥 Pro Tips

1. **Reduced Motion**: Aurora respects `prefers-reduced-motion` (already in CSS)
2. **Dark Mode**: All styles use CSS variables → automatic theme support
3. **Mobile**: Sparklines scale with container width (responsive SVG)
4. **Performance**: Edge runtime + ISR caching = blazing fast
5. **Accessibility**: Proper aria labels + keyboard focus states

---

## 📦 File Checklist

After running setup scripts, you should have:

```
✓ app/api/crypto-intel/route.ts
✓ app/api/crypto-intel/history/route.ts
✓ app/components/Sparkline.tsx
✓ app/components/CryptoIntel.tsx
✓ app/globals.css (updated with .aurora)
```

---

## 🐛 Common Issues

### "Failed to fetch crypto intel"
→ CoinGecko API down or rate limited. Wait 1 min and retry.

### Sparkline not showing
→ Need at least 2 data points. Wait for first poll cycle (10s).

### Aurora not animating
→ Check `prefers-reduced-motion` setting in OS. Disable to see animation.

### TypeScript errors
→ Run `npm run type-check` to see specifics. May need `@types/node` update.

---

## 🎯 What's Next?

You now have a production-ready crypto intelligence widget! 

**Want to add payments?** Check out `CRYPTO_PAYMENTS_GUIDE.md` (coming next) for:
- Stripe checkout
- Coinbase Commerce crypto payments
- Post-purchase emails
- Usage tracking

**Questions?** Open an issue or check existing docs in `/DOCS`.

---

**Made with ❤️ for AdGenXAI Beehive**
