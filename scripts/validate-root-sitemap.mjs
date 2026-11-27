#!/usr/bin/env node
/**
 * Validate the root GoGo Company sitemap against the files that GitHub Pages
 * will publish. This is a build-time consistency check, not an indexing claim.
 */
import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import { relative, resolve, sep } from "node:path";

const root = process.cwd();
const sitemapPath = resolve(root, "sitemap.xml");
const robotsPath = resolve(root, "robots.txt");
const sitemap = await readFile(sitemapPath, "utf8");
const robots = await readFile(robotsPath, "utf8");
const base = new URL("https://gogocompany.in/");

assert.match(robots, /^Sitemap:\s*https:\/\/gogocompany\.in\/sitemap\.xml\s*$/im,
  "robots.txt must advertise the canonical root sitemap");

const urls = [...sitemap.matchAll(/<url>\s*([\s\S]*?)\s*<\/url>/gi)];
assert.ok(urls.length > 0, "root sitemap must contain at least one URL");

const seen = new Set();
const failures = [];
let checked = 0;

function localFileForUrl(rawUrl) {
  const url = new URL(rawUrl);
  assert.equal(url.origin, base.origin, "sitemap URL must use the canonical HTTPS host");
  assert.equal(url.search, "", "sitemap URL must not contain query parameters");
  assert.equal(url.hash, "", "sitemap URL must not contain fragments");
  assert.ok(url.pathname.startsWith("/"), "sitemap URL path must be absolute");

  let pathname = decodeURIComponent(url.pathname);
  if (pathname.endsWith("/")) pathname += "index.html";
  let candidate = resolve(root, "." + pathname);
  const rel = relative(root, candidate);
  assert.ok(rel && !rel.startsWith(".." + sep) && rel !== "..",
    "sitemap URL must resolve inside the published site");
  return candidate;
}

for (const [, block] of urls) {
  const loc = block.match(/<loc>\s*([^<]+)\s*<\/loc>/i)?.[1]?.trim();
  if (!loc) {
    failures.push("Sitemap entry is missing <loc>");
    continue;
  }
  if (seen.has(loc)) {
    failures.push("Duplicate URL: " + loc);
    continue;
  }
  seen.add(loc);

  const lastmod = block.match(/<lastmod>\s*([^<]+)\s*<\/lastmod>/i)?.[1]?.trim();
  if (lastmod && !/^\d{4}-\d{2}-\d{2}(?:T[^\s]+)?$/.test(lastmod)) {
    failures.push("Invalid lastmod value for " + loc + ": " + lastmod);
  }

  try {
    const file = localFileForUrl(loc);
    await stat(file);
    const html = await readFile(file, "utf8");
    const canonical = html.match(/<link\b(?=[^>]*\brel=["']canonical["'])[^>]*\bhref=["']([^"']+)["'][^>]*>/i)?.[1];
    const robotsTag = html.match(/<meta\b(?=[^>]*\bname=["']robots["'])[^>]*>/i)?.[0] || "";
    const robotsContent = robotsTag.match(/\bcontent=["']([^"']+)["']/i)?.[1] || "";
    if (!canonical) failures.push("Missing canonical: " + loc);
    else {
      const canonicalUrl = new URL(canonical, base);
      const sitemapUrl = new URL(loc);
      if (canonicalUrl.origin !== sitemapUrl.origin ||
          canonicalUrl.pathname.replace(/\/$/, "") !== sitemapUrl.pathname.replace(/\/$/, "") ||
          canonicalUrl.search !== "" || canonicalUrl.hash !== "") {
        failures.push("Canonical mismatch: " + loc + " -> " + canonical);
      }
    }
    if (/\bnoindex\b/i.test(robotsContent)) {
      failures.push("Sitemap URL is marked noindex: " + loc);
    }
    checked++;
  } catch (error) {
    failures.push("Cannot validate " + loc + ": " + error.message);
  }
}

if (failures.length) {
  for (const failure of failures) console.error("ERROR:", failure);
  throw new Error("Root sitemap validation failed: " + failures.length + " issue(s), " + checked + " page(s) checked");
}

console.log("Root sitemap validation passed: " + checked + " unique URLs resolve to published, canonical, indexable pages.");
