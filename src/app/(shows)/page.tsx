import type { CategorizedShows } from "@/types"

import { getShows } from "@/lib/fetchers"
import { getCurrentUser } from "@/lib/session"
import Hero from "@/components/hero"
import ShowsContainer from "@/components/shows-container"

export default async function Home() {
  const user = await getCurrentUser()

  const allShows = await getShows("tv")

  const allShowsByCategory: CategorizedShows[] = [
    {
      title: "Currently Airing",
      shows: allShows.trending,
    },
    {
      title: "Top Rated Anime",
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
    <section>
      <div className="pb-16 pt-10">
        <Hero shows={allShows.netflix ?? []} />
        <ShowsContainer user={user} shows={allShowsByCategory} />
      </div>
    </section>
  )
}
