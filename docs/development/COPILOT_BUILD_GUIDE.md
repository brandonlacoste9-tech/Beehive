# 🤖 GitHub Copilot Build Guide for AdGenXAI

**What GitHub Copilot Should Build: Complete AdGenXAI Platform Specification**

This document describes the complete vision and architecture of AdGenXAI - an AI-powered advertising creative platform. Use this as the definitive guide for what GitHub Copilot should build when creating or extending the AdGenXAI platform.

---

## 📋 Table of Contents

1. [Platform Overview](#platform-overview)
2. [Core Architecture](#core-architecture)
3. [Feature Specifications](#feature-specifications)
4. [Technical Stack](#technical-stack)
5. [Database Schema](#database-schema)
6. [API Endpoints](#api-endpoints)
7. [UI/UX Components](#uiux-components)
8. [Integration Requirements](#integration-requirements)
9. [Security & Authentication](#security--authentication)
10. [Monetization Strategy](#monetization-strategy)
11. [Deployment Architecture](#deployment-architecture)
12. [Build Instructions](#build-instructions)

---

## 🎯 Platform Overview

### What is AdGenXAI?

AdGenXAI is a **production-ready SaaS platform** that uses AI to generate advertising creative content in seconds. It combines multiple AI models (Google Gemini, OpenAI, Anthropic) with payment processing (Stripe), authentication (Supabase), and newsletter integration (Beehiv) to deliver a complete advertising creative solution.

### Core Value Proposition

- **Speed**: Generate ad creative in under 10 seconds
- **Quality**: Professional-grade headlines, body copy, and image prompts
- **Flexibility**: Multiple AI models, tones, and customization options
- **Monetization**: Built-in payment processing and subscription management
- **Scalability**: Serverless architecture with automatic scaling

### Target Users

- Marketing agencies
- SMB marketing teams
- Freelance advertisers
- Content creators
- Social media managers

---

## 🏗️ Core Architecture

### High-Level System Design

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Layer (Next.js)                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Landing Page │  │  Dashboard   │  │ Creative     │      │
│  │              │  │              │  │ Studio       │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    API Layer (Next.js API Routes)            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ /api/generate│  │ /api/stripe  │  │ /api/auth    │      │
│  │              │  │ /webhook     │  │              │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                     Service Layer                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  AI Models   │  │  Payments    │  │ Email        │      │
│  │  Gemini/GPT  │  │  Stripe      │  │ SendGrid     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                     Data Layer                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Supabase    │  │  Netlify     │  │  External    │      │
│  │  PostgreSQL  │  │  Blobs       │  │  APIs        │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

### Technology Decisions

**Frontend Framework**: Next.js 14 (App Router)
- Server-side rendering for SEO
- API routes for serverless functions
- Static export for Netlify deployment

**AI Integration**: Multi-model approach
- Primary: Google Gemini 1.5 Pro (best price/performance)
- Fallback: OpenAI GPT-4 (high quality)
- Optional: Anthropic Claude (specialized tasks)

**Authentication**: Supabase Auth
- JWT-based sessions
- Row-level security (RLS)
- Email/password + social logins

**Payments**: Stripe
- Subscription management
- 14-day free trials
- Webhook-based automation

**Hosting**: Netlify
- Serverless functions
- Edge CDN distribution
- Automatic deployments from GitHub

---

## 🎨 Feature Specifications

### 1. AI Ad Generation Engine

**What Copilot Should Build:**

A comprehensive ad generation system that:

#### Input Collection
```typescript
interface GenerationRequest {
  productName: string;          // "Eco-Friendly Water Bottle"
  productDescription: string;   // "Keeps drinks cold for 24h..."
  targetAudience: string;       // "Health-conscious millennials"
  tone: 'professional' | 'casual' | 'exciting' | 'friendly' | 'urgent' | 'luxury';
  platform?: 'facebook' | 'instagram' | 'google' | 'linkedin' | 'tiktok';
  model?: 'gemini-1.5-pro' | 'gemini-1.5-flash' | 'gpt-4' | 'claude-3';
}
```

#### Output Generation
```typescript
interface GenerationResult {
  headline: string;             // AI-generated headline
  bodyCopy: string;             // AI-generated body text
  imagePrompt: string;          // DALL-E/Midjourney prompt
  callToAction: string;         // CTA button text
  metadata: {
    model: string;
    timestamp: string;
    processingTime: number;
  };
}
```

#### Core Logic Flow
1. **Validate Input**: Check rate limits, subscription tier
2. **Select AI Model**: Based on user preference + availability
3. **Build Prompt**: Construct optimized prompt for selected model
4. **Call AI API**: With retry logic and timeout handling
5. **Parse Response**: Extract structured data from AI output
6. **Save to Database**: Store generation with user_id
7. **Return to Client**: Format for display

#### File Location
- `/lib/ad-generation.ts` - Core generation logic
- `/app/api/generate/route.ts` - API endpoint
- `/app/components/CreativeStudio/GeneratorForm.tsx` - UI form

### 2. User Dashboard

**What Copilot Should Build:**

#### Dashboard Features

**Usage Analytics**
```typescript
interface UsageStats {
  totalGenerations: number;
  generationsToday: number;
  generationsThisMonth: number;
  quotaRemaining: number;
  quotaLimit: number;
  lastGeneration: Date;
}
```

Display:
- Real-time usage chart (Chart.js)
- Quota progress bars
- Recent activity timeline
- Generation history table

**Generation History**
- Searchable/filterable table
- Export to CSV functionality
- Re-generate variations
- Delete old generations

**Subscription Management**
- Current plan display
- Upgrade/downgrade options
- Payment history
- Invoice downloads (via Stripe)

#### File Locations
- `/app/dashboard/page.tsx` - Main dashboard
- `/app/dashboard/history/page.tsx` - Generation history
- `/app/dashboard/settings/page.tsx` - User settings

### 3. Payment & Subscription System

**What Copilot Should Build:**

#### Pricing Tiers

```typescript
const PRICING_TIERS = {
  FREE: {
    name: 'Free',
    price: 0,
    generationsPerDay: 10,
    models: ['gemini-1.5-flash'],
    features: ['Basic generations', 'History (7 days)', 'Email support']
  },
  PRO: {
    name: 'Pro',
    price: 97,  // $97/month
    generationsPerDay: 100,
    models: ['gemini-1.5-pro', 'gpt-4'],
    features: ['Advanced AI', 'Unlimited history', 'API access', 'Priority support']
  },
  ENTERPRISE: {
    name: 'Enterprise',
    price: 497,  // $497/month
    generationsPerDay: -1,  // Unlimited
    models: ['all'],
    features: ['All models', 'Custom training', 'White-label', 'Dedicated support']
  }
};
```

#### Stripe Integration Flow

1. **Checkout Session Creation** (`/api/stripe/checkout/route.ts`)
   - User clicks "Upgrade to Pro"
   - Create Stripe Checkout Session
   - Redirect to Stripe-hosted checkout
   - Include 14-day trial parameter

2. **Webhook Handling** (`/api/stripe/webhook/route.ts`)
   ```typescript
   // Handle these events:
   - checkout.session.completed
   - customer.subscription.created
   - customer.subscription.updated
   - customer.subscription.deleted
   - invoice.payment_succeeded
   - invoice.payment_failed
   ```

3. **Database Updates**
   ```sql
   -- Update user subscription status
   UPDATE users 
   SET 
     subscription_tier = 'pro',
     subscription_status = 'active',
     stripe_customer_id = $1,
     stripe_subscription_id = $2,
     updated_at = NOW()
   WHERE id = $3;
   ```

4. **Email Notifications**
   - Welcome email on signup
   - Payment success confirmation
   - Payment failure alerts
   - Subscription renewal reminders

#### File Locations
- `/app/api/stripe/checkout/route.ts`
- `/app/api/stripe/webhook/route.ts`
- `/app/api/stripe/portal/route.ts` - Customer portal
- `/lib/stripe.ts` - Stripe client setup

### 4. Authentication & User Management

**What Copilot Should Build:**

#### Supabase Auth Integration

**Sign Up Flow**
```typescript
// /app/auth/signup/page.tsx
async function handleSignUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${APP_URL}/auth/callback`,
      data: {
        subscription_tier: 'free',
        onboarding_completed: false
      }
    }
  });
  
  // Send welcome email
  await sendEmail({
    to: email,
    template: 'welcome',
    data: { email }
  });
}
```

**Sign In Flow**
```typescript
// /app/auth/signin/page.tsx
async function handleSignIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  
  if (!error) {
    router.push('/dashboard');
  }
}
```

**Session Management**
```typescript
// middleware.ts
export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  
  const { data: { session } } = await supabase.auth.getSession();
  
  // Protect /dashboard routes
  if (req.nextUrl.pathname.startsWith('/dashboard') && !session) {
    return NextResponse.redirect(new URL('/auth/signin', req.url));
  }
  
  return res;
}
```

#### Row-Level Security (RLS)

```sql
-- Enable RLS on all tables
ALTER TABLE generations ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own generations
CREATE POLICY "Users can view own generations"
ON generations
FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Users can insert their own generations
CREATE POLICY "Users can create own generations"
ON generations
FOR INSERT
WITH CHECK (auth.uid() = user_id);
```

#### File Locations
- `/app/auth/signup/page.tsx`
- `/app/auth/signin/page.tsx`
- `/app/auth/callback/route.ts`
- `/lib/supabase/client.ts`
- `/lib/supabase/middleware.ts`

### 5. Email System

**What Copilot Should Build:**

#### Email Templates

**Welcome Email** (after signup)
```typescript
{
  subject: "Welcome to AdGenXAI! 🎉",
  body: `
    Hi ${name},
    
    Welcome to AdGenXAI! Your account is ready.
    
    Here's what you can do:
    - Generate 10 ads per day (Free plan)
    - Upgrade for unlimited access
    - Export your ad creative
    
    Get started: ${APP_URL}/dashboard
  `
}
```

**Payment Success**
```typescript
{
  subject: "Payment Successful - AdGenXAI Pro",
  body: `
    Thanks for upgrading to Pro!
    
    Your benefits:
    - 100 generations/day
    - Advanced AI models
    - Priority support
    
    Invoice: ${invoiceUrl}
  `
}
```

**Usage Alert** (approaching quota)
```typescript
{
  subject: "You're running low on generations",
  body: `
    You've used 8/10 of your daily generations.
    
    Upgrade to Pro for 100/day:
    ${APP_URL}/pricing
  `
}
```

#### Email Service Integration

```typescript
// /lib/email.ts
import { SendGrid } from '@sendgrid/mail';

export async function sendEmail({
  to,
  template,
  data
}: EmailOptions) {
  const templates = {
    welcome: getWelcomeTemplate(data),
    payment_success: getPaymentSuccessTemplate(data),
    usage_alert: getUsageAlertTemplate(data)
  };
  
  await sendGrid.send({
    to,
    from: process.env.FROM_EMAIL,
    subject: templates[template].subject,
    html: templates[template].body
  });
}
```

#### File Locations
- `/lib/email.ts` - Email service
- `/lib/email-templates/` - HTML templates

### 6. Analytics & Reporting

**What Copilot Should Build:**

#### User Analytics Dashboard

**Generation Metrics**
```typescript
interface GenerationMetrics {
  totalGenerations: number;
  averagePerDay: number;
  peakUsageTime: string;
  favoriteModel: string;
  favoriteTone: string;
  successRate: number;
}
```

**Chart Components**
- Daily usage line chart
- Model distribution pie chart
- Tone preference bar chart
- Success rate over time

**Admin Analytics** (for ADMIN_USER_IDS)
```typescript
interface PlatformMetrics {
  totalUsers: number;
  activeUsers: number;
  totalGenerations: number;
  revenue: {
    monthly: number;
    annual: number;
  };
  subscriptions: {
    free: number;
    pro: number;
    enterprise: number;
  };
  churnRate: number;
}
```

#### File Locations
- `/app/dashboard/analytics/page.tsx`
- `/app/components/Charts/` - Chart components
- `/lib/analytics.ts` - Analytics logic

---

## 💻 Technical Stack

### Core Technologies

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Framework** | Next.js | 14.2.0 | React framework with SSR |
| **Language** | TypeScript | 5.5.0 | Type-safe JavaScript |
| **Styling** | Tailwind CSS | 3.4.18 | Utility-first CSS |
| **Database** | Supabase (PostgreSQL) | Latest | Database + Auth |
| **Payments** | Stripe | 14.10.0 | Payment processing |
| **AI** | Google Gemini | 0.21.0 | Primary AI model |
| **AI** | OpenAI | 4.67.0 | Fallback AI model |
| **Email** | SendGrid | Latest | Transactional emails |
| **Hosting** | Netlify | - | Serverless deployment |
| **Analytics** | Chart.js | 4.4.0 | Data visualization |

### Development Dependencies

```json
{
  "devDependencies": {
    "@playwright/test": "^1.40.0",      // E2E testing
    "@vitest/ui": "^1.0.0",              // Unit testing
    "eslint": "^8.57.0",                 // Linting
    "prettier": "^3.3.0",                // Code formatting
    "typescript": "^5.5.0",              // Type checking
    "autoprefixer": "^10.4.21",          // CSS processing
    "postcss": "^8.5.6",                 // CSS processing
    "netlify-cli": "^23.9.5"             // Local development
  }
}
```

### Environment Variables

See `.env.example` for complete list. Critical variables:

```bash
# Required for core functionality
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
GEMINI_API_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
SENDGRID_API_KEY=

# Optional enhancements
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
BEEHIV_API_KEY=
```

---

## 🗄️ Database Schema

### Tables

**users** (managed by Supabase Auth)
```sql
CREATE TABLE auth.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**user_profiles** (extends auth.users)
```sql
CREATE TABLE public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  subscription_tier VARCHAR(50) DEFAULT 'free',
  subscription_status VARCHAR(50) DEFAULT 'inactive',
  stripe_customer_id VARCHAR(255),
  stripe_subscription_id VARCHAR(255),
  daily_quota_remaining INTEGER DEFAULT 10,
  total_generations INTEGER DEFAULT 0,
  last_generation_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
ON user_profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON user_profiles FOR UPDATE
USING (auth.uid() = id);
```

**generations**
```sql
CREATE TABLE public.generations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_name VARCHAR(255) NOT NULL,
  product_description TEXT NOT NULL,
  target_audience VARCHAR(255),
  tone VARCHAR(50) NOT NULL,
  platform VARCHAR(50),
  model VARCHAR(100) NOT NULL,
  headline VARCHAR(500),
  body_copy TEXT,
  image_prompt TEXT,
  call_to_action VARCHAR(255),
  processing_time_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE generations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own generations"
ON generations FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create generations"
ON generations FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own generations"
ON generations FOR DELETE
USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX idx_generations_user_id ON generations(user_id);
CREATE INDEX idx_generations_created_at ON generations(created_at DESC);
```

**subscription_events**
```sql
CREATE TABLE public.subscription_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  event_type VARCHAR(100) NOT NULL,
  stripe_event_id VARCHAR(255) UNIQUE,
  data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for Stripe idempotency
CREATE UNIQUE INDEX idx_stripe_event_id ON subscription_events(stripe_event_id);
```

### Database Functions

**Reset Daily Quota** (runs daily via cron)
```sql
CREATE OR REPLACE FUNCTION reset_daily_quotas()
RETURNS void AS $$
BEGIN
  UPDATE user_profiles
  SET daily_quota_remaining = CASE
    WHEN subscription_tier = 'free' THEN 10
    WHEN subscription_tier = 'pro' THEN 100
    WHEN subscription_tier = 'enterprise' THEN 999999
    ELSE 10
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Schedule to run daily at midnight UTC
SELECT cron.schedule(
  'reset-daily-quotas',
  '0 0 * * *',
  $$SELECT reset_daily_quotas()$$
);
```

---

## 🔌 API Endpoints

### Generation Endpoints

**POST /api/generate**
```typescript
// Create new ad generation
Request: {
  productName: string;
  productDescription: string;
  targetAudience: string;
  tone: string;
  platform?: string;
  model?: string;
}

Response: {
  id: string;
  headline: string;
  bodyCopy: string;
  imagePrompt: string;
  callToAction: string;
  metadata: {
    model: string;
    processingTime: number;
  };
}
```

**GET /api/generate/history**
```typescript
// Get user's generation history
Request: {
  page?: number;
  limit?: number;
  search?: string;
}

Response: {
  generations: Generation[];
  total: number;
  page: number;
  totalPages: number;
}
```

**POST /api/generate/variations**
```typescript
// Generate variations of existing ad
Request: {
  generationId: string;
  count: number;  // 1-5
}

Response: {
  variations: Generation[];
}
```

### Payment Endpoints

**POST /api/stripe/checkout**
```typescript
// Create Stripe Checkout session
Request: {
  priceId: string;  // Pro or Enterprise price ID
}

Response: {
  url: string;  // Stripe Checkout URL
}
```

**POST /api/stripe/webhook**
```typescript
// Handle Stripe webhooks
Request: {
  type: string;
  data: object;
}

Response: {
  received: true;
}
```

**POST /api/stripe/portal**
```typescript
// Create customer portal session
Request: {}

Response: {
  url: string;  // Stripe portal URL
}
```

### User Endpoints

**GET /api/user/profile**
```typescript
// Get user profile
Response: {
  id: string;
  email: string;
  subscriptionTier: string;
  subscriptionStatus: string;
  quotaRemaining: number;
  totalGenerations: number;
}
```

**PATCH /api/user/profile**
```typescript
// Update user profile
Request: {
  name?: string;
  preferences?: object;
}

Response: {
  updated: true;
}
```

**GET /api/user/usage**
```typescript
// Get usage statistics
Response: {
  totalGenerations: number;
  generationsToday: number;
  generationsThisMonth: number;
  quotaRemaining: number;
  quotaLimit: number;
}
```

---

## 🎨 UI/UX Components

### Component Hierarchy

```
App
├── Layout (Root)
│   ├── Header
│   │   ├── Logo
│   │   ├── Navigation
│   │   └── UserMenu
│   ├── Main Content
│   └── Footer
│
├── Landing Page (/)
│   ├── Hero Section
│   │   ├── Headline
│   │   ├── Subheadline
│   │   └── CTA Button
│   ├── Features Section
│   │   └── Feature Cards (x6)
│   ├── Demo Section
│   │   └── Interactive Demo
│   ├── Pricing Section
│   │   └── Pricing Cards (x3)
│   └── Testimonials Section
│
├── Creative Studio (/creative-studio)
│   ├── Generator Form
│   │   ├── Input Fields
│   │   ├── Tone Selector
│   │   ├── Model Selector
│   │   └── Generate Button
│   ├── Preview Panel
│   │   ├── Ad Preview
│   │   ├── Copy Buttons
│   │   └── Export Options
│   └── History Sidebar
│
└── Dashboard (/dashboard)
    ├── Overview
    │   ├── Stats Cards
    │   ├── Usage Chart
    │   └── Recent Activity
    ├── History
    │   ├── Search/Filter
    │   ├── Data Table
    │   └── Pagination
    └── Settings
        ├── Profile Form
        ├── Subscription Card
        └── Preferences
```

### Key Components to Build

**1. GeneratorForm.tsx**
```typescript
'use client';

import { useState } from 'react';

export function GeneratorForm() {
  const [formData, setFormData] = useState({
    productName: '',
    productDescription: '',
    targetAudience: '',
    tone: 'professional'
  });
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  
  async function handleGenerate() {
    setLoading(true);
    
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    
    const data = await response.json();
    setResult(data);
    setLoading(false);
  }
  
  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Form fields */}
      <input
        type="text"
        placeholder="Product Name"
        value={formData.productName}
        onChange={(e) => setFormData({...formData, productName: e.target.value})}
        className="w-full px-4 py-2 border rounded-lg"
      />
      
      {/* More fields... */}
      
      <button
        onClick={handleGenerate}
        disabled={loading}
        className="w-full bg-blue-600 text-white py-3 rounded-lg"
      >
        {loading ? 'Generating...' : 'Generate Ad Creative'}
      </button>
      
      {result && <AdPreview result={result} />}
    </div>
  );
}
```

**2. PricingCard.tsx**
```typescript
interface PricingCardProps {
  tier: 'free' | 'pro' | 'enterprise';
  price: number;
  features: string[];
  highlighted?: boolean;
}

export function PricingCard({ tier, price, features, highlighted }: PricingCardProps) {
  return (
    <div className={`
      border rounded-xl p-8
      ${highlighted ? 'border-blue-500 shadow-xl' : 'border-gray-200'}
    `}>
      <h3 className="text-2xl font-bold capitalize">{tier}</h3>
      <div className="mt-4">
        <span className="text-5xl font-bold">${price}</span>
        <span className="text-gray-600">/month</span>
      </div>
      
      <ul className="mt-6 space-y-3">
        {features.map((feature, i) => (
          <li key={i} className="flex items-center">
            <CheckIcon className="w-5 h-5 text-green-500 mr-2" />
            {feature}
          </li>
        ))}
      </ul>
      
      <button className="w-full mt-8 bg-blue-600 text-white py-3 rounded-lg">
        {tier === 'free' ? 'Get Started' : 'Upgrade Now'}
      </button>
    </div>
  );
}
```

**3. UsageChart.tsx**
```typescript
'use client';

import { Line } from 'react-chartjs-2';

export function UsageChart({ data }) {
  const chartData = {
    labels: data.map(d => d.date),
    datasets: [{
      label: 'Generations',
      data: data.map(d => d.count),
      borderColor: 'rgb(59, 130, 246)',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      tension: 0.4
    }]
  };
  
  return (
    <div className="bg-white p-6 rounded-xl shadow">
      <h3 className="text-lg font-semibold mb-4">Usage Over Time</h3>
      <Line data={chartData} />
    </div>
  );
}
```

---

## 🔐 Security & Authentication

### Security Requirements

**1. Environment Variables**
- Never commit secrets to Git
- Use `.env.local` for development
- Store in Netlify for production
- Validate all required env vars on startup

**2. Row-Level Security (RLS)**
- Enable on all user-data tables
- Policy: `auth.uid() = user_id`
- Test with different user accounts

**3. API Route Protection**
```typescript
// middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  
  // Check authentication
  const { data: { session } } = await supabase.auth.getSession();
  
  // Protect /api/* routes (except webhooks)
  if (req.nextUrl.pathname.startsWith('/api') && 
      !req.nextUrl.pathname.includes('/webhook')) {
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
  }
  
  return res;
}
```

**4. Rate Limiting**
```typescript
// lib/rate-limit.ts
import { LRUCache } from 'lru-cache';

const rateLimiters = new Map();

export function rateLimit(identifier: string, limit: number) {
  if (!rateLimiters.has(identifier)) {
    rateLimiters.set(identifier, new LRUCache({
      max: 500,
      ttl: 60000 // 1 minute
    }));
  }
  
  const tokenCount = rateLimiters.get(identifier).get(identifier) || 0;
  
  if (tokenCount >= limit) {
    return { success: false };
  }
  
  rateLimiters.get(identifier).set(identifier, tokenCount + 1);
  return { success: true };
}
```

**5. Input Validation**
```typescript
// lib/validation.ts
import { z } from 'zod';

export const GenerationRequestSchema = z.object({
  productName: z.string().min(1).max(255),
  productDescription: z.string().min(10).max(2000),
  targetAudience: z.string().max(255),
  tone: z.enum(['professional', 'casual', 'exciting', 'friendly', 'urgent', 'luxury']),
  platform: z.enum(['facebook', 'instagram', 'google', 'linkedin', 'tiktok']).optional(),
  model: z.string().optional()
});
```

**6. CORS Configuration**
```typescript
// netlify.toml
[[headers]]
  for = "/api/*"
  [headers.values]
    Access-Control-Allow-Origin = "https://www.adgenxai.pro"
    Access-Control-Allow-Methods = "GET, POST, OPTIONS"
    Access-Control-Allow-Headers = "Content-Type, Authorization"
```

---

## 💰 Monetization Strategy

### Pricing Model

**Free Tier** (Lead Generation)
- Purpose: Convert visitors to users
- Quota: 10 generations/day
- Features: Basic AI, 7-day history
- Conversion goal: 5-10% to Pro

**Pro Tier** ($97/month)
- Target: SMBs and freelancers
- Quota: 100 generations/day
- Features: Advanced AI, unlimited history, API access
- Primary revenue driver

**Enterprise Tier** ($497/month)
- Target: Agencies and large teams
- Quota: Unlimited
- Features: All models, custom training, white-label
- High-value customers

### Revenue Optimization

**1. Free Trial Strategy**
```typescript
// 14-day free trial on Pro/Enterprise
const checkoutSession = await stripe.checkout.sessions.create({
  mode: 'subscription',
  line_items: [{
    price: STRIPE_PRICE_PRO,
    quantity: 1
  }],
  subscription_data: {
    trial_period_days: 14
  }
});
```

**2. Usage-Based Upsells**
```typescript
// Show upgrade prompt when quota is low
if (quotaRemaining <= 2 && tier === 'free') {
  showUpgradeModal({
    message: "You're almost out of generations!",
    cta: "Upgrade to Pro for 100/day",
    ctaLink: "/pricing"
  });
}
```

**3. Annual Billing Discount**
```typescript
// Offer 20% discount for annual payment
const PRICING = {
  pro_monthly: 97,
  pro_annual: 970,  // $80.83/month (16% savings)
  enterprise_monthly: 497,
  enterprise_annual: 4970  // $414.17/month (16% savings)
};
```

---

## 🚀 Deployment Architecture

### Netlify Configuration

**netlify.toml**
```toml
[build]
  command = "npm run build && npm run export"
  publish = "out"
  functions = "netlify/functions"

[build.environment]
  NODE_VERSION = "18"
  NPM_VERSION = "9"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Permissions-Policy = "geolocation=(), microphone=(), camera=()"
```

### CI/CD Pipeline

**GitHub Actions** (`.github/workflows/deploy.yml`)
```yaml
name: Deploy to Netlify

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Type check
        run: npm run type-check
      
      - name: Lint
        run: npm run lint
      
      - name: Test
        run: npm test
      
      - name: Build
        run: npm run build
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
      
      - name: Deploy to Netlify
        uses: netlify/actions/cli@master
        with:
          args: deploy --prod
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

### Performance Optimization

**1. Static Generation**
```typescript
// app/page.tsx (Landing page)
export const revalidate = 3600; // Revalidate every hour

export default async function HomePage() {
  // Static generation for fast load times
  return <LandingPage />;
}
```

**2. Image Optimization**
```typescript
import Image from 'next/image';

<Image
  src="/hero-image.jpg"
  alt="AdGenXAI Platform"
  width={1200}
  height={600}
  priority
  quality={85}
/>
```

**3. Code Splitting**
```typescript
import dynamic from 'next/dynamic';

const CreativeStudio = dynamic(
  () => import('@/components/CreativeStudio'),
  { ssr: false, loading: () => <Spinner /> }
);
```

---

## 🛠️ Build Instructions

### Step-by-Step Setup

**1. Clone Repository**
```bash
git clone https://github.com/brandonlacoste9-tech/Beehive.git
cd Beehive
```

**2. Install Dependencies**
```bash
npm install
```

**3. Configure Environment**
```bash
cp .env.example .env.local

# Edit .env.local with your credentials
# Required: SUPABASE_URL, SUPABASE_ANON_KEY, GEMINI_API_KEY, STRIPE_SECRET_KEY
```

**4. Set Up Supabase**
```bash
# Create project at https://supabase.com
# Run migrations (see Database Schema section)
# Enable email authentication
# Configure RLS policies
```

**5. Set Up Stripe**
```bash
# Create account at https://stripe.com
# Create products for Pro ($97/mo) and Enterprise ($497/mo)
# Get Price IDs and add to .env.local
# Set up webhook endpoint: https://your-domain.com/api/stripe/webhook
# Add webhook secret to .env.local
```

**6. Development Server**
```bash
npm run dev
# Visit http://localhost:3000
```

**7. Build & Test**
```bash
npm run type-check  # TypeScript validation
npm run lint        # ESLint
npm test           # Vitest unit tests
npm run e2e        # Playwright E2E tests
npm run build      # Production build
```

**8. Deploy to Netlify**
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod
```

### Testing Checklist

- [ ] User can sign up with email/password
- [ ] User receives welcome email
- [ ] Free tier allows 10 generations/day
- [ ] Generation produces valid headline, body, and image prompt
- [ ] Stripe checkout works for Pro tier
- [ ] Webhook updates user subscription status
- [ ] Pro tier allows 100 generations/day
- [ ] Generation history displays correctly
- [ ] CSV export works
- [ ] Quota resets daily
- [ ] Rate limiting prevents abuse
- [ ] RLS policies prevent data leaks

---

## 📊 Success Metrics

### KPIs to Track

**User Acquisition**
- Signups per day
- Free-to-Pro conversion rate (target: 5-10%)
- Pro-to-Enterprise conversion rate (target: 2-5%)

**Engagement**
- Generations per user per day
- Feature usage (models, tones, platforms)
- Session duration
- Return rate (DAU/MAU)

**Revenue**
- Monthly Recurring Revenue (MRR)
- Customer Lifetime Value (LTV)
- Churn rate (target: <5%/month)
- Average Revenue Per User (ARPU)

**Technical**
- API response time (target: <2s)
- Uptime (target: 99.9%)
- Error rate (target: <0.1%)
- Generation success rate (target: >95%)

---

## 🎓 Best Practices

### Code Quality

**1. TypeScript Strict Mode**
```typescript
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true
  }
}
```

**2. Error Handling**
```typescript
try {
  const result = await generateAd(params);
  return { success: true, data: result };
} catch (error) {
  console.error('Generation failed:', error);
  
  // Log to error tracking service
  await logError(error, { userId, params });
  
  // Return user-friendly error
  return {
    success: false,
    error: 'Failed to generate ad. Please try again.'
  };
}
```

**3. Testing Strategy**
```typescript
// Unit tests for business logic
describe('Ad Generation', () => {
  it('should generate headline from product info', () => {
    const result = generateHeadline({
      productName: 'Water Bottle',
      tone: 'exciting'
    });
    
    expect(result).toContain('Water Bottle');
    expect(result.length).toBeLessThan(100);
  });
});

// Integration tests for API routes
describe('POST /api/generate', () => {
  it('should require authentication', async () => {
    const response = await fetch('/api/generate', {
      method: 'POST',
      body: JSON.stringify({})
    });
    
    expect(response.status).toBe(401);
  });
});

// E2E tests for user flows
test('User can generate ad', async ({ page }) => {
  await page.goto('/creative-studio');
  await page.fill('[name=productName]', 'Test Product');
  await page.click('button:has-text("Generate")');
  await expect(page.locator('.headline')).toBeVisible();
});
```

---

## 🔄 Maintenance & Updates

### Regular Tasks

**Daily**
- Monitor error logs
- Check generation success rate
- Review support tickets

**Weekly**
- Analyze usage patterns
- Review user feedback
- Update AI prompts based on results

**Monthly**
- Review and optimize database queries
- Update dependencies
- Analyze revenue metrics
- A/B test pricing/features

**Quarterly**
- Add new AI models
- Launch new features
- Review and update documentation
- Security audit

---

## 📚 Additional Resources

### Documentation Links

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Stripe API Reference](https://stripe.com/docs/api)
- [Google Gemini API](https://ai.google.dev/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Netlify Functions](https://docs.netlify.com/functions/overview/)

### Internal Documentation

- `/README.md` - Project overview
- `/IMPLEMENTATION_GUIDE.md` - Feature implementation details
- `/copilot-instructions.md` - Copilot code review guidelines
- `/.env.example` - Environment variable reference
- `/CHANGELOG.md` - Version history

---

## ✅ Summary: What Copilot Should Build

When GitHub Copilot builds AdGenXAI, it should create:

### Core Application
1. ✅ **Landing page** with hero, features, pricing, and CTA
2. ✅ **Creative Studio** with AI generation form and real-time preview
3. ✅ **User Dashboard** with analytics, history, and settings
4. ✅ **Authentication** system with Supabase (signup, signin, sessions)
5. ✅ **Payment** integration with Stripe (checkout, webhooks, portal)

### Backend Services
6. ✅ **AI generation API** with multi-model support (Gemini, GPT-4, Claude)
7. ✅ **Database** schema with RLS policies
8. ✅ **Email** service with templates (welcome, payment, alerts)
9. ✅ **Webhook** handlers for Stripe events
10. ✅ **Rate limiting** and quota management

### Infrastructure
11. ✅ **Netlify** deployment configuration
12. ✅ **CI/CD** pipeline with GitHub Actions
13. ✅ **Environment** variable management
14. ✅ **Monitoring** and error tracking
15. ✅ **Security** headers and RLS policies

### Documentation
16. ✅ **User** documentation (README, guides)
17. ✅ **Developer** documentation (API, schema)
18. ✅ **Deployment** documentation (Netlify, Supabase)
19. ✅ **Testing** documentation (unit, integration, E2E)

---

**This is the complete specification for AdGenXAI. Use this guide to understand the full scope of what should be built, maintained, and extended.**

© 2025 AdGenXAI - Built with GitHub Copilot
