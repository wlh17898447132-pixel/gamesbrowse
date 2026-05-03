import { getCategoryCatalog, getIndexableGames } from "./games";

export const staticSearchPages = [
  { path: "/", changefreq: "weekly", priority: "1.0", indexable: true },
  { path: "/games/", changefreq: "weekly", priority: "0.9", indexable: true },
  { path: "/category/", changefreq: "weekly", priority: "0.8", indexable: true },
  { path: "/about/", changefreq: "monthly", priority: "0.5", indexable: true },
  { path: "/contact/", changefreq: "monthly", priority: "0.2", indexable: false },
  { path: "/privacy-policy/", changefreq: "monthly", priority: "0.2", indexable: false },
  { path: "/terms/", changefreq: "monthly", priority: "0.2", indexable: false }
];

export function getSitemapEntries() {
  const categoryEntries = getCategoryCatalog()
    .filter((category) => category.indexable)
    .map((category) => ({
      path: `/category/${category.slug}/`,
      changefreq: "weekly",
      priority: "0.8",
      indexable: true
    }));

  const gameEntries = getIndexableGames()
    .map((game) => ({
      path: `/games/${game.slug}/`,
      changefreq: "weekly",
      priority: game.featured ? "0.9" : "0.7",
      indexable: true
    }));

  return [...staticSearchPages, ...categoryEntries, ...gameEntries].filter(
    (entry) => entry.indexable !== false
  );
}
