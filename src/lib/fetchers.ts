import type { Show } from "@/types"
import type { MEDIA_TYPE } from "@prisma/client"

import { anilistByMalIds } from "@/lib/anime/anilist"
import {
  dedupeByMalId,
  jikanByGenre,
  jikanSearch,
  jikanSeason,
  jikanToShow,
  jikanTopAnime,
  type JikanAnime,
} from "@/lib/anime/jikan"

// MAL genre IDs
const GENRE_ACTION = 1
const GENRE_ADVENTURE = 2
const GENRE_COMEDY = 4
const GENRE_DRAMA = 8
const GENRE_FANTASY = 10
const GENRE_HORROR = 14
const GENRE_MYSTERY = 7
const GENRE_ROMANCE = 22
const GENRE_SCIFI = 24
const GENRE_SLICE_OF_LIFE = 36
const GENRE_SUPERNATURAL = 37

async function enrichShows(jikan: JikanAnime[]): Promise<Show[]> {
  if (jikan.length === 0) return []
  const malIds = jikan.map((a) => a.mal_id)
  const banners = await anilistByMalIds(malIds)
  return jikan.map((a) => {
    const show = jikanToShow(a)
    const al = banners.get(a.mal_id)
    if (al?.bannerImage) {
      show.backdrop_path = al.bannerImage
    }
    return show
  })
}

export async function getShows(mediaType: MEDIA_TYPE) {
  const jikanType = mediaType === "movie" ? "movie" : "tv"

  const [
    trending,
    topRated,
    netflix,
    action,
    comedy,
    horror,
    romance,
    docs,
  ] = await Promise.all([
    mediaType === "tv"
      ? jikanTopAnime("tv", "airing", 20)
      : jikanTopAnime("movie", "bypopularity", 20),
    jikanTopAnime(jikanType, undefined, 20),
    jikanByGenre(jikanType, [GENRE_ADVENTURE, GENRE_FANTASY], 20),
    jikanByGenre(jikanType, [GENRE_ACTION], 20),
    jikanByGenre(jikanType, [GENRE_COMEDY], 20),
    jikanByGenre(jikanType, [GENRE_HORROR], 20),
    jikanByGenre(jikanType, [GENRE_ROMANCE], 20),
    jikanByGenre(jikanType, [GENRE_SLICE_OF_LIFE], 20),
  ])

  const allJikan = [
    ...trending,
    ...topRated,
    ...netflix,
    ...action,
    ...comedy,
    ...horror,
    ...romance,
    ...docs,
  ]
  const enrichedMap = new Map(
    (await enrichShows(dedupeByMalId(allJikan))).map((s) => [s.id, s])
  )
  const toShows = (arr: JikanAnime[]): Show[] =>
    arr.map((a) => enrichedMap.get(a.mal_id) ?? jikanToShow(a))

  return {
    trending: toShows(trending),
    topRated: toShows(topRated),
    netflix: toShows(netflix),
    action: toShows(action),
    comedy: toShows(comedy),
    horror: toShows(horror),
    romance: toShows(romance),
    docs: toShows(docs),
  }
}

export async function getNewAndPopularShows() {
  const [seasonNowTv, seasonUpcomingTv, popularTv, popularMovie] =
    await Promise.all([
      jikanSeason("now", "tv", 20),
      jikanSeason("upcoming", "tv", 20),
      jikanTopAnime("tv", "bypopularity", 20),
      jikanTopAnime("movie", "bypopularity", 20),
    ])

  const allJikan = [
    ...seasonNowTv,
    ...seasonUpcomingTv,
    ...popularTv,
    ...popularMovie,
  ]
  const enrichedMap = new Map(
    (await enrichShows(dedupeByMalId(allJikan))).map((s) => [s.id, s])
  )
  const toShows = (arr: JikanAnime[]): Show[] =>
    arr.map((a) => enrichedMap.get(a.mal_id) ?? jikanToShow(a))

  return {
    trendingTvs: toShows(seasonNowTv),
    trendingMovies: toShows(seasonUpcomingTv),
    popularTvs: toShows(popularTv),
    popularMovies: toShows(popularMovie),
  }
}

export async function searchShows(query: string) {
  const items = await jikanSearch(query, 20)
  const enriched = await enrichShows(items)
  return { results: enriched }
}

// Re-exported for ad-hoc imports if any callers still reference internals.
export { GENRE_ACTION, GENRE_ADVENTURE, GENRE_COMEDY, GENRE_DRAMA, GENRE_FANTASY, GENRE_HORROR, GENRE_MYSTERY, GENRE_ROMANCE, GENRE_SCIFI, GENRE_SLICE_OF_LIFE, GENRE_SUPERNATURAL }
