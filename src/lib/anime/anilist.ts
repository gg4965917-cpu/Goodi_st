const ANILIST_URL = "https://graphql.anilist.co"

const QUERY = `
query ($idsMal: [Int]) {
  Page(perPage: 50) {
    media(idMal_in: $idsMal, type: ANIME) {
      idMal
      bannerImage
      coverImage { extraLarge large }
      trailer { id site }
    }
  }
}
`

export type AniListMediaLite = {
  idMal: number | null
  bannerImage: string | null
  coverImage?: { extraLarge?: string | null; large?: string | null } | null
  trailer?: { id?: string | null; site?: string | null } | null
}

export async function anilistByMalIds(
  malIds: number[],
  revalidate = 3600
): Promise<Map<number, AniListMediaLite>> {
  const out = new Map<number, AniListMediaLite>()
  if (malIds.length === 0) return out
  const unique = Array.from(new Set(malIds))
  // AniList page perPage limit is 50
  const chunks: number[][] = []
  for (let i = 0; i < unique.length; i += 50) chunks.push(unique.slice(i, i + 50))

  await Promise.all(
    chunks.map(async (chunk) => {
      try {
        const res = await fetch(ANILIST_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({ query: QUERY, variables: { idsMal: chunk } }),
          next: { revalidate },
        })
        if (!res.ok) return
        const json = (await res.json()) as {
          data?: { Page?: { media?: AniListMediaLite[] } }
        }
        const items = json.data?.Page?.media ?? []
        for (const m of items) {
          if (typeof m.idMal === "number") out.set(m.idMal, m)
        }
      } catch {
        // swallow — enrichment is best-effort
      }
    })
  )
  return out
}
