# Copilot Instructions for synthomaha.net

## Quick Commands

**Package Manager**: Bun (not npm/yarn)

- `bun install` - Install dependencies
- `bun run dev` - Start dev server (localhost:4321)
- `bun run build` - Build for production
- `bun run lint` - Check formatting with Prettier
- `bun run fix` - Auto-fix formatting issues
- `bun run check` - Run Astro type checking

## Architecture

This is an **Astro 6 static site generator** with React islands and Netlify edge functions.

### Key Stack

- **Framework**: Astro 6 with React 19 for interactive components
- **Styling**: Tailwind CSS 4
- **Hosting**: Netlify (with edge functions and blob storage)
- **Package Manager**: Bun with Volta for Node version pinning (v24.15.0)

### Project Structure

```
src/
  pages/           # Astro routes (directory-based routing)
  components/      # Reusable Astro and React components
  layouts/         # Astro page layouts (shared wrapper)
  content/         # Content collections (YAML data)
    events/        # Event data (loaded at build-time)
    musicians/     # Musician profiles (loaded at build-time)
  styles/          # Global CSS / Tailwind setup
  utils/           # Shared utility functions
  types.ts         # TypeScript interfaces

netlify/functions/  # Serverless functions (TypeScript)
  subscribe-email.ts      # Handles email signups (stores in Netlify Blobs)
  send-booking-request.ts # Handles booking form submissions
```

### Content Collections

Events and musician data are defined via **Astro Content Collections** in `src/content.config.ts`:

- **Events**: YAML files with schema (title, date, time, location, description, price, image)
- **Musicians**: YAML files with schema (name, bio, profileImage, links to bandcamp/soundcloud/instagram/website)

Both use the **glob loader** to auto-discover YAML files at build time.

### Netlify Integration

- **Adapter**: `@astrojs/netlify` for SSR/edge capabilities
- **Functions**: TypeScript in `netlify/functions/` (auto-deployed)
- **Blob Storage**: Used by functions to persist data (e.g., subscriber emails, booking requests)
- **Forms**: Uses Netlify Forms for static form detection (hidden form definitions in pages)

## Key Conventions

### Component Types

- **`.astro` files**: Static/server-rendered components. Use for layout, content display, and integration.
- **`.tsx` files**: React islands. Use `client:load` directive in parent Astro component to enable interactivity.
  - Example: `<EmailSignupForm client:load />` enables client-side event handling

### Prettier Formatting Rules

- **General files**: 160-char line width, 4-space tabs, single quotes, no trailing commas
- **Markdown, YAML, Astro frontmatter**: 2-space tabs (override via `.prettierrc`)
- Always run `bun run fix` before committing to auto-format per these rules

### Styling

- Use **Tailwind CSS** utility classes (configured in `astro.config.mjs`)
- Color scheme uses CSS custom properties (e.g., `text-primary`, `bg-primary/50`) — check `src/styles/` for theme definitions
- No separate CSS files needed; apply Tailwind classes inline

### Date Handling in Content

- YAML dates are quoted as strings (e.g., `"2026-06-05"`) to preserve them as strings, not parsed as dates
- Times are 24-hour format strings (e.g., `"20:00"`)
- Use TypeScript date parsing utilities as needed in components

### Networking in Functions

- Netlify functions run in a serverless environment; keep them lightweight and fast
- Use `@netlify/blobs` for simple data persistence (key-value store)
- Store data structures as JSON blobs (e.g., `subscribers.json`, `bookings.json`)

## Development Workflow

1. **Start dev server**: `bun run dev` (hot reload enabled)
2. **Type check**: `bun run check` (catches TypeScript errors)
3. **Format code**: `bun run fix` (auto-apply Prettier rules)
4. **Test Netlify functions locally**: Functions auto-serve via `bun run dev` at `/.netlify/functions/function-name`
5. **Deploy**: Push to main branch — Netlify auto-deploys via webhook

## Common Tasks

### Adding a New Event

1. Create `src/content/events/YYYY-MM-DD-name.yaml` with schema from `src/content.config.ts`
2. Rebuild or wait for dev server to hot-reload
3. Component `<EventCalendar />` auto-displays events

### Adding a New Musician

1. Create `src/content/musicians/username.yaml` with schema from `src/content.config.ts`
2. Dev server hot-reloads; `<MusicianProfiles />` auto-displays

### Adding Form Submissions

1. Define hidden form in Astro page (for Netlify Forms detection)
2. Create React component with `client:load` to handle submission
3. Post to `/` with form-name and fields (uses Netlify Forms API)
4. Optionally create a Netlify function to handle custom logic

### Debugging Netlify Functions

- View logs in Netlify UI (Functions tab)
- Test locally: dev server serves functions at `/.netlify/functions/function-name`
- Check `@netlify/blobs` data in Netlify UI (Deployments > Storage > Blobs)

## Type Checking & Errors

- Always enable JSX: React components use React 19 with automatic JSX transform
- Astro auto-generates types in `.astro/types.d.ts` for Content Collections
- Run `bun run check` to catch TypeScript errors early
- Content Collection schemas enforce type safety at build time

## Deployment

- Builds run `bun run build` (creates `dist/` directory)
- Static files and functions auto-deploy to Netlify on push to main
- Environment variables can be configured in Netlify UI or netlify.toml
