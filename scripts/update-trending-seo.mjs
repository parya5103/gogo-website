#!/usr/bin/env node
import { readFile, writeFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";

const ROOT = process.cwd();
const DOMAIN = "https://gogocompany.in";
const RSS_URL = "https://trends.google.com/trending/rss?geo=IN";
const START = "<!-- GOGO-TRENDING-START -->";
const END = "<!-- GOGO-TRENDING-END -->";

export function decodeEntities(value = "") {
  return String(value).replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)));
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
export function renderTrendingSection({ jobs = [], news = [], trends = [] } = {}) {
  const jobItems = jobs.slice(0, 6).map(job => ({ title: job.title, url: safeUrl(job.url || job.original_source_url), source: job.source }));
  const newsItems = news.slice(0, 6).map(item => ({ title: item.title, url: safeUrl(item.url), source: item.source }));
  const trendTags = trends.slice(0, 10).map(item => '<li><a href="' + escapeHtml(item.link || DOMAIN + "/pikanews/trending.html") + '">' + escapeHtml(item.title) + '</a></li>').join("");
  return START + '\n<section class="section gogo-trending" aria-labelledby="gogo-trending-title">\n' +
    '<div class="container"><div class="section-head"><h2 id="gogo-trending-title">Today on GoGo Company</h2><p>Fresh links from the latest synced public listings and publisher-attributed news. Check original sources before acting on time-sensitive information.</p></div>\n' +
    '<div class="trending-grid"><section aria-labelledby="trending-jobs"><h3 id="trending-jobs">🔥 Trending Sarkari Jobs &amp; Exams Today</h3>' +
    renderList(jobItems, "No current job listings are available in the synced feed. Visit Sarkari Sarthi for the latest collection.") +
    '<p><a href="/sarkari-sarthi/">Browse all Sarkari Sarthi updates</a></p></section>\n' +
    '<section aria-labelledby="trending-news"><h3 id="trending-news">⚡ Breaking &amp; Trending News (PikaNews Live)</h3>' +
    renderList(newsItems, "The latest PikaNews headlines will appear here after the next successful feed sync.") +
    (trendTags ? '<h4>Trending searches in India</h4><ul class="trending-tags">' + trendTags + '</ul>' : '') +
    '<p><a href="/pikanews/trending.html">Explore PikaNews trending</a></p></section>\n' +
    '<section aria-labelledby="trending-games"><h3 id="trending-games">🎮 Most Played Free Browser Games</h3><ul class="trending-list">' +
    '<li><a href="/arrowout/">Play Arrow Out! — free arrow puzzle game online</a></li>' +
    '<li><a href="/crystalquest/">Play Crystal Quest — free Match-3 puzzle adventure</a></li></ul></section></div></div></section>\n' + END;
}
export async function updateTrendingSeo(root = ROOT, trendItems) {
  const trends = trendItems ?? await fetchTrends();
  const manifest = await readJson(root + "/sarkari-sarthi/jobs/job_manifest.json", { jobs: [] });
  const rawNews = await readJson(root + "/pikanews/data/latest.json", []);
  const jobs = (Array.isArray(manifest.jobs) ? manifest.jobs : []).filter(job =>
    job && String(job.status || "").toLowerCase() === "active" && safeUrl(job.url || job.original_source_url))
    .sort((a, b) => Date.parse(b.published_date || b.scraped_at || b.last_verified || 0) - Date.parse(a.published_date || a.scraped_at || a.last_verified || 0));
  const news = (Array.isArray(rawNews) ? rawNews : []).filter(item =>
    item && item.thin !== true && item.title && safeUrl(item.url))
    .sort((a, b) => Date.parse(b.published_at || b.collection_timestamp || 0) - Date.parse(a.published_at || a.collection_timestamp || 0));
  const section = renderTrendingSection({ jobs, news, trends });
  let html = await readFile(root + "/index.html", "utf8");
  const markerPattern = /<!-- GOGO-TRENDING-START -->[\s\S]*?<!-- GOGO-TRENDING-END -->/;
  html = markerPattern.test(html) ? html.replace(markerPattern, section) : html.replace(/<\/main>/i, section + "\n</main>");
  const scriptPattern = /<script\s+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/i;
  const match = html.match(scriptPattern);
  if (match) {
    try {
      const graph = JSON.parse(match[1]);
      graph["@graph"] = Array.isArray(graph["@graph"]) ? graph["@graph"].filter(node => node["@id"] !== DOMAIN + "/#daily-updates") : [];
      const entries = [
        ...jobs.slice(0, 6).map(job => ({ name: job.title, url: safeUrl(job.url || job.original_source_url) })),
        ...news.slice(0, 6).map(item => ({ name: item.title, url: safeUrl(item.url) }))
      ].filter(item => item.url).map((item, index) => ({ "@type": "ListItem", position: index + 1, name: item.name, url: item.url }));
      graph["@graph"].push({ "@type": "ItemList", "@id": DOMAIN + "/#daily-updates", name: "Latest GoGo Company updates", dateModified: new Date().toISOString(), numberOfItems: entries.length, itemListElement: entries });
      html = html.replace(match[0], '<script type="application/ld+json">\n' + JSON.stringify(graph, null, 2) + '\n</script>');
    } catch (error) { console.warn("Existing homepage JSON-LD was not changed:", error.message); }
  }
  await writeFile(root + "/index.html", html.endsWith("\n") ? html : html + "\n");
  console.log("Trending homepage section updated:", jobs.length, "active jobs;", news.length, "news items;", trends.length, "trending terms.");
  return { jobs: jobs.length, news: news.length, trends: trends.length };
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await updateTrendingSeo();
