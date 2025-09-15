import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { CalendarService } from '../services/calendar.js';
import { ListEventsSchema } from '../types/calendar.js';
import { validateInput } from '../utils/validation.js';

export const listEventsTool: Tool = {
  name: 'list_events',
  description: 'List calendar events within a specified time range',
  inputSchema: {
    type: 'object',
    properties: {
      timeMin: {
        type: 'string',
        format: 'date-time',
        description: 'Lower bound for event start time (ISO format, e.g., 2023-12-01T00:00:00Z)',
      },
      timeMax: {
        type: 'string',
        format: 'date-time',
        description: 'Upper bound for event start time (ISO format, e.g., 2023-12-31T23:59:59Z)',
      },
      maxResults: {
        type: 'number',
        minimum: 1,
        maximum: 2500,
        default: 250,
        description: 'Maximum number of events to return (default: 250, max: 2500)',
      },
      orderBy: {
        type: 'string',
        enum: ['startTime', 'updated'],
        default: 'startTime',
        description: 'Order events by start time or last updated time',
      },
      singleEvents: {
        type: 'boolean',
        default: true,
        description: 'Whether to expand recurring events into instances',
      },
      showDeleted: {
        type: 'boolean',
        default: false,
        description: 'Whether to include deleted events',
      },
    },
    additionalProperties: false,
  },
};

export async function handleListEvents(
  args: unknown,
  calendarService: CalendarService
): Promise<string> {
  const input = validateInput(ListEventsSchema, {
    maxResults: 250,
    orderBy: 'startTime' as const,
    singleEvents: true,
    showDeleted: false,
    ...(args || {})
  });

  const events = await calendarService.listEvents({
    timeMin: input.timeMin,
    timeMax: input.timeMax,
    maxResults: input.maxResults || 250,
    orderBy: input.orderBy || 'startTime',
    singleEvents: input.singleEvents ?? true,
    showDeleted: input.showDeleted ?? false,
  });

  const formattedEvents = events.map(event => ({
    id: event.id,
    summary: event.summary,
    description: event.description,
    location: event.location,
    start: event.start,
    end: event.end,
    attendees: event.attendees?.map(attendee => ({
      email: attendee.email,
      displayName: attendee.displayName,
      responseStatus: attendee.responseStatus,
    })),
    status: event.status,
    recurrence: event.recurrence,
  }));

  return JSON.stringify({
    success: true,
    message: `Found ${events.length} events`,
    count: events.length,
    events: formattedEvents,
  }, null, 2);
}