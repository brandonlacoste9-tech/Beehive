# 🔑 BeeHive Authentication Setup Guide

Your authentication system is built and ready! Now you just need to get your OAuth credentials.

## Step-by-Step Setup Instructions

### 1. Google OAuth Setup (5 minutes)

1. **Go to Google Cloud Console**: https://console.cloud.google.com/apis/credentials
2. **Create a project** (if you don't have one):
   - Click "Select a project" → "New Project"
   - Name it "BeeHive" → Click "Create"
3. **Enable Google+ API**:
   - Go to "APIs & Services" → "Library"
   - Search for "Google+ API" → Click "Enable"
4. **Create OAuth Credentials**:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth 2.0 Client ID"
   - Choose "Web application"
   - **Name**: BeeHive Local Development
   - **Authorized redirect URIs**: `http://localhost:3000/api/auth/callback/google`
   - Click "Create"
5. **Copy your credentials** to `.env.local`:
   - Client ID → `GOOGLE_CLIENT_ID`
   - Client Secret → `GOOGLE_CLIENT_SECRET`

### 2. GitHub OAuth Setup (3 minutes)

1. **Go to GitHub Developer Settings**: https://github.com/settings/developers
2. **Create New OAuth App**:
   - Click "New OAuth App"
   - **Application name**: BeeHive Local Development
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`
   - Click "Register application"
3. **Copy your credentials** to `.env.local`:
   - Client ID → `GITHUB_CLIENT_ID`
   - Generate a client secret → `GITHUB_CLIENT_SECRET`

### 3. Test Your Authentication! 🚀

Once you've updated `.env.local` with your real credentials:

```bash
npm run dev
```

Then visit `http://localhost:3000` and test:
- ✅ Click "Sign In" button
- ✅ Try Google login
- ✅ Try GitHub login  
- ✅ Visit `/dashboard` (should redirect to login if not authenticated)
- ✅ Sign out

## Troubleshooting

- **"Configuration" error**: Double-check your `.env.local` file has no extra spaces
- **"Invalid redirect URI"**: Make sure the callback URLs match exactly
- **"Client secret invalid"**: Regenerate the client secret and update `.env.local`

## What's Next?

Once authentication is working:
1. 🎉 Celebrate - you have a production-ready auth system!
2. 💳 Stripe integration for premium features
3. 📊 Enhanced user dashboard
4. 🔒 Role-based access control

---

**Need help?** The `.env.local` file has been pre-configured with a secure `NEXTAUTH_SECRET` - you just need to add your OAuth credentials!