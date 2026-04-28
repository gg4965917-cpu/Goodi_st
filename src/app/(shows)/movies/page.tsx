import type { Metadata } from "next"
import type { CategorizedShows } from "@/types"

import { getShows } from "@/lib/fetchers"
import { getCurrentUser } from "@/lib/session"
import ShowsContainer from "@/components/shows-container"

export const metadata: Metadata = {
  title: "Movies",
  description: "All anime movies grouped by genre",
}

export default async function MoviesPage() {
  const user = await getCurrentUser()

  const allShows = await getShows("movie")

  const allShowsByCategory: CategorizedShows[] = [
    {
      title: "Popular Anime Movies",
      shows: allShows.trending,
    },
    {
      title: "Top Rated Movies",
      shows: allShows.topRated,
    },
    {
      title: "Adventure & Fantasy",
      shows: allShows.netflix,
    },
    {
      title: "Action",
      shows: allShows.action,
    },
    {
      title: "Comedy",
      shows: allShows.comedy,
    },
    {
      title: "Horror",
      shows: allShows.horror,
    },
    {
      title: "Romance",
      shows: allShows.romance,
    },
    {
      title: "Slice of Life",
      shows: allShows.docs,
    },
  ]

  return (
    <section className="pb-16 pt-10">
      <ShowsContainer user={user} shows={allShowsByCategory} />
    </section>
  )
}
