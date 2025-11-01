# Copilot Instructions for AdGenXAI

## Project Overview

AdGenXAI is an AI-powered advertising creative platform built with Next.js 14, TypeScript, and deployed on Netlify. It integrates Google Gemini AI, Stripe payments, Supabase authentication, and Beehiv newsletter functionality to deliver a complete SaaS solution.

**Live Demo**: [www.adgenxai.pro](https://www.adgenxai.pro)

## Tech Stack

- **Framework**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS 3.4
- **AI**: Google Gemini 1.5 Pro, OpenAI (optional), Anthropic (optional)
- **Authentication**: Supabase Auth
- **Payments**: Stripe with Checkout and Customer Portal
- **Newsletter**: Beehiv API integration
- **Deployment**: Netlify (serverless functions + static export)
- **Database**: Supabase (PostgreSQL)
- **Testing**: Jest with React Testing Library
- **Charts**: Chart.js with react-chartjs-2

## Getting Started

### Prerequisites

- Node.js 18+ (see `engines` in package.json)
- npm 9+

### Installation

```bash
npm install
```

### Environment Setup

1. Copy `.env.example` to `.env.local`
2. Fill in all required environment variables (see `.env.example` for detailed documentation)
3. Key variables include:
   - `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `GEMINI_API_KEY` (required)
   - `STRIPE_SECRET_KEY` and Stripe price IDs
   - `BEEHIV_API_KEY` and `BEEHIV_PUBLICATION_ID` (optional)

## Building the Project

```bash
# Development build
npm run dev

# Production build for Netlify
npm run build && npm run export
```

The build process:
- `npm run build` - Creates optimized Next.js production build
- `npm run export` - Exports static HTML files to `out/` directory for Netlify

## Testing

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch
```

Test files should be placed next to the code they test with `.test.ts` or `.test.tsx` extension.

## Linting and Type Checking

```bash
# Run ESLint
npm run lint

# Run TypeScript type checking
npm run type-check

# Run both linting and type checking
npm run validate

# Format code with Prettier
npm run format
```

**Always run `npm run validate` before committing code changes.**

## Code Conventions

### TypeScript

- Use strict TypeScript mode (configured in `tsconfig.json`)
- Define proper types for all function parameters and return values
- Use Zod for runtime validation where appropriate

### React/Next.js

- Follow Next.js 14 App Router conventions when applicable
- Use functional components with hooks
- Keep components focused and single-responsibility
- Use proper error boundaries for error handling

### Path Aliases

Use the configured path aliases for cleaner imports:
- `@/*` maps to `./src/*`
- `@/components/*` maps to `./src/components/*`
- `@/lib/*` maps to `./src/lib/*`
- `@/styles/*` maps to `./styles/*`

### Styling

- Use Tailwind CSS utility classes
- Follow existing Tailwind configuration in `tailwind.config.js`
- Maintain consistent spacing and color usage

### ESLint Rules

- Console statements are allowed (`no-console: off`)
- Unused variables generate warnings, not errors
- React unescaped entities warnings are disabled
- Follow `next/core-web-vitals` configuration

## Project Structure

Expected directory layout:
```
.
├── .github/              # GitHub configuration and workflows
├── src/                  # Source code
│   ├── components/       # React components
│   ├── lib/             # Utility functions and helpers
│   └── ...
├── pages/               # Next.js pages (if using Pages Router)
├── netlify/             # Netlify serverless functions
│   └── functions/       # API endpoints
├── public/              # Static assets
├── styles/              # Global styles
└── supabase/            # Database migrations and schemas
```

## Key Integrations

### Supabase

- Authentication with JWT tokens
- Row-level security (RLS) policies
- See `supabase/` directory for schema migrations

### Stripe

- Stripe Checkout for subscriptions
- Customer portal for subscription management
- Webhook handling for payment events
- 3-tier pricing: Free, Pro ($97/mo), Enterprise ($497/mo)

### AI Models

- Primary: Google Gemini 1.5 Pro and Flash
- Optional: OpenAI GPT models, Anthropic Claude
- Tone options: Professional, Casual, Exciting, Friendly, Urgent, Luxury

### Beehiv Newsletter

- Subscriber management via API
- Newsletter campaign integration
- UTM tracking support

## Deployment

Deploys to Netlify with the following configuration (see `netlify.toml`):

- Build command: `npm run build && npm run export`
- Publish directory: `out`
- Functions directory: `netlify/functions`

Environment variables must be set in Netlify dashboard before deployment.

## Important Files and Documentation

- `README.md` - Main project documentation
- `DEPLOYMENT.md` - Comprehensive Netlify deployment guide
- `.env.example` - Complete list of required environment variables
- `NETLIFY_ENV_SETUP.md` - Environment variable setup guide
- `netlify.toml` - Netlify configuration
- `package.json` - Dependencies and scripts

## Security and Best Practices

- Never commit secrets or API keys to the repository
- Use environment variables for all sensitive configuration
- Follow the principle of least privilege for API keys
- Maintain Supabase RLS policies for data security
- Validate all user inputs
- Use proper error handling and user-friendly error messages

## Restricted Areas

- Do not modify `.github/agents/` directory (agent-specific configuration)
- Be careful when modifying core configuration files like `next.config.js`, `netlify.toml`, or `tsconfig.json`
- Database migrations should follow Supabase best practices

## Getting Help

- Check the issue tracker: https://github.com/brandonlacoste9-tech/Beehive/issues
- Review documentation files in the repository root
- Health check endpoint: https://www.adgenxai.pro/.netlify/functions/health

## Development Workflow

1. Create a feature branch from `main`
2. Make changes following the code conventions above
3. Run `npm run validate` to check linting and types
4. Run `npm run test` to verify tests pass
5. Create a pull request with clear description
6. Ensure all CI checks pass before merging

---

**Note**: This project uses Copilot for code assistance. When making changes, ensure they align with the existing architecture and patterns demonstrated in the codebase.
