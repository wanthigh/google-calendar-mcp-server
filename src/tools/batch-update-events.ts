import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { CalendarService } from '../services/calendar.js';
import { UpdateEventSchema } from '../types/calendar.js';
import { validateInput } from '../utils/validation.js';
import { withRetry, DEFAULT_RETRY_OPTIONS, RetryOptions } from '../utils/retry.js';
import { z } from 'zod';

// 批量更新事件的Schema
export const BatchUpdateEventsSchema = z.object({
  updates: z.array(UpdateEventSchema),
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

export const batchUpdateEventsTool: Tool = {
  name: 'batch_update_events',
  description: 'Update multiple calendar events in batch with error handling and rate limiting',
  inputSchema: {
    type: 'object',
    properties: {
      updates: {
        type: 'array',
        description: 'Array of event updates to perform',
        items: {
          type: 'object',
          properties: {
            eventId: {
              type: 'string',
              description: 'ID of the event to update (required)',
            },
            summary: {
              type: 'string',
              description: 'Event title/summary',
            },
            description: {
              type: 'string',
              description: 'Event description',
            },
            location: {
              type: 'string',
              description: 'Event location',
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
            status: {
              type: 'string',
              enum: ['confirmed', 'tentative', 'cancelled'],
              description: 'Event status',
            },
          },
          required: ['eventId'],
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
            description: 'Continue processing if individual updates fail',
          },
          batchSize: {
            type: 'number',
            minimum: 1,
            maximum: 50,
            default: 10,
            description: 'Number of updates to process simultaneously',
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
    required: ['updates'],
  },
};

export async function handleBatchUpdateEvents(
  args: unknown,
  calendarService: CalendarService
): Promise<string> {
  const input = validateInput(BatchUpdateEventsSchema, args);

  const options = {
    continueOnError: true,
    batchSize: 10,
    delayBetweenBatches: 100,
    retryOptions: DEFAULT_RETRY_OPTIONS,
    ...input.options,
  };

  // Merge retry options
  const retryOptions: RetryOptions = {
    ...DEFAULT_RETRY_OPTIONS,
    ...options.retryOptions,
  };

  const results = {
    total: input.updates.length,
    successful: 0,
    failed: 0,
    updatedEvents: [] as any[],
    errors: [] as any[],
  };

  // 分批处理更新
  for (let i = 0; i < input.updates.length; i += options.batchSize) {
    const batch = input.updates.slice(i, i + options.batchSize);

    const batchPromises = batch.map(async (updateData, index) => {
      try {
        const event = await withRetry(
          () => calendarService.updateEvent(updateData),
          retryOptions
        );

        results.successful++;
        results.updatedEvents.push({
          index: i + index,
          eventId: event.id,
          summary: event.summary,
          originalEventId: updateData.eventId,
        });
        return { success: true, event };
      } catch (error) {
        results.failed++;
        const errorInfo = {
          index: i + index,
          eventId: updateData.eventId,
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

    // 等待当前批次完成
    await Promise.all(batchPromises);

    // 批次间延迟
    if (i + options.batchSize < input.updates.length && options.delayBetweenBatches > 0) {
      await new Promise(resolve => setTimeout(resolve, options.delayBetweenBatches));
    }
  }

  return JSON.stringify({
    success: results.failed === 0,
    message: `Batch update completed: ${results.successful} successful, ${results.failed} failed`,
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
    updatedEvents: results.updatedEvents,
    errors: results.errors.length > 0 ? results.errors : undefined,
  }, null, 2);
}