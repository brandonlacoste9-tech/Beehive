# Contributing to AdGenXAI

Thank you for your interest in contributing to AdGenXAI! This guide will help you get started.

## Prerequisites

- **Node.js** 18.x or higher
- **npm** 9.x or higher
- **Netlify CLI** (install via `npm i -g netlify-cli`)
- **Git** for version control

## Environment Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/brandonlacoste9-tech/Beehive.git
   cd Beehive
   ```

2. **Install dependencies**

   ```bash
   npm ci
   ```

3. **Configure environment variables**

   Copy `.env.example` to `.env.local`:

   ```bash
   cp .env.example .env.local
   ```

   **Required variables:**

   - `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
   - `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
   - `GOOGLE_GEMINI_API_KEY` - Google Gemini API key
   - `STRIPE_SECRET_KEY` - Stripe secret key
   - `STRIPE_WEBHOOK_SECRET` - Stripe webhook signing secret
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key
   - `BEEHIV_API_KEY` - Beehiv API key (optional)
   - `BEEHIV_PUBLICATION_ID` - Beehiv publication ID (optional)

   **For GitHub Models integration:**
   - `GITHUB_TOKEN` - GitHub personal access token with `models:read` scope

## Running Locally

### Standard Next.js development

```bash
npm run dev
```

Visit `http://localhost:3000`

### With Netlify Functions (recommended)

```bash
npx netlify dev
```

This starts Next.js with Netlify Functions support at `http://localhost:8888`

## Development Workflow

### Before you commit

1. **Lint your code**

   ```bash
   npm run lint
   ```

2. **Type check**

   ```bash
   npm run type-check
   ```

3. **Run tests**

   ```bash
   npm test
   ```

4. **Format code**

   ```bash
   npm run format
   ```

5. **Run all validations**

   ```bash
   npm run validate
   ```

### Commit message convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

**Examples:**

```
feat: add usage meter badge component
fix: resolve authentication redirect loop
docs: update API endpoint documentation
```

## Testing

- **Unit tests**: Jest + React Testing Library
- **Run all tests**: `npm test`
- **Watch mode**: `npm run test:watch`

## Code Style

- **TypeScript**: Strict mode enabled
- **ESLint**: Next.js recommended config
- **Prettier**: 2-space indentation, single quotes
- **File naming**: `PascalCase` for components, `camelCase` for utilities

## Project Structure

```
Beehive/
├── app/                    # App Router components
│   ├── components/         # React components
│   └── lib/               # Utility functions
├── pages/                 # Pages Router (API routes only)
│   └── api/               # API endpoints
├── netlify/
│   └── functions/         # Netlify serverless functions
├── lib/                   # Shared utilities
├── styles/                # Global styles
├── public/                # Static assets
└── migrations/            # Database migrations
```

## Pull Request Process

1. Create a feature branch: `git checkout -b feat/your-feature`
2. Make your changes
3. Run validation: `npm run validate`
4. Commit with conventional message
5. Push and create PR
6. Ensure CI passes
7. Request review from maintainers

## Getting Help

- **Issues**: https://github.com/brandonlacoste9-tech/Beehive/issues
- **Email**: support@adgenxai.pro
- **Health Check**: https://www.adgenxai.pro/.netlify/functions/health

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
