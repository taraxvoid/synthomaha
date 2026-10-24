# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
bun run dev            # dev server (Astro, localhost:4321) with hot-reload
bun run build          # build static site to dist/
bun run preview        # preview built dist/ locally

bun run lint           # check formatting/linting (Biome)
bun run format         # auto-fix formatting (Biome)
bun run lint:actions   # validate .github/workflows/ (github-actionlint)

bun run check          # Astro + TypeScript type checking
bun run check:content  # sync Astro content types

bun run test           # everything: build, check, unit, e2e (mobile-chrome)
bun run test:push      # pre-push gate: build, check, unit, e2e smoke (site.spec)
bun run test:fast      # lint + data validation, no build
bun run test:unit      # vitest run (all of test/*.test.ts)
bun run test:data      # content validation only
bun run test:e2e       # build + Playwright (mobile-chrome)
bun run test:e2e:all   # build + Playwright (mobile + desktop)

bun run generate       # regenerate logo PNG + favicons
bun run compress:images  # compress public/images/uploads
```

Tests are **vitest** via `bun run <script>`; bare `bun test` invokes Bun's own
runner and won't run the suite.

Git hooks are lefthook, shared from voidflow's `lefthook/site.yml` (format,
actionlint, check, `test:unit:precommit` on commit; `test:push` on push).
This repo adds a pre-commit `compress-images` step for
`public/images/uploads/**` that re-stages the compressed files.

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

- `test/*.test.ts` — unit tests (vitest); `build.test.ts` needs a built `dist/`
- `test/e2e/` — Playwright e2e tests

### CI

`.github/workflows/ci.yml` is the only workflow: on PRs and pushes to `main`
it calls voidflow's shared `site-ci.yml` (`single-environment: true`). Draft
PRs are skipped.

**This repo requires SHA-pinned actions.** Every `uses:` must name a full
commit SHA with the version as a trailing comment — a tag (`@v4`) makes the
workflow fail at startup in 0s with no logs and no annotation. Run
`bun run lint:actions` after editing any workflow.
