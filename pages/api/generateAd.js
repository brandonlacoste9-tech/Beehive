import OpenAI from 'openai';

// This is a placeholder for a proper key management solution.
// In production, use environment variables.
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { prompt } = req.body;

  if (!prompt || prompt.trim().length === 0) {
    return res.status(400).json({ message: 'Prompt is required' });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert marketing copywriter for social media platforms. Based on the user's prompt (which is a URL or product description), generate a compelling ad creative. The output must be a valid JSON object with three keys: 'headline' (a short, punchy headline), 'body' (2-3 sentences of engaging ad copy), and 'imagePrompt' (a descriptive prompt for an AI image generator like Midjourney or DALL-E to create a visually appealing ad image)."
        },
        {
          role: "user",
          content: `Generate ad creative for: ${prompt}`
        }
      ],
      response_format: { type: "json_object" },
    });

    const adCreative = JSON.parse(completion.choices[0].message.content);
    res.status(200).json(adCreative);

  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    res.status(500).json({ message: 'An error occurred while generating the ad creative.' });
  }
}