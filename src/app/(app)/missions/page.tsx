import { MissionPage } from "@/components/missions/mission-page"
import { getMissionPageState } from "@/modules/missions/service"

export const dynamic = "force-dynamic"

export default async function MissionsPage() {
  const missionState = await getMissionPageState()

  return <MissionPage missionState={missionState} />
}
