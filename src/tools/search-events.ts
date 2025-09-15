import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { CalendarService } from '../services/calendar.js';
import { SearchEventsSchema } from '../types/calendar.js';
import { validateInput } from '../utils/validation.js';

export const searchEventsTool: Tool = {
  name: 'search_events',
  description: 'Search for calendar events by keyword',
  inputSchema: {
    type: 'object',
    properties: {
      q: {
        type: 'string',
        description: 'Search query (required) - searches in title, description, location, and attendee names',
      },
      timeMin: {
        type: 'string',
        format: 'date-time',
        description: 'Lower bound for event start time (ISO format)',
      },
      timeMax: {
        type: 'string',
        format: 'date-time',
        description: 'Upper bound for event start time (ISO format)',
      },
      maxResults: {
        type: 'number',
        minimum: 1,
        maximum: 2500,
        default: 250,
        description: 'Maximum number of events to return (default: 250, max: 2500)',
      },
    },
    required: ['q'],
    additionalProperties: false,
  },
};

export async function handleSearchEvents(
  args: unknown,
  calendarService: CalendarService
): Promise<string> {
  const input = validateInput(SearchEventsSchema, {
    maxResults: 250,
    ...(typeof args === 'object' && args !== null ? args : {})
  });

  const events = await calendarService.searchEvents({
    q: input.q,
    timeMin: input.timeMin,
    timeMax: input.timeMax,
    maxResults: input.maxResults || 250,
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
    message: `Found ${events.length} events matching "${input.q}"`,
    query: input.q,
    count: events.length,
    events: formattedEvents,
  }, null, 2);
}