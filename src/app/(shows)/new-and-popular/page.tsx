import type { Metadata } from "next"
import type { CategorizedShows } from "@/types"

import { getNewAndPopularShows } from "@/lib/fetchers"
import ShowsContainer from "@/components/shows-container"

export const metadata: Metadata = {
  title: "New & Popular",
  description: "New and popular anime grouped by category",
}

export default async function NewAndPopularPage() {
  const allShows = await getNewAndPopularShows()

  const allShowsByCategory: CategorizedShows[] = [
    {
      title: "This Season",
      shows: allShows.trendingTvs,
    },
    {
      title: "Coming Soon",
      shows: allShows.trendingMovies,
    },
    {
      title: "Popular Series",
      shows: allShows.popularTvs,
    },
    {
      title: "Popular Movies",
      shows: allShows.popularMovies,
    },
  ]

  return (
    <section className="pb-16 pt-10">
      <ShowsContainer shows={allShowsByCategory} />
    </section>
  )
}
