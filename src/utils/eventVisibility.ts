export function isEventPast(eventDate: string, todayStr: string): boolean {
    return eventDate < todayStr
}
