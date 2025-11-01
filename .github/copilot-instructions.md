# Copilot Instructions for AdGenXAI (Beehive)

This guide provides context and instructions for GitHub Copilot when working with the AdGenXAI repository.

---

## Project Overview

**AdGenXAI** is an AI-powered advertising creative platform that helps users generate compelling ad copy, headlines, and creative ideas using multiple AI providers (Google Gemini, OpenAI). The platform includes:

- AI-powered ad generation with multiple tone options
- Subscription management via Stripe
- User authentication and authorization via Supabase
- Newsletter integration with Beehiv
- Real-time analytics and usage tracking
- Netlify deployment with serverless functions

---

## Technologies & Tools

### Core Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript 5.5+ (strict mode enabled)
- **Styling**: Tailwind CSS 3.4
- **Package Manager**: npm (>=9.0.0)
- **Node Version**: >=18.0.0

### Key Dependencies
- **AI Providers**: 
  - Google Gemini (`@google/generative-ai`)
  - OpenAI (`openai`)
  - Anthropic Claude (`@anthropic-ai/sdk`)
  - Azure AI (`@azure-rest/ai-inference`)
- **Database**: Supabase (`@supabase/supabase-js`)
- **Payments**: Stripe (`stripe`, `@stripe/stripe-js`, `@stripe/react-stripe-js`)
- **Charts**: Chart.js (`chart.js`, `react-chartjs-2`)
- **Animation**: Framer Motion (`framer-motion`)
- **Newsletter**: Beehiv API integration
- **Deployment**: Netlify Functions (`@netlify/functions`)

### Testing & Quality
- **Unit Tests**: Vitest with React Testing Library
- **E2E Tests**: Playwright
- **Linting**: ESLint with Next.js config
- **Type Checking**: TypeScript strict mode

---

## Development Workflow

### Setup & Installation
```bash
npm install                # Install dependencies
cp .env.example .env.local # Set up environment variables
npm run dev               # Start development server
```

### Available Scripts
- `npm run dev` - Start development server on port 3000
- `npm run build` - Build for production
- `npm run export` - Export static site
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking
- `npm run test` - Run unit tests with Vitest
- `npm run test:watch` - Run tests in watch mode
- `npm run e2e` - Run Playwright E2E tests
- `npm run validate` - Run type-check + lint (use before commits)

### Before Committing
**Always run:**
```bash
npm run validate    # TypeScript + ESLint
npm run test        # Unit tests
```

---

## Repository Structure

```
/app              - Next.js App Router pages and API routes
  /api            - API endpoints (serverless functions)
  /dashboard      - Protected dashboard pages
/lib              - Shared utilities and helpers
  /providers      - AI provider adapters (OpenAI, Gemini, etc.)
  /supabase       - Supabase client and types
/public           - Static assets
/styles           - Global styles and Tailwind config
/test             - Test files and utilities
/netlify          - Netlify-specific configurations
  /functions      - Netlify serverless functions
/scripts          - Build and maintenance scripts
```

---

## Code Review Priorities

### 1. Security (Blocking)
- ✅ **No secrets in code**: All config from `process.env.*`
- ✅ **RLS policies enforced**: All Supabase queries respect Row-Level Security
- ✅ **Auth checks**: Every API route verifies `session?.user.id` and ownership
- ✅ **OWASP Top 10**: Guard against injection, XSS, CSRF, etc.

### 2. Correctness (Blocking)
- ✅ **Provider fallback logic**: OpenAI → Gemini → GitHub Models
- ✅ **Streaming handlers**: Complete and non-blocking with AbortController
- ✅ **Real-time subscriptions**: Work bidirectionally via Supabase
- ✅ **Tests**: Cover all new/changed behavior

### 3. Quality Gates (Non-blocking, mergeable if documented)
- ✅ **ESLint clean**: Pass `npm run lint`
- ✅ **TypeScript strict**: Pass `npm run type-check`
- ✅ **Test coverage**: Unit tests for new functions
- ✅ **Docs in sync**: Update relevant documentation

---

## Coding Standards

### TypeScript
- Use strict mode (enabled in `tsconfig.json`)
- Prefer interfaces over types for object shapes
- Use proper typing; avoid `any` unless absolutely necessary
- Export types from shared locations

### React/Next.js
- Use App Router conventions (not Pages Router)
- Server Components by default; use `'use client'` only when needed
- Use React Server Actions for form submissions when appropriate
- Prefer async/await over promises for readability

### API Routes
- Always verify authentication and authorization
- Use proper HTTP status codes
- Include error handling with try/catch
- Return consistent response formats
- Document expected request/response shapes

### Testing
- Write unit tests for utility functions and helpers
- Write integration tests for API routes
- Use descriptive test names: `test("should do X when Y happens")`
- Mock external dependencies (AI APIs, Stripe, Supabase)

### Security
- Never hardcode API keys or secrets
- Always use environment variables via `process.env.*`
- Validate and sanitize user input
- Use parameterized queries to prevent SQL injection
- Implement proper CORS for API routes

---

## AI Provider Integration

### Providers (PR-3)
- **Primary**: Google Gemini (`gemini-1.5-pro`, `gemini-1.5-flash`)
- **Fallback**: OpenAI (`gpt-4-turbo`, `gpt-4o`)
- **Additional**: GitHub Models (free tier), Anthropic Claude, Azure AI
- **Selection**: Via `AI_PROVIDER=gemini|openai|github` env var
- **Streaming**: Server-Sent Events (SSE) with AbortController
- **Error handling**: Exponential backoff, circuit breaker, fallback trigger

### Implementation Pattern
```typescript
// lib/providers/gemini-adapter.ts
async function streamCompletion(
  params: StreamCompletionParams,
  signal?: AbortSignal
): Promise<ReadableStream<string>> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY not set");
  }
  
  // Implementation with proper error handling
  // Use signal for cancellation support
  // Throw errors to trigger fallback chain
}
```

---

## Database & Auth (PR-1 & PR-5)

### Supabase Configuration
- **Engine**: Supabase PostgreSQL
- **Data access**: Prefer views/RPC over ad-hoc SQL in API routes
- **RLS**: Row-level security enforced on all tables
- **Real-time**: Use `onSubscription` for live updates
- **Types**: Generated from Supabase schema via `supabase gen types`

### Authentication
- **Service**: Supabase Auth (JWT tokens in session cookie)
- **Verification**: Every API route checks `session?.user.id` + ownership
- **RLS enforcement**: Queries automatically scoped to `auth.uid()` via policies
- **Dashboard**: Reads user/org context from `session` (not localStorage)

### Example: Secure API Route
```typescript
// app/api/ads/route.ts
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const supabase = createClient();
  
  // Check authentication
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return new Response('Unauthorized', { status: 401 });
  }
  
  // Query with RLS - automatically filtered by user
  const { data, error } = await supabase
    .from('ads')
    .select('*')
    // RLS policies ensure user can only see their own data
    
  if (error) {
    return new Response(error.message, { status: 500 });
  }
  
  return Response.json(data);
}
```

---

## Pull Request Guidelines

### PR Size & Scope
- ✅ **Keep PRs focused**: < 400 LOC net change
- ✅ **Split large changes**: One PR per feature/area
- ✅ **Atomic commits**: Each commit should be a logical unit

### PR Requirements
1. **Title format**: `feat|fix|docs|refactor(scope): description`
2. **Description**: Include context, changes, and testing notes
3. **Tests**: Add/update tests for behavior changes
4. **Docs**: Update relevant documentation
5. **Labels**: Apply appropriate labels (PR-1, PR-3, PR-5 for Phase-2)
6. **Validation**: Ensure `npm run validate` passes

### When Suggesting Fixes

**If you find issues during review:**

1. **Check severity**
   - 🔴 Blocking: Security, RLS bypass, secrets, broken tests → Request fixes before merge
   - 🟡 Non-blocking: Style, minor optimization → Suggest, allow merge with note
   - 🟢 Nice-to-have: Refactor opportunity, performance polish → Comment for future

2. **Propose a stacked PR**
   - One PR per area (Providers / Supabase / Auth)
   - Include: 1-paragraph rationale + bullet list of files + test notes
   - Title format: `fix(phase2): [area] [specific issue] (CCR-suggested)`
   - Reference the original PR in description

---

## Testing Requirements

### Unit Tests
- Use Vitest with React Testing Library
- Test files: `*.test.ts` or `*.test.tsx`
- Cover utility functions, hooks, and components
- Mock external dependencies

### E2E Tests
- Use Playwright for end-to-end testing
- Test files: `test/**/*.spec.ts`
- Cover critical user flows
- Test across multiple browsers when needed

### Example Test
```typescript
// lib/utils/format.test.ts
import { describe, test, expect } from 'vitest';
import { formatCurrency } from './format';

describe('formatCurrency', () => {
  test('should format USD correctly', () => {
    expect(formatCurrency(1234.56, 'USD')).toBe('$1,234.56');
  });
  
  test('should handle zero', () => {
    expect(formatCurrency(0, 'USD')).toBe('$0.00');
  });
});
```

---

## Documentation

### Keep in Sync
When making changes, update relevant docs:
- `README.md` - High-level overview and quick start
- `CONTRIBUTING.md` - Contribution guidelines
- `docs/PROVIDER_INTEGRATION.md` - AI provider setup (if exists)
- `docs/DATABASE_SCHEMA.md` - Database schema changes (if exists)
- API route comments - Document endpoints and parameters

### Code Comments
- Document complex logic and business rules
- Explain "why" not "what" (code shows what)
- Keep comments up to date with code changes
- Use JSDoc for functions and interfaces

---

## Environment Variables

### Required Variables
See `.env.example` for the complete list. Key variables include:

```bash
# AI Providers
GEMINI_API_KEY=          # Google Gemini API key
OPENAI_API_KEY=          # OpenAI API key
AI_PROVIDER=gemini       # Default provider

# Database & Auth
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Payments
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# Newsletter (optional)
BEEHIV_API_KEY=
BEEHIV_PUBLICATION_ID=
```

**Security Note**: Never commit `.env.local` or any file containing secrets to git.

---

## Common Patterns

### Error Handling
```typescript
try {
  const result = await riskyOperation();
  return Response.json({ success: true, data: result });
} catch (error) {
  console.error('Operation failed:', error);
  return Response.json(
    { success: false, error: error.message },
    { status: 500 }
  );
}
```

### Loading States
```typescript
'use client';

export default function Component() {
  const [loading, setLoading] = useState(false);
  
  async function handleAction() {
    setLoading(true);
    try {
      await performAction();
    } finally {
      setLoading(false);
    }
  }
  
  return <button disabled={loading}>...</button>;
}
```

---

## Deployment

### Netlify Configuration
- Build command: `npm run build && npm run export`
- Publish directory: `out`
- Functions directory: `netlify/functions`
- Environment variables: Set in Netlify dashboard

### Pre-deployment Checklist
- [ ] All tests pass (`npm run test`)
- [ ] Type checking passes (`npm run type-check`)
- [ ] Linting passes (`npm run lint`)
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Stripe webhooks configured

---

## Reference: Key Files

- **Provider adapters**: `lib/providers/` (interface, openai, gemini, github-models)
- **Supabase client**: `lib/supabase/client.ts`, `lib/supabase/types.ts`
- **Auth middleware**: `middleware.ts` (session verification)
- **Dashboard pages**: `app/dashboard/*/page.tsx`
- **API routes**: `app/api/*/route.ts` (check user ownership)
- **Tests**: `**/*.test.ts`, `test/**/*.spec.ts`
- **Config files**: `next.config.js`, `tailwind.config.js`, `tsconfig.json`

---

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Stripe API Reference](https://stripe.com/docs/api)
- [Google Gemini API](https://ai.google.dev/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

**Remember**: Write clean, secure, well-tested code. When in doubt, ask for clarification. Let's build something great! 🚀
