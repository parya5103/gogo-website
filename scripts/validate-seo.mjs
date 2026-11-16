#!/usr/bin/env node
/**
 * Dependency-free checks for the GoGo hub's critical SEO signals.
 * This is intentionally structural: it does not claim to predict rankings.
 */
import { readFile } from "node:fs/promises";

const html = await readFile("index.html", "utf8");
const sitemap = await readFile("sitemap.xml", "utf8");
const robots = await readFile("robots.txt", "utf8");

function one(pattern, label) {
  const matches = [...html.matchAll(pattern)];
  if (matches.length !== 1) throw new Error(`Expected exactly one ${label}; found ${matches.length}`);
  return matches[0][1].trim();
}

const title = one(/<title>([\s\S]*?)<\/title>/gi, "title");
const description = one(/<meta\s+name=["']description["']\s+content=["']([^"']*)["'][^>]*>/gi, "meta description");
const canonical = one(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["'][^>]*>/gi, "canonical URL");
if (title.length < 25 || title.length > 65) throw new Error(`Title length out of range: ${title.length}`);
if (description.length < 70 || description.length > 170) throw new Error(`Description length out of range: ${description.length}`);
if (canonical !== "https://gogocompany.in/") throw new Error(`Unexpected homepage canonical: ${canonical}`);
if (/<meta\s+name=["']keywords["']/i.test(html)) throw new Error("Obsolete meta keywords tag must not be used");

const jsonLdBlocks = [...html.matchAll(/<script\s+type=["']application\/ld\+json["']\s*>([\s\S]*?)<\/script>/gi)];
if (!jsonLdBlocks.length) throw new Error("No JSON-LD block found");
const graphTypes = new Set();
for (const match of jsonLdBlocks) {
  const parsed = JSON.parse(match[1]);
  for (const node of (parsed["@graph"] || [parsed])) graphTypes.add(node["@type"]);
}
for (const required of ["Organization", "WebSite", "ItemList"]) {
  if (!graphTypes.has(required)) throw new Error(`Missing JSON-LD type: ${required}`);
}

const locs = [...sitemap.matchAll(/<loc>\s*([^<]+)\s*<\/loc>/gi)].map((m) => m[1].trim());
if (!locs.length) throw new Error("Root sitemap contains no URLs");
if (new Set(locs).size !== locs.length) throw new Error("Root sitemap contains duplicate URLs");
for (const url of locs) {
  const parsed = new URL(url);
  if (parsed.protocol !== "https:" || parsed.hostname !== "gogocompany.in") {
    throw new Error(`Unexpected sitemap URL: ${url}`);
  }
}
if (!robots.includes("Sitemap: https://gogocompany.in/sitemap.xml")) {
  throw new Error("robots.txt does not reference the root sitemap");
}
console.log(`SEO validation passed: title ${title.length} chars, description ${description.length} chars, ${jsonLdBlocks.length} JSON-LD block(s), ${locs.length} unique root sitemap URLs.`);
