import { site } from "../data/site";
import { getSitemapEntries } from "../data/search";

export const prerender = true;

const origin = site.url.endsWith("/") ? site.url : `${site.url}/`;

function toAbsolute(path) {
  const normalizedPath = path === "/" ? "" : path.replace(/^\//, "");
  return new URL(normalizedPath, origin).toString();
}

function escapeXml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export function GET() {
  const urls = getSitemapEntries()
    .map(
      (entry) => `  <url>
    <loc>${escapeXml(toAbsolute(entry.path))}</loc>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`
    )
    .join("\n");

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8"
    }
  });
}
