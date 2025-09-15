import { google } from 'googleapis';
import { handleGoogleApiError } from '../utils/error.js';
export class CalendarService {
    constructor(authService, configManager) {
        this.authService = authService;
        this.configManager = configManager;
        this.calendar = google.calendar({ version: 'v3', auth: authService.getAuthClient() });
    }
    async createEvent(input) {
        try {
            await this.authService.ensureAuthenticated();
            const event = {
                summary: input.summary,
                description: input.description,
                location: input.location,
                start: this.convertEventDateTime(input.start),
                end: this.convertEventDateTime(input.end),
                attendees: input.attendees?.map(attendee => ({
                    email: attendee.email,
                    displayName: attendee.displayName,
                    optional: attendee.optional,
                    responseStatus: attendee.responseStatus,
                })),
                recurrence: input.recurrence,
                status: input.status,
                visibility: input.visibility,
                transparency: input.transparency,
            };
            const response = await this.calendar.events.insert({
                calendarId: this.configManager.getDefaultCalendarId(),
                requestBody: event,
                sendUpdates: 'all',
            });
            return this.convertToCalendarEvent(response.data);
        }
        catch (error) {
            throw handleGoogleApiError(error);
        }
    }
    async updateEvent(input) {
        try {
            await this.authService.ensureAuthenticated();
            const existingEvent = await this.calendar.events.get({
                calendarId: this.configManager.getDefaultCalendarId(),
                eventId: input.eventId,
            });
            const updateData = {
                summary: existingEvent.data.summary,
                start: existingEvent.data.start,
                end: existingEvent.data.end,
                description: existingEvent.data.description,
                location: existingEvent.data.location,
                status: existingEvent.data.status,
                visibility: existingEvent.data.visibility,
                transparency: existingEvent.data.transparency,
                recurrence: existingEvent.data.recurrence,
                attendees: existingEvent.data.attendees,
            };
            if (input.summary !== undefined)
                updateData.summary = input.summary;
            if (input.description !== undefined)
                updateData.description = input.description;
            if (input.location !== undefined)
                updateData.location = input.location;
            if (input.start !== undefined)
                updateData.start = this.convertEventDateTime(input.start);
            if (input.end !== undefined)
                updateData.end = this.convertEventDateTime(input.end);
            if (input.status !== undefined)
                updateData.status = input.status;
            if (input.visibility !== undefined)
                updateData.visibility = input.visibility;
            if (input.transparency !== undefined)
                updateData.transparency = input.transparency;
            if (input.recurrence !== undefined)
                updateData.recurrence = input.recurrence;
            if (input.attendees !== undefined) {
                updateData.attendees = input.attendees.map(attendee => ({
                    email: attendee.email,
                    displayName: attendee.displayName,
                    optional: attendee.optional,
                    responseStatus: attendee.responseStatus,
                }));
            }
            const response = await this.calendar.events.update({
                calendarId: this.configManager.getDefaultCalendarId(),
                eventId: input.eventId,
                requestBody: updateData,
                sendUpdates: 'all',
            });
            return this.convertToCalendarEvent(response.data);
        }
        catch (error) {
            throw handleGoogleApiError(error);
        }
    }
    async deleteEvent(input) {
        try {
            await this.authService.ensureAuthenticated();
            await this.calendar.events.delete({
                calendarId: this.configManager.getDefaultCalendarId(),
                eventId: input.eventId,
                sendUpdates: 'all',
            });
        }
        catch (error) {
            throw handleGoogleApiError(error);
        }
    }
    async listEvents(input = { maxResults: 250, orderBy: 'startTime', singleEvents: true, showDeleted: false }) {
        try {
            await this.authService.ensureAuthenticated();
            const response = await this.calendar.events.list({
                calendarId: this.configManager.getDefaultCalendarId(),
                timeMin: input.timeMin,
                timeMax: input.timeMax,
                maxResults: input.maxResults,
                singleEvents: input.singleEvents,
                orderBy: input.orderBy,
                showDeleted: input.showDeleted,
            });
            return (response.data.items || []).map(event => this.convertToCalendarEvent(event));
        }
        catch (error) {
            throw handleGoogleApiError(error);
        }
    }
    async searchEvents(input) {
        try {
            await this.authService.ensureAuthenticated();
            const response = await this.calendar.events.list({
                calendarId: this.configManager.getDefaultCalendarId(),
                q: input.q,
                timeMin: input.timeMin,
                timeMax: input.timeMax,
                maxResults: input.maxResults,
                singleEvents: true,
                orderBy: 'startTime',
            });
            return (response.data.items || []).map(event => this.convertToCalendarEvent(event));
        }
        catch (error) {
            throw handleGoogleApiError(error);
        }
    }
    async getEvent(eventId) {
        try {
            await this.authService.ensureAuthenticated();
            const response = await this.calendar.events.get({
                calendarId: this.configManager.getDefaultCalendarId(),
                eventId: eventId,
            });
            return this.convertToCalendarEvent(response.data);
        }
        catch (error) {
            throw handleGoogleApiError(error);
        }
    }
    convertEventDateTime(eventDateTime) {
        const result = {};
        if (eventDateTime.dateTime) {
            result.dateTime = eventDateTime.dateTime;
            result.timeZone = eventDateTime.timeZone || this.configManager.getDefaultTimeZone();
        }
        else if (eventDateTime.date) {
            result.date = eventDateTime.date;
        }
        return result;
    }
    convertToCalendarEvent(googleEvent) {
        return {
            id: googleEvent.id || undefined,
            summary: googleEvent.summary || '',
            description: googleEvent.description || undefined,
            location: googleEvent.location || undefined,
            start: {
                dateTime: googleEvent.start?.dateTime || undefined,
                date: googleEvent.start?.date || undefined,
                timeZone: googleEvent.start?.timeZone || undefined,
            },
            end: {
                dateTime: googleEvent.end?.dateTime || undefined,
                date: googleEvent.end?.date || undefined,
                timeZone: googleEvent.end?.timeZone || undefined,
            },
            attendees: googleEvent.attendees?.map(attendee => ({
                email: attendee.email || '',
                displayName: attendee.displayName || undefined,
                optional: attendee.optional || undefined,
                responseStatus: attendee.responseStatus,
            })),
            recurrence: googleEvent.recurrence || undefined,
            status: googleEvent.status,
            visibility: googleEvent.visibility,
            transparency: googleEvent.transparency,
        };
    }
}
//# sourceMappingURL=calendar.js.map