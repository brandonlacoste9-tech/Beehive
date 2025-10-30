// Placeholder API endpoint - OpenAI dependency removed
export default function handler(req, res) {
  res.status(200).json({ 
    message: 'OpenAI functionality has been removed to fix build issues',
    headline: 'Sample Headline', 
    body: 'Sample ad body text', 
    imagePrompt: 'Sample image description' 
  });
}