import { z } from 'zod';
export const EventDateTimeSchema = z.object({
    dateTime: z.string().optional(),
    date: z.string().optional(),
    timeZone: z.string().optional(),
});
export const AttendeeSchema = z.object({
    email: z.string().email(),
    displayName: z.string().optional(),
    optional: z.boolean().optional(),
    responseStatus: z.enum(['needsAction', 'declined', 'tentative', 'accepted']).optional(),
});
export const EventSchema = z.object({
    id: z.string().optional(),
    summary: z.string(),
    description: z.string().optional(),
    location: z.string().optional(),
    start: EventDateTimeSchema,
    end: EventDateTimeSchema,
    attendees: z.array(AttendeeSchema).optional(),
    recurrence: z.array(z.string()).optional(),
    status: z.enum(['confirmed', 'tentative', 'cancelled']).optional(),
    visibility: z.enum(['default', 'public', 'private', 'confidential']).optional(),
    transparency: z.enum(['opaque', 'transparent']).optional(),
});
export const CreateEventSchema = EventSchema.omit({ id: true });
export const UpdateEventSchema = EventSchema.partial().extend({
    eventId: z.string(),
});
export const ListEventsSchema = z.object({
    timeMin: z.string().optional(),
    timeMax: z.string().optional(),
    maxResults: z.number().min(1).max(2500).default(250),
    orderBy: z.enum(['startTime', 'updated']).default('startTime'),
    singleEvents: z.boolean().default(true),
    showDeleted: z.boolean().default(false),
});
export const SearchEventsSchema = z.object({
    q: z.string(),
    timeMin: z.string().optional(),
    timeMax: z.string().optional(),
    maxResults: z.number().min(1).max(2500).default(250),
});
export const DeleteEventSchema = z.object({
    eventId: z.string(),
});
//# sourceMappingURL=calendar.js.map