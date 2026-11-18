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
assert.match(homepage, /GOGO-TRENDING-START[\s\S]*GOGO-TRENDING-END/);
assert.match(homepage, /daily-updates/);
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
  assert.ok(canonical && sitemap.includes("<loc>" + canonical + "</loc>"), path + " canonical missing from sitemap");
}
const keywordPages = [
  ["sarkari-sarthi/index.html", /sarkari naukri 2026/i],
  ["pikanews/index.html", /aaj ki Bollywood khabar/i],
  ["arrowout/index.html", /arrow wala puzzle game/i],
  ["crystalquest/index.html", /candy-crush-style gem adventure/i]
];
for (const [path, keyword] of keywordPages) {
  const html = await read(path);
  assert.match(html, /id=["']gogo-search-intent["']/i, path + " must include visible search-intent content");
  assert.match(html, keyword, path + " must include its relevant keyword naturally");
  const title = html.match(/<title>([^<]+)<\/title>/i)?.[1] || "";
  const description = html.match(/<meta name="description" content="([^"]*)"/i)?.[1] || "";
  assert.ok(title.length <= 75, path + " title exceeds 75 characters");
  assert.ok(description.length <= 155, path + " description exceeds 155 characters");
}
console.log("SEO build validation passed: homepage, list semantics, contrast tokens, 5 canonical hubs and sitemap.");
