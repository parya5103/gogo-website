#!/usr/bin/env node
/**
 * Rebuild PikaNews Google News sitemap from the synced first-party article index.
 * Only recent, complete, published static article pages are eligible (48-hour window).
 */
import { readFile, readdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const ROOT = process.cwd();
const SITE = "https://gogocompany.in";
const WINDOW_MS = 48 * 60 * 60 * 1000;
const xml = value => String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
const iso = value => { const date = new Date(value); return Number.isFinite(date.getTime()) ? date.toISOString() : null; };

export async function generateNewsSitemap({ root = ROOT, now = new Date() } = {}) {
  const latest = JSON.parse(await readFile(join(root, "pikanews/data/latest.json"), "utf8"));
  if (!Array.isArray(latest)) throw new Error("PikaNews latest.json must contain an array");
  const dirs = await readdir(join(root, "pikanews/news"), { withFileTypes: true });
  const slugs = dirs.filter(entry => entry.isDirectory()).map(entry => entry.name);
  const candidates = latest.filter(item => {
    if (!item || !item.id || !item.title) return false;
    if (item.thin === true || String(item.category).toLowerCase() === "trending") return false;
    if (item.content_type !== "original_editorial" || item.editorial_reviewed !== true) return false;
    if (typeof item.editorial_content !== "string" || item.editorial_content.trim().length < 500) return false;
    if (typeof item.author !== "string" || !item.author.trim()) return false;
    if (!["Person", "Organization"].includes(item.author_type)) return false;
    const published = new Date(item.published_at).getTime();
    const age = now.getTime() - published;
    return Number.isFinite(published) && age >= -5 * 60 * 1000 && age <= WINDOW_MS;
  }).map(item => {
    const slug = slugs.find(name => name.endsWith("-" + String(item.id).slice(0, 8)));
    return slug ? { item, slug, published: iso(item.published_at) } : null;
  }).filter(Boolean).sort((a, b) => Date.parse(b.published) - Date.parse(a.published)).slice(0, 1000);

  const entries = [];
  for (const { item, slug, published } of candidates) {
    const html = await readFile(join(root, "pikanews/news", slug, "index.html"), "utf8");
    const canonical = html.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i)?.[1];
    const articleSchema = [...html.matchAll(/<script\s+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)]
      .map(match => { try { return JSON.parse(match[1]); } catch { return null; } })
      .find(schema => schema && schema["@type"] === "NewsArticle");
    const robots = html.match(/<meta name="robots" content="([^"]+)"/i)?.[1] || "";
    if (!canonical || !canonical.startsWith(SITE + "/pikanews/news/") || !articleSchema || /noindex/i.test(robots)) continue;
    entries.push(
      "  <url>\n" +
      "    <loc>" + xml(canonical) + "</loc>\n" +
      "    <news:news>\n" +
      "      <news:publication><news:name>PikaNews</news:name><news:language>en</news:language></news:publication>\n" +
      "      <news:publication_date>" + published + "</news:publication_date>\n" +
      "      <news:title>" + xml(item.title) + "</news:title>\n" +
      "    </news:news>\n" +
      "  </url>"
    );
  }
  const document = '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">\n' +
    entries.join("\n") + (entries.length ? "\n" : "") + '</urlset>\n';
  await writeFile(join(root, "pikanews/news-sitemap.xml"), document, "utf8");
  console.log("Generated PikaNews news sitemap with " + entries.length + " recent, canonical NewsArticle URLs.");
  return { count: entries.length, document };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await generateNewsSitemap();
