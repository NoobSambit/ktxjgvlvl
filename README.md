# IndiaForBTS

Scalable Next.js App Router foundation for a BTS streaming coordination platform focused on Indian ARMY fans.

## Deployment Target

This app is configured to deploy on Vercel, run heavy tracker syncing through GitHub Actions, and use an external cron service such as `cron-job.org` for scheduling.

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
- `GET/POST /api/internal/cron/*`

## Environment

Copy `.env.example` to `.env.local` and provide:

- `MONGODB_URI`
- `ARMYVERSE_MONGODB_URI`
- `LASTFM_API_KEY`
- `CRON_SECRET`
- `APP_URL`
- `DISABLE_CRON_AUTH`

## Vercel Deploy

1. Import the repository into Vercel.
2. Add the runtime environment variables:
   - `MONGODB_URI`
   - `ARMYVERSE_MONGODB_URI`
   - `LASTFM_API_KEY`
   - `CRON_SECRET`
   - `APP_URL`
   - `DISABLE_CRON_AUTH`
3. Keep `APP_URL` set to the final production origin.
4. Do not configure Vercel Cron Jobs for this project.

## External Cron Jobs

Create the scheduled jobs in `cron-job.org` instead of Vercel.

Recommended shared settings:

- timezone: `Asia/Kolkata`
- use `POST` requests for Vercel cron routes
- use the GitHub Actions `workflow_dispatch` API for tracker syncing

### Vercel-targeted jobs

Shared settings:

- request method: `POST`
- header: `x-cron-secret: <your CRON_SECRET value>`
- target base URL: `https://<your-vercel-domain>`

Recommended jobs:

- `00:31` every day:
  `/api/internal/cron/generate-daily-missions`
- `00:35` every Monday:
  `/api/internal/cron/generate-weekly-missions`
- `05:05` every day:
  `/api/internal/cron/scrape-chart-snapshots`

The internal cron routes also accept `GET`, but `POST` plus `x-cron-secret` is the recommended external setup.

### GitHub Actions tracker sync

`sync-active-trackers` is intended to run through GitHub Actions, not through a Vercel function timeout window.

Workflow file:

- `.github/workflows/sync-active-trackers.yml`

GitHub repository secrets required by the workflow:

- `MONGODB_URI`
- `LASTFM_API_KEY`

Recommended cron-job.org request:

- method: `POST`
- URL:
  `https://api.github.com/repos/<github-owner>/<github-repo>/actions/workflows/sync-active-trackers.yml/dispatches`
- headers:
  - `Accept: application/vnd.github+json`
  - `Authorization: Bearer <github-token-with-actions-write>`
  - `X-GitHub-Api-Version: 2022-11-28`
  - `Content-Type: application/json`
- body:
  `{"ref":"<default-branch>"}`

Recommended frequency:

- every `1 hour`, preferably a few minutes past the hour such as `07` minutes

The workflow uses concurrency protection, so overlapping sync runs do not stack endlessly.

### Optional fallback jobs

The tracker sync already rematerializes leaderboards and location activity after importing streams.

Only add these as separate external jobs if you want a backup rebuild path:

- `/api/internal/cron/materialize-leaderboards`
- `/api/internal/cron/materialize-location-activity`

## Notes

- Internal cron routes are protected by `CRON_SECRET` when it is set.
- Only use one scheduler. If you use `cron-job.org`, do not also configure Vercel Cron Jobs.
- The cron endpoints keep both `GET` and `POST` enabled for manual ops and external schedulers.
- `sync-active-trackers` is expected to run from GitHub Actions so it is not limited by Vercel Hobby function duration.
- Location auto-suggestion accepts both Vercel geo headers and Cloudflare geo headers.
- The current services return seeded/demo data so the UI and API layers are runnable before the full Mongo-backed repository layer is finished.
- `Stats.fm` is intentionally adapter-ready but not enabled in the MVP service layer yet.
