# IndiaForBTS

Scalable Next.js App Router foundation for a BTS streaming coordination platform focused on Indian ARMY fans.

## Deployment Target

This app is configured for Cloudflare Workers using `@opennextjs/cloudflare`.

## What is implemented

- App Router project scaffold with route groups for marketing, auth, app, and admin
- TailwindCSS + reusable UI primitives
- Feature-module layout for trackers, streaming, missions, leaderboards, charts, wiki, events, voting guides, fan projects, admin, regions, and users
- MongoDB model definitions for core platform entities
- Tracker provider adapter contracts with MVP `Last.fm` and `Musicat` placeholders
- Internal cron/job contracts for syncing trackers, generating missions, materializing leaderboards, and scraping chart snapshots
- Seeded pages and JSON APIs proving the architecture works end to end before full production integrations are added

## Routes

- `/`
- `/dashboard`
- `/missions`
- `/leaderboards`
- `/wiki`
- `/events`
- `/voting-guides`
- `/projects`
- `/admin`

## APIs

- `GET/POST /api/v1/tracker-connections`
- `POST /api/v1/stream-sync`
- `GET /api/v1/missions`
- `GET /api/v1/leaderboards`
- `GET /api/v1/charts`
- `GET /api/v1/wiki`
- `GET /api/v1/events`
- `GET /api/v1/fan-projects`
- `POST /api/internal/cron/*`

## Environment

Copy `.env.example` to `.env.local` and provide:

- `MONGODB_URI`
- `CRON_SECRET`
- `APP_URL`

For local Cloudflare preview, also copy `.dev.vars.example` to `.dev.vars` and keep the same values there.

## Cloudflare Deploy

1. Install dependencies with `npm install`.
2. Create a KV namespace for the Next incremental cache.
3. Replace `replace-with-your-kv-namespace-id` in `wrangler.jsonc` with the real KV namespace id.
4. Add your runtime secrets and vars in Cloudflare:
   - `MONGODB_URI`
   - `ARMYVERSE_MONGODB_URI`
   - `LASTFM_API_KEY`
   - `CRON_SECRET`
   - `APP_URL`
   - `DISABLE_CRON_AUTH`
5. Build the Cloudflare worker bundle with `npm run cf:build`.
6. Preview locally with `npm run cf:preview`.
7. Deploy with `npm run cf:deploy`.

## Cloudflare Cron Triggers

`wrangler.jsonc` configures native Cloudflare cron triggers for:

- hourly tracker sync
- hourly location activity materialization
- 6-hour chart snapshot scraping
- daily mission rollover at `12:01 AM IST`
- weekly mission rollover at `12:05 AM IST` on Monday

## Notes

- Internal cron routes are protected by `CRON_SECRET` when it is set.
- Location auto-suggestion accepts both Vercel geo headers and Cloudflare geo headers. For state/city level Cloudflare hints, enable visitor-location request headers in Cloudflare if you want hosting-based suggestion quality comparable to Vercel.
- The current services return seeded/demo data so the UI and API layers are runnable before the full Mongo-backed repository layer is finished.
- `Stats.fm` is intentionally adapter-ready but not enabled in the MVP service layer yet.
