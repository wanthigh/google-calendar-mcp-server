export function formatDateTime(date, timeZone) {
    if (timeZone) {
        return new Date(date.toLocaleString('en-US', { timeZone })).toISOString();
    }
    return date.toISOString();
}
export function parseDateTime(dateTime) {
    return new Date(dateTime);
}
export function formatDateOnly(date) {
    return date.toISOString().split('T')[0];
}
export function isAllDayEvent(start, end) {
    return Boolean(start.date && end.date);
}
export function getDefaultTimeZone() {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
}
export function addMinutes(date, minutes) {
    return new Date(date.getTime() + minutes * 60000);
}
export function addHours(date, hours) {
    return addMinutes(date, hours * 60);
}
export function addDays(date, days) {
    const result = new Date(date);
    result.setDate(date.getDate() + days);
    return result;
}
export function getStartOfDay(date) {
    const result = new Date(date);
    result.setHours(0, 0, 0, 0);
    return result;
}
export function getEndOfDay(date) {
    const result = new Date(date);
    result.setHours(23, 59, 59, 999);
    return result;
}
//# sourceMappingURL=date.js.map