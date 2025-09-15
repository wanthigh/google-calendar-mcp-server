import { RateLimitError } from './error.js';

export interface RetryOptions {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  retryableErrors: string[];
}

export const DEFAULT_RETRY_OPTIONS: RetryOptions = {
  maxRetries: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  backoffMultiplier: 2,
  retryableErrors: ['RATE_LIMIT_ERROR', 'NETWORK_ERROR', 'TIMEOUT_ERROR', 'INTERNAL_ERROR']
};

export async function withRetry<T>(
  operation: () => Promise<T>,
  options: Partial<RetryOptions> = {}
): Promise<T> {
  const opts = { ...DEFAULT_RETRY_OPTIONS, ...options };
  let lastError: Error;

  for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;

      // Check if error is retryable
      const isRetryable = isRetryableError(error as Error, opts.retryableErrors);

      if (!isRetryable || attempt === opts.maxRetries) {
        throw error;
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(
        opts.baseDelay * Math.pow(opts.backoffMultiplier, attempt),
        opts.maxDelay
      );

      console.error(`Attempt ${attempt + 1} failed: ${(error as Error).message}. Retrying in ${delay}ms...`);

      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}

function isRetryableError(error: Error, retryableErrors: string[]): boolean {
  // Check for rate limit errors
  if (error instanceof RateLimitError) {
    return true;
  }

  // Check for specific error codes
  if ('code' in error) {
    const code = (error as any).code;

    // Google API rate limit codes
    if (code === 429 || code === 403) {
      return true;
    }

    // Network errors
    if (code === 'ECONNRESET' || code === 'ENOTFOUND' || code === 'ETIMEDOUT') {
      return true;
    }

    // Google API quota errors
    if (code === 'quotaExceeded' || code === 'rateLimitExceeded') {
      return true;
    }
  }

  // Check error message for retryable patterns
  const message = error.message.toLowerCase();

  if (message.includes('rate limit') ||
      message.includes('quota exceeded') ||
      message.includes('too many requests') ||
      message.includes('service unavailable') ||
      message.includes('internal error') ||
      message.includes('backend error')) {
    return true;
  }

  // Check against custom retryable error types
  if ('name' in error && retryableErrors.includes(error.name)) {
    return true;
  }

  return false;
}

export class RetryableOperation<T> {
  private operation: () => Promise<T>;
  private options: RetryOptions;
  private attempts: number = 0;
  private lastError?: Error;

  constructor(operation: () => Promise<T>, options: Partial<RetryOptions> = {}) {
    this.operation = operation;
    this.options = { ...DEFAULT_RETRY_OPTIONS, ...options };
  }

  async execute(): Promise<T> {
    return withRetry(this.operation, this.options);
  }

  getAttempts(): number {
    return this.attempts;
  }

  getLastError(): Error | undefined {
    return this.lastError;
  }
}