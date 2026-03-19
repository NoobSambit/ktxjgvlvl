import nextHandler from "./.open-next/worker.js";

const cronRoutesByExpression = {
  "5 * * * *": ["/api/internal/cron/sync-active-trackers"],
  "15 * * * *": ["/api/internal/cron/materialize-location-activity"],
  "0 */6 * * *": ["/api/internal/cron/scrape-chart-snapshots"],
  "31 18 * * *": [
    "/api/internal/cron/generate-daily-missions",
    "/api/internal/cron/materialize-leaderboards",
    "/api/internal/cron/materialize-location-activity",
  ],
  "35 18 * * 0": [
    "/api/internal/cron/generate-weekly-missions",
    "/api/internal/cron/materialize-leaderboards",
    "/api/internal/cron/materialize-location-activity",
  ],
};

async function invokeInternalCron(path, env, ctx) {
  const headers = new Headers();

  if (env.CRON_SECRET) {
    headers.set("x-cron-secret", env.CRON_SECRET);
  }

  const response = await nextHandler.fetch(
    new Request(`https://internal${path}`, {
      method: "POST",
      headers,
    }),
    env,
    ctx,
  );

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Cron route ${path} failed with ${response.status}: ${body}`);
  }
}

export default {
  async fetch(request, env, ctx) {
    return nextHandler.fetch(request, env, ctx);
  },

  async scheduled(event, env, ctx) {
    const routes = cronRoutesByExpression[event.cron] ?? [];

    if (routes.length === 0) {
      return;
    }

    ctx.waitUntil(
      Promise.all(routes.map((route) => invokeInternalCron(route, env, ctx))),
    );
  },
};
