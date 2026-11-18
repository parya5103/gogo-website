#!/usr/bin/env node
import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";

const root = process.cwd();
const sitemap = await readFile(join(root, "pikanews/news-sitemap.xml"), "utf8");
const blocks = [...sitemap.matchAll(/<url>([\s\S]*?)<\/url>/gi)].map(match => match[1]);
assert.ok(blocks.length > 0, "At least one recent PikaNews article should be discoverable");
assert.ok(blocks.length <= 1000, "Google News sitemap must contain at most 1,000 URLs");
assert.match(sitemap, /xmlns:news=["']http:\/\/www\.google\.com\/schemas\/sitemap-news\/0\.9["']/);
const dirs = await readdir(join(root, "pikanews/news"), { withFileTypes: true });
const now = Date.now();
for (const block of blocks) {
  const loc = block.match(/<loc>([^<]+)<\/loc>/)?.[1];
  const pub = block.match(/<news:publication_date>([^<]+)<\/news:publication_date>/)?.[1];
  const title = block.match(/<news:title>([\s\S]*?)<\/news:title>/)?.[1];
  assert.ok(loc && loc.startsWith("https://gogocompany.in/pikanews/news/"), "News URL must be canonical GoGo PikaNews URL");
  assert.ok(pub && title, "Each news entry requires publication date and title");
  const age = now - Date.parse(pub);
  assert.ok(Number.isFinite(age) && age >= -5 * 60 * 1000 && age <= 48 * 60 * 60 * 1000, "News sitemap may only contain articles from the last 48 hours");
  const slug = new URL(loc).pathname.split("/").filter(Boolean).at(-1);
  assert.ok(dirs.some(entry => entry.isDirectory() && entry.name === slug), "News sitemap URL must map to a static article page");
  const html = await readFile(join(root, "pikanews/news", slug, "index.html"), "utf8");
  assert.ok(html.includes('rel="canonical" href="' + loc + '"'), "Article canonical must match news sitemap URL");
  const schemas = [...html.matchAll(/<script\s+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)].map(m => { try { return JSON.parse(m[1]); } catch { return null; } }).filter(Boolean);
  const article = schemas.find(s => s["@type"] === "NewsArticle");
  assert.ok(article, "Every news sitemap URL must contain NewsArticle JSON-LD");
  const description = html.match(/<meta\b(?=[^>]*\bname=["\x27]description["\x27])[^>]*\bcontent="([^"]*)"/i)?.[1] || "";
  const decodedDescription = description.replaceAll("&amp;", "&").replaceAll("&#x27;", "'").replaceAll("&#39;", "'");
  assert.ok(decodedDescription.length >= 70 && decodedDescription.length <= 160, "Article meta description must be 70–160 characters: " + loc + " (got " + decodedDescription.length + ")");
  assert.equal(article.description, decodedDescription, "NewsArticle JSON-LD description must match the HTML meta description");
  assert.ok(article.speakable && article.speakable["@type"] === "SpeakableSpecification", "NewsArticle must expose speakable selectors");
}
console.log("PikaNews SEO validation passed: fresh news sitemap, canonical pages, NewsArticle and speakable metadata.");
