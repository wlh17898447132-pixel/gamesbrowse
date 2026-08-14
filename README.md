# Chaos Front Guide

`gamesbrowse.online` is being converted from a browser-game catalog into an English-first guide site for **Chaos Front**.

The site is built with Astro and deployed as static HTML. The current public baseline contains the homepage, editorial policy, legal notices, canonical-host redirects, `robots.txt`, and an index-only sitemap.

## Editorial Rule

Do not publish a guide claim until it has a recorded game version, verification date, reproducible condition or original capture, source, risk, and alternative path. The first guide routes will be added to the sitemap only when their evidence records are ready.

## Local Development

```bash
npm ci
npm run dev
npm run build
npm run seo:check
```

## Deployment

Cloudflare Pages should build the default branch with `npm run build` and publish the `dist` directory. The domain remains `https://gamesbrowse.online`.

## Legacy URLs

Legacy game and category routes have intentionally been removed. They must not redirect to the homepage. After the production URL inventory is exported from Cloudflare and Search Console, add only explicit one-to-one `301` mappings to `public/_redirects`; unrelated routes should remain clean 404s, or use 410 if the Pages architecture adds that capability.
