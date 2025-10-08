// Next.js API route that mimics the Netlify function for local development
export default function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check for authorization header
  const authHeader = req.headers.authorization || req.headers.Authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized - Bearer token required' });
  }

  const token = authHeader.substring(7); // Remove 'Bearer ' prefix
  
  // Simple token validation
  if (!token || token.trim() === '') {
    return res.status(401).json({ error: 'Invalid token' });
  }

  // Return mock submissions data
  const submissions = [
    {
      id: 1,
      email: 'user1@example.com',
      product: 'Luxury Watch',
      description: 'High-end timepiece for executives',
      timestamp: new Date('2024-01-15T10:30:00').toISOString(),
    },
    {
      id: 2,
      email: 'user2@example.com',
      product: 'Smart Home Device',
      description: 'AI-powered home automation',
      timestamp: new Date('2024-01-16T14:20:00').toISOString(),
    },
    {
      id: 3,
      email: 'user3@example.com',
      product: 'Fitness App',
      description: 'Personalized workout plans',
      timestamp: new Date('2024-01-17T09:15:00').toISOString(),
    },
  ];

  res.status(200).json({ submissions });
}
