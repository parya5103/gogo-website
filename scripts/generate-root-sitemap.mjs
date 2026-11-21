#!/usr/bin/env node
/**
 * Rebuild the root sitemap from the existing curated URL allowlist.
 * Only existing, self-canonical, indexable pages on gogocompany.in survive.
 * Product sub-portals keep their own sitemaps; this script never crawls or
 * guesses URLs and never includes noindex or redirect routes.
 */
import { readFile, writeFile, access } from "node:fs/promises";
import { resolve } from "node:path";

const ROOT = process.cwd();
const DOMAIN = "https://gogocompany.in";
const SITEMAP = resolve(ROOT, "sitemap.xml");
const REQUIRED = [
  "/", "/about/", "/contact/", "/privacy-policy/", "/terms-and-conditions/",
  "/disclaimer/", "/free-online-games/", "/gta6/", "/arrowout/",
  "/crystalquest/", "/sarkari-sarthi/", "/ai/"
];

function fileForPath(path) {
  const clean = decodeURIComponent(path).replace(/^\/+/, "");
  return clean.endsWith("/") || !clean ? (clean ? clean + "index.html" : "index.html") : clean;
}
function readTag(html, regex) { return html.match(regex)?.[1]?.trim() || ""; }
function parseBlocks(xml) {
  return [...xml.matchAll(/<url>\s*([\s\S]*?)\s*<\/url>/gi)].map(match => match[1]);
}
function xmlEscape(value) {
  return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}

export async function generateRootSitemap(root = ROOT) {
  const sitemapPath = resolve(root, "sitemap.xml");
  const original = await readFile(sitemapPath, "utf8");
  const existing = new Map();
  for (const block of parseBlocks(original)) {
    const loc = readTag(block, /<loc>\s*([^<]+)\s*<\/loc>/i);
    if (!loc) continue;
    try {
      const url = new URL(loc);
      if (url.origin !== DOMAIN || url.search || url.hash || url.pathname.endsWith("/index.html") || url.pathname === "/about.html") continue;
      existing.set(url.pathname, block);
    } catch {}
  }
  for (const path of REQUIRED) if (!existing.has(path)) existing.set(path, "");

  const output = [];
  const failures = [];
  for (const [pathname, oldBlock] of existing) {
    const url = DOMAIN + pathname;
    const relative = fileForPath(pathname);
    let html;
    try { html = await readFile(resolve(root, relative), "utf8"); }
    catch { failures.push(pathname + " (missing file)"); continue; }
    const canonical = readTag(html, /<link\b[^>]*\brel=["']canonical["'][^>]*\bhref=["']([^"']+)["'][^>]*>/i);
    const robots = readTag(html, /<meta\b[^>]*\bname=["']robots["'][^>]*\bcontent=["']([^"']+)["'][^>]*>/i);
    if (canonical !== url || /\bnoindex\b/i.test(robots)) continue;
    const lastmod = readTag(oldBlock, /<lastmod>\s*(\d{4}-\d{2}-\d{2})\s*<\/lastmod>/i) || new Date().toISOString().slice(0, 10);
    const changefreq = readTag(oldBlock, /<changefreq>\s*([^<]+)\s*<\/changefreq>/i) || "weekly";
    const priority = readTag(oldBlock, /<priority>\s*(0(?:\.\d+)?|1(?:\.0+)?)\s*<\/priority>/i) || (pathname === "/" ? "1.0" : "0.6");
    output.push({ pathname, block: "  <url><loc>" + xmlEscape(url) + "</loc><lastmod>" + lastmod + "</lastmod><changefreq>" + changefreq + "</changefreq><priority>" + priority + "</priority></url>" });
  }
  if (failures.length) throw new Error("Required sitemap routes are missing: " + failures.join(", "));
  output.sort((a, b) => a.pathname === "/" ? -1 : b.pathname === "/" ? 1 : a.pathname.localeCompare(b.pathname));
  const xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    output.map(item => item.block).join("\n") + "\n</urlset>\n";
  await writeFile(sitemapPath, xml, "utf8");
  console.log("Generated root sitemap with " + output.length + " existing, self-canonical, indexable URLs.");
  return { count: output.length, urls: output.map(item => DOMAIN + item.pathname), xml };
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(new URL(import.meta.url).pathname)) {
  await generateRootSitemap();
}
