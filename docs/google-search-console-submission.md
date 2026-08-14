# Google Search Console Submission

This repository is ready for a Google Search Console domain-property submission after the production deploy completes.

## Production URLs

- Canonical site: `https://gamesbrowse.online/`
- Sitemap: `https://gamesbrowse.online/sitemap.xml`
- Robots file: `https://gamesbrowse.online/robots.txt`
- Initial indexable URLs: `/`, `/release-date/`, and `/about/`

The guide queue on the home page is intentionally not represented by crawlable guide URLs. Do not add guide routes to the sitemap until they contain tested, first-hand content.

## Owner Steps

1. Open Google Search Console while signed into the account that will own this property.
2. Add `gamesbrowse.online` as a **Domain property**.
3. Publish the DNS TXT record that Google supplies at the domain's DNS provider, then complete verification in Search Console.
4. In **Sitemaps**, submit `https://gamesbrowse.online/sitemap.xml`.
5. Use **URL Inspection** on the home page and `/release-date/`, confirm the live test sees HTTP 200, the self-referencing canonical, and an indexable page, then request indexing.
6. Check the Pages deployment and Search Console coverage report after Google has crawled the site. Keep the legacy `/games/*`, `/category/*`, and `/categories/*` URLs as `410 Gone`; do not redirect them to the home page.

## Deployment Checks

Before submitting, verify these production addresses load without a login wall:

```text
https://gamesbrowse.online/
https://gamesbrowse.online/release-date/
https://gamesbrowse.online/sitemap.xml
https://gamesbrowse.online/robots.txt
```

`npm run seo:check` validates the generated HTML before deployment. It checks the sitemap allowlist and `lastmod` values, self-canonicals, titles, descriptions, a single H1, social images, JSON-LD, crawl directives, and the official media files.

## Deliberately Not Automated

Google's verification token and account-level submission cannot be committed safely or performed without the property owner's Google account. The DNS verification step above is the only remaining owner action once the production URLs pass the deployment checks.
