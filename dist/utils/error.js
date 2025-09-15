export class CalendarError extends Error {
    constructor(message, code, statusCode, originalError) {
        super(message);
        this.code = code;
        this.statusCode = statusCode;
        this.originalError = originalError;
        this.name = 'CalendarError';
    }
}
export class AuthenticationError extends CalendarError {
    constructor(message, originalError) {
        super(message, 'AUTHENTICATION_ERROR', 401, originalError);
        this.name = 'AuthenticationError';
    }
}
export class ValidationError extends CalendarError {
    constructor(message, originalError) {
        super(message, 'VALIDATION_ERROR', 400, originalError);
        this.name = 'ValidationError';
    }
}
export class NotFoundError extends CalendarError {
    constructor(message, originalError) {
        super(message, 'NOT_FOUND_ERROR', 404, originalError);
        this.name = 'NotFoundError';
    }
}
export class RateLimitError extends CalendarError {
    constructor(message, originalError) {
        super(message, 'RATE_LIMIT_ERROR', 429, originalError);
        this.name = 'RateLimitError';
    }
}
export function handleGoogleApiError(error) {
    if (error.code === 401) {
        return new AuthenticationError('Authentication failed', error);
    }
    if (error.code === 403) {
        return new RateLimitError('Rate limit exceeded or permission denied', error);
    }
    if (error.code === 404) {
        return new NotFoundError('Event or calendar not found', error);
    }
    if (error.code === 400) {
        return new ValidationError('Invalid request parameters', error);
    }
    return new CalendarError(error.message || 'Unknown error occurred', 'UNKNOWN_ERROR', error.code, error);
}
//# sourceMappingURL=error.js.map