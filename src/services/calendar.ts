import { google, calendar_v3 } from 'googleapis';
import { AuthService } from './auth.js';
import { ConfigManager } from './config.js';
import {
  CalendarEvent,
  CreateEventInput,
  UpdateEventInput,
  ListEventsInput,
  SearchEventsInput,
  DeleteEventInput,
  EventDateTime
} from '../types/calendar.js';
import { handleGoogleApiError } from '../utils/error.js';

export class CalendarService {
  private calendar: calendar_v3.Calendar;
  private authService: AuthService;
  private configManager: ConfigManager;

  constructor(authService: AuthService, configManager: ConfigManager) {
    this.authService = authService;
    this.configManager = configManager;
    this.calendar = google.calendar({ version: 'v3', auth: authService.getAuthClient() });
  }

  async createEvent(input: CreateEventInput): Promise<CalendarEvent> {
    try {
      await this.authService.ensureAuthenticated();

      const event: calendar_v3.Schema$Event = {
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
        sendUpdates: 'all', // Send notifications to attendees
      });

      return this.convertToCalendarEvent(response.data);
    } catch (error) {
      throw handleGoogleApiError(error);
    }
  }

  async updateEvent(input: UpdateEventInput): Promise<CalendarEvent> {
    try {
      await this.authService.ensureAuthenticated();

      // 首先获取现有事件的完整信息
      const existingEvent = await this.calendar.events.get({
        calendarId: this.configManager.getDefaultCalendarId(),
        eventId: input.eventId,
      });

      const updateData: calendar_v3.Schema$Event = {
        // 保留现有的必要字段
        summary: existingEvent.data.summary,
        start: existingEvent.data.start,
        end: existingEvent.data.end,
        // 其他现有字段
        description: existingEvent.data.description,
        location: existingEvent.data.location,
        status: existingEvent.data.status,
        visibility: existingEvent.data.visibility,
        transparency: existingEvent.data.transparency,
        recurrence: existingEvent.data.recurrence,
        attendees: existingEvent.data.attendees,
      };

      // 应用更新
      if (input.summary !== undefined) updateData.summary = input.summary;
      if (input.description !== undefined) updateData.description = input.description;
      if (input.location !== undefined) updateData.location = input.location;
      if (input.start !== undefined) updateData.start = this.convertEventDateTime(input.start);
      if (input.end !== undefined) updateData.end = this.convertEventDateTime(input.end);
      if (input.status !== undefined) updateData.status = input.status;
      if (input.visibility !== undefined) updateData.visibility = input.visibility;
      if (input.transparency !== undefined) updateData.transparency = input.transparency;
      if (input.recurrence !== undefined) updateData.recurrence = input.recurrence;

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
    } catch (error) {
      throw handleGoogleApiError(error);
    }
  }

  async deleteEvent(input: DeleteEventInput): Promise<void> {
    try {
      await this.authService.ensureAuthenticated();

      await this.calendar.events.delete({
        calendarId: this.configManager.getDefaultCalendarId(),
        eventId: input.eventId,
        sendUpdates: 'all',
      });
    } catch (error) {
      throw handleGoogleApiError(error);
    }
  }

  async listEvents(input: ListEventsInput = { maxResults: 250, orderBy: 'startTime', singleEvents: true, showDeleted: false }): Promise<CalendarEvent[]> {
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
    } catch (error) {
      throw handleGoogleApiError(error);
    }
  }

  async searchEvents(input: SearchEventsInput): Promise<CalendarEvent[]> {
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
    } catch (error) {
      throw handleGoogleApiError(error);
    }
  }

  async getEvent(eventId: string): Promise<CalendarEvent> {
    try {
      await this.authService.ensureAuthenticated();

      const response = await this.calendar.events.get({
        calendarId: this.configManager.getDefaultCalendarId(),
        eventId: eventId,
      });

      return this.convertToCalendarEvent(response.data);
    } catch (error) {
      throw handleGoogleApiError(error);
    }
  }

  private convertEventDateTime(eventDateTime: EventDateTime): calendar_v3.Schema$EventDateTime {
    const result: calendar_v3.Schema$EventDateTime = {};

    if (eventDateTime.dateTime) {
      result.dateTime = eventDateTime.dateTime;
      result.timeZone = eventDateTime.timeZone || this.configManager.getDefaultTimeZone();
    } else if (eventDateTime.date) {
      result.date = eventDateTime.date;
    }

    return result;
  }

  private convertToCalendarEvent(googleEvent: calendar_v3.Schema$Event): CalendarEvent {
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
        responseStatus: attendee.responseStatus as any,
      })),
      recurrence: googleEvent.recurrence || undefined,
      status: googleEvent.status as any,
      visibility: googleEvent.visibility as any,
      transparency: googleEvent.transparency as any,
    };
  }
}