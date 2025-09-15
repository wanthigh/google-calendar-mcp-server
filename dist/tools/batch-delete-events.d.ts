import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { CalendarService } from '../services/calendar.js';
import { z } from 'zod';
export declare const BatchDeleteEventsSchema: z.ZodObject<{
    eventIds: z.ZodArray<z.ZodString, "many">;
    options: z.ZodOptional<z.ZodObject<{
        continueOnError: z.ZodDefault<z.ZodBoolean>;
        batchSize: z.ZodDefault<z.ZodNumber>;
        delayBetweenBatches: z.ZodDefault<z.ZodNumber>;
        confirmationRequired: z.ZodDefault<z.ZodBoolean>;
        retryOptions: z.ZodOptional<z.ZodObject<{
            maxRetries: z.ZodDefault<z.ZodNumber>;
            baseDelay: z.ZodDefault<z.ZodNumber>;
            maxDelay: z.ZodDefault<z.ZodNumber>;
            backoffMultiplier: z.ZodDefault<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            maxRetries: number;
            baseDelay: number;
            maxDelay: number;
            backoffMultiplier: number;
        }, {
            maxRetries?: number | undefined;
            baseDelay?: number | undefined;
            maxDelay?: number | undefined;
            backoffMultiplier?: number | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        continueOnError: boolean;
        batchSize: number;
        delayBetweenBatches: number;
        confirmationRequired: boolean;
        retryOptions?: {
            maxRetries: number;
            baseDelay: number;
            maxDelay: number;
            backoffMultiplier: number;
        } | undefined;
    }, {
        continueOnError?: boolean | undefined;
        batchSize?: number | undefined;
        delayBetweenBatches?: number | undefined;
        retryOptions?: {
            maxRetries?: number | undefined;
            baseDelay?: number | undefined;
            maxDelay?: number | undefined;
            backoffMultiplier?: number | undefined;
        } | undefined;
        confirmationRequired?: boolean | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    eventIds: string[];
    options?: {
        continueOnError: boolean;
        batchSize: number;
        delayBetweenBatches: number;
        confirmationRequired: boolean;
        retryOptions?: {
            maxRetries: number;
            baseDelay: number;
            maxDelay: number;
            backoffMultiplier: number;
        } | undefined;
    } | undefined;
}, {
    eventIds: string[];
    options?: {
        continueOnError?: boolean | undefined;
        batchSize?: number | undefined;
        delayBetweenBatches?: number | undefined;
        retryOptions?: {
            maxRetries?: number | undefined;
            baseDelay?: number | undefined;
            maxDelay?: number | undefined;
            backoffMultiplier?: number | undefined;
        } | undefined;
        confirmationRequired?: boolean | undefined;
    } | undefined;
}>;
export declare const batchDeleteEventsTool: Tool;
export declare function handleBatchDeleteEvents(args: unknown, calendarService: CalendarService): Promise<string>;
//# sourceMappingURL=batch-delete-events.d.ts.map