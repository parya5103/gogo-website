#!/usr/bin/env node
/**
 * Refresh root sitemap lastmod values from Git history and notify IndexNow
 * about changed, public HTML pages. No paid API or third-party dependency.
 */
import { readFile, writeFile, stat } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { resolve, extname } from "node:path";

const ROOT = process.cwd();
const SITEMAP = resolve(ROOT, "sitemap.xml");
const DOMAIN = "https://gogocompany.in";
const INDEXNOW_KEY = "gogocompanyin2026indexnowkey";
const KEY_LOCATION = `${DOMAIN}/indexnow-key.txt`;

function git(args) {
  try {
    return execFileSync("git", args, { cwd: ROOT, encoding: "utf8" }).trim();
  } catch {
    return "";
  }
}

function changedPaths() {
  return git(["status", "--porcelain", "--untracked-files=all"])
    .split("\n")
    .filter(Boolean)
    .map((line) => line.slice(3).replace(/^"|"$/g, ""))
    .filter(Boolean);
}

function toPublicUrl(file) {
  const normalized = file.replaceAll("\\", "/").replace(/^\.\//, "");
  if (!normalized.endsWith(".html")) return null;
  let path = normalized.replace(/\/index\.html$/i, "/");
  if (path === "index.html") path = "";
  if (!path.startsWith("/")) path = "/" + path;
  return new URL(path, DOMAIN).href;
}

function sitemapFileForUrl(url) {
  const pathname = new URL(url).pathname;
  let relative = decodeURIComponent(pathname).replace(/^\/+/, "");
  if (!relative || relative.endsWith("/")) relative += "index.html";
  if (!extname(relative)) relative += "/index.html";
  const candidate = resolve(ROOT, relative);
  if (!candidate.startsWith(ROOT + "/") && candidate !== resolve(ROOT, "index.html")) {
    return null;
  }
  return candidate;
}

async function lastModified(url, changed) {
  const file = sitemapFileForUrl(url);
  if (!file) return null;
  try {
    await stat(file);
  } catch {
    return null;
  }
  const relative = file.slice(ROOT.length + 1);
  if (changed.has(relative)) return new Date().toISOString().slice(0, 10);
  const committed = git(["log", "-1", "--format=%cI", "--", relative]);
  if (committed) {
    const date = new Date(committed);
    if (!Number.isNaN(date.getTime())) return date.toISOString().slice(0, 10);
  }
  return null;
}

const changed = new Set(changedPaths());
let xml = await readFile(SITEMAP, "utf8");
const urlBlocks = [...xml.matchAll(/<url>\s*([\s\S]*?)\s*<\/url>/g)];
for (const match of urlBlocks) {
  const block = match[0];
  const loc = block.match(/<loc>\s*([^<]+)\s*<\/loc>/);
  if (!loc) continue;
  const date = await lastModified(loc[1].trim(), changed);
  if (!date) continue;
  const updated = /<lastmod>[^<]*<\/lastmod>/.test(block)
    ? block.replace(/<lastmod>[^<]*<\/lastmod>/, `<lastmod>${date}</lastmod>`)
    : block.replace(/<loc>\s*([^<]+)\s*<\/loc>/, `<loc>$1</loc>\n    <lastmod>${date}</lastmod>`);
  xml = xml.replace(block, updated);
}
await writeFile(SITEMAP, xml.endsWith("\n") ? xml : xml + "\n", "utf8");
console.log(`Updated sitemap lastmod values for ${urlBlocks.length} URL entries.`);

const urls = [...new Set([...changed].map(toPublicUrl).filter(Boolean))];
if (urls.length) {
  const payload = {
    host: new URL(DOMAIN).hostname,
    key: INDEXNOW_KEY,
    keyLocation: KEY_LOCATION,
    urlList: urls.slice(0, 10000)
  };
  try {
    const response = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "content-type": "application/json; charset=utf-8" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(15000)
    });
    if (response.ok || response.status === 202) {
      console.log(`IndexNow accepted notification for ${payload.urlList.length} changed URLs (HTTP ${response.status}).`);
    } else {
      console.warn(`IndexNow returned HTTP ${response.status}; sitemap publication will continue.`);
    }
  } catch (error) {
    console.warn("IndexNow notification failed; sitemap publication will continue:", error.message);
  }
} else {
  console.log("No changed HTML pages detected; IndexNow notification skipped.");
}
