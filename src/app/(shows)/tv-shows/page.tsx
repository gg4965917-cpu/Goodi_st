import type { Metadata } from "next"
import type { CategorizedShows } from "@/types"

import { getShows } from "@/lib/fetchers"
import ShowsContainer from "@/components/shows-container"

export const metadata: Metadata = {
  title: "TV Series",
  description: "All anime series grouped by genre",
}

export default async function TVShowsPage() {
  const allShows = await getShows("tv")

  const allShowsByCategory: CategorizedShows[] = [
    {
      title: "Currently Airing",
      shows: allShows.trending,
    },
    {
      title: "Top Rated Series",
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
      <ShowsContainer shows={allShowsByCategory} />
    </section>
  )
}
