import { suggestRegionFromIp } from "@/platform/integrations/geo/ip-geolocation"

export async function getRegionPolicy() {
  const suggestion = await suggestRegionFromIp()

  return {
    resetTimezone: "Asia/Kolkata",
    trustModel: "ip-suggest-and-confirm",
    suggestion
  }
}
