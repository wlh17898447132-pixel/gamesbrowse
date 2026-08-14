import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const distDir = path.join(root, "dist");
const siteUrl = "https://gamesbrowse.online";
const sitemapPath = path.join(distDir, "sitemap.xml");
const robotsPath = path.join(distDir, "robots.txt");
const pageRules = {
  "https://gamesbrowse.online/": {
    structuredData: ["WebSite", "BreadcrumbList", "VideoObject"]
  },
  "https://gamesbrowse.online/release-date/": {
    structuredData: ["WebSite", "BreadcrumbList", "Article"]
  },
  "https://gamesbrowse.online/about/": {
    structuredData: ["WebSite", "BreadcrumbList"]
  }
};

function fail(message) {
  throw new Error(message);
}

function readFile(filePath) {
  if (!fs.existsSync(filePath)) {
    fail(`Missing file: ${path.relative(root, filePath)}`);
  }

  return fs.readFileSync(filePath, "utf8");
}

function getUrlsFromSitemap(xml) {
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1].trim());
}

function getLastmodsFromSitemap(xml) {
  return [...xml.matchAll(/<lastmod>([^<]+)<\/lastmod>/g)].map((match) => match[1].trim());
}

function urlToHtmlPath(url) {
  const parsed = new URL(url);
  if (parsed.origin !== siteUrl) {
    fail(`Sitemap URL uses unexpected origin: ${url}`);
  }

  if (parsed.search || parsed.hash) {
    fail(`Sitemap URL must not include query or hash: ${url}`);
  }

  const pathname = parsed.pathname;
  if (pathname !== "/" && !pathname.endsWith("/")) {
    fail(`Sitemap URL is not a final trailing-slash URL: ${url}`);
  }

  return pathname === "/"
    ? path.join(distDir, "index.html")
    : path.join(distDir, pathname, "index.html");
}

function getSingleMatch(html, regex, label, url) {
  const matches = [...html.matchAll(regex)];
  if (matches.length !== 1) {
    fail(`${url} must have exactly one ${label}; found ${matches.length}`);
  }

  return matches[0][1].trim();
}

function getStructuredData(html, url) {
  const matches = [
    ...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)
  ];

  return matches.map((match) => {
    try {
      return JSON.parse(match[1]);
    } catch {
      fail(`${url} contains invalid JSON-LD`);
    }
  });
}

function checkPage(url) {
  const rule = pageRules[url];
  if (!rule) fail(`${url} is not an approved indexable URL`);

  const htmlPath = urlToHtmlPath(url);
  const html = readFile(htmlPath);
  const title = getSingleMatch(html, /<title>([^<]+)<\/title>/gi, "title", url);
  const description = getSingleMatch(
    html,
    /<meta\s+name="description"\s+content="([^"]*)"\s*\/?>/gi,
    "meta description",
    url
  );
  const canonical = getSingleMatch(
    html,
    /<link\s+rel="canonical"\s+href="([^"]+)"\s*\/?>/gi,
    "canonical",
    url
  );
  const ogImage = getSingleMatch(
    html,
    /<meta\s+property="og:image"\s+content="([^"]+)"\s*\/?>/gi,
    "Open Graph image",
    url
  );
  const twitterCard = getSingleMatch(
    html,
    /<meta\s+name="twitter:card"\s+content="([^"]+)"\s*\/?>/gi,
    "Twitter card",
    url
  );
  const h1Matches = [...html.matchAll(/<h1(?:\s[^>]*)?>([\s\S]*?)<\/h1>/gi)];
  const robotsMatches = [...html.matchAll(/<meta\s+name="robots"\s+content="([^"]*)"\s*\/?>/gi)];
  const structuredData = getStructuredData(html, url);
  const structuredTypes = structuredData.map((entry) => entry["@type"]);

  if (!title) fail(`${url} has an empty title`);
  if (!description) fail(`${url} has an empty meta description`);
  if (title.length < 30 || title.length > 70) fail(`${url} title length must be 30-70 characters`);
  if (description.length < 70 || description.length > 180) {
    fail(`${url} description length must be 70-180 characters`);
  }
  if (canonical !== url) fail(`${url} canonical is not self-referencing: ${canonical}`);
  if (h1Matches.length !== 1) fail(`${url} must have exactly one H1; found ${h1Matches.length}`);
  if (!ogImage.startsWith(`${siteUrl}/media/`)) fail(`${url} uses an unexpected Open Graph image`);
  if (twitterCard !== "summary_large_image") fail(`${url} must use a large Twitter card`);

  for (const type of rule.structuredData) {
    if (!structuredTypes.includes(type)) fail(`${url} is missing ${type} JSON-LD`);
  }

  for (const match of robotsMatches) {
    if (match[1].toLowerCase().includes("noindex")) {
      fail(`${url} has noindex robots meta`);
    }
  }
}

const robots = readFile(robotsPath);
if (!/User-agent:\s*\*/i.test(robots)) fail("robots.txt is missing User-agent: *");
if (!/Allow:\s*\//i.test(robots)) fail("robots.txt does not allow crawling");
if (!new RegExp(`Sitemap:\\s*${siteUrl.replaceAll(".", "\\.")}/sitemap\\.xml`, "i").test(robots)) {
  fail("robots.txt is missing the canonical sitemap URL");
}

const sitemap = readFile(sitemapPath);
const urls = getUrlsFromSitemap(sitemap);
const lastmods = getLastmodsFromSitemap(sitemap);
if (urls.length === 0) fail("sitemap.xml contains no URLs");
if (urls.length !== Object.keys(pageRules).length) fail("sitemap.xml has an unexpected URL count");
if (lastmods.length !== urls.length) fail("Every sitemap URL must include a lastmod date");
for (const lastmod of lastmods) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(lastmod)) fail(`Invalid sitemap lastmod: ${lastmod}`);
}

const duplicateUrls = urls.filter((url, index) => urls.indexOf(url) !== index);
if (duplicateUrls.length > 0) {
  fail(`sitemap.xml contains duplicate URLs: ${[...new Set(duplicateUrls)].join(", ")}`);
}

for (const url of urls) {
  checkPage(url);
}

for (const mediaPath of [
  path.join(distDir, "media", "chaos-front-hero.webp"),
  path.join(distDir, "media", "chaos-front-share.webp"),
  path.join(distDir, "media", "chaos-front-official-trailer.mp4")
]) {
  if (!fs.existsSync(mediaPath)) fail(`Missing production media: ${path.relative(root, mediaPath)}`);
}

console.log(`SEO check passed for ${urls.length} sitemap URLs.`);
