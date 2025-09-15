export declare class CalendarError extends Error {
    code: string;
    statusCode?: number | undefined;
    originalError?: Error | undefined;
    constructor(message: string, code: string, statusCode?: number | undefined, originalError?: Error | undefined);
}
export declare class AuthenticationError extends CalendarError {
    constructor(message: string, originalError?: Error);
}
export declare class ValidationError extends CalendarError {
    constructor(message: string, originalError?: Error);
}
export declare class NotFoundError extends CalendarError {
    constructor(message: string, originalError?: Error);
}
export declare class RateLimitError extends CalendarError {
    constructor(message: string, originalError?: Error);
}
export declare function handleGoogleApiError(error: any): CalendarError;
//# sourceMappingURL=error.d.ts.map