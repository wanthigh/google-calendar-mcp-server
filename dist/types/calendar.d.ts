import { z } from 'zod';
export declare const EventDateTimeSchema: z.ZodObject<{
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
export declare const AttendeeSchema: z.ZodObject<{
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
}>;
export declare const EventSchema: z.ZodObject<{
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
}, "strip", z.ZodTypeAny, {
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
    id?: string | undefined;
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
    id?: string | undefined;
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
}>;
export declare const CreateEventSchema: z.ZodObject<Omit<{
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
}>;
export declare const UpdateEventSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    summary: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    location: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    start: z.ZodOptional<z.ZodObject<{
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
    }>>;
    end: z.ZodOptional<z.ZodObject<{
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
    }>>;
    attendees: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodObject<{
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
    }>, "many">>>;
    recurrence: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
    status: z.ZodOptional<z.ZodOptional<z.ZodEnum<["confirmed", "tentative", "cancelled"]>>>;
    visibility: z.ZodOptional<z.ZodOptional<z.ZodEnum<["default", "public", "private", "confidential"]>>>;
    transparency: z.ZodOptional<z.ZodOptional<z.ZodEnum<["opaque", "transparent"]>>>;
} & {
    eventId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    eventId: string;
    status?: "tentative" | "confirmed" | "cancelled" | undefined;
    id?: string | undefined;
    summary?: string | undefined;
    description?: string | undefined;
    location?: string | undefined;
    start?: {
        date?: string | undefined;
        dateTime?: string | undefined;
        timeZone?: string | undefined;
    } | undefined;
    end?: {
        date?: string | undefined;
        dateTime?: string | undefined;
        timeZone?: string | undefined;
    } | undefined;
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
    eventId: string;
    status?: "tentative" | "confirmed" | "cancelled" | undefined;
    id?: string | undefined;
    summary?: string | undefined;
    description?: string | undefined;
    location?: string | undefined;
    start?: {
        date?: string | undefined;
        dateTime?: string | undefined;
        timeZone?: string | undefined;
    } | undefined;
    end?: {
        date?: string | undefined;
        dateTime?: string | undefined;
        timeZone?: string | undefined;
    } | undefined;
    attendees?: {
        email: string;
        displayName?: string | undefined;
        optional?: boolean | undefined;
        responseStatus?: "needsAction" | "declined" | "tentative" | "accepted" | undefined;
    }[] | undefined;
    recurrence?: string[] | undefined;
    visibility?: "default" | "public" | "private" | "confidential" | undefined;
    transparency?: "opaque" | "transparent" | undefined;
}>;
export type EventDateTime = z.infer<typeof EventDateTimeSchema>;
export type Attendee = z.infer<typeof AttendeeSchema>;
export type CalendarEvent = z.infer<typeof EventSchema>;
export type CreateEventInput = z.infer<typeof CreateEventSchema>;
export type UpdateEventInput = z.infer<typeof UpdateEventSchema>;
export declare const ListEventsSchema: z.ZodObject<{
    timeMin: z.ZodOptional<z.ZodString>;
    timeMax: z.ZodOptional<z.ZodString>;
    maxResults: z.ZodDefault<z.ZodNumber>;
    orderBy: z.ZodDefault<z.ZodEnum<["startTime", "updated"]>>;
    singleEvents: z.ZodDefault<z.ZodBoolean>;
    showDeleted: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    maxResults: number;
    orderBy: "startTime" | "updated";
    singleEvents: boolean;
    showDeleted: boolean;
    timeMin?: string | undefined;
    timeMax?: string | undefined;
}, {
    timeMin?: string | undefined;
    timeMax?: string | undefined;
    maxResults?: number | undefined;
    orderBy?: "startTime" | "updated" | undefined;
    singleEvents?: boolean | undefined;
    showDeleted?: boolean | undefined;
}>;
export type ListEventsInput = z.infer<typeof ListEventsSchema>;
export declare const SearchEventsSchema: z.ZodObject<{
    q: z.ZodString;
    timeMin: z.ZodOptional<z.ZodString>;
    timeMax: z.ZodOptional<z.ZodString>;
    maxResults: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    maxResults: number;
    q: string;
    timeMin?: string | undefined;
    timeMax?: string | undefined;
}, {
    q: string;
    timeMin?: string | undefined;
    timeMax?: string | undefined;
    maxResults?: number | undefined;
}>;
export type SearchEventsInput = z.infer<typeof SearchEventsSchema>;
export declare const DeleteEventSchema: z.ZodObject<{
    eventId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    eventId: string;
}, {
    eventId: string;
}>;
export type DeleteEventInput = z.infer<typeof DeleteEventSchema>;
//# sourceMappingURL=calendar.d.ts.map