const BASE_URL = "https://api.17track.net/track/v2.2"

function headers() {
  return {
    "Content-Type": "application/json",
    "17token": process.env.TRACK17_API_KEY!,
  }
}

interface RegisterItem {
  number: string
  carrier: number
}

export async function registerTracking(items: RegisterItem[]) {
  if (!items.length) return

  const res = await fetch(`${BASE_URL}/register`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(
      items.map((i) => ({
        number: i.number,
        carrier: i.carrier,
        auto_detection: true,
      }))
    ),
  })

  const data = await res.json()
  return data
}

export interface TrackInfoResult {
  number: string
  carrier: number
  delivered: boolean
  deliveredAt: string | null
  // date à laquelle le colis a été remis au transporteur (étape "PickedUp"
  // du milestone 17Track), utile pour la date de dépôt d'un colis retour
  pickedUpAt: string | null
}

export async function getTrackInfo(items: RegisterItem[]): Promise<TrackInfoResult[]> {
  if (!items.length) return []

  const res = await fetch(`${BASE_URL}/gettrackinfo`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(items),
  })

  const data = await res.json()
  const accepted = data?.data?.accepted ?? []

  return accepted.map((item: {
    number: string
    carrier: number
    track_info?: {
      latest_status?: { status?: string }
      latest_event?: { time_iso?: string }
      milestone?: Array<{ key_stage?: string; time_iso?: string | null }>
    }
  }) => {
    const status = item.track_info?.latest_status?.status
    const delivered = status === "Delivered"
    const pickedUp = item.track_info?.milestone?.find((m) => m.key_stage === "PickedUp")

    return {
      number: item.number,
      carrier: item.carrier,
      delivered,
      deliveredAt: delivered
        ? item.track_info?.latest_event?.time_iso ?? null
        : null,
      pickedUpAt: pickedUp?.time_iso ?? null,
    }
  })
}
