export function isEventPast(eventDate: string, todayStr: string): boolean {
    return eventDate < todayStr
}

export interface VisibilityCandidate {
    date: string
    // Occurrences of the same recurring event share a series id
    series?: string
}

// The site is static, so recurring events are rendered as several upcoming
// occurrences at build time. In the browser we show only the first one that
// isn't past, so the listing stays correct between deploys.
export function visibleEvents(
    events: VisibilityCandidate[],
    todayStr: string,
): boolean[] {
    const shownSeries = new Set<string>()
    return events.map(({ date, series }) => {
        if (isEventPast(date, todayStr)) return false
        if (series === undefined) return true
        if (shownSeries.has(series)) return false
        shownSeries.add(series)
        return true
    })
}
