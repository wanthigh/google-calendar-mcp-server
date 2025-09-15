export interface RetryOptions {
    maxRetries: number;
    baseDelay: number;
    maxDelay: number;
    backoffMultiplier: number;
    retryableErrors: string[];
}
export declare const DEFAULT_RETRY_OPTIONS: RetryOptions;
export declare function withRetry<T>(operation: () => Promise<T>, options?: Partial<RetryOptions>): Promise<T>;
export declare class RetryableOperation<T> {
    private operation;
    private options;
    private attempts;
    private lastError?;
    constructor(operation: () => Promise<T>, options?: Partial<RetryOptions>);
    execute(): Promise<T>;
    getAttempts(): number;
    getLastError(): Error | undefined;
}
//# sourceMappingURL=retry.d.ts.map