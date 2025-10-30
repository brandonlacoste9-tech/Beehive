# 🐝 AdGenXAI - AI-Powered Advertising Creative Platform

**Transform your advertising with AI-generated creative in seconds.**

AdGenXAI is a complete, production-ready platform that combines Google Gemini AI, Stripe payments, Supabase authentication, and Beehiv newsletter integration to deliver a powerful SaaS solution for AI-powered ad creative generation.

🌐 **Live Demo**: [www.adgenxai.pro](https://www.adgenxai.pro)

---

## ✨ Features

### 🎨 **AI Ad Generation**
- Generate compelling headlines, body copy, and image prompts
- Multiple AI models (Gemini 1.5 Pro, Gemini Flash)
- 6 tone options (Professional, Casual, Exciting, Friendly, Urgent, Luxury)
- Real-time generation with fallback support

### 💰 **Monetization**
- 3-tier pricing: Free, Pro ($97/mo), Enterprise ($497/mo)
- Stripe Checkout with 14-day free trial
- Customer portal for subscription management
- Automated webhook handling for payments
- Usage limits and quota enforcement

### 🔐 **Authentication & Security**
- Supabase Auth with email/password
- JWT token-based sessions
- Protected API routes with middleware
- Row-level security policies
- Secure password requirements

### 📊 **User Dashboard**
- Real-time usage analytics with Chart.js
- Generation history with search and export (CSV)
- Subscription management
- Usage quota tracking
- Recent activity feed

### 📧 **Newsletter Integration**
- Beehiv API integration
- Subscriber management
- Newsletter campaigns
- UTM tracking
- Webhook synchronization

### 🧠 **AI Sensory Cortex**
- Health monitoring endpoints
- Real-time system status
- Event processing webhooks
- Type-safe TypeScript implementation

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Netlify account
- Supabase account
- Stripe account
- Google Gemini API key
- Beehiv account (optional)

### 1. Clone & Install

```bash
git clone https://github.com/brandonlacoste9-tech/Beehive.git
cd Beehive
npm install
```

### 2. Set Up Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Fill in all required variables (see `.env.example` for details).

### 3. Set Up Database

Run the migration in Supabase SQL Editor:
```sql
-- Copy contents of: supabase/migrations/001_initial_schema.sql
```

### 4. Configure Stripe

1. Create Products in Stripe Dashboard
2. Get Price IDs and add to `.env.local`
3. Set up webhook endpoint

### 5. Run Development

```bash
npm run dev
```

Visit `http://localhost:3000`

---

## 📖 Documentation

- **Getting Started**: [wiki/GettingStarted.md](wiki/GettingStarted.md)
- **Gemini Integration**: [wiki/Gemini.md](wiki/Gemini.md)
- **Beehiv Integration**: [scrolls/beehiv-integration.md](scrolls/beehiv-integration.md)
- **Rituals & Checklists**: [scrolls/rituals.md](scrolls/rituals.md)

---

## 🎯 Pricing Tiers

| Feature | Free | Pro ($97/mo) | Enterprise ($497/mo) |
|---------|------|--------------|----------------------|
| Generations/day | 10 | 100 | Unlimited |
| AI Models | Basic | Advanced | All + Custom |
| History & Export | ✅ | ✅ | ✅ |
| API Access | ❌ | ✅ | ✅ |
| Support | Email | Priority | 24/7 Dedicated |

---

## 🔧 Tech Stack

- **Framework**: Next.js 14 + TypeScript
- **Styling**: Tailwind CSS 3.4
- **AI**: Google Gemini 1.5 Pro
- **Auth**: Supabase
- **Payments**: Stripe
- **Newsletter**: Beehiv
- **Deployment**: Netlify
- **Charts**: Chart.js

---

## 🚢 Deployment

Deploy to Netlify:
1. Connect GitHub repo
2. Build command: `npm run build && npm run export`
3. Publish directory: `out`
4. Add environment variables

---

## 📄 License

MIT License - See [LICENSE](LICENSE)

---

## 🆘 Support

- **Email**: support@adgenxai.pro
- **Health Check**: https://www.adgenxai.pro/.netlify/functions/health
- **Issues**: https://github.com/brandonlacoste9-tech/Beehive/issues

---

**Built with ❤️ using Claude Code**

© 2025 AdGenXAI. All rights reserved.