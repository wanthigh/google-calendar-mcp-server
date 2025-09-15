import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { CalendarService } from '../services/calendar.js';
import { DeleteEventSchema } from '../types/calendar.js';
import { validateInput } from '../utils/validation.js';

export const deleteEventTool: Tool = {
  name: 'delete_event',
  description: 'Delete a calendar event',
  inputSchema: {
    type: 'object',
    properties: {
      eventId: {
        type: 'string',
        description: 'ID of the event to delete (required)',
      },
    },
    required: ['eventId'],
  },
};

export async function handleDeleteEvent(
  args: unknown,
  calendarService: CalendarService
): Promise<string> {
  const input = validateInput(DeleteEventSchema, args);

  await calendarService.deleteEvent(input);

  return JSON.stringify({
    success: true,
    message: `Event ${input.eventId} deleted successfully`,
    eventId: input.eventId,
  }, null, 2);
}