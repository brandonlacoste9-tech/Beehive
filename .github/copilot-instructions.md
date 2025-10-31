# GitHub Copilot Instructions for AdGenXAI

## Repository Overview

AdGenXAI is a production-ready SaaS platform for AI-powered advertising creative generation. The platform combines multiple AI providers (Google Gemini, OpenAI, Anthropic Claude), Stripe payments, Supabase authentication, and Beehiv newsletter integration to deliver a comprehensive advertising creative solution.

**Live Demo**: https://www.adgenxai.pro

### Main Technologies
- **Framework**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS 3.4
- **AI Models**: Google Gemini 1.5 Pro (primary), OpenAI GPT-4, Anthropic Claude
- **Authentication**: Supabase Auth with JWT tokens
- **Database**: Supabase (PostgreSQL)
- **Payments**: Stripe with Checkout and Customer Portal
- **Newsletter**: Beehiv API integration
- **Deployment**: Netlify (Functions + Static Export)
- **Charts**: Chart.js with react-chartjs-2
- **Testing**: Jest with React Testing Library
- **Validation**: Zod for type-safe schemas

## Project Structure

```
Beehive/
├── .github/              # GitHub configuration and workflows
├── netlify/functions/    # Netlify serverless functions (API routes)
├── pages/               # Next.js pages (if using pages router)
├── src/                 # Source code
│   ├── components/      # React components
│   ├── lib/            # Utility functions and configurations
│   └── styles/         # CSS and styling files
├── public/             # Static assets
├── supabase/           # Database migrations and schemas
├── .env.example        # Environment variables template
├── netlify.toml        # Netlify configuration
├── package.json        # Dependencies and scripts
└── tsconfig.json       # TypeScript configuration
```

## How to Build, Test, and Contribute

### Setup
```bash
# Install dependencies
npm install

# Copy environment variables template
cp .env.example .env.local
# Fill in all required variables (see .env.example for details)
```

### Development
```bash
# Run development server
npm run dev

# Build for production
npm run build

# Export static files
npm run export

# Type checking
npm run type-check

# Linting
npm run lint

# Run tests
npm test

# Run tests in watch mode
npm test:watch

# Format code
npm run format

# Validate (type-check + lint)
npm run validate
```

### Before Committing
1. Run `npm run validate` to ensure type checking and linting pass
2. Run `npm test` to ensure all tests pass
3. Update documentation if adding new features or changing APIs
4. Follow existing code patterns and conventions

## Coding Standards

### TypeScript
- **Strict mode enabled**: All code must pass strict TypeScript checks
- Use explicit types for function parameters and return values
- Prefer interfaces for object shapes, types for unions/intersections
- Use `@/` path aliases for imports (e.g., `@/components/Button`)
- Avoid `any` type - use `unknown` or specific types instead

### React/Next.js
- Use functional components with hooks
- Follow Next.js 14 conventions (App Router if applicable, Pages Router currently)
- Keep components focused and single-purpose
- Extract reusable logic into custom hooks
- Use proper Next.js data fetching patterns (getServerSideProps, getStaticProps)

### File Organization
- Component files: PascalCase (e.g., `UserDashboard.tsx`)
- Utility files: camelCase (e.g., `authHelpers.ts`)
- One component per file (except for small, tightly coupled components)
- Co-locate test files with source files (e.g., `Button.tsx` and `Button.test.tsx`)

### Styling
- Use Tailwind CSS utility classes
- Follow existing Tailwind configuration in `tailwind.config.js`
- Avoid inline styles unless absolutely necessary
- Use semantic class names for custom CSS when needed
- Maintain responsive design patterns (mobile-first)

### Code Quality
- **No console.log in production code** - use proper logging utilities
- Handle errors gracefully with try-catch blocks
- Validate user input with Zod schemas
- Write meaningful variable and function names
- Add JSDoc comments for complex functions
- Keep functions small and focused (< 50 lines ideally)

### Security
- Never commit secrets or API keys
- Use environment variables for sensitive data
- Validate and sanitize all user inputs
- Implement proper authentication checks
- Follow Supabase Row Level Security (RLS) policies
- Use Stripe webhook signature verification

## Copilot Agent Task Guidelines

### What Copilot Should Work On
✅ **Good tasks for Copilot:**
- Bug fixes with clear reproduction steps
- Adding unit tests for existing code
- Refactoring code to improve readability
- Updating documentation
- Implementing well-defined features with clear requirements
- Adding type definitions and improving type safety
- Improving accessibility (a11y)
- Performance optimizations with specific metrics

❌ **Tasks to escalate to human reviewers:**
- Changes to authentication or authorization logic
- Modifying payment processing code (Stripe integration)
- Database schema changes or migrations
- Changes to security policies or RLS rules
- Large architectural refactors
- Changes affecting user data privacy
- Production environment configuration changes
- Sensitive business logic modifications

### Acceptance Criteria for PRs
When creating pull requests, ensure:
1. All tests pass (`npm test`)
2. Type checking passes (`npm run type-check`)
3. Linting passes (`npm run lint`)
4. Code follows existing patterns and conventions
5. New features include unit tests
6. Documentation is updated for API changes
7. No new security vulnerabilities introduced
8. Performance impact is considered
9. Breaking changes are clearly documented
10. Commit messages are clear and descriptive

### Testing Requirements
- Write unit tests for all new utility functions
- Include integration tests for API routes
- Test error scenarios and edge cases
- Maintain or improve test coverage
- Use meaningful test descriptions
- Mock external dependencies (AI APIs, Stripe, Supabase)

## AI Integration Guidelines

### When Working with AI Features
- Use environment variables for API keys (never hardcode)
- Implement proper error handling and fallbacks
- Add rate limiting considerations
- Cache responses when appropriate
- Log AI interactions for debugging (without exposing sensitive data)
- Test with multiple AI providers (Gemini primary, OpenAI/Claude fallbacks)
- Handle token limits and costs appropriately

### Stripe Integration
- Never expose secret keys to the client
- Always verify webhook signatures
- Use idempotency keys for payment operations
- Handle all webhook event types gracefully
- Test with Stripe test mode before production
- Follow PCI compliance guidelines

### Supabase Integration
- Use Row Level Security (RLS) policies
- Validate user sessions on every protected route
- Use service role key only in secure server contexts
- Implement proper error handling for database operations
- Use transactions for multi-step database operations

## Contribution Workflow

1. **Create a branch** from main with descriptive name
2. **Make minimal, focused changes** addressing one concern
3. **Test thoroughly** using all test commands
4. **Commit with clear messages** following conventional commits
5. **Create PR** with description of changes and testing done
6. **Address review feedback** promptly
7. **Ensure CI passes** before requesting merge

## Feature Flags and Configuration

The platform uses environment variables for feature toggles:
- `ENABLE_REFERRALS` - Referral program
- `ENABLE_TEAMS` - Team collaboration features
- `ENABLE_AB_TESTING` - A/B testing functionality
- `ENABLE_BULK_GENERATION` - Bulk ad generation

When adding features, consider making them toggleable via environment variables.

## Monitoring and Debugging

### Health Checks
- Main health endpoint: `/.netlify/functions/health`
- Monitor AI provider availability
- Check database connectivity
- Verify Stripe webhook functionality

### Logging
- Use structured logging for serverless functions
- Include request IDs for tracing
- Log errors with full context
- Avoid logging sensitive data (passwords, API keys, PII)

## Resources

- **Main Documentation**: README.md
- **Environment Setup**: .env.example
- **Deployment Guide**: DEPLOYMENT.md
- **Netlify Setup**: NETLIFY_ENV_SETUP.md
- **Database Migrations**: supabase/MIGRATION_GUIDE.md (if exists)
- **Change Log**: CHANGELOG.md

## Support and Issues

- **Issues**: https://github.com/brandonlacoste9-tech/Beehive/issues
- **Email**: support@adgenxai.pro

---

**Note**: This is a production SaaS application handling real user data and payments. Always prioritize security, data privacy, and code quality. When in doubt, ask for human review before making changes to sensitive areas.
