#!/usr/bin/env node
import { readFile, writeFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";

const ROOT = process.cwd();
const DOMAIN = "https://gogocompany.in";
const RSS_URL = "https://trends.google.com/trending/rss?geo=IN";
const START = "<!-- GOGO-TRENDING-START -->";
const END = "<!-- GOGO-TRENDING-END -->";

export function decodeEntities(value = "") {
  const named = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'" };
  return String(value).replace(/&(#x[0-9a-f]+|#\d+|amp|lt|gt|quot|apos);/gi, (entity, token) => {
    if (token[0] !== "#") return named[token.toLowerCase()] ?? entity;
    const codePoint = token[1].toLowerCase() === "x"
      ? Number.parseInt(token.slice(2), 16)
      : Number.parseInt(token.slice(1), 10);
    if (!Number.isInteger(codePoint) || codePoint < 0 || codePoint > 0x10ffff ||
        (codePoint >= 0xd800 && codePoint <= 0xdfff)) return entity;
    return String.fromCodePoint(codePoint);
  });
}
export function serializeJsonLd(value, space = 0) {
  return JSON.stringify(value, null, space).replace(/[<>&]/g, character => ({
    "<": "\\u003c", ">": "\\u003e", "&": "\\u0026"
  })[character]);
}
export function escapeHtml(value = "") {
  return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
export function safeUrl(value, base = DOMAIN) {
  try { const url = new URL(value, base); return ["https:", "http:"].includes(url.protocol) ? url.href : null; }
  catch { return null; }
}
export function parseGoogleTrendsRss(xml = "") {
  const items = [];
  for (const match of xml.matchAll(/<item\b[^>]*>([\s\S]*?)<\/item>/gi)) {
    const block = match[1];
    const read = tag => decodeEntities(block.match(new RegExp("<" + tag + "(?:\\s[^>]*)?>([\\s\\S]*?)<\\/" + tag + ">", "i"))?.[1]?.replace(/<!\[CDATA\[|\]\]>/g, "").trim() || "");
    const title = read("title");
    if (title) items.push({ title, traffic: read("ht:approx_traffic"), link: safeUrl(read("link")) });
  }
  return items;
}
async function readJson(path, fallback) {
  try { return JSON.parse(await readFile(path, "utf8")); } catch { return fallback; }
}
async function fetchTrends() {
  try {
    const response = await fetch(RSS_URL, { headers: { "user-agent": "GoGoCompany-SEO/1.0 (+https://gogocompany.in/)" }, signal: AbortSignal.timeout(12000) });
    if (!response.ok) throw new Error("Google Trends RSS returned HTTP " + response.status);
    return parseGoogleTrendsRss(await response.text()).slice(0, 12);
  } catch (error) {
    console.warn("Google Trends feed unavailable; using synced product data only:", error.message);
    return [];
  }
}
function renderList(items, emptyText) {
  if (!items.length) return '<p class="trending-empty">' + escapeHtml(emptyText) + '</p>';
  return '<ul class="trending-list">' + items.map(item => '<li><a href="' + escapeHtml(item.url) + '">' + escapeHtml(item.title) + '</a>' +
    (item.source ? '<span class="trending-source"> · ' + escapeHtml(item.source) + '</span>' : '') + '</li>').join("") + '</ul>';
}
export function renderTrendingSection() {
  return START + '\n<section class="section gogo-trending" aria-labelledby="gogo-trending-title">\n' +
    '<div class="container"><div class="section-head"><h2 id="gogo-trending-title">Explore GoGo Company products</h2><p>Choose a product by the task you want to do. Each product has its own instructions, support information and detailed pages.</p></div>' +
    '<div class="trending-grid">' +
    '<section aria-labelledby="gogo-arrow-out"><h3 id="gogo-arrow-out">Arrow Out! — logic puzzle</h3><p>Plan a safe order to clear directional arrows from a crowded board. Learn the controls, hints and puzzle rules in the game guide.</p><p><a href="/arrowout/">Play Arrow Out!</a> · <a href="/arrowout/about.html">Read the game guide</a></p></section>' +
    '<section aria-labelledby="gogo-crystal-quest"><h3 id="gogo-crystal-quest">Crystal Quest — match-3 adventure</h3><p>Match neighbouring gems, create special combinations and work through a fantasy puzzle campaign.</p><p><a href="/crystalquest/">Play Crystal Quest</a> · <a href="/crystalquest/guide.html">Read the strategy guide</a></p></section>' +
    '<section aria-labelledby="gogo-sarkari-sarthi"><h3 id="gogo-sarkari-sarthi">Sarkari Sarthi — recruitment information</h3><p>Discover recruitment notices and exam updates. Always check the original recruiting authority notification before applying.</p><p><a href="/sarkari-sarthi/">Explore Sarkari Sarthi</a> · <a href="/disclaimer/">Read our information disclaimer</a></p></section>' +
    '<section aria-labelledby="gogo-pikanews"><h3 id="gogo-pikanews">PikaNews — publisher-attributed news</h3><p>Browse headlines by topic and continue to the original publisher for full reporting and context.</p><p><a href="/pikanews/">Explore PikaNews</a> · <a href="/pikanews/sources.html">See our source policy</a></p></section>' +
    '<section aria-labelledby="gogo-gta-guide"><h3 id="gogo-gta-guide">GTA 6 — independent reference guide</h3><p>Review a structured guide that distinguishes official announcements from information that remains unconfirmed.</p><p><a href="/gta6/">Open the GTA 6 guide</a></p></section>' +
    '</div></div></section>\n' + END;
}
export async function updateTrendingSeo(root = ROOT) {
  const section = renderTrendingSection();
  let html = await readFile(root + "/index.html", "utf8");
  const markerPattern = /<!-- GOGO-TRENDING-START -->[\s\S]*?<!-- GOGO-TRENDING-END -->/;
  html = markerPattern.test(html) ? html.replace(markerPattern, section) : html.replace(/<\/main>/i, section + "\n</main>");
  await writeFile(root + "/index.html", html.endsWith("\n") ? html : html + "\n");
  console.log("Homepage product directory refreshed; external feed headlines are kept on their dedicated product pages.");
  return { products: 5 };
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await updateTrendingSeo();
