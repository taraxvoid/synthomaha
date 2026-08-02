import { expect, test } from '@playwright/test'

test('home page loads with correct title', async ({ page }) => {
    const response = await page.goto('/')
    expect(response.status()).toBe(200)
    await expect(page).toHaveTitle(/SynthOmaha/i)
})

test('no console errors on home page', async ({ page }) => {
    const errors = []
    page.on('console', (msg) => {
        if (msg.type() === 'error') errors.push(msg.text())
    })
    await page.goto('/')
    expect(errors).toHaveLength(0)
})

test('nav links point to expected sections and those sections exist', async ({
    page,
}) => {
    await page.goto('/')
    const nav = page.locator('nav')
    await expect(nav.getByRole('link', { name: /Events/i })).toHaveAttribute(
        'href',
        '#events',
    )
    await expect(nav.getByRole('link', { name: /Join Us/i })).toHaveAttribute(
        'href',
        '#signup',
    )
    await expect(nav.getByRole('link', { name: /Musicians/i })).toHaveAttribute(
        'href',
        '#musicians',
    )
    await expect(nav.getByRole('link', { name: /Booking/i })).toHaveAttribute(
        'href',
        '#contact',
    )

    await expect(page.locator('section#events')).toBeAttached()
    await expect(page.locator('section#signup')).toBeAttached()
    await expect(page.locator('#musicians')).toBeAttached()
    await expect(page.locator('#contact')).toBeAttached()
})

test('musician cards render', async ({ page }) => {
    await page.goto('/')
    const cards = page.locator('#musicians wa-card')
    expect(await cards.count()).toBeGreaterThan(0)
})

test('musician social links have rel=noopener noreferrer', async ({ page }) => {
    await page.goto('/')
    const links = page.locator('#musicians a[href^="http"]')
    const count = await links.count()
    expect(count).toBeGreaterThan(0)
    for (let i = 0; i < count; i++) {
        const rel = await links.nth(i).getAttribute('rel')
        expect(rel).toContain('noopener')
        expect(rel).toContain('noreferrer')
    }
})

test('event cards render with calendar download links', async ({ page }) => {
    await page.clock.setFixedTime(new Date('2026-01-01T12:00:00'))
    await page.goto('/')
    const cards = page.locator('#events wa-card[data-event-date]')
    expect(await cards.count()).toBeGreaterThan(0)
    const addToCalendar = cards
        .first()
        .getByRole('link', { name: /Add To Calendar/i })
    await expect(addToCalendar).toHaveAttribute('href', /\/events\/.+\.ics$/)
})

test('recurring event shows its next two upcoming occurrences', async ({
    page,
}) => {
    await page.clock.setFixedTime(new Date('2026-01-01T12:00:00'))
    await page.goto('/')
    const dates = await page
        .locator('#events wa-card[data-event-date]')
        .evaluateAll((cards) =>
            cards.map((c) => c.getAttribute('data-event-date')),
        )
    expect(new Set(dates).size).toBe(dates.length)
    expect(dates.length).toBeGreaterThanOrEqual(2)
})

test('event cards lay out in two columns on wide viewports', async ({
    page,
}) => {
    await page.clock.setFixedTime(new Date('2026-01-01T12:00:00'))
    await page.setViewportSize({ width: 1280, height: 900 })
    await page.goto('/')
    const cards = page.locator('#events wa-card[data-event-date]:not([hidden])')
    const count = await cards.count()
    expect(count).toBeGreaterThanOrEqual(2)
    const firstBox = await cards.nth(0).boundingBox()
    const secondBox = await cards.nth(1).boundingBox()
    // Two cards side by side share the same row (similar y) rather than stacking.
    expect(Math.abs(firstBox.y - secondBox.y)).toBeLessThan(4)
    expect(secondBox.x).toBeGreaterThan(firstBox.x)
})

// ---------------------------------------------------------------------------
// Event visibility (clock-driven)
// ---------------------------------------------------------------------------

test('past events are hidden, future events visible', async ({ page }) => {
    await page.clock.setFixedTime(new Date('2026-07-01T12:00:00'))
    await page.goto('/')
    await expect(
        page.locator('wa-card[data-event-date="2026-06-29"]'),
    ).toHaveAttribute('hidden', '')
})

test('shows no-events message when all events are in the past', async ({
    page,
}) => {
    await page.clock.setFixedTime(new Date('2030-01-01T12:00:00'))
    await page.goto('/')
    const cards = page.locator('#events wa-card[data-event-date]')
    const count = await cards.count()
    for (let i = 0; i < count; i++) {
        await expect(cards.nth(i)).toHaveAttribute('hidden', '')
    }
    await expect(page.locator('#no-events-message')).not.toHaveAttribute(
        'hidden',
        '',
    )
})

test('shows all events when all are in the future', async ({ page }) => {
    await page.clock.setFixedTime(new Date('2020-01-01T12:00:00'))
    await page.goto('/')
    const cards = page.locator('#events wa-card[data-event-date]')
    const count = await cards.count()
    for (let i = 0; i < count; i++) {
        await expect(cards.nth(i)).not.toHaveAttribute('hidden', '')
    }
    await expect(page.locator('#no-events-message')).toHaveAttribute(
        'hidden',
        '',
    )
})

// ---------------------------------------------------------------------------
// Static feeds
// ---------------------------------------------------------------------------

test('events.ics returns a valid calendar', async ({ request }) => {
    const response = await request.get('/events.ics')
    expect(response.ok()).toBeTruthy()
    expect(response.headers()['content-type']).toContain('text/calendar')
    const body = await response.text()
    expect(body).toContain('BEGIN:VCALENDAR')
    expect(body).toContain('END:VCALENDAR')
})

// ---------------------------------------------------------------------------
// Mobile rendering — 375px viewport
// ---------------------------------------------------------------------------

test('no horizontal scroll on home page at 375px', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto('/')
    const overflow = await page.evaluate(
        () => document.scrollingElement.scrollWidth > window.innerWidth,
    )
    expect(overflow).toBe(false)
})

test('musician cards stack vertically at 375px (image above text)', async ({
    page,
}) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto('/')
    const card = page.locator('#musicians wa-card').first()
    const img = card.locator('img').first()
    const name = card.locator('.text-ink-bright').first()
    const imgBox = await img.boundingBox()
    const nameBox = await name.boundingBox()
    // Image bottom should be at or above the name top (stacked, not side-by-side)
    expect(imgBox.y + imgBox.height).toBeLessThanOrEqual(nameBox.y + 4)
})

test('musician card text does not overflow its container at 375px', async ({
    page,
}) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto('/')
    const cards = page.locator('#musicians wa-card')
    const count = await cards.count()
    for (let i = 0; i < count; i++) {
        const textContainer = cards.nth(i).locator('.min-w-0')
        const overflowing = await textContainer.evaluate(
            (el) => el.scrollWidth > el.clientWidth,
        )
        expect(overflowing, `musician card ${i} text overflows`).toBe(false)
    }
})

test('event cards do not overflow at 375px', async ({ page }) => {
    await page.clock.setFixedTime(new Date('2026-01-01T12:00:00'))
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto('/')
    const cards = page.locator('#events wa-card[data-event-date]:not([hidden])')
    const count = await cards.count()
    for (let i = 0; i < count; i++) {
        const overflowing = await cards
            .nth(i)
            .evaluate((el) => el.scrollWidth > el.clientWidth)
        expect(overflowing, `event card ${i} overflows`).toBe(false)
    }
})

test('nav does not overflow at 375px', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto('/')
    const nav = page.locator('nav')
    const overflowing = await nav.evaluate(
        (el) => el.scrollWidth > el.clientWidth,
    )
    expect(overflowing).toBe(false)
})
