// netlify/functions/utils/response.ts
/**
 * Standard JSON response helpers for Netlify functions
 */
/**
 * Returns a JSON response with optional custom headers.
 * @param data - The response payload
 * @param statusCode - HTTP status code (default 200)
 * @param headers - Optional additional headers (merged, Content-Type can be overridden)
 */
export function jsonResponse(
  data: any,
  statusCode: number = 200,
  headers: Record<string, string> = {}
) {
  const baseHeaders = { 'Content-Type': 'application/json' };
  // Merge, allowing custom Content-Type to override
  const merged = { ...baseHeaders, ...headers };
  return {
    statusCode,
    headers: merged,
    body: JSON.stringify(data),
  };
}

/**
 * Returns a standardized error response with optional custom headers.
 * @param message - Error message (string or any)
 * @param statusCode - HTTP status code (default 500)
 * @param headers - Optional additional headers
 */
export function errorResponse(
  message: any,
  statusCode: number = 500,
  headers: Record<string, string> = {}
) {
  // Defensive: always coerce error to string
  const errMsg = typeof message === 'string' ? message : String(message);
  return jsonResponse({ error: errMsg }, statusCode, headers);
}
