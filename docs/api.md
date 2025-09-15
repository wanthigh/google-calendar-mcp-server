# API Reference

This document provides detailed information about all available tools in the Google Calendar MCP Server.

## Tools Overview

The server provides 5 main tools for calendar management:

1. `create_event` - Create new calendar events
2. `update_event` - Update existing events
3. `delete_event` - Delete events
4. `list_events` - List events in date ranges
5. `search_events` - Search events by keywords

## Tool Specifications

### create_event

Creates a new calendar event with specified details.

**Input Schema:**
```json
{
  "type": "object",
  "properties": {
    "summary": {
      "type": "string",
      "description": "Event title/summary (required)"
    },
    "description": {
      "type": "string",
      "description": "Event description (optional)"
    },
    "location": {
      "type": "string",
      "description": "Event location (optional)"
    },
    "start": {
      "type": "object",
      "description": "Event start time",
      "properties": {
        "dateTime": {
          "type": "string",
          "format": "date-time",
          "description": "Start date-time in ISO format (e.g., 2023-12-25T10:00:00Z)"
        },
        "date": {
          "type": "string",
          "format": "date",
          "description": "Start date for all-day events (e.g., 2023-12-25)"
        },
        "timeZone": {
          "type": "string",
          "description": "Time zone (e.g., America/New_York)"
        }
      }
    },
    "end": {
      "type": "object",
      "description": "Event end time",
      "properties": {
        "dateTime": {
          "type": "string",
          "format": "date-time",
          "description": "End date-time in ISO format (e.g., 2023-12-25T11:00:00Z)"
        },
        "date": {
          "type": "string",
          "format": "date",
          "description": "End date for all-day events (e.g., 2023-12-25)"
        },
        "timeZone": {
          "type": "string",
          "description": "Time zone (e.g., America/New_York)"
        }
      }
    },
    "attendees": {
      "type": "array",
      "description": "List of event attendees (optional)",
      "items": {
        "type": "object",
        "properties": {
          "email": {
            "type": "string",
            "format": "email",
            "description": "Attendee email address"
          },
          "displayName": {
            "type": "string",
            "description": "Attendee display name"
          },
          "optional": {
            "type": "boolean",
            "description": "Whether attendance is optional"
          }
        },
        "required": ["email"]
      }
    },
    "recurrence": {
      "type": "array",
      "description": "Recurrence rules (optional)",
      "items": {
        "type": "string",
        "description": "RRULE strings (e.g., RRULE:FREQ=WEEKLY;BYDAY=MO,WE,FR)"
      }
    },
    "status": {
      "type": "string",
      "enum": ["confirmed", "tentative", "cancelled"],
      "description": "Event status"
    },
    "visibility": {
      "type": "string",
      "enum": ["default", "public", "private", "confidential"],
      "description": "Event visibility"
    },
    "transparency": {
      "type": "string",
      "enum": ["opaque", "transparent"],
      "description": "Event transparency (shows as busy or free)"
    }
  },
  "required": ["summary", "start", "end"]
}
```

**Example Usage:**
```json
{
  "summary": "Team Meeting",
  "description": "Weekly team sync meeting",
  "location": "Conference Room A",
  "start": {
    "dateTime": "2023-12-25T10:00:00Z",
    "timeZone": "America/New_York"
  },
  "end": {
    "dateTime": "2023-12-25T11:00:00Z",
    "timeZone": "America/New_York"
  },
  "attendees": [
    {
      "email": "colleague@example.com",
      "displayName": "John Doe"
    }
  ],
  "status": "confirmed"
}
```

**Response Format:**
```json
{
  "success": true,
  "message": "Event created successfully",
  "event": {
    "id": "event_id_123",
    "summary": "Team Meeting",
    "start": { "dateTime": "2023-12-25T10:00:00Z" },
    "end": { "dateTime": "2023-12-25T11:00:00Z" },
    "location": "Conference Room A",
    "attendees": [...],
    "status": "confirmed"
  }
}
```

### update_event

Updates an existing calendar event.

**Input Schema:**
```json
{
  "type": "object",
  "properties": {
    "eventId": {
      "type": "string",
      "description": "ID of the event to update (required)"
    }
    // ... all other properties from create_event are optional
  },
  "required": ["eventId"]
}
```

**Example Usage:**
```json
{
  "eventId": "event_id_123",
  "summary": "Updated Team Meeting",
  "location": "Conference Room B"
}
```

### delete_event

Deletes a calendar event.

**Input Schema:**
```json
{
  "type": "object",
  "properties": {
    "eventId": {
      "type": "string",
      "description": "ID of the event to delete (required)"
    }
  },
  "required": ["eventId"]
}
```

**Example Usage:**
```json
{
  "eventId": "event_id_123"
}
```

**Response Format:**
```json
{
  "success": true,
  "message": "Event event_id_123 deleted successfully",
  "eventId": "event_id_123"
}
```

### list_events

Lists calendar events within a specified time range.

**Input Schema:**
```json
{
  "type": "object",
  "properties": {
    "timeMin": {
      "type": "string",
      "format": "date-time",
      "description": "Lower bound for event start time (ISO format)"
    },
    "timeMax": {
      "type": "string",
      "format": "date-time",
      "description": "Upper bound for event start time (ISO format)"
    },
    "maxResults": {
      "type": "number",
      "minimum": 1,
      "maximum": 2500,
      "default": 250,
      "description": "Maximum number of events to return"
    },
    "orderBy": {
      "type": "string",
      "enum": ["startTime", "updated"],
      "default": "startTime",
      "description": "Order events by start time or last updated time"
    },
    "singleEvents": {
      "type": "boolean",
      "default": true,
      "description": "Whether to expand recurring events into instances"
    },
    "showDeleted": {
      "type": "boolean",
      "default": false,
      "description": "Whether to include deleted events"
    }
  }
}
```

**Example Usage:**
```json
{
  "timeMin": "2023-12-01T00:00:00Z",
  "timeMax": "2023-12-31T23:59:59Z",
  "maxResults": 100,
  "orderBy": "startTime"
}
```

**Response Format:**
```json
{
  "success": true,
  "message": "Found 5 events",
  "count": 5,
  "events": [
    {
      "id": "event_id_123",
      "summary": "Team Meeting",
      "start": { "dateTime": "2023-12-25T10:00:00Z" },
      "end": { "dateTime": "2023-12-25T11:00:00Z" },
      "location": "Conference Room A",
      "status": "confirmed"
    }
    // ... more events
  ]
}
```

### search_events

Searches for calendar events by keyword.

**Input Schema:**
```json
{
  "type": "object",
  "properties": {
    "q": {
      "type": "string",
      "description": "Search query (required) - searches in title, description, location, and attendee names"
    },
    "timeMin": {
      "type": "string",
      "format": "date-time",
      "description": "Lower bound for event start time (ISO format)"
    },
    "timeMax": {
      "type": "string",
      "format": "date-time",
      "description": "Upper bound for event start time (ISO format)"
    },
    "maxResults": {
      "type": "number",
      "minimum": 1,
      "maximum": 2500,
      "default": 250,
      "description": "Maximum number of events to return"
    }
  },
  "required": ["q"]
}
```

**Example Usage:**
```json
{
  "q": "team meeting",
  "timeMin": "2023-12-01T00:00:00Z",
  "maxResults": 50
}
```

**Response Format:**
```json
{
  "success": true,
  "message": "Found 3 events matching \"team meeting\"",
  "query": "team meeting",
  "count": 3,
  "events": [
    // ... matching events
  ]
}
```

## Error Handling

All tools return errors in a consistent format:

```json
{
  "success": false,
  "error": "Error message describing what went wrong",
  "tool": "name_of_tool_that_failed"
}
```

### Common Error Types

- **Authentication errors**: Invalid or expired credentials
- **Permission errors**: Insufficient calendar permissions
- **Validation errors**: Invalid input parameters
- **Not found errors**: Event or calendar doesn't exist
- **Rate limit errors**: Google API quota exceeded

## Date and Time Formats

### DateTime Format
Use ISO 8601 format: `YYYY-MM-DDTHH:MM:SSZ`

Examples:
- `2023-12-25T10:00:00Z` (UTC)
- `2023-12-25T10:00:00-05:00` (EST)

### Date Format (All-day events)
Use ISO date format: `YYYY-MM-DD`

Example:
- `2023-12-25`

### Time Zones
Use IANA time zone identifiers:
- `America/New_York`
- `Europe/London`
- `Asia/Tokyo`
- `UTC`

## Recurrence Rules

Use RRULE format for recurring events:

Examples:
- `RRULE:FREQ=DAILY` - Daily
- `RRULE:FREQ=WEEKLY;BYDAY=MO,WE,FR` - Monday, Wednesday, Friday
- `RRULE:FREQ=MONTHLY;BYMONTHDAY=15` - 15th of every month
- `RRULE:FREQ=YEARLY;BYMONTH=12;BYMONTHDAY=25` - Annual (Christmas)

## Best Practices

1. **Always specify time zones** for timed events
2. **Use appropriate event status** (confirmed, tentative, cancelled)
3. **Include meaningful descriptions** for better searchability
4. **Handle errors gracefully** and check response status
5. **Respect rate limits** - don't make too many requests rapidly
6. **Use batch operations** when possible for multiple events