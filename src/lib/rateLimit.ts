import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * API Rate Limiting Middleware
 *
 * Implements sliding window rate limiting to prevent API abuse
 * Uses in-memory storage (can be upgraded to Redis for production)
 */

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
  keyGenerator?: (req: NextApiRequest) => string; // Custom key generator
}

interface RequestLog {
  count: number;
  resetTime: number;
  requests: number[]; // Timestamps of requests
}

// In-memory store (use Redis in production for distributed systems)
const requestStore = new Map<string, RequestLog>();

/**
 * Rate limit middleware factory
 */
export function rateLimit(config: RateLimitConfig) {
  const {
    windowMs = 60000, // Default: 1 minute
    maxRequests = 60, // Default: 60 requests per minute
    keyGenerator = defaultKeyGenerator,
  } = config;

  return async (
    req: NextApiRequest,
    res: NextApiResponse,
    next: () => Promise<void>
  ): Promise<void> => {
    const key = keyGenerator(req);
    const now = Date.now();

    // Get or initialize request log
    let log = requestStore.get(key);

    if (!log || now > log.resetTime) {
      // Create new log or reset if window expired
      log = {
        count: 0,
        resetTime: now + windowMs,
        requests: [],
      };
      requestStore.set(key, log);
    }

    // Remove requests outside the sliding window
    log.requests = log.requests.filter((timestamp) => timestamp > now - windowMs);

    // Add current request
    log.requests.push(now);
    log.count = log.requests.length;

    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', maxRequests.toString());
    res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - log.count).toString());
    res.setHeader('X-RateLimit-Reset', log.resetTime.toString());

    // Check if rate limit exceeded
    if (log.count > maxRequests) {
      const retryAfter = Math.ceil((log.resetTime - now) / 1000);
      res.setHeader('Retry-After', retryAfter.toString());

      return res.status(429).json({
        error: 'Too Many Requests',
        message: `Rate limit exceeded. Please try again in ${retryAfter} seconds.`,
        retryAfter,
      }) as any;
    }

    // Continue to next middleware/handler
    await next();
  };
}

/**
 * Default key generator (IP + User ID if available)
 */
function defaultKeyGenerator(req: NextApiRequest): string {
  // Try to get user ID from authorization header
  const authHeader = req.headers.authorization;
  let userId = 'anonymous';

  if (authHeader?.startsWith('Bearer ')) {
    // Extract user ID from token (simplified - in production, decode JWT)
    const token = authHeader.substring(7);
    userId = token.substring(0, 20); // Use first 20 chars as identifier
  }

  // Get IP address
  const ip =
    (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
    (req.headers['x-real-ip'] as string) ||
    req.socket.remoteAddress ||
    'unknown';

  return `${ip}:${userId}`;
}

/**
 * IP-based key generator
 */
export function ipKeyGenerator(req: NextApiRequest): string {
  const ip =
    (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
    (req.headers['x-real-ip'] as string) ||
    req.socket.remoteAddress ||
    'unknown';

  return `ip:${ip}`;
}

/**
 * User-based key generator (requires authentication)
 */
export function userKeyGenerator(req: NextApiRequest): string {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return 'anonymous';
  }

  const token = authHeader.substring(7);
  return `user:${token.substring(0, 20)}`;
}

/**
 * Endpoint-specific key generator
 */
export function endpointKeyGenerator(endpoint: string) {
  return (req: NextApiRequest): string => {
    const ip =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
      (req.headers['x-real-ip'] as string) ||
      req.socket.remoteAddress ||
      'unknown';

    return `${endpoint}:${ip}`;
  };
}

/**
 * Cleanup old entries periodically
 */
setInterval(() => {
  const now = Date.now();
  for (const [key, log] of requestStore.entries()) {
    if (now > log.resetTime && log.requests.length === 0) {
      requestStore.delete(key);
    }
  }
}, 60000); // Clean up every minute

/**
 * Wrapper to use rate limiting with existing auth middleware
 */
export function withRateLimit<T extends (...args: any[]) => Promise<void>>(
  handler: T,
  config: RateLimitConfig
): T {
  const limiter = rateLimit(config);

  return (async (req: NextApiRequest, res: NextApiResponse) => {
    await limiter(req, res, async () => {
      await handler(req, res);
    });
  }) as T;
}

/**
 * Preset rate limit configurations
 */
export const RateLimitPresets = {
  // Strict: 10 requests per minute
  strict: {
    windowMs: 60000,
    maxRequests: 10,
  },

  // Standard: 60 requests per minute
  standard: {
    windowMs: 60000,
    maxRequests: 60,
  },

  // Generous: 120 requests per minute
  generous: {
    windowMs: 60000,
    maxRequests: 120,
  },

  // Auth endpoints: 5 requests per 15 minutes
  auth: {
    windowMs: 15 * 60000,
    maxRequests: 5,
  },

  // Public endpoints: 30 requests per minute
  public: {
    windowMs: 60000,
    maxRequests: 30,
  },

  // Generation endpoints: Plan-based (handled separately)
  generation: {
    free: {
      windowMs: 60000,
      maxRequests: 10,
    },
    pro: {
      windowMs: 60000,
      maxRequests: 50,
    },
    enterprise: {
      windowMs: 60000,
      maxRequests: 200,
    },
  },
};
