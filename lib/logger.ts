/**
 * Simple structured logger for Netlify Functions
 * Pino-like interface with automatic secret redaction
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  requestId?: string;
  event?: string;
  duration?: number;
  status?: number;
  [key: string]: any;
}

const SECRETS_TO_REDACT = [
  'password',
  'token',
  'api_key',
  'apiKey',
  'secret',
  'authorization',
  'auth',
  'bearer',
  'stripe',
  'key'
];

function redactSecrets(obj: unknown): unknown {
  if (typeof obj !== 'object' || obj === null) return obj;

  if (Array.isArray(obj)) {
    return obj.map(redactSecrets);
  }

  const redacted: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    const lowerKey = key.toLowerCase();
    const shouldRedact = SECRETS_TO_REDACT.some(secret => lowerKey.includes(secret));

    if (shouldRedact && typeof value === 'string') {
      redacted[key] = '[REDACTED]';
    } else if (typeof value === 'object') {
      redacted[key] = redactSecrets(value);
    } else {
      redacted[key] = value;
    }
  }
  return redacted;
}

class Logger {
  private context: LogContext = {};

  constructor(initialContext?: LogContext) {
    this.context = initialContext || {};
  }

  child(context: LogContext): Logger {
    return new Logger({ ...this.context, ...context });
  }

  private log(level: LogLevel, message: string, data?: LogContext) {
    const timestamp = new Date().toISOString();
    const logData = redactSecrets({
      timestamp,
      level,
      message,
      ...this.context,
      ...data
    });

    const output = JSON.stringify(logData);

    switch (level) {
      case 'error':
        console.error(output);
        break;
      case 'warn':
        console.warn(output);
        break;
      default:
        console.log(output);
    }
  }

  debug(message: string, data?: LogContext) {
    this.log('debug', message, data);
  }

  info(message: string, data?: LogContext) {
    this.log('info', message, data);
  }

  warn(message: string, data?: LogContext) {
    this.log('warn', message, data);
  }

  error(message: string, data?: LogContext) {
    this.log('error', message, data);
  }
}

export function createLogger(context?: LogContext): Logger {
  return new Logger(context);
}

export type { Logger, LogContext, LogLevel };
