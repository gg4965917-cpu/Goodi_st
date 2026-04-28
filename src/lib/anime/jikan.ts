import type { Show } from "@/types"

const JIKAN_BASE = "https://api.jikan.moe/v4"

export type JikanImage = {
  jpg?: { image_url?: string; large_image_url?: string; small_image_url?: string }
  webp?: { image_url?: string; large_image_url?: string; small_image_url?: string }
}

export type JikanAired = {
  from?: string | null
  to?: string | null
  prop?: { from?: { year?: number | null } }
}

export type JikanTrailer = {
  youtube_id?: string | null
  url?: string | null
  embed_url?: string | null
  images?: { maximum_image_url?: string | null }
}

export type JikanGenreLite = { mal_id: number; name: string }

export type JikanAnime = {
  mal_id: number
  url?: string
  images?: JikanImage
  trailer?: JikanTrailer
  approved?: boolean
  titles?: { type?: string; title?: string }[]
  title?: string
  title_english?: string | null
  title_japanese?: string | null
  title_synonyms?: string[]
  type?: string | null
  source?: string | null
  episodes?: number | null
  status?: string | null
  airing?: boolean
  duration?: string | null
  rating?: string | null
  score?: number | null
  scored_by?: number | null
  rank?: number | null
  popularity?: number | null
  members?: number | null
  favorites?: number | null
  synopsis?: string | null
  background?: string | null
  season?: string | null
  year?: number | null
  aired?: JikanAired
  genres?: JikanGenreLite[]
  explicit_genres?: JikanGenreLite[]
  themes?: JikanGenreLite[]
  demographics?: JikanGenreLite[]
  studios?: JikanGenreLite[]
  producers?: JikanGenreLite[]
}

type JikanList = { data: JikanAnime[]; pagination?: unknown }
type JikanOne = { data: JikanAnime }

async function jikanFetch<T>(path: string, revalidate: number): Promise<T | null> {
  try {
    const res = await fetch(`${JIKAN_BASE}${path}`, {
      next: { revalidate },
      headers: { Accept: "application/json" },
    })
    if (!res.ok) return null
    return (await res.json()) as T
  } catch {
    return null
  }
}

function pickImage(images?: JikanImage): string | null {
  return (
    images?.webp?.large_image_url ??
    images?.jpg?.large_image_url ??
    images?.webp?.image_url ??
    images?.jpg?.image_url ??
    null
  )
}

export function jikanToShow(a: JikanAnime): Show {
  const isMovie = a.type === "Movie"
  const poster = pickImage(a.images)
  const trailerImg = a.trailer?.images?.maximum_image_url ?? null
  const aired = a.aired?.from ?? null
  const titleEn = a.title_english ?? a.title ?? "Untitled"
  return {
    adult: a.rating === "Rx" || a.rating === "Rx - Hentai",
    backdrop_path: trailerImg ?? poster,
    media_type: isMovie ? "movie" : "tv",
    budget: null,
    homepage: a.url ?? null,
    showId: String(a.mal_id),
    id: a.mal_id,
    imdb_id: null,
    original_language: "ja",
    original_title: a.title ?? a.title_japanese ?? null,
    overview: a.synopsis ?? null,
    popularity: typeof a.members === "number" ? a.members : 0,
    poster_path: poster,
    number_of_seasons: null,
    number_of_episodes: a.episodes ?? null,
    release_date: isMovie ? aired : null,
    first_air_date: !isMovie ? aired : null,
    last_air_date: !isMovie ? a.aired?.to ?? null : null,
    revenue: null,
    runtime: null,
    status: a.status ?? null,
    tagline: null,
    title: isMovie ? titleEn : null,
    name: !isMovie ? titleEn : null,
    video: false,
    vote_average: a.score ?? 0,
    vote_count: a.scored_by ?? 0,
  }
}

function dedupeByMalId<T extends { mal_id: number }>(items: T[]): T[] {
  const seen = new Set<number>()
  const out: T[] = []
  for (const it of items) {
    if (seen.has(it.mal_id)) continue
    seen.add(it.mal_id)
    out.push(it)
  }
  return out
}

export async function jikanTopAnime(
  type: "tv" | "movie" | "ova" | "special" | "ona" = "tv",
  filter: "airing" | "upcoming" | "bypopularity" | "favorite" | undefined,
  limit = 20,
  revalidate = 3600
): Promise<JikanAnime[]> {
  const qs = new URLSearchParams({ type, limit: String(limit), sfw: "true" })
  if (filter) qs.set("filter", filter)
  const out = await jikanFetch<JikanList>(`/top/anime?${qs.toString()}`, revalidate)
  return out?.data ?? []
}

export async function jikanByGenre(
  type: "tv" | "movie",
  genreIds: number[],
  limit = 20,
  revalidate = 3600
): Promise<JikanAnime[]> {
  const qs = new URLSearchParams({
    type,
    genres: genreIds.join(","),
    order_by: "popularity",
    sort: "asc",
    limit: String(limit),
    sfw: "true",
  })
  const out = await jikanFetch<JikanList>(`/anime?${qs.toString()}`, revalidate)
  return out?.data ?? []
}

export async function jikanSeason(
  filter: "now" | "upcoming",
  type: "tv" | "movie" | undefined,
  limit = 20,
  revalidate = 3600
): Promise<JikanAnime[]> {
  const qs = new URLSearchParams({ limit: String(limit), sfw: "true" })
  if (filter === "now") qs.set("filter", "tv")
  const path = filter === "now" ? "/seasons/now" : "/seasons/upcoming"
  const out = await jikanFetch<JikanList>(`${path}?${qs.toString()}`, revalidate)
  let data = out?.data ?? []
  if (type) data = data.filter((a) => (type === "movie" ? a.type === "Movie" : a.type !== "Movie"))
  return data.slice(0, limit)
}

export async function jikanSearch(
  query: string,
  limit = 20,
  revalidate = 60
): Promise<JikanAnime[]> {
  if (!query.trim()) return []
  const qs = new URLSearchParams({
    q: query,
    limit: String(limit),
    order_by: "popularity",
    sort: "asc",
    sfw: "true",
  })
  const out = await jikanFetch<JikanList>(`/anime?${qs.toString()}`, revalidate)
  return out?.data ?? []
}

export async function jikanFull(malId: number, revalidate = 3600): Promise<JikanAnime | null> {
  const out = await jikanFetch<JikanOne>(`/anime/${malId}/full`, revalidate)
  return out?.data ?? null
}

export { dedupeByMalId, pickImage }
