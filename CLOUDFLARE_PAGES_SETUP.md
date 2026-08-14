# Cloudflare Pages Setup

## Build Settings

- Framework preset: Astro
- Build command: `npm run build`
- Output directory: `dist`
- Node version: `22.16.0`
- Production branch: `main`

## Domain and Crawl Settings

- Attach `gamesbrowse.online` as the canonical production domain.
- Preserve the host redirects in `public/_redirects` so HTTP and `www` requests use `https://gamesbrowse.online`.
- Verify `https://gamesbrowse.online/robots.txt` and `https://gamesbrowse.online/sitemap.xml` after every deployment.
- Submit the sitemap only after verifying the domain in Google Search Console.

## Legacy Route Policy

- Add a `301` only for an exact, relevant old-to-new page equivalent.
- Leave unrelated legacy game and category routes as clean 404 responses.
- Do not direct old catalog URLs to the homepage.
- If a Cloudflare Pages Function is later introduced for status handling, it may return `410 Gone` for confirmed obsolete game routes.

## Pre-Deployment Checks

- Run `npm run build`.
- Run `npm run seo:check`.
- Confirm every sitemap URL has one title, description, canonical, H1, and no `noindex` directive.
- Inspect the deployed homepage and About page on desktop and mobile.
