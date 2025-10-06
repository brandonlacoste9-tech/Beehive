import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });

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
          content: "You are an expert ad copywriter. Return JSON with headline, body, and imagePrompt."
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
    console.error("OpenAI error:", error);
    res.status(500).json({ message: 'Failed to generate ad creative.' });
  }
}