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
const reactHomepage = await read("assets/js/gogo-home-react.js");
const homeCss = await read("frontend/src/styles.css");
const reactHomepageCss = await read("assets/css/gogo-home-react.css");
const sitemap = await read("sitemap.xml");
assert.match(homepage, /Play\. Prepare\./, "homepage must render its primary heading in initial HTML");
assert.match(homepage, /verification context|verify recruitment details/i, "Sarkari Sarthi source-verification guidance must be present");
assert.match(homepage, /publisher-attributed|original publisher/i, "PikaNews attribution must be present");
assert.doesNotMatch(homepage, /esm\.sh\/react|id=["']gogo-react-root["']/, "homepage must not depend on a CDN-only empty React shell");
for (const productPath of ["arrowout", "crystalquest", "sarkari-sarthi", "pikanews"]) {
  assert.ok(homepage.includes('href="/' + productPath + '/'), "homepage must link to " + productPath);
}
assert.match(homepage, /<main id=["']main["']>/);
assert.match(homepage, /application\/ld\+json/);
assert.match(homepage, /FAQPage/);
assert.match(homepage, /Brand disambiguation/i);
assert.match(homepage, /data-gogo-react-home/);
for (const policyPath of ["/about/", "/contact/", "/privacy-policy/", "/terms-and-conditions/", "/disclaimer/"]) {
  assert.ok(homepage.includes('href="' + policyPath + '"'), "homepage must expose trust/policy link " + policyPath);
}
assert.match(sharedJs, /isReactHome/);
assert.match(sharedJs, /ensureAccountAssets\(\)/);
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
  "Read the complete Arrow Out! tap-away puzzle guide",
  "Arrow Out! strategy guide",
  "Read the Crystal Quest match-3 browser game guide"
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

const crystalStrategySource = await read("scripts/content/crystalquest-strategy.html");
const crystalStrategy = await read("crystalquest/strategy.html");
assert.ok(crystalStrategySource.length > 9000, "central Crystal Quest strategy guide source must remain substantive");
assert.equal(crystalStrategy, crystalStrategySource, "published Crystal Quest strategy guide must match its central source after post-sync enhancements");
assert.match(crystalStrategy, /Crystal Resonance|Guardian shield colour/i);
assert.match(crystalStrategy, /FAQPage/);
assert.ok(sitemap.includes("<loc>https://gogocompany.in/crystalquest/strategy.html</loc>"), "Crystal Quest strategy guide must be included in sitemap");
const arrowGame = await read("arrowout/index.html");
for (const href of ["about.html", "privacy.html"]) {
  assert.ok(arrowGame.includes('href="' + href + '"'), "Arrow Out game screen must expose help/site link " + href);
}
const crystalGame = await read("crystalquest/index.html");
for (const href of ["guide.html", "privacy.html", "terms.html", "../"]) {
  assert.ok(crystalGame.includes('href="' + href + '"'), "Crystal Quest game screen must expose help/site link " + href);
}
const crystalGuide = await read("crystalquest/guide.html");
assert.match(crystalGuide, /href="strategy\.html"/, "Crystal Quest base guide must link to the strategy guide after product sync");

const keywordPages = [
  ["sarkari-sarthi/index.html", /sarkari naukri 2026/i],
  ["arrowout/about.html", /arrow wala puzzle game/i]
];
const pikanews = await read("pikanews/index.html");
assert.match(pikanews, /<meta name="robots" content="index,follow,max-image-preview:large">/i, "PikaNews discovery homepage must be indexable");
const pikanewsSitemap = await read("pikanews/sitemap.xml");
assert.ok(pikanewsSitemap.includes("<loc>https://gogocompany.in/pikanews/</loc>"), "indexable PikaNews homepage must appear in its product sitemap");
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

assert.ok(sharedJs.includes('href: "gta6/", label: "GTA 6 Guide"'), "GTA 6 must be reachable from the shared primary navigation");
assert.doesNotMatch(sharedJs, /Admin Dashboard/, "public footer must not expose the admin dashboard link");
assert.ok(sharedJs.includes("Browser games, career information and digital media"), "footer tagline must describe the current product mix");


assert.match(homepage, /<div id=["']root["']>/, "homepage must hydrate a server-rendered React root");
assert.match(homepage, /assets\/gogo-home\//, "homepage must load local, bundled Vite assets");
assert.doesNotMatch(homepage, /window\.__GOGO_FEEDS__=|Today on GoGo Company|TRENDING SEARCHES IN INDIA|trends-strip|gogo-trending/i, "homepage must not embed external feeds or search-trend snippets");
assert.match(homepage, /ad-slot/, "ad reservation must be present in homepage markup");
assert.match(homeCss, /prefers-reduced-motion:reduce/, "homepage CSS must respect reduced-motion preferences");
assert.match(homeCss, /min-height:250px/, "ad slot must reserve a stable minimum height");
assert.match(homepage, /<title>GoGo Company/);
assert.doesNotMatch(homepage, /href=["\']https?:[^"\']+["\'] target=["\']_blank["\'](?![^>]*rel=["\'][^"\']*noopener)/i, "external links opening new tabs must use noopener");

console.log("SEO build validation passed: prerendered homepage, product hubs, schema, accessibility and sitemap.");
