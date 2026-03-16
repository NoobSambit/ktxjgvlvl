import { z } from "zod"

const envSchema = z.object({
  MONGODB_URI: z.string().min(1).optional(),
  ARMYVERSE_MONGODB_URI: z.string().min(1).optional(),
  LASTFM_API_KEY: z.string().min(1).optional(),
  IP_GEOLOCATION_PROVIDER: z.enum(["ipapi"]).optional(),
  IP_GEOLOCATION_API_KEY: z.string().min(1).optional(),
  CRON_SECRET: z.string().min(16).optional(),
  APP_URL: z.string().url().optional(),
  DISABLE_CRON_AUTH: z
    .enum(["true", "false", "1", "0"])
    .optional()
    .transform((value) => value === "true" || value === "1"),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development")
})

const parsed = envSchema.safeParse({
  MONGODB_URI: process.env.MONGODB_URI,
  ARMYVERSE_MONGODB_URI: process.env.ARMYVERSE_MONGODB_URI,
  LASTFM_API_KEY: process.env.LASTFM_API_KEY,
  IP_GEOLOCATION_PROVIDER: process.env.IP_GEOLOCATION_PROVIDER,
  IP_GEOLOCATION_API_KEY: process.env.IP_GEOLOCATION_API_KEY,
  CRON_SECRET: process.env.CRON_SECRET,
  APP_URL: process.env.APP_URL,
  DISABLE_CRON_AUTH: process.env.DISABLE_CRON_AUTH,
  NODE_ENV: process.env.NODE_ENV
})

export const env = parsed.success
  ? parsed.data
  : {
      MONGODB_URI: process.env.MONGODB_URI,
      ARMYVERSE_MONGODB_URI: process.env.ARMYVERSE_MONGODB_URI,
      LASTFM_API_KEY: process.env.LASTFM_API_KEY,
      IP_GEOLOCATION_PROVIDER: process.env.IP_GEOLOCATION_PROVIDER as "ipapi" | undefined,
      IP_GEOLOCATION_API_KEY: process.env.IP_GEOLOCATION_API_KEY,
      CRON_SECRET: process.env.CRON_SECRET,
      APP_URL: process.env.APP_URL,
      DISABLE_CRON_AUTH:
        process.env.DISABLE_CRON_AUTH === "true" || process.env.DISABLE_CRON_AUTH === "1",
      NODE_ENV: (process.env.NODE_ENV ?? "development") as "development" | "test" | "production"
    }
