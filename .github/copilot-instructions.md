# Copilot Instructions

## Repo Context
This repo: **Beehive**  
Role in stack: Core AI-powered advertising creative platform (AdGenXAI) - Next.js SaaS application with Google Gemini AI integration, Stripe payments, and Supabase authentication  
Primary runtime: Node.js 18+ / TypeScript  
Deployment: Netlify (serverless functions + static export)

## Coding Guidance
- Use ES modules unless inside `netlify/` or legacy scripts (CommonJS).  
- All network calls must handle errors and timeouts.  
- Commit style: `feat:`, `fix:`, `ci:`, `docs:`.  
- Never generate secrets or tokens.  
- Pull requests must build and test before merge.

## AI Agent Rules
- Reuse existing utilities before adding new ones.  
- Place new platform integrations in `packages/platforms/<name>` with TypeScript types.  
- Document API endpoints in `app/api` with proper error handling.  
- Use existing Supabase client patterns from `lib/supabase.ts`.  
- Follow Tailwind CSS conventions from `tailwind.config.js`.

## Example
When extending Gemini AI features, modify `lib/gemini.ts` and associated API routes rather than creating parallel implementations.