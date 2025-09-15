import { CreateEventSchema } from '../types/calendar.js';
import { validateInput } from '../utils/validation.js';
import { withRetry, DEFAULT_RETRY_OPTIONS } from '../utils/retry.js';
import { z } from 'zod';
export const BatchCreateEventsSchema = z.object({
    events: z.array(CreateEventSchema),
    options: z.object({
        continueOnError: z.boolean().default(true),
        batchSize: z.number().min(1).max(50).default(10),
        delayBetweenBatches: z.number().min(0).max(5000).default(100),
        retryOptions: z.object({
            maxRetries: z.number().min(0).max(10).default(3),
            baseDelay: z.number().min(100).max(10000).default(1000),
            maxDelay: z.number().min(1000).max(60000).default(10000),
            backoffMultiplier: z.number().min(1).max(5).default(2),
        }).optional(),
    }).optional(),
});
export const batchCreateEventsTool = {
    name: 'batch_create_events',
    description: 'Create multiple calendar events in batch with error handling and rate limiting',
    inputSchema: {
        type: 'object',
        properties: {
            events: {
                type: 'array',
                description: 'Array of events to create',
                items: {
                    type: 'object',
                    properties: {
                        summary: {
                            type: 'string',
                            description: 'Event title/summary (required)',
                        },
                        description: {
                            type: 'string',
                            description: 'Event description (optional)',
                        },
                        location: {
                            type: 'string',
                            description: 'Event location (optional)',
                        },
                        start: {
                            type: 'object',
                            description: 'Event start time',
                            properties: {
                                dateTime: {
                                    type: 'string',
                                    format: 'date-time',
                                    description: 'Start date-time in ISO format',
                                },
                                date: {
                                    type: 'string',
                                    format: 'date',
                                    description: 'Start date for all-day events',
                                },
                                timeZone: {
                                    type: 'string',
                                    description: 'Time zone',
                                },
                            },
                        },
                        end: {
                            type: 'object',
                            description: 'Event end time',
                            properties: {
                                dateTime: {
                                    type: 'string',
                                    format: 'date-time',
                                    description: 'End date-time in ISO format',
                                },
                                date: {
                                    type: 'string',
                                    format: 'date',
                                    description: 'End date for all-day events',
                                },
                                timeZone: {
                                    type: 'string',
                                    description: 'Time zone',
                                },
                            },
                        },
                        attendees: {
                            type: 'array',
                            description: 'List of event attendees (optional)',
                            items: {
                                type: 'object',
                                properties: {
                                    email: {
                                        type: 'string',
                                        format: 'email',
                                        description: 'Attendee email address',
                                    },
                                    displayName: {
                                        type: 'string',
                                        description: 'Attendee display name',
                                    },
                                    optional: {
                                        type: 'boolean',
                                        description: 'Whether attendance is optional',
                                    },
                                },
                                required: ['email'],
                            },
                        },
                        recurrence: {
                            type: 'array',
                            description: 'Recurrence rules (optional)',
                            items: {
                                type: 'string',
                                description: 'RRULE strings',
                            },
                        },
                        status: {
                            type: 'string',
                            enum: ['confirmed', 'tentative', 'cancelled'],
                            description: 'Event status',
                        },
                    },
                    required: ['summary', 'start', 'end'],
                },
                minItems: 1,
                maxItems: 100,
            },
            options: {
                type: 'object',
                description: 'Batch processing options',
                properties: {
                    continueOnError: {
                        type: 'boolean',
                        default: true,
                        description: 'Continue processing if individual events fail',
                    },
                    batchSize: {
                        type: 'number',
                        minimum: 1,
                        maximum: 50,
                        default: 10,
                        description: 'Number of events to process simultaneously',
                    },
                    delayBetweenBatches: {
                        type: 'number',
                        minimum: 0,
                        maximum: 5000,
                        default: 100,
                        description: 'Delay between batches in milliseconds',
                    },
                    retryOptions: {
                        type: 'object',
                        description: 'Retry configuration for failed operations',
                        properties: {
                            maxRetries: {
                                type: 'number',
                                minimum: 0,
                                maximum: 10,
                                default: 3,
                                description: 'Maximum number of retry attempts',
                            },
                            baseDelay: {
                                type: 'number',
                                minimum: 100,
                                maximum: 10000,
                                default: 1000,
                                description: 'Base delay between retries in milliseconds',
                            },
                            maxDelay: {
                                type: 'number',
                                minimum: 1000,
                                maximum: 60000,
                                default: 10000,
                                description: 'Maximum delay between retries in milliseconds',
                            },
                            backoffMultiplier: {
                                type: 'number',
                                minimum: 1,
                                maximum: 5,
                                default: 2,
                                description: 'Exponential backoff multiplier',
                            },
                        },
                    },
                },
            },
        },
        required: ['events'],
    },
};
export async function handleBatchCreateEvents(args, calendarService) {
    const input = validateInput(BatchCreateEventsSchema, args);
    const options = {
        continueOnError: true,
        batchSize: 10,
        delayBetweenBatches: 100,
        retryOptions: DEFAULT_RETRY_OPTIONS,
        ...input.options,
    };
    const retryOptions = {
        ...DEFAULT_RETRY_OPTIONS,
        ...options.retryOptions,
    };
    const results = {
        total: input.events.length,
        successful: 0,
        failed: 0,
        retried: 0,
        createdEvents: [],
        errors: [],
    };
    for (let i = 0; i < input.events.length; i += options.batchSize) {
        const batch = input.events.slice(i, i + options.batchSize);
        const batchPromises = batch.map(async (eventData, index) => {
            try {
                const event = await withRetry(() => calendarService.createEvent(eventData), retryOptions);
                results.successful++;
                results.createdEvents.push({
                    index: i + index,
                    eventId: event.id,
                    summary: event.summary,
                    start: event.start,
                });
                return { success: true, event };
            }
            catch (error) {
                results.failed++;
                const errorInfo = {
                    index: i + index,
                    summary: eventData.summary,
                    error: error instanceof Error ? error.message : 'Unknown error',
                    retriesAttempted: retryOptions.maxRetries,
                };
                results.errors.push(errorInfo);
                if (!options.continueOnError) {
                    throw error;
                }
                return { success: false, error: errorInfo };
            }
        });
        await Promise.all(batchPromises);
        if (i + options.batchSize < input.events.length && options.delayBetweenBatches > 0) {
            await new Promise(resolve => setTimeout(resolve, options.delayBetweenBatches));
        }
    }
    return JSON.stringify({
        success: results.failed === 0,
        message: `Batch create completed: ${results.successful} successful, ${results.failed} failed`,
        summary: {
            total: results.total,
            successful: results.successful,
            failed: results.failed,
            successRate: `${((results.successful / results.total) * 100).toFixed(1)}%`,
        },
        retryConfig: {
            enabled: retryOptions.maxRetries > 0,
            maxRetries: retryOptions.maxRetries,
            baseDelay: retryOptions.baseDelay,
        },
        createdEvents: results.createdEvents,
        errors: results.errors.length > 0 ? results.errors : undefined,
    }, null, 2);
}
//# sourceMappingURL=batch-create-events.js.map