import { validateInput } from '../utils/validation.js';
import { withRetry, DEFAULT_RETRY_OPTIONS } from '../utils/retry.js';
import { z } from 'zod';
export const BatchDeleteEventsSchema = z.object({
    eventIds: z.array(z.string()).min(1).max(100),
    options: z.object({
        continueOnError: z.boolean().default(true),
        batchSize: z.number().min(1).max(50).default(10),
        delayBetweenBatches: z.number().min(0).max(5000).default(100),
        confirmationRequired: z.boolean().default(false),
        retryOptions: z.object({
            maxRetries: z.number().min(0).max(10).default(3),
            baseDelay: z.number().min(100).max(10000).default(1000),
            maxDelay: z.number().min(1000).max(60000).default(10000),
            backoffMultiplier: z.number().min(1).max(5).default(2),
        }).optional(),
    }).optional(),
});
export const batchDeleteEventsTool = {
    name: 'batch_delete_events',
    description: 'Delete multiple calendar events in batch with error handling and rate limiting',
    inputSchema: {
        type: 'object',
        properties: {
            eventIds: {
                type: 'array',
                description: 'Array of event IDs to delete',
                items: {
                    type: 'string',
                    description: 'Event ID to delete',
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
                        description: 'Continue processing if individual deletions fail',
                    },
                    batchSize: {
                        type: 'number',
                        minimum: 1,
                        maximum: 50,
                        default: 10,
                        description: 'Number of deletions to process simultaneously',
                    },
                    delayBetweenBatches: {
                        type: 'number',
                        minimum: 0,
                        maximum: 5000,
                        default: 100,
                        description: 'Delay between batches in milliseconds',
                    },
                    confirmationRequired: {
                        type: 'boolean',
                        default: false,
                        description: 'Whether to require confirmation before deletion',
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
        required: ['eventIds'],
    },
};
export async function handleBatchDeleteEvents(args, calendarService) {
    const input = validateInput(BatchDeleteEventsSchema, args);
    const options = {
        continueOnError: true,
        batchSize: 10,
        delayBetweenBatches: 100,
        confirmationRequired: false,
        retryOptions: DEFAULT_RETRY_OPTIONS,
        ...input.options,
    };
    const retryOptions = {
        ...DEFAULT_RETRY_OPTIONS,
        ...options.retryOptions,
    };
    if (options.confirmationRequired) {
        return JSON.stringify({
            success: false,
            requiresConfirmation: true,
            message: `Are you sure you want to delete ${input.eventIds.length} events? This action cannot be undone.`,
            eventIds: input.eventIds,
            hint: 'Set confirmationRequired to false to proceed with deletion',
        }, null, 2);
    }
    const results = {
        total: input.eventIds.length,
        successful: 0,
        failed: 0,
        deletedEventIds: [],
        errors: [],
    };
    for (let i = 0; i < input.eventIds.length; i += options.batchSize) {
        const batch = input.eventIds.slice(i, i + options.batchSize);
        const batchPromises = batch.map(async (eventId, index) => {
            try {
                await withRetry(() => calendarService.deleteEvent({ eventId }), retryOptions);
                results.successful++;
                results.deletedEventIds.push(eventId);
                return { success: true, eventId };
            }
            catch (error) {
                results.failed++;
                const errorInfo = {
                    index: i + index,
                    eventId: eventId,
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
        if (i + options.batchSize < input.eventIds.length && options.delayBetweenBatches > 0) {
            await new Promise(resolve => setTimeout(resolve, options.delayBetweenBatches));
        }
    }
    return JSON.stringify({
        success: results.failed === 0,
        message: `Batch delete completed: ${results.successful} successful, ${results.failed} failed`,
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
        deletedEventIds: results.deletedEventIds,
        errors: results.errors.length > 0 ? results.errors : undefined,
    }, null, 2);
}
//# sourceMappingURL=batch-delete-events.js.map