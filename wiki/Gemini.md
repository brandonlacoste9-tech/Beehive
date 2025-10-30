# Google Gemini Integration Guide

AdGenXAI uses Google's Gemini 1.5 Pro for AI-powered ad creative generation. This guide covers integration, best practices, and troubleshooting.

## 🔑 API Key Setup

### Get Your API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key to your `.env.local`:

```env
GEMINI_API_KEY=your_api_key_here
```

### API Limits

**Free Tier**:
- 60 requests per minute
- 1,500 requests per day
- No credit card required

**Paid Tier**:
- Higher rate limits
- Pay-as-you-go pricing
- Production-ready

## 🎯 How It Works

### Ad Generation Flow

1. **User Input**: Product, audience, tone
2. **Prompt Engineering**: Structured prompt sent to Gemini
3. **AI Generation**: Gemini creates headline, body, image prompt
4. **JSON Parsing**: Extract structured data
5. **Response**: Return to frontend

### Prompt Template

```javascript
const prompt = `You are an expert advertising copywriter. Generate compelling ad creative for the following:

Product: ${product}
Target Audience: ${audience}
Tone: ${tone}

Please provide:
1. A catchy headline (max 60 characters)
2. Persuasive body copy (2-3 sentences, max 150 words)
3. An image prompt for AI image generation (detailed description)

Format your response as JSON:
{
  "headline": "...",
  "body": "...",
  "imagePrompt": "..."
}`;
```

## 💡 Best Practices

### Prompt Engineering

**✅ DO**:
- Be specific about output format (JSON)
- Set clear length constraints
- Provide context about audience and tone
- Use structured prompts

**❌ DON'T**:
- Send overly long prompts (>2000 tokens)
- Mix multiple requests in one call
- Ignore response parsing errors
- Exceed rate limits

### Error Handling

```javascript
try {
  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();

  // Parse JSON with fallback
  let adCreative;
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      adCreative = JSON.parse(jsonMatch[0]);
    } else {
      throw new Error('No JSON found');
    }
  } catch (parseError) {
    // Fallback to manual parsing
    adCreative = {
      headline: text.substring(0, 60),
      body: text.substring(0, 300),
      imagePrompt: `${product} ad for ${audience}`,
    };
  }
} catch (error) {
  console.error('Gemini API error:', error);
  // Return sample data or error message
}
```

## 🚀 Advanced Features

### Temperature Control

```javascript
const model = genAI.getGenerativeModel({
  model: 'gemini-1.5-pro',
  generationConfig: {
    temperature: 0.9, // Higher = more creative (0.0-1.0)
    topK: 40,
    topP: 0.95,
    maxOutputTokens: 1024,
  },
});
```

### Safety Settings

```javascript
const model = genAI.getGenerativeModel({
  model: 'gemini-1.5-pro',
  safetySettings: [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
  ],
});
```

### Streaming Responses

```javascript
const result = await model.generateContentStream(prompt);
for await (const chunk of result.stream) {
  const chunkText = chunk.text();
  console.log(chunkText);
}
```

## 📊 Rate Limiting

### Implementation

```javascript
class RateLimiter {
  constructor(maxRequests, timeWindow) {
    this.maxRequests = maxRequests;
    this.timeWindow = timeWindow;
    this.requests = [];
  }

  async acquire() {
    const now = Date.now();
    this.requests = this.requests.filter(
      (time) => now - time < this.timeWindow
    );

    if (this.requests.length >= this.maxRequests) {
      const oldestRequest = this.requests[0];
      const waitTime = this.timeWindow - (now - oldestRequest);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }

    this.requests.push(now);
  }
}

const limiter = new RateLimiter(60, 60000); // 60 requests per minute

async function generateAd(prompt) {
  await limiter.acquire();
  return await model.generateContent(prompt);
}
```

## 🔍 Debugging

### Enable Verbose Logging

```javascript
const model = genAI.getGenerativeModel({
  model: 'gemini-1.5-pro',
  generationConfig: {
    candidateCount: 1,
    stopSequences: [],
  },
});

console.log('Request:', prompt);
const result = await model.generateContent(prompt);
console.log('Response:', result.response);
console.log('Text:', result.response.text());
```

### Common Issues

**1. API Key Not Working**
```bash
# Check if key is loaded
echo $GEMINI_API_KEY

# Verify in code
if (!process.env.GEMINI_API_KEY) {
  console.error('GEMINI_API_KEY not set!');
}
```

**2. Rate Limit Exceeded**
```json
{
  "error": {
    "code": 429,
    "message": "Resource has been exhausted"
  }
}
```
Solution: Implement rate limiting or upgrade plan

**3. Response Format Issues**
- Gemini might return markdown code blocks
- Use regex to extract JSON: `/\{[\s\S]*\}/`
- Always have a fallback parser

## 🎨 Example Outputs

### Professional Tone
```json
{
  "headline": "Transform Your Business with AI-Powered Marketing",
  "body": "Discover how leading enterprises leverage AdGenXAI to create compelling, data-driven advertising campaigns. Increase ROI by 300% with intelligent creative optimization.",
  "imagePrompt": "Professional business team collaborating on digital marketing strategy, modern office setting, clean aesthetic, business casual attire, natural lighting, high quality photography"
}
```

### Casual Tone
```json
{
  "headline": "Your Next Favorite Coffee is Here!",
  "body": "Say hello to coffee that actually cares about your taste buds. We roast small batches, ship fast, and make mornings awesome. Try it risk-free!",
  "imagePrompt": "Cozy coffee shop scene with steaming cup of artisan coffee, warm lighting, rustic wood table, casual and inviting atmosphere, lifestyle photography"
}
```

## 📚 Resources

- [Gemini API Documentation](https://ai.google.dev/docs)
- [Prompt Engineering Guide](https://ai.google.dev/docs/prompt_best_practices)
- [Rate Limits & Pricing](https://ai.google.dev/pricing)
- [Safety Settings](https://ai.google.dev/docs/safety_setting_gemini)

---

Ready to generate legendary ad creative! 🚀
