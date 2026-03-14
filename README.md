# IndiaForBTS

Scalable Next.js App Router foundation for a BTS streaming coordination platform focused on Indian ARMY fans.

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

## Notes

- Internal cron routes are protected by `CRON_SECRET` when it is set.
- The current services return seeded/demo data so the UI and API layers are runnable before the full Mongo-backed repository layer is finished.
- `Stats.fm` is intentionally adapter-ready but not enabled in the MVP service layer yet.
