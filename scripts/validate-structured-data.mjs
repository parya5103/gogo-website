#!/usr/bin/env node
import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";

const root = process.cwd();
const read = path => readFile(join(root, path), "utf8");
function schemas(html) {
  return [...html.matchAll(/<script\s+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)]
    .map(match => { try { return JSON.parse(match[1]); } catch { return null; } }).filter(Boolean);
}
for (const [path, expectedName] of [["arrowout/index.html", "Arrow Out!"], ["crystalquest/index.html", "Crystal Quest"]]) {
  const html = await read(path);
  const game = schemas(html).find(schema => Array.isArray(schema["@type"]) && schema["@type"].includes("VideoGame") && schema["@type"].includes("SoftwareApplication"));
  assert.ok(game, path + " must contain VideoGame and SoftwareApplication JSON-LD");
  assert.equal(game.name, expectedName);
  assert.equal(game.isAccessibleForFree, true);
  assert.ok(game.offers && game.offers.price === "0");
}
const sarkari = schemas(await read("sarkari-sarthi/index.html"));
assert.ok(!sarkari.some(schema => schema["@type"] === "JobPosting"), "JobPosting must never be placed on a job-listing page");
const injector = await read("sarkari-sarthi/assets/js/sarkari-schema-injector.js");
const injectorTemplate = await read("scripts/sarkari-schema-injector.js");
assert.equal(injector, injectorTemplate, "Sarkari sync must receive the persistent central JobPosting injector template");
for (const guard of ['data-job-detail-page="true"', 'const title = clean(job.job_title);', 'verification_status', '"official_verified"', 'official_application_url', 'applicationIsSecure', 'rawValidThrough', 'const place = clean(job.location || job.district)', 'directApply": false', 'escapeHtml']) {
  assert.ok(injector.includes(guard), "JobPosting injector missing safety guard: " + guard);
}
assert.ok(injector.includes('(validThrough && new Date(validThrough) <= new Date())'), "Unknown expiry must remain optional; expired jobs must be excluded");
assert.ok(injector.includes('description.split(/\\n+/)'), "Job descriptions must be serialized as escaped HTML paragraphs");
const newsDirs = await readdir(join(root, "pikanews/news"), { withFileTypes: true });
let checked = 0;
let staticPages = 0;
let noindexedAggregates = 0;
for (const dir of newsDirs.filter(entry => entry.isDirectory())) {
  const html = await read("pikanews/news/" + dir.name + "/index.html");
  const article = schemas(html).find(schema => schema["@type"] === "NewsArticle");
  const robotsTag = html.match(/<meta\b(?=[^>]*\bname=["']robots["'])[^>]*>/i)?.[0] || "";
  const robots = robotsTag.match(/\bcontent=["']([^"']*)["']/i)?.[1] || "";
  if (!article) {
    assert.match(robots, /noindex/i, "Aggregated static PikaNews page " + dir.name + " without NewsArticle schema must remain noindex");
    noindexedAggregates++;
    staticPages++;
    continue;
  }
  assert.ok(!/noindex/i.test(robots), "Eligible original editorial NewsArticle pages must be indexable");
  assert.equal(article.publisher?.name, "PikaNews", "NewsArticle publisher must match the PikaNews publication");
  assert.equal(article.speakable?.["@type"], "SpeakableSpecification", "NewsArticle should expose speakable content selectors");
  assert.ok(article.mainEntityOfPage, "NewsArticle must identify its canonical page");
  checked++;
  staticPages++;
}
assert.ok(staticPages > 0, "At least one static PikaNews article page should be validated");
console.log("Structured data validation passed: two games, guarded job detail schema, " + checked + " eligible original NewsArticle(s), and " + noindexedAggregates + " correctly noindexed aggregated pages.");


const homepage = await read("index.html");
const homepageGraph = schemas(homepage);
const organization = homepageGraph.find(schema => schema["@type"] === "Organization" && schema.name === "GoGo Company");
const founder = homepageGraph.find(schema => schema["@type"] === "Person" && schema.name === "Pratik Arya");
const website = homepageGraph.find(schema => schema["@type"] === "WebSite" && schema.url === "https://gogocompany.in/");
assert.ok(organization, "homepage must disambiguate the GoGo Company organization entity");
assert.ok(founder && founder.sameAs?.includes("https://github.com/parya5103"), "founder profile should use the verified public GitHub profile");
assert.ok(website && website.name === "GoGo Company", "homepage WebSite entity must use the consistent brand name");
assert.match(homepage, /GoGo Company — Free HTML5 Browser Games &amp; Sarkari Exam Tools/);
