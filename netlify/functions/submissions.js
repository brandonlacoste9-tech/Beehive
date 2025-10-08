// Netlify function for fetching submissions with Bearer token authentication
exports.handler = async (event, context) => {
  // Only allow GET requests
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  // Check for authorization header
  const authHeader = event.headers.authorization || event.headers.Authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'Unauthorized - Bearer token required' }),
    };
  }

  const token = authHeader.substring(7); // Remove 'Bearer ' prefix
  
  // Simple token validation (in production, this would check against a secure store)
  // For demo purposes, we accept any non-empty token
  if (!token || token.trim() === '') {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'Invalid token' }),
    };
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

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ submissions }),
  };
};
