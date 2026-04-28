import { env } from "@/env.mjs"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(input: string | number): string {
  const date = new Date(input)
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })
}

export function getYear(input: string | number): number {
  const date = new Date(input)
  return date.getFullYear()
}

export function absoluteUrl(path: string) {
  const base = env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  return `${base}${path}`
}

/**
 * Resolves an image reference into a fully-qualified URL.
 *
 * Historical TMDB-shaped values were paths like `/abc.jpg`; the migrated
 * Jikan/AniList sources store full `https://...` URLs. Persisted MyList rows
 * may still contain legacy TMDB paths, so fall back to the TMDB CDN for those.
 */
export function showImageUrl(
  path: string | null | undefined,
  fallback?: string | null
): string {
  if (path && /^https?:\/\//.test(path)) return path
  if (path) return `https://image.tmdb.org/t/p/w500${path.startsWith("/") ? path : `/${path}`}`
  if (fallback && /^https?:\/\//.test(fallback)) return fallback
  if (fallback) return `https://image.tmdb.org/t/p/w500${fallback.startsWith("/") ? fallback : `/${fallback}`}`
  return ""
}

export function formatEnum(input: string): string {
  const words = input.split("_")
  const capitalizedWords = words.map((word) => {
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  })
  return capitalizedWords.join(" ")
}
