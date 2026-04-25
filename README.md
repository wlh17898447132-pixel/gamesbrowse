# GamesBrowse

GamesBrowse is moving from a single-file HTML game page to a multi-page Astro-based game site.

## Current Status

- The live site is still represented by the legacy root `index.html`
- The new multi-page source is being built under `src/`
- Phase 1 focuses on structure, reusable layouts, and support for both native and `iframe` game modes

## Local Development

```bash
npm install
npm run dev
```

## Planned Architecture

- `src/pages/` for routes
- `src/layouts/` for shared page shells
- `src/components/` for reusable UI
- `src/data/` for game metadata
- `public/scripts/` for standalone game scripts
- `public/embeds/` for iframe validation demos

See the planning docs for details:

- `UPGRADE_PLAN.md`
- `IFRAME_GUIDELINES.md`
- `PHASE1_CHECKLIST.md`

