import { site } from "../data/site";

export const prerender = true;

export function GET() {
  const origin = site.url.endsWith("/") ? site.url : `${site.url}/`;
  const sitemapUrl = new URL("sitemap.xml", origin).toString();
  const body = `User-agent: *\nAllow: /\n\nSitemap: ${sitemapUrl}\n`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8"
    }
  });
}
