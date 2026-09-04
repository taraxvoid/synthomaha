# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
bun run dev            # dev server (Astro, localhost:4321) with hot-reload
bun run build          # build static site to dist/
bun run preview        # preview built dist/ locally

bun run lint           # check formatting/linting (Biome)
bun run format         # auto-fix formatting (Biome)
bun run lint:actions   # validate .github/workflows/ (actionlint)

bun run check          # Astro + TypeScript type checking
bun run check:content  # sync Astro content types

bun run test           # unit tests
bun run test:unit      # unit tests only (bun:test)
bun run test:e2e       # Playwright e2e tests

bun run generate       # regenerate logo PNG + favicons
```

### Build performance

`bun run build` uses a custom build script (`scripts/build.mjs`) that skips
Astro's content sync step when the content store is already up-to-date. It
detects content changes automatically by comparing `src/content/` file mtimes
against a `.last-sync` timestamp — no gotchas, changes are picked up automatically.
The sync runs only when needed (first build, after content changes, or when
the cache is cleared).

## Architecture

Static site built with **Astro** + **React** + **Tailwind CSS v4**, deployed to Netlify. Single layout at `src/layouts/Layout.astro`.

### Pages

- `/` — home: about section, events calendar, musician profiles, booking form, email signup
- `/events/` — event listings (static generation from content collection)
- `/events.ics` — iCal feed for calendar subscriptions

### Content model

Content lives in `src/content/` as YAML:

- `events/` — event entries with date, title, venue, performers, etc.
- `musicians/` — musician profiles with name, bio, social links, profile image

Zod schemas live in `src/content.config.ts`.

### Components

- `src/layouts/Layout.astro` — main layout (HTML shell, Header, Footer)
- `src/components/Header.astro` — site navigation
- `src/components/Footer.astro` — site footer
- `src/components/EventCalendar.astro` — upcoming events display
- `src/components/EventSubscribe.astro` — calendar/email subscribe
- `src/components/MusicianProfiles.astro` — musician grid
- `src/components/MusicianCard.astro` — individual musician card
- `src/components/BookingForm.tsx` — React booking request form (Netlify Forms)
- `src/components/EmailSignupForm.tsx` — React email signup (Netlify Forms)

### Forms

Booking and email signup use Netlify Forms. Hidden static forms in `index.astro` for build-time detection; React components handle the interactive versions.

### Netlify Functions

Server-side logic lives in `netlify/functions/`. Form handling and any edge function logic goes here.

### Tests

- `test/*.test.js` — unit tests (bun:test)
- `test/e2e/` — Playwright e2e tests

### CI

Workflows live in `.github/workflows/`, all keyed on `main`:

- `pr-checks.yml` ("Ensure PR mergable") — the PR gate: actionlint, advisory
  `bun audit`, lint, build, `astro check`, unit tests, mobile-chrome e2e, and
  (only when `bun.lock` changed, checked via `dorny/paths-filter`, SHA-pinned
  per this repo's `sha_pinning_required` policy) `check:licenses` — blocks the
  GPL/AGPL/SSPL family from production deps. Not a separate workflow — folded
  into this job so it doesn't need its own CI run.
- `e2e.yml` — full Playwright matrix (mobile + desktop) on push to `main`.

PRs run mobile-chrome only to keep the gate fast; the full matrix runs after
merge. Draft PRs are skipped.

**This repo requires SHA-pinned actions.** Every `uses:` must name a full
commit SHA with the version as a trailing comment — a tag (`@v4`) makes the
workflow fail at startup in 0s with no logs and no annotation. Run
`bun run lint:actions` after editing any workflow.

Default to using Bun instead of Node.js.

- Use `bun <file>` instead of `node <file>` or `ts-node <file>`
- Use `bun test` instead of `jest` or `vitest`
- Use `bun install` instead of `npm install`
- Use `bun run <script>` instead of `npm run <script>`
- Use `bunx <package>` instead of `npx <package>`
- Bun automatically loads .env, so don't use dotenv.
