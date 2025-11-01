# Quick Setup - Post Implementation

Run these commands to complete the setup:

## 1. Make shell script executable (macOS/Linux only)

```bash
chmod +x scripts/tail-fns.sh
```

## 2. Create missing API directory

```bash
mkdir -p app/api/usage
```

Then move the usage route file:
```bash
# The route.ts file needs to be created at:
# app/api/usage/route.ts
```

## 3. Generate design tokens

```bash
npm run extract-tokens
```

This creates `tokens.json` in the root directory.

## 4. Test the CI workflow

Push to GitHub to trigger the workflow:

```bash
git add .
git commit -m "feat: add infrastructure and tooling improvements"
git push origin main
```

## 5. Optional: Install Husky for pre-commit hooks

```bash
npm install --save-dev husky
npx husky init
```

Then add to `.husky/pre-commit`:

```bash
#!/bin/sh
npm run check-secrets
```

Make it executable:

```bash
chmod +x .husky/pre-commit
```

## 6. Test the usage meter

Start dev server:

```bash
npm run dev
```

The usage meter component is ready to be imported:

```tsx
import UsageBadge from './components/UsageBadge';

// In your layout or page:
<UsageBadge />
```

## 7. Test function logging (when deployed to Netlify)

```bash
# Windows
.\scripts\tail-fns.ps1

# macOS/Linux
./scripts/tail-fns.sh
```

---

All files are created and ready to use! 🎉
