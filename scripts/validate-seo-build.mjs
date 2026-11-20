#!/usr/bin/env node
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = path => readFile(new URL("../" + path, import.meta.url), "utf8");
const pages = [
  ["sarkari-sarthi/latest-govt-jobs/index.html", "Latest Government Jobs in India"],
  ["sarkari-sarthi/admit-card/index.html", "Sarkari Admit Cards & Exam Hall Tickets"],
  ["sarkari-sarthi/sarkari-result/index.html", "Sarkari Results, Merit Lists & Cutoffs"],
  ["sarkari-sarthi/mp-govt-jobs/index.html", "Madhya Pradesh Government Jobs"],
  ["free-online-games/index.html", "Play Free Online Browser Games"]
];
const homepage = await read("index.html");
const sharedJs = await read("assets/js/main.js");
const css = await read("assets/css/style.css");
const sitemap = await read("sitemap.xml");
assert.match(homepage, /GoGo Company builds mobile-friendly browser games and digital products/);
for (const productPath of ["arrowout", "crystalquest", "sarkari-sarthi", "pikanews"]) {
  assert.ok(homepage.includes('href="./' + productPath + '/'), "homepage must link to " + productPath);
}
assert.match(homepage, /id=["']critical-css["']/);
assert.match(homepage, /rel=["']preload["'][^>]*assets\/css\/style\.css/);
assert.match(homepage, /<main id=["']main["']>/);
for (const policyPath of ["/about.html", "/contact/", "/privacy-policy/", "/terms-and-conditions/", "/disclaimer/"]) {
  assert.ok(homepage.includes('href="' + policyPath + '"'), "homepage must expose trust/policy link " + policyPath);
}
assert.match(homepage, /GOGO-TRENDING-START[\s\S]*GOGO-TRENDING-END/);
assert.match(sharedJs, /nav \+=\s*['"]<li/);
assert.match(sharedJs, /links \+=\s*['"]<li/);
assert.match(css, /--accent:\s*#1e40af/i);
assert.match(css, /site-header \.accent \{ color: #1e40af; \}/);
assert.match(css, /site-footer \.accent \{ color: #1e40af; \}/);

function stripCompleteHtmlComments(source, file) {
  let output = "";
  let cursor = 0;
  while (cursor < source.length) {
    const start = source.indexOf("<!--", cursor);
    if (start === -1) {
      output += source.slice(cursor);
      break;
    }
    output += source.slice(cursor, start);
    const end = source.indexOf("-->", start + 4);
    assert.notEqual(end, -1, file + " contains an unterminated HTML comment");
    cursor = end + 3;
  }
  return output;
}
function assertListChildrenAreLi(html, file) {
  for (const match of html.matchAll(/<(ul|ol)\b[^>]*>([\s\S]*?)<\/\1>/gi)) {
    const withoutComments = stripCompleteHtmlComments(match[2], file);
    const remaining = withoutComments
      .replace(/<li\b[^>]*>[\s\S]*?<\/li>/gi, "").replace(/\s/g, "");
    assert.equal(remaining, "", file + " contains a list with a non-li direct child");
  }
}
assertListChildrenAreLi(homepage, "index.html");
for (const [path, h1] of pages) {
  const html = await read(path);
  assert.ok(html.includes("<h1>" + h1.replace(/&/g, "&amp;") + "</h1>"), path + " has the expected unique H1");
  assert.match(html, /rel=["']canonical["']/);
  assert.match(html, /CollectionPage/);
  assert.match(html, /FAQPage/);
  assertListChildrenAreLi(html, path);
  const title = html.match(/<title>([^<]+)<\/title>/i)?.[1] || "";
  const description = html.match(/<meta name="description" content="([^"]*)"/i)?.[1] || "";
  assert.ok(title.length <= 60, path + " title exceeds 60 characters");
  assert.ok(description.length <= 155, path + " meta description exceeds 155 characters");
  const canonical = html.match(/<link rel="canonical" href="([^"]+)"/i)?.[1];
  const robots = html.match(/<meta name="robots" content="([^"]+)"/i)?.[1] || "index,follow";
  if (robots.startsWith("noindex")) {
    assert.ok(canonical && !sitemap.includes("<loc>" + canonical + "</loc>"), path + " noindex canonical must not be listed in sitemap");
  } else {
    assert.ok(canonical && sitemap.includes("<loc>" + canonical + "</loc>"), path + " indexable canonical missing from sitemap");
  }
}
const gta6 = await read("gta6/index.html");
const gtaTitle = gta6.match(/<title>([^<]+)<\/title>/i)?.[1] || "";
assert.ok(gtaTitle.length > 0 && gtaTitle.length <= 60, "GTA 6 title must fit a concise search snippet");
assert.match(gta6, /"@type":"Article"[\s\S]*?"image":/);
assert.match(gta6, /"publisher":\{"@type":"Organization","name":"GoGo Company","url":"https:\/\/gogocompany\.in\/","logo":\{"@type":"ImageObject"/);

const gamesHub = await read("free-online-games/index.html");
for (const phrase of [
  "Choose the puzzle style that fits you",
  "Arrow Out! — a tap-away arrow puzzle",
  "Crystal Quest — a 27-level match-3 adventure",
  "Read the complete Arrow Out! game guide",
  "Arrow Out! strategy guide",
  "Read the Crystal Quest match-3 guide"
]) {
  assert.ok(gamesHub.includes(phrase), "free games hub is missing useful player guidance: " + phrase);
}

const arrowStrategySource = await read("scripts/content/arrowout-strategy.html");
const arrowStrategy = await read("arrowout/strategy.html");
assert.ok(arrowStrategySource.length > 9000, "central Arrow Out strategy guide source must remain substantive");
assert.equal(arrowStrategy, arrowStrategySource, "published Arrow Out strategy guide must match its central source after post-sync enhancements");
assert.match(arrowStrategy, /<link rel="canonical" href="https:\/\/gogocompany\.in\/arrowout\/strategy\.html"/);
assert.match(arrowStrategy, /Trace the entire|trace the complete|trace its head direction/i);
assert.match(arrowStrategy, /FAQPage/);
assert.ok(sitemap.includes("<loc>https://gogocompany.in/arrowout/strategy.html</loc>"), "Arrow Out strategy guide must be included in sitemap");

const keywordPages = [
  ["sarkari-sarthi/index.html", /sarkari naukri 2026/i],
  ["arrowout/about.html", /arrow wala puzzle game/i]
];
const pikanews = await read("pikanews/index.html");
assert.match(pikanews, /<meta name="robots" content="noindex,follow">/i, "aggregated PikaNews listings must remain noindex until original editorial thresholds are met");
assert.ok(!sitemap.includes("<loc>https://gogocompany.in/pikanews/</loc>"), "noindex PikaNews homepage must not appear in the root sitemap");
assert.doesNotMatch(pikanews, /id=["']gogo-search-intent["']/i, "keyword-stuffed SEO sections must not be injected into the aggregated PikaNews homepage");
const crystal = await read("crystalquest/index.html");
assert.match(crystal, /<meta name="description" content="[^"]*(match-3|match 3)[^"]*candy-crush-style/i, "Crystal Quest must expose truthful match-3 search intent in its metadata");
for (const [path, keyword] of keywordPages) {
  const html = await read(path);
  assert.match(html, /id=["']gogo-search-intent["']/i, path + " must include visible search-intent content");
  assert.match(html, keyword, path + " must include its relevant keyword naturally");
  const title = html.match(/<title>([^<]+)<\/title>/i)?.[1] || "";
  const description = html.match(/<meta name="description" content="([^"]*)"/i)?.[1] || "";
  assert.ok(title.length <= 60, path + " title exceeds 60 characters");
  assert.ok(description.length <= 155, path + " description exceeds 155 characters");
}
console.log("SEO build validation passed: homepage, list semantics, contrast tokens, 5 canonical hubs and sitemap.");
