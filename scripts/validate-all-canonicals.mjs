#!/usr/bin/env node
/**
 * Audit every HTML document for one valid canonical URL.
 * Folder index files use trailing-slash routes; explicit .html pages retain
 * their .html URL. Known legacy aliases canonicalize to their destination.
 */
import { readdir, readFile } from "node:fs/promises";
import { resolve, relative, sep } from "node:path";

const ROOT = process.cwd();
const ORIGIN = "https://gogocompany.in";
const SKIP = new Set([".git", "node_modules", ".site-build", "dist", "coverage"]);
const ALIASES = new Map([
  ["about.html", "/about/"],
  ["arrow-out/index.html", "/arrowout/"],
  ["crystal-quest/index.html", "/crystalquest/"],
  ["sarkari/index.html", "/sarkari-sarthi/"]
]);

async function collect(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (entry.isDirectory() && SKIP.has(entry.name)) continue;
    const full = resolve(dir, entry.name);
    if (entry.isDirectory()) out.push(...await collect(full));
    else if (entry.isFile() && /\.html?$/i.test(entry.name)) out.push(full);
  }
  return out;
}

const files = await collect(ROOT);
const failures = [];
for (const file of files) {
  const path = relative(ROOT, file).split(sep).join("/");
  const html = await readFile(file, "utf8");
  const tags = [...html.matchAll(/<link\b(?=[^>]*\brel=["']canonical["'])[^>]*>/gi)];
  if (tags.length !== 1) {
    failures.push(path + ": expected exactly one canonical tag, found " + tags.length);
    continue;
  }
  const href = tags[0][0].match(/\bhref=["']([^"']+)["']/i)?.[1];
  if (!href) {
    failures.push(path + ": canonical tag has no href");
    continue;
  }
  let url;
  try { url = new URL(href); } catch {
    failures.push(path + ": canonical URL is not absolute HTTPS: " + href);
    continue;
  }
  if (url.origin !== ORIGIN || url.search || url.hash) {
    failures.push(path + ": canonical must be an absolute GoGo URL without query/hash: " + href);
    continue;
  }
  let expected = ALIASES.get(path);
  if (!expected) {
    if (path === "index.html") expected = "/";
    else if (path.endsWith("/index.html")) expected = "/" + path.slice(0, -"index.html".length);
    else expected = "/" + path;
  }
  if (url.pathname !== expected) failures.push(path + ": canonical path mismatch; expected " + expected + ", found " + url.pathname);
}

console.log("Audited " + files.length + " HTML files for canonical integrity.");
if (failures.length) {
  console.error(failures.slice(0, 100).join("\n"));
  if (failures.length > 100) console.error("... and " + (failures.length - 100) + " more");
  process.exitCode = 1;
} else console.log("PASS: every HTML file has one valid, self-consistent canonical URL.");
