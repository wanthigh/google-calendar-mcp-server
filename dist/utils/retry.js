import { RateLimitError } from './error.js';
export const DEFAULT_RETRY_OPTIONS = {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 10000,
    backoffMultiplier: 2,
    retryableErrors: ['RATE_LIMIT_ERROR', 'NETWORK_ERROR', 'TIMEOUT_ERROR', 'INTERNAL_ERROR']
};
export async function withRetry(operation, options = {}) {
    const opts = { ...DEFAULT_RETRY_OPTIONS, ...options };
    let lastError;
    for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
        try {
            return await operation();
        }
        catch (error) {
            lastError = error;
            const isRetryable = isRetryableError(error, opts.retryableErrors);
            if (!isRetryable || attempt === opts.maxRetries) {
                throw error;
            }
            const delay = Math.min(opts.baseDelay * Math.pow(opts.backoffMultiplier, attempt), opts.maxDelay);
            console.error(`Attempt ${attempt + 1} failed: ${error.message}. Retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
    throw lastError;
}
function isRetryableError(error, retryableErrors) {
    if (error instanceof RateLimitError) {
        return true;
    }
    if ('code' in error) {
        const code = error.code;
        if (code === 429 || code === 403) {
            return true;
        }
        if (code === 'ECONNRESET' || code === 'ENOTFOUND' || code === 'ETIMEDOUT') {
            return true;
        }
        if (code === 'quotaExceeded' || code === 'rateLimitExceeded') {
            return true;
        }
    }
    const message = error.message.toLowerCase();
    if (message.includes('rate limit') ||
        message.includes('quota exceeded') ||
        message.includes('too many requests') ||
        message.includes('service unavailable') ||
        message.includes('internal error') ||
        message.includes('backend error')) {
        return true;
    }
    if ('name' in error && retryableErrors.includes(error.name)) {
        return true;
    }
    return false;
}
export class RetryableOperation {
    constructor(operation, options = {}) {
        this.attempts = 0;
        this.operation = operation;
        this.options = { ...DEFAULT_RETRY_OPTIONS, ...options };
    }
    async execute() {
        return withRetry(this.operation, this.options);
    }
    getAttempts() {
        return this.attempts;
    }
    getLastError() {
        return this.lastError;
    }
}
//# sourceMappingURL=retry.js.map