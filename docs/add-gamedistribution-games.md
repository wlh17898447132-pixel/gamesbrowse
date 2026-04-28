# Add GameDistribution Games

This project uses `src/data/games.ts` as the single source of truth for game cards, category pages, the `/games/` listing, detail pages, Similar Games, and iframe embeds.

## Workflow

1. Open the GameDistribution game detail page.
2. Copy the game title.
3. Copy the Description.
4. Copy the Instructions.
5. Copy the Embed iframe or Example URL.
6. Extract the `https://html5.gamedistribution.com/.../` base URL from the embed.
7. Create a slug:
   - lowercase only
   - spaces become `-`
   - remove punctuation
   - keep it short but recognizable
8. Add a new object to `src/data/games.ts`.
9. Make sure `iframeBaseUrl` does **not** contain:
   - `www.example.com`
   - `gamesbrowse.online`
   - `gd_sdk_referrer_url=`
10. Do **not** handwrite `gd_sdk_referrer_url` inside `iframeBaseUrl`.
11. Run `npm run build`.
12. Open `/games/[slug]/` locally and verify the embed loads.
13. Confirm the generated iframe still uses `html5.gamedistribution.com`.
14. Commit only after the route, homepage card, category page, and `/games/` listing all look correct.

## Data File

Use `src/data/games.ts` for production data.

- `games` is the raw game list you maintain by hand.
- `catalogGames` is the resolved build-time version used by Astro pages.
- `getGameIframeSrc(game)` automatically appends:
  - `gd_sdk_referrer_url=${encodeURIComponent(getGameUrl(game.slug))}`

## Example Entry

```ts
{
  title: "Only Up Parkour 2",
  slug: "only-up-parkour-2",
  source: "gamedistribution",
  type: "iframe",
  category: "Arcade",
  categories: ["Arcade", "Parkour", "Skill"],
  tags: ["Arcade", "Parkour", "Jumping", "Skill"],
  shortDescription:
    "Jump, climb, and avoid obstacles in a vertical parkour arcade challenge.",
  description:
    "Only Up Parkour 2 is a vertical parkour arcade game where you jump, climb, and avoid obstacles to reach the top.",
  instructions: "WASD = Move, Space = Jump",
  controls: "WASD = Move, Space = Jump",
  thumbnail: "",
  gameDistributionUrl: "https://gamedistribution.com/games/only-up-parkour-2/",
  iframeBaseUrl: "https://html5.gamedistribution.com/48a82403f7b14a6b8a1ffb4f9f20dae9/",
  iframeWidth: 960,
  iframeHeight: 600,
  featured: true,
  popular: true,
  editorPick: true,
  newGame: true,
  createdAt: "2026-04-28"
}
```

## Validation Rules

`src/data/games.ts` performs build-time validation for:

1. Unique slugs.
2. Valid `createdAt` dates.
3. Known categories.
4. GameDistribution iframe URLs must:
   - exist
   - use `html5.gamedistribution.com`
   - not contain `www.example.com`
   - not contain `gamesbrowse.online`
   - not contain `gd_sdk_referrer_url=`

If one of these rules fails, `npm run build` will stop with an error.

## CSV Template

Use `src/data/game-import-template.csv` as a manual intake sheet.

- The CSV is only a template.
- The production site reads `src/data/games.ts`.
- If you later want a converter, you can build a script that transforms the CSV into `games.ts` or JSON.
