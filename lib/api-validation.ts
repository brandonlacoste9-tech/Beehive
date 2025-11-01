/**
 * API Validation Utilities
 * Common validation schemas and functions for API endpoints
 */

export interface ValidationResult<T> {
  valid: boolean;
  data?: T;
  errors?: string[];
}

/**
 * Validate string field
 */
export function validateString(
  value: unknown,
  fieldName: string,
  options?: {
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    required?: boolean;
  }
): { valid: boolean; error?: string } {
  if (options?.required && !value) {
    return { valid: false, error: `${fieldName} is required` };
  }

  if (!value) {
    return { valid: true };
  }

  if (typeof value !== 'string') {
    return { valid: false, error: `${fieldName} must be a string` };
  }

  const trimmed = value.trim();

  if (options?.minLength && trimmed.length < options.minLength) {
    return {
      valid: false,
      error: `${fieldName} must be at least ${options.minLength} characters`,
    };
  }

  if (options?.maxLength && trimmed.length > options.maxLength) {
    return {
      valid: false,
      error: `${fieldName} must not exceed ${options.maxLength} characters`,
    };
  }

  if (options?.pattern && !options.pattern.test(trimmed)) {
    return { valid: false, error: `${fieldName} has invalid format` };
  }

  return { valid: true };
}

/**
 * Validate number field
 */
export function validateNumber(
  value: unknown,
  fieldName: string,
  options?: {
    min?: number;
    max?: number;
    integer?: boolean;
    required?: boolean;
  }
): { valid: boolean; error?: string } {
  if (options?.required && value === undefined && value === null) {
    return { valid: false, error: `${fieldName} is required` };
  }

  if (value === undefined || value === null) {
    return { valid: true };
  }

  const num = typeof value === 'string' ? parseFloat(value) : value;

  if (typeof num !== 'number' || isNaN(num)) {
    return { valid: false, error: `${fieldName} must be a number` };
  }

  if (options?.integer && !Number.isInteger(num)) {
    return { valid: false, error: `${fieldName} must be an integer` };
  }

  if (options?.min !== undefined && num < options.min) {
    return {
      valid: false,
      error: `${fieldName} must be at least ${options.min}`,
    };
  }

  if (options?.max !== undefined && num > options.max) {
    return {
      valid: false,
      error: `${fieldName} must not exceed ${options.max}`,
    };
  }

  return { valid: true };
}

/**
 * Validate array field
 */
export function validateArray(
  value: unknown,
  fieldName: string,
  options?: {
    minLength?: number;
    maxLength?: number;
    itemType?: string;
    required?: boolean;
  }
): { valid: boolean; error?: string } {
  if (options?.required && !value) {
    return { valid: false, error: `${fieldName} is required` };
  }

  if (!value) {
    return { valid: true };
  }

  if (!Array.isArray(value)) {
    return { valid: false, error: `${fieldName} must be an array` };
  }

  if (options?.minLength && value.length < options.minLength) {
    return {
      valid: false,
      error: `${fieldName} must contain at least ${options.minLength} items`,
    };
  }

  if (options?.maxLength && value.length > options.maxLength) {
    return {
      valid: false,
      error: `${fieldName} must not contain more than ${options.maxLength} items`,
    };
  }

  if (options?.itemType) {
    const invalidItems = value.filter(item => typeof item !== options.itemType);
    if (invalidItems.length > 0) {
      return {
        valid: false,
        error: `${fieldName} items must be of type ${options.itemType}`,
      };
    }
  }

  return { valid: true };
}

/**
 * Validate enum field
 */
export function validateEnum<T extends string | number>(
  value: unknown,
  fieldName: string,
  allowedValues: readonly T[],
  options?: {
    required?: boolean;
  }
): { valid: boolean; error?: string } {
  if (options?.required && !value) {
    return { valid: false, error: `${fieldName} is required` };
  }

  if (!value) {
    return { valid: true };
  }

  if (!allowedValues.includes(value as T)) {
    return {
      valid: false,
      error: `${fieldName} must be one of: ${allowedValues.join(', ')}`,
    };
  }

  return { valid: true };
}

/**
 * Validate JSON request body
 */
export async function validateRequestBody(request: Request): Promise<{
  valid: boolean;
  data?: Record<string, unknown>;
  error?: string;
}> {
  try {
    const contentType = request.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      return {
        valid: false,
        error: 'Content-Type must be application/json',
      };
    }

    const text = await request.text();
    if (!text) {
      return {
        valid: false,
        error: 'Request body is required',
      };
    }

    const data = JSON.parse(text);

    if (typeof data !== 'object' || data === null) {
      return {
        valid: false,
        error: 'Request body must be a JSON object',
      };
    }

    return { valid: true, data };
  } catch (error) {
    return {
      valid: false,
      error: 'Invalid JSON in request body',
    };
  }
}

/**
 * Rate limiting helper
 */
export function createRateLimiter(maxRequests: number, windowMs: number) {
  const requests: Map<string, number[]> = new Map();

  return function isRateLimited(key: string): boolean {
    const now = Date.now();
    const requestTimes = requests.get(key) || [];

    // Remove old requests outside the window
    const recentRequests = requestTimes.filter(time => now - time < windowMs);

    if (recentRequests.length >= maxRequests) {
      return true;
    }

    recentRequests.push(now);
    requests.set(key, recentRequests);
    return false;
  };
}

/**
 * Create API response with consistent format
 */
export function createApiResponse<T>(
  data: T,
  status: number = 200
) {
  return {
    status,
    data,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Create API error response with consistent format
 */
export function createApiError(
  message: string,
  status: number = 400,
  details?: Record<string, unknown>
) {
  return {
    status,
    error: {
      message,
      details,
      timestamp: new Date().toISOString(),
    },
  };
}
