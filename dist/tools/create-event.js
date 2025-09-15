import { CreateEventSchema } from '../types/calendar.js';
import { validateInput } from '../utils/validation.js';
export const createEventTool = {
    name: 'create_event',
    description: 'Create a new calendar event with specified details',
    inputSchema: {
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
                        description: 'Start date-time in ISO format (e.g., 2023-12-25T10:00:00Z)',
                    },
                    date: {
                        type: 'string',
                        format: 'date',
                        description: 'Start date for all-day events (e.g., 2023-12-25)',
                    },
                    timeZone: {
                        type: 'string',
                        description: 'Time zone (e.g., America/New_York)',
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
                        description: 'End date-time in ISO format (e.g., 2023-12-25T11:00:00Z)',
                    },
                    date: {
                        type: 'string',
                        format: 'date',
                        description: 'End date for all-day events (e.g., 2023-12-25)',
                    },
                    timeZone: {
                        type: 'string',
                        description: 'Time zone (e.g., America/New_York)',
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
                    description: 'RRULE strings (e.g., RRULE:FREQ=WEEKLY;BYDAY=MO,WE,FR)',
                },
            },
            status: {
                type: 'string',
                enum: ['confirmed', 'tentative', 'cancelled'],
                description: 'Event status',
            },
            visibility: {
                type: 'string',
                enum: ['default', 'public', 'private', 'confidential'],
                description: 'Event visibility',
            },
            transparency: {
                type: 'string',
                enum: ['opaque', 'transparent'],
                description: 'Event transparency (shows as busy or free)',
            },
        },
        required: ['summary', 'start', 'end'],
    },
};
export async function handleCreateEvent(args, calendarService) {
    const input = validateInput(CreateEventSchema, args);
    const event = await calendarService.createEvent(input);
    return JSON.stringify({
        success: true,
        message: 'Event created successfully',
        event: {
            id: event.id,
            summary: event.summary,
            start: event.start,
            end: event.end,
            location: event.location,
            attendees: event.attendees,
            status: event.status,
        },
    }, null, 2);
}
//# sourceMappingURL=create-event.js.map