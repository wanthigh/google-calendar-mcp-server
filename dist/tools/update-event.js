import { UpdateEventSchema } from '../types/calendar.js';
import { validateInput } from '../utils/validation.js';
export const updateEventTool = {
    name: 'update_event',
    description: 'Update an existing calendar event',
    inputSchema: {
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
            attendees: {
                type: 'array',
                description: 'List of event attendees',
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
                        responseStatus: {
                            type: 'string',
                            enum: ['needsAction', 'declined', 'tentative', 'accepted'],
                            description: 'Attendee response status',
                        },
                    },
                    required: ['email'],
                },
            },
            recurrence: {
                type: 'array',
                description: 'Recurrence rules',
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
            visibility: {
                type: 'string',
                enum: ['default', 'public', 'private', 'confidential'],
                description: 'Event visibility',
            },
            transparency: {
                type: 'string',
                enum: ['opaque', 'transparent'],
                description: 'Event transparency',
            },
        },
        required: ['eventId'],
    },
};
export async function handleUpdateEvent(args, calendarService) {
    const input = validateInput(UpdateEventSchema, args);
    const event = await calendarService.updateEvent(input);
    return JSON.stringify({
        success: true,
        message: 'Event updated successfully',
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
//# sourceMappingURL=update-event.js.map