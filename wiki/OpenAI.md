# OpenAI Integration

AdGenXAI uses GPT-4 via the official OpenAI SDK.

## API Usage
- Endpoint: `chat.completions.create`
- Model: `gpt-4`
- Format: JSON object with `headline`, `body`, `imagePrompt`

## Rate Limits
- Free tier: ~3 requests/min
- Pro tier: higher throughput

## Prompt Engineering Tips
- Be specific: "A luxury watch for CEOs"
- Add emotion: "Make it aspirational"
- Use context: "For Instagram carousel"