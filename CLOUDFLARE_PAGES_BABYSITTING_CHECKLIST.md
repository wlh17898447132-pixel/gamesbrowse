# Cloudflare Pages Release Checklist

- [ ] The deployment uses the `main` branch and `npm run build`.
- [ ] The `dist` directory is selected as the Pages output.
- [ ] `https://gamesbrowse.online/` returns HTTP 200.
- [ ] `https://gamesbrowse.online/about/` returns HTTP 200.
- [ ] `https://gamesbrowse.online/robots.txt` names `https://gamesbrowse.online/sitemap.xml`.
- [ ] The sitemap contains only intended indexable canonical URLs.
- [ ] HTTP and `www` URLs redirect in one hop to the canonical HTTPS host.
- [ ] Old `/games/`, `/category/`, and `/categories/` URLs return HTTP 410 and do not redirect to the homepage.
- [ ] An exported legacy URL inventory has a documented 301, 404, or 410 decision per URL.
- [ ] Google Search Console has verified the domain and received the current sitemap.
