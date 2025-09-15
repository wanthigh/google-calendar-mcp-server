export function formatDateTime(date: Date, timeZone?: string): string {
  if (timeZone) {
    return new Date(date.toLocaleString('en-US', { timeZone })).toISOString();
  }
  return date.toISOString();
}

export function parseDateTime(dateTime: string): Date {
  return new Date(dateTime);
}

export function formatDateOnly(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function isAllDayEvent(start: any, end: any): boolean {
  return Boolean(start.date && end.date);
}

export function getDefaultTimeZone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

export function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60000);
}

export function addHours(date: Date, hours: number): Date {
  return addMinutes(date, hours * 60);
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(date.getDate() + days);
  return result;
}

export function getStartOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

export function getEndOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
}