# Getting Started with AdGenXAI

Welcome to AdGenXAI - the AI-powered advertising creative platform! This guide will help you get up and running quickly.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Netlify account (for deployment)
- Google Gemini API key (optional for local development)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/brandonlacoste9-tech/Beehive.git
   cd Beehive
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```

   Add your API keys:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   BEEHIV_API_KEY=your_beehiv_api_key_here
   BEEHIV_PUBLICATION_ID=your_publication_id
   SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_key
   NEXT_PUBLIC_SENSORY_CORTEX_URL=https://your-cortex-url.com
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## 🎯 Using the Ad Generator

### Generate Ad Creative

1. **Fill in the form**:
   - **Product/Service**: What you're advertising (e.g., "AI Marketing Platform")
   - **Target Audience**: Who you're targeting (e.g., "Small business owners")
   - **Tone**: Choose from professional, casual, exciting, friendly, urgent, or luxury

2. **Click "Generate Ad Creative"**
   The AI will generate:
   - A catchy headline (optimized for attention)
   - Persuasive body copy (2-3 sentences)
   - An image prompt for AI image generators

3. **Use the results**:
   - Copy the headline for your ad campaigns
   - Use the body copy in your marketing materials
   - Feed the image prompt to DALL-E, Midjourney, or Stable Diffusion

## 🔗 API Integration

### Generate Ad via API

```javascript
const response = await fetch('https://adgenxai.pro/api/generateAd', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    product: 'AI Marketing Platform',
    audience: 'Small business owners',
    tone: 'professional',
  }),
});

const data = await response.json();
console.log(data.data);
// {
//   headline: "...",
//   body: "...",
//   imagePrompt: "..."
// }
```

## 📧 Newsletter Integration

Subscribe users to your Beehiv newsletter:

```javascript
const response = await fetch('https://adgenxai.pro/api/beehiv/subscribe', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'user@example.com',
    utmSource: 'website',
    utmCampaign: 'hero-signup',
  }),
});
```

## 🏥 Health Monitoring

Check system health:
- **Frontend**: https://adgenxai.pro
- **Health Endpoint**: https://adgenxai.pro/.netlify/functions/health
- **Webhook Status**: https://adgenxai.pro/.netlify/functions/webhook

## 🔧 Troubleshooting

### "Missing GEMINI_API_KEY" Error

If you see this error, the system will return sample data. To use real AI generation:
1. Get a Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Add it to your `.env.local` file
3. Restart the development server

### Build Errors

```bash
# Clean install
rm -rf node_modules .next
npm install
npm run build
```

### TypeScript Errors

```bash
# Run type check
npm run type-check

# Fix common issues
npm run lint --fix
```

## 📚 Next Steps

- Read the [Gemini Integration Guide](./Gemini.md)
- Explore [API Documentation](./OpenAI.md)
- Check out the [Cookbook](./Cookbook.md) for examples
- Review the [Beehiv Integration](../scrolls/beehiv-integration.md)

## 🆘 Support

- **GitHub Issues**: https://github.com/brandonlacoste9-tech/Beehive/issues
- **Website**: https://adgenxai.pro
- **Health Status**: https://adgenxai.pro/.netlify/functions/health

---

Happy generating! 🎉
