import { AuthService } from './auth.js';
import { ConfigManager } from './config.js';
import { CalendarEvent, CreateEventInput, UpdateEventInput, ListEventsInput, SearchEventsInput, DeleteEventInput } from '../types/calendar.js';
export declare class CalendarService {
    private calendar;
    private authService;
    private configManager;
    constructor(authService: AuthService, configManager: ConfigManager);
    createEvent(input: CreateEventInput): Promise<CalendarEvent>;
    updateEvent(input: UpdateEventInput): Promise<CalendarEvent>;
    deleteEvent(input: DeleteEventInput): Promise<void>;
    listEvents(input?: ListEventsInput): Promise<CalendarEvent[]>;
    searchEvents(input: SearchEventsInput): Promise<CalendarEvent[]>;
    getEvent(eventId: string): Promise<CalendarEvent>;
    private convertEventDateTime;
    private convertToCalendarEvent;
}
//# sourceMappingURL=calendar.d.ts.map