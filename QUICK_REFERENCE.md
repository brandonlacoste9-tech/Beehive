# ⚡ Quick Reference - Crypto Intel Stack

## 🚀 One-Liner Deploy

```bash
setup-crypto-dirs.bat && powershell -ExecutionPolicy Bypass -File setup-crypto-files.ps1 && npm i && npm run dev
```

---

## 📁 File Map

```
Beehive/
├── app/
│   ├── components/
│   │   ├── Sparkline.tsx          ✅ Created
│   │   ├── CryptoIntel.tsx        ✅ Created
│   │   ├── ThemeToggle.tsx        ✅ Exists
│   │   ├── MetricCounter.tsx      ✅ Exists
│   │   └── UsageBadge.tsx         ✅ Exists
│   │
│   ├── api/                        ⚡ Run setup-crypto-files.ps1
│   │   └── crypto-intel/
│   │       ├── route.ts           🔜 Will create
│   │       └── history/
│   │           └── route.ts       🔜 Will create
│   │
│   └── globals.css                 ✅ Updated (aurora styles)
│
├── setup-crypto-dirs.bat           ✅ Created
├── setup-crypto-files.ps1          ✅ Created
├── setup-complete-stack.ps1        ✅ Created
├── CRYPTO_INTEL_SETUP.md           ✅ Created
└── IMPLEMENTATION_STATUS.md        ✅ Created
```

---

## 🎯 Quick Commands

### Setup
```cmd
REM Windows CMD
setup-crypto-dirs.bat

REM PowerShell
powershell -ExecutionPolicy Bypass -File setup-crypto-files.ps1
```

### Development
```bash
npm run dev               # Start dev server
npm run build             # Production build
npm run type-check        # TypeScript validation
npm run lint              # ESLint check
```

### Testing API Endpoints
```bash
# Prices
curl http://localhost:3000/api/crypto-intel

# History
curl http://localhost:3000/api/crypto-intel/history?ids=bitcoin,ethereum&points=60
```

---

## 🎨 Usage Examples

### Basic
```tsx
import CryptoIntel from "@/components/CryptoIntel";

<CryptoIntel />
```

### With Section Wrapper
```tsx
<section className="max-w-7xl mx-auto px-6 py-12">
  <h2 className="text-3xl font-bold mb-6">Market Pulse</h2>
  <CryptoIntel />
</section>
```

### Custom Sparkline
```tsx
import Sparkline from "@/components/Sparkline";

<Sparkline
  values={[100, 102, 98, 105, 103]}
  width={200}
  height={60}
  stroke="#10B981"
  fill="rgba(16,185,129,0.12)"
/>
```

---

## 🔧 Common Customizations

### Change Coins
```tsx
// app/components/CryptoIntel.tsx (line 18)
const ids = ["bitcoin", "ethereum", "solana", "cardano"];
```

### Poll Faster
```tsx
// app/components/CryptoIntel.tsx (line 59)
const interval = 5_000; // 5 seconds
```

### More Sparkline Points
```tsx
// app/components/CryptoIntel.tsx (line 19)
const points = 120; // 2x resolution
```

### Aurora Intensity
```css
/* app/globals.css */
.aurora {
  filter: blur(24px) saturate(160%); /* More intense */
}
```

---

## 🐛 Quick Fixes

### Sparkline Empty?
→ Wait 10s for first data poll

### Aurora Not Moving?
→ Check OS "Reduce motion" settings

### API 429 Error?
→ Increase poll interval or add API key

### Build Error?
→ Run `npm run type-check` to see details

---

## 📊 Component Props

### Sparkline
```tsx
type Props = {
  values: number[];         // Required: price array
  width?: number;          // Default: 160
  height?: number;         // Default: 48
  stroke?: string;         // Default: "#10B981"
  fill?: string;           // Default: "rgba(16,185,129,0.12)"
  strokeWidth?: number;    // Default: 2
  className?: string;
};
```

### CryptoIntel
```tsx
// No props - fully self-contained
<CryptoIntel />
```

---

## 🌐 API Response Schemas

### /api/crypto-intel
```json
{
  "timestamp": "2025-01-31T12:34:56.789Z",
  "prices": {
    "bitcoin": {
      "usd": 42000.50,
      "usd_24h_change": 2.34
    },
    "ethereum": { /* ... */ }
  },
  "topNews": [
    {
      "title": "BTC breaks $42k...",
      "url": "https://...",
      "votes": { /* ... */ }
    }
  ],
  "sentiment": "📈 Cautiously optimistic"
}
```

### /api/crypto-intel/history
```json
{
  "timestamp": "2025-01-31T12:34:56.789Z",
  "ids": ["bitcoin", "ethereum"],
  "points": 60,
  "results": {
    "bitcoin": {
      "samples": [
        { "t": 1706700000000, "p": 41500.25 },
        { "t": 1706701000000, "p": 41550.75 }
      ]
    }
  }
}
```

---

## 🎨 CSS Variables

```css
/* Theme tokens (auto dark/light) */
--bg              /* Background color */
--text            /* Text color */
--card            /* Card background */
--border          /* Border color */

/* Aurora animation (set inline) */
--aurora-intensity   /* 0-1 based on volatility */
--aurora-hue        /* 150 (green) or 10 (red) */
--aurora-speed      /* Animation speed in seconds */
```

---

## 📦 Dependencies Added

```json
{
  "@stripe/stripe-js": "^2.4.0",
  "framer-motion": "^12.23.24",
  "stripe": "^14.10.0",
  "zod": "^3.23.0",
  "nodemailer": "^6.9.0"
}
```

**Optional** (for payments/blog):
```bash
npm i coinbase-commerce-node gray-matter marked
```

---

## 🚦 Status Indicators

| Symbol | Meaning |
|--------|---------|
| ✅ | Completed |
| 🔜 | Ready to create (run script) |
| ⚡ | Action required |
| 🎯 | Current focus |
| 🔮 | Future enhancement |

---

## 📞 Quick Help

**Setup issues?**  
→ Read `CRYPTO_INTEL_SETUP.md`

**Implementation questions?**  
→ Check `IMPLEMENTATION_STATUS.md`

**Want full stack?**  
→ Run `setup-complete-stack.ps1`

**TypeScript errors?**  
→ Run `npm run type-check`

**Build errors?**  
→ Run `npm run build` and check output

---

## ✅ Pre-Commit Checklist

- [ ] All files created
- [ ] `npm run build` succeeds
- [ ] `npm run type-check` passes
- [ ] `npm run lint` passes
- [ ] Local dev server works
- [ ] Crypto intel renders
- [ ] Sparklines show after 10s
- [ ] Aurora glows animate

---

**Ready?** Run the setup scripts and start coding! 🚀
