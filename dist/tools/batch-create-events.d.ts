import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { CalendarService } from '../services/calendar.js';
import { z } from 'zod';
export declare const BatchCreateEventsSchema: z.ZodObject<{
    events: z.ZodArray<z.ZodObject<Omit<{
        id: z.ZodOptional<z.ZodString>;
        summary: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        location: z.ZodOptional<z.ZodString>;
        start: z.ZodObject<{
            dateTime: z.ZodOptional<z.ZodString>;
            date: z.ZodOptional<z.ZodString>;
            timeZone: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            date?: string | undefined;
            dateTime?: string | undefined;
            timeZone?: string | undefined;
        }, {
            date?: string | undefined;
            dateTime?: string | undefined;
            timeZone?: string | undefined;
        }>;
        end: z.ZodObject<{
            dateTime: z.ZodOptional<z.ZodString>;
            date: z.ZodOptional<z.ZodString>;
            timeZone: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            date?: string | undefined;
            dateTime?: string | undefined;
            timeZone?: string | undefined;
        }, {
            date?: string | undefined;
            dateTime?: string | undefined;
            timeZone?: string | undefined;
        }>;
        attendees: z.ZodOptional<z.ZodArray<z.ZodObject<{
            email: z.ZodString;
            displayName: z.ZodOptional<z.ZodString>;
            optional: z.ZodOptional<z.ZodBoolean>;
            responseStatus: z.ZodOptional<z.ZodEnum<["needsAction", "declined", "tentative", "accepted"]>>;
        }, "strip", z.ZodTypeAny, {
            email: string;
            displayName?: string | undefined;
            optional?: boolean | undefined;
            responseStatus?: "needsAction" | "declined" | "tentative" | "accepted" | undefined;
        }, {
            email: string;
            displayName?: string | undefined;
            optional?: boolean | undefined;
            responseStatus?: "needsAction" | "declined" | "tentative" | "accepted" | undefined;
        }>, "many">>;
        recurrence: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        status: z.ZodOptional<z.ZodEnum<["confirmed", "tentative", "cancelled"]>>;
        visibility: z.ZodOptional<z.ZodEnum<["default", "public", "private", "confidential"]>>;
        transparency: z.ZodOptional<z.ZodEnum<["opaque", "transparent"]>>;
    }, "id">, "strip", z.ZodTypeAny, {
        summary: string;
        start: {
            date?: string | undefined;
            dateTime?: string | undefined;
            timeZone?: string | undefined;
        };
        end: {
            date?: string | undefined;
            dateTime?: string | undefined;
            timeZone?: string | undefined;
        };
        status?: "tentative" | "confirmed" | "cancelled" | undefined;
        description?: string | undefined;
        location?: string | undefined;
        attendees?: {
            email: string;
            displayName?: string | undefined;
            optional?: boolean | undefined;
            responseStatus?: "needsAction" | "declined" | "tentative" | "accepted" | undefined;
        }[] | undefined;
        recurrence?: string[] | undefined;
        visibility?: "default" | "public" | "private" | "confidential" | undefined;
        transparency?: "opaque" | "transparent" | undefined;
    }, {
        summary: string;
        start: {
            date?: string | undefined;
            dateTime?: string | undefined;
            timeZone?: string | undefined;
        };
        end: {
            date?: string | undefined;
            dateTime?: string | undefined;
            timeZone?: string | undefined;
        };
        status?: "tentative" | "confirmed" | "cancelled" | undefined;
        description?: string | undefined;
        location?: string | undefined;
        attendees?: {
            email: string;
            displayName?: string | undefined;
            optional?: boolean | undefined;
            responseStatus?: "needsAction" | "declined" | "tentative" | "accepted" | undefined;
        }[] | undefined;
        recurrence?: string[] | undefined;
        visibility?: "default" | "public" | "private" | "confidential" | undefined;
        transparency?: "opaque" | "transparent" | undefined;
    }>, "many">;
    options: z.ZodOptional<z.ZodObject<{
        continueOnError: z.ZodDefault<z.ZodBoolean>;
        batchSize: z.ZodDefault<z.ZodNumber>;
        delayBetweenBatches: z.ZodDefault<z.ZodNumber>;
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
    }>>;
}, "strip", z.ZodTypeAny, {
    events: {
        summary: string;
        start: {
            date?: string | undefined;
            dateTime?: string | undefined;
            timeZone?: string | undefined;
        };
        end: {
            date?: string | undefined;
            dateTime?: string | undefined;
            timeZone?: string | undefined;
        };
        status?: "tentative" | "confirmed" | "cancelled" | undefined;
        description?: string | undefined;
        location?: string | undefined;
        attendees?: {
            email: string;
            displayName?: string | undefined;
            optional?: boolean | undefined;
            responseStatus?: "needsAction" | "declined" | "tentative" | "accepted" | undefined;
        }[] | undefined;
        recurrence?: string[] | undefined;
        visibility?: "default" | "public" | "private" | "confidential" | undefined;
        transparency?: "opaque" | "transparent" | undefined;
    }[];
    options?: {
        continueOnError: boolean;
        batchSize: number;
        delayBetweenBatches: number;
        retryOptions?: {
            maxRetries: number;
            baseDelay: number;
            maxDelay: number;
            backoffMultiplier: number;
        } | undefined;
    } | undefined;
}, {
    events: {
        summary: string;
        start: {
            date?: string | undefined;
            dateTime?: string | undefined;
            timeZone?: string | undefined;
        };
        end: {
            date?: string | undefined;
            dateTime?: string | undefined;
            timeZone?: string | undefined;
        };
        status?: "tentative" | "confirmed" | "cancelled" | undefined;
        description?: string | undefined;
        location?: string | undefined;
        attendees?: {
            email: string;
            displayName?: string | undefined;
            optional?: boolean | undefined;
            responseStatus?: "needsAction" | "declined" | "tentative" | "accepted" | undefined;
        }[] | undefined;
        recurrence?: string[] | undefined;
        visibility?: "default" | "public" | "private" | "confidential" | undefined;
        transparency?: "opaque" | "transparent" | undefined;
    }[];
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
    } | undefined;
}>;
export declare const batchCreateEventsTool: Tool;
export declare function handleBatchCreateEvents(args: unknown, calendarService: CalendarService): Promise<string>;
//# sourceMappingURL=batch-create-events.d.ts.map