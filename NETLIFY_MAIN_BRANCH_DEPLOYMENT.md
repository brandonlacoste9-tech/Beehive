# Netlify Main Branch Deployment Configuration

## Problem
Netlify was configured to deploy from PR branch (pull/34/head) instead of the main branch, causing the live site to show outdated code without recent fixes.

## Solution
This document provides step-by-step instructions to configure Netlify to deploy from the main branch.

---

## Quick Fix: Netlify Dashboard Settings

### Step 1: Access Netlify Site Settings
1. Go to [Netlify Dashboard](https://app.netlify.com/)
2. Select your site: **foundryai.com** (or the Beehive site)
3. Navigate to **Site settings** → **Build & deploy**

### Step 2: Configure Production Branch
1. Click on **Branches and deploy contexts** (or **Deploy contexts**)
2. Find the **Production branch** setting
3. Ensure it is set to: `main`
4. If it shows `pull/34/head` or any other branch, change it to `main`

### Step 3: Configure Deploy Contexts
Under **Deploy contexts**, ensure the following settings:

- **Production branch:** `main` ✅
- **Deploy previews:** Choose one of:
  - ❌ "None" (no PR previews) - Recommended if you only want main branch deploys
  - ⚠️ "Any pull request against your production branch" - Only if you want PR previews
  - ⚠️ "All pull requests" - Only if you want all PR previews

### Step 4: Stop Deploy Previews (If Needed)
If you want to completely disable PR deployments:
1. In **Deploy contexts**
2. Under **Deploy previews**, select **"None"**
3. Save changes

### Step 5: Trigger New Production Deploy
1. Go to **Deploys** tab
2. Click **Trigger deploy** → **Deploy site**
3. This will deploy from the current main branch

---

## Alternative: Close PR #34

If PR #34 is no longer needed:
1. Go to https://github.com/brandonlacoste9-tech/Beehive/pull/34
2. Click **Close pull request**
3. Netlify will automatically switch to deploying from main

---

## Repository Configuration

The repository now includes explicit deploy context configuration in `netlify.toml`:

```toml
# Production context: explicit configuration for main branch deployments
[context.production]
  command = "npm run build"
  publish = ".next"

# Deploy Preview context: for pull requests and branch previews
[context.deploy-preview]
  command = "npm run build"
  publish = ".next"

# Branch deploy context: for non-production branch deployments
[context.branch-deploy]
  command = "npm run build"
  publish = ".next"
```

This ensures:
- ✅ Production deploys always use the correct build configuration
- ✅ Preview deploys are properly isolated
- ✅ Clear separation between production and preview contexts

---

## GitHub Actions Integration

The repository has a GitHub Actions workflow (`.github/workflows/deploy.yml`) that automatically deploys to Netlify when commits are pushed to main:

```yaml
on:
  push:
    branches: [main]
```

This provides an additional deployment path through CI/CD.

---

## Verification Steps

After configuring Netlify:

1. **Check Current Deploy Source:**
   - Go to Netlify **Deploys** tab
   - Look at the latest deploy
   - Verify it shows: `Branch: main` (not `pull/34/head`)

2. **Verify File Content:**
   - Check that `lib/theme.ts` exists in the deployed site
   - Verify recent fixes are present

3. **Test the Site:**
   - Visit https://foundryai.com
   - Ensure all features work correctly
   - Verify theme and styling are correct

---

## Common Issues & Troubleshooting

### Issue: Netlify Still Deploys from PR
**Solution:** Clear the deploy cache
1. Go to **Site settings** → **Build & deploy**
2. Scroll to **Build settings**
3. Click **Clear cache and retry deploy**

### Issue: Deploy Fails
**Solution:** Check build logs
1. Go to **Deploys** tab
2. Click on the failed deploy
3. Review logs for errors
4. Common fixes:
   - Ensure all environment variables are set
   - Verify `npm install` completes successfully
   - Check for TypeScript errors

### Issue: Environment Variables Missing
**Solution:** Add required variables
1. Go to **Site settings** → **Environment variables**
2. Add all required variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `OPENAI_API_KEY`
   - Any other required variables

---

## Best Practices

1. **Always deploy from main:**
   - Keep main branch stable and tested
   - Use PR previews for testing changes
   - Merge to main only after review

2. **Use Deploy Previews wisely:**
   - Enable for important PRs that need preview
   - Disable if you don't need PR previews
   - Monitor Netlify build minutes usage

3. **Monitor Deployments:**
   - Check Netlify deploy logs regularly
   - Set up deploy notifications
   - Use GitHub Actions for automated deploys

4. **Keep Dependencies Updated:**
   - Regularly update `@netlify/plugin-nextjs`
   - Keep Next.js and other dependencies current
   - Test updates in preview before main

---

## Success Criteria

✅ Production branch set to `main` in Netlify dashboard
✅ Latest deploy shows `Branch: main`
✅ Site shows recent fixes (e.g., lib/theme.ts exists)
✅ All features work correctly
✅ No deploy errors in logs

---

## Need Help?

If issues persist:
1. Check Netlify build logs for specific errors
2. Compare main branch with deployed code
3. Verify all environment variables are set
4. Contact Netlify support if needed

**Main branch is the source of truth!** Always ensure Netlify deploys from main for production.
