import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const distDir = path.join(root, "dist");
const siteUrl = "https://gamesbrowse.online";
const sitemapPath = path.join(distDir, "sitemap.xml");
const robotsPath = path.join(distDir, "robots.txt");

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

function checkPage(url) {
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
  const h1Matches = [...html.matchAll(/<h1(?:\s[^>]*)?>([\s\S]*?)<\/h1>/gi)];
  const robotsMatches = [...html.matchAll(/<meta\s+name="robots"\s+content="([^"]*)"\s*\/?>/gi)];

  if (!title) fail(`${url} has an empty title`);
  if (!description) fail(`${url} has an empty meta description`);
  if (canonical !== url) fail(`${url} canonical is not self-referencing: ${canonical}`);
  if (h1Matches.length < 1) fail(`${url} is missing an H1`);

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
if (urls.length === 0) fail("sitemap.xml contains no URLs");

const duplicateUrls = urls.filter((url, index) => urls.indexOf(url) !== index);
if (duplicateUrls.length > 0) {
  fail(`sitemap.xml contains duplicate URLs: ${[...new Set(duplicateUrls)].join(", ")}`);
}

for (const url of urls) {
  checkPage(url);
}

console.log(`SEO check passed for ${urls.length} sitemap URLs.`);
