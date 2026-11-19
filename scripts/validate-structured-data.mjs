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
let noindex = 0;
let inspected = 0;
for (const dir of newsDirs.filter(entry => entry.isDirectory())) {
  const html = await read("pikanews/news/" + dir.name + "/index.html");
  const article = schemas(html).find(schema => schema["@type"] === "NewsArticle");
  const robots = html.match(/<meta\s+name=["']robots["']\\s+content=["']([^"']+)["']/i)?.[1] || "";
  inspected++;
  if (!article) {
    assert.match(robots, /noindex/i, "Aggregated or non-editorial PikaNews pages without NewsArticle schema must be noindex");
    noindex++;
    continue;
  }
  assert.doesNotMatch(robots, /noindex/i, "A qualifying original editorial NewsArticle must not be noindex");
  assert.equal(article.publisher?.name, "PikaNews", "NewsArticle publisher must match the PikaNews publication");
  assert.equal(article.speakable?.["@type"], "SpeakableSpecification", "NewsArticle should expose speakable content selectors");
  assert.ok(article.mainEntityOfPage, "NewsArticle must identify its canonical page");
  checked++;
}
assert.ok(inspected > 0, "At least one static PikaNews article page should be inspected");
console.log("Structured data validation passed: two games, guarded job detail schema, " + checked + " qualifying PikaNews NewsArticle pages and " + noindex + " noindex aggregated/thin pages.");
