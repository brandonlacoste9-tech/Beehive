# Dependency Management Notes

## Recent Changes

### Removed Packages
- **coinbase-commerce-node** (v1.0.4) - Removed as deprecated and unused
  - Package was deprecated and had no security fixes available
  - No code references found in the codebase
  - Removed to reduce vulnerabilities

### Updated Packages
- **nodemailer** - Updated to latest version to fix security vulnerabilities
  - Used in `app/lib/mailer.ts` and `lib/email.ts`
  - Fixed moderate severity vulnerability (GHSA-mm7p-fcc7-pg87)

### Deprecated Packages Still in Use
The following packages are deprecated but kept temporarily as they're used by the project:

- **@supabase/auth-helpers-nextjs** (v0.10.0)
  - Status: Deprecated - migrate to @supabase/ssr
  - Used for: Supabase authentication
  - Action needed: Plan migration to @supabase/ssr in future PR

## Remaining Vulnerabilities

### Development Dependencies Only
The following vulnerabilities are in development dependencies and don't affect production:

- **happy-dom** (v12.10.3) - Testing library vulnerabilities
  - Severity: Critical (but dev-only)
  - Status: Would require breaking change to update
  - Risk: Low (only used in test environment)

- **tar** (v7.5.1) - In netlify-cli
  - Severity: Moderate
  - Status: Transitive dependency through netlify-cli
  - Risk: Low (dev-only CLI tool)

### Production Dependencies
All production dependencies are now free of high/critical vulnerabilities with available fixes.

## Audit Summary
```bash
# Before cleanup:
16 vulnerabilities (2 low, 9 moderate, 2 high, 3 critical)

# After cleanup:
10 vulnerabilities (2 low, 7 moderate, 1 critical)
# All remaining vulnerabilities are in devDependencies only
```

## Maintenance Commands
```bash
# Check for production vulnerabilities only
npm audit --production

# Update dependencies (safe updates)
npm update

# Check for outdated packages
npm outdated
```
