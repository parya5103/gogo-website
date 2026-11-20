#!/usr/bin/env node
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname } from "node:path";
import { pathToFileURL } from "node:url";

const ROOT = process.cwd();
const DOMAIN = "https://gogocompany.in";
const HUBS = [
  { path: "sarkari-sarthi/latest-govt-jobs/index.html", slug: "latest-govt-jobs", title: "Latest Govt Jobs 2026 | Sarkari Naukri Updates", description: "Find current government job notifications, eligibility details and application links. Verify every vacancy with its original recruiting authority.", h1: "Latest Government Jobs in India", keywords: /job|recruit|vacan|bharti|notification|apply|appointment/i, kind: "jobs", faq: [["Where can I find the latest government jobs?", "Browse the current listings on Sarkari Sarthi and confirm every detail in the original recruiting authority notification."],["How should I verify a vacancy?", "Open the source notification and check eligibility, dates, fees and the official application website before applying."]] },
  { path: "sarkari-sarthi/admit-card/index.html", slug: "admit-card", title: "Sarkari Admit Card 2026 Download | Hall Tickets", description: "Find admit card and exam hall ticket updates. Check the recruiting authority website for official download links and exam instructions.", h1: "Sarkari Admit Cards & Exam Hall Tickets", keywords: /admit.?card|hall.?ticket|call.?letter/i, kind: "jobs", faq: [["Where should I download an admit card?", "Use the official recruiting authority or examination portal linked from the relevant notice."],["What should I check before an exam?", "Confirm the exam date, reporting time, venue, permitted documents and instructions on the official admit card."]] },
  { path: "sarkari-sarthi/sarkari-result/index.html", slug: "sarkari-result", title: "Sarkari Result 2026 | Merit Lists & Cutoffs", description: "Explore examination result, merit list, answer key and cutoff updates. Confirm published results with the official examination authority.", h1: "Sarkari Results, Merit Lists & Cutoffs", keywords: /result|merit.?list|cut.?off|answer.?key/i, kind: "jobs", faq: [["Where can I verify an examination result?", "Check the official examination authority website and use the result notice or candidate login it provides."],["Are cutoff marks guaranteed in advance?", "No. Cutoffs vary by examination, category, vacancies and official evaluation; rely only on published authority data."]] },
  { path: "sarkari-sarthi/mp-govt-jobs/index.html", slug: "mp-govt-jobs", title: "MP Govt Jobs 2026 | MPESB & State Bharti", description: "Browse Madhya Pradesh government recruitment updates, including MPESB and state vacancies, with source links and verification guidance.", h1: "Madhya Pradesh Government Jobs", keywords: /madhya.?pradesh|\bmpesb\b|vyapam|mp.?govt|mp.?police|mp.?bharti/i, kind: "jobs", faq: [["Where can I check Madhya Pradesh recruitment notices?", "Use Sarkari Sarthi to discover listings, then verify the notification on MPESB or the responsible Madhya Pradesh department website."],["Does every listing mean applications are open?", "No. Check the official notice and application dates before treating a listing as open."]] },
  { path: "free-online-games/index.html", slug: "free-online-games", title: "Free Online Browser Games | Play on Mobile & PC", description: "Play two free browser puzzle games on mobile or PC: Arrow Out! has 1,000 tap-away levels; Crystal Quest has 27 match-3 fantasy levels.", h1: "Play Free Online Browser Games", keywords: null, kind: "games", faq: [["Can I play these games without downloading an app?", "Yes. Arrow Out! and Crystal Quest are playable in supported web browsers."],["Do the games work on mobile and desktop?", "The games are designed for supported modern mobile and desktop browsers; device and browser capabilities can vary."]] }
];

export function escapeHtml(value = "") {
  return String(value).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");
}
export function serializeJsonLd(value) {
  return JSON.stringify(value).replace(/[<>&]/g, character => ({
    "<": "\\u003c", ">": "\\u003e", "&": "\\u0026"
  })[character]);
}
function safeUrl(value) { try { const url = new URL(value); return ["https:","http:"].includes(url.protocol) ? url.href : null; } catch { return null; } }
export function isQualityJob(job) {
  if (!job || String(job.status || "").toLowerCase() !== "active") return false;
  if (String(job.verification_status || "").toLowerCase() !== "official_verified") return false;
  if (String(job.description || "").trim().length < 180) return false;
  const dates = job.important_dates || {};
  const evidence = [
    job.organization, job.vacancies, job.qualification || job.minimum_qualification,
    job.age_limit, dates.last_date || job.last_date, job.official_notification_url,
    job.official_application_url, job.salary || job.pay_scale, job.selection_process
  ];
  return Boolean(evidence.filter(value => value != null && String(value).trim() !== "").length >= 4
    && safeUrl(job.official_notification_url || job.official_application_url || job.url || job.original_source_url));
}
async function readJson(path, fallback) { try { return JSON.parse(await readFile(path,"utf8")); } catch { return fallback; } }
function jobCard(job) {
  const url = safeUrl(job.url || job.original_source_url);
  if (!url) return "";
  return '<article class="hub-card"><h3><a href="' + escapeHtml(url) + '" rel="noopener noreferrer">' + escapeHtml(job.title || "Recruitment notice") + '</a></h3>' +
    '<p>' + escapeHtml((job.description || "Open the source listing for recruitment details.").slice(0, 260)) + '</p>' +
    '<p class="hub-meta">Source: ' + escapeHtml(job.source || "Source listing") + (job.category ? " · " + escapeHtml(job.category) : "") + '</p></article>';
}
function gameGuide() {
  return `<section class="hub-guide">
<h2>Choose the puzzle style that fits you</h2>
<div class="hub-grid">
<article class="hub-card">
<h3>Arrow Out! — a tap-away arrow puzzle</h3>
<p>Arrow Out! is a path-planning puzzle. Tap an arrow only when its route to the edge of the board is clear; another arrow in the corridor blocks it. Plan the removal order, clear every arrow and work through 1,000 levels. The game also includes daily challenges, hints, undo and board controls for larger puzzles.</p>
<p><a href="/arrowout/about.html">Read the complete Arrow Out! game guide</a> before you play.</p>
</article>
<article class="hub-card">
<h3>Crystal Quest — a 27-level match-3 adventure</h3>
<p>Crystal Quest is a fantasy gem-matching game. Swap neighbouring gems to make matches of three or more, then use larger patterns to create special gems: line clears, colour clears, area blasts and seeker crystals. The campaign includes Guardian encounters, Crystal Resonance stages and a daily challenge.</p>
<p><a href="/crystalquest/guide.html">Read the Crystal Quest match-3 guide</a> for special-gem rules and level tips.</p>
</article>
</div>
</section>
<section class="hub-guide">
<h2>How to start playing</h2>
<ol>
<li>Choose a game above and open its page. Both games run in a supported modern browser.</li>
<li>In Arrow Out!, study each arrow's direction and tap only when its exit path is clear.</li>
<li>In Crystal Quest, tap a gem and then a neighbouring gem, or drag between adjacent cells, to make a match.</li>
<li>Check the game's own instructions for level objectives, controls and available features.</li>
</ol>
<p>No account is required to start either game. Progress is stored in browser storage on the current device, so clearing browser data can remove a local save. Crystal Quest and Arrow Out! support offline play after their required game files have been cached; for the most reliable offline use, open each game while online first and follow its install or cache instructions.</p>
</section>
<section class="hub-guide">
<h2>Which game should you try first?</h2>
<p>Choose Arrow Out! if you enjoy spatial reasoning, planning and finding a safe order to clear a crowded board. Choose Crystal Quest if you prefer matching gems, building special combinations and completing level objectives within a move limit. Both are free to start and designed for phone and desktop browsers.</p>
</section>`;
}
function gameCards() {
  return '<article class="hub-card"><h3><a href="/arrowout/">Arrow Out! — Free Arrow Puzzle Game</a></h3><p>Solve arrow-path logic puzzles across a large level collection with touch-friendly controls.</p></article>' +
    '<article class="hub-card"><h3><a href="/crystalquest/">Crystal Quest — Free Match-3 Adventure</a></h3><p>Match magical gems through a 27-level fantasy puzzle adventure with supported PWA offline play.</p></article>';
}
export function renderHub(hub, jobs = []) {
  const cards = hub.kind === "games" ? gameCards() : jobs.map(jobCard).filter(Boolean).slice(0, 24).join("\n");
  const fallback = hub.kind === "games" ? "" : '<p class="hub-empty">No matching live entries are available in the current synced dataset. Browse the <a href="/sarkari-sarthi/">Sarkari Sarthi portal</a> for the latest collection. This page will populate when matching records are published.</p>';
  const url = DOMAIN + "/" + hub.path.replace(/index\.html$/, "");
  const isIndexable = hub.kind === "games" || jobs.length >= 5;
  const faqs = hub.faq.map(([q,a]) => ({ "@type":"Question", name:q, acceptedAnswer:{"@type":"Answer",text:a} }));
  const schema = { "@context":"https://schema.org","@graph":[
    {"@type":"CollectionPage","@id":url+"#collection","url":url,"name":hub.title,"description":hub.description,"inLanguage":"en-IN","dateModified":new Date().toISOString(),"mainEntity":{"@id":url+"#items"},"breadcrumb":{"@id":url+"#breadcrumb"}},
    {"@type":"ItemList","@id":url+"#items","name":hub.h1,"numberOfItems":hub.kind==="games"?2:Math.min(jobs.length,24),"itemListElement":hub.kind==="games"?[
      {"@type":"ListItem","position":1,"url":DOMAIN+"/arrowout/","name":"Arrow Out!"},
      {"@type":"ListItem","position":2,"url":DOMAIN+"/crystalquest/","name":"Crystal Quest"}
    ]:jobs.slice(0,24).map((job,i)=>({"@type":"ListItem","position":i+1,"name":job.title,"url":safeUrl(job.url||job.original_source_url)})).filter(x=>x.url)},
    {"@type":"BreadcrumbList","@id":url+"#breadcrumb","itemListElement":[{"@type":"ListItem","position":1,"name":"Home","item":DOMAIN+"/"},{"@type":"ListItem","position":2,"name":hub.kind==="games"?"Free Online Games":"Sarkari Sarthi","item":hub.kind==="games"?DOMAIN+"/free-online-games/":DOMAIN+"/sarkari-sarthi/"},{"@type":"ListItem","position":3,"name":hub.h1,"item":url}]},
    {"@type":"FAQPage","@id":url+"#faq","mainEntity":faqs}
  ]};
  const crumbRoot = hub.kind==="games" ? '<a href="/">Home</a>' : '<a href="/">Home</a> / <a href="/sarkari-sarthi/">Sarkari Sarthi</a>';
  return '<!doctype html>\n<html lang="en-IN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<title>' + escapeHtml(hub.title.slice(0,60)) + '</title><meta name="description" content="' + escapeHtml(hub.description.slice(0,155)) + '">' +
    '<meta name="robots" content="' + (isIndexable ? "index,follow,max-image-preview:large" : "noindex,follow") + '"><link rel="canonical" href="' + escapeHtml(url) + '">' +
    '<meta property="og:type" content="website"><meta property="og:title" content="' + escapeHtml(hub.title) + '"><meta property="og:description" content="' + escapeHtml(hub.description) + '"><meta property="og:url" content="' + escapeHtml(url) + '">' +
    '<style>:root{color-scheme:light;font-family:system-ui,-apple-system,"Segoe UI",sans-serif;color:#172033;background:#f7f8fc}*{box-sizing:border-box}body{margin:0;line-height:1.65}.wrap{max-width:1080px;margin:auto;padding:24px 20px}.top{background:#101827;color:#fff}.top a{color:#bfdbfe}.crumb{font-size:.95rem}.hero{padding:38px 0 24px}.hero h1{font-size:clamp(2rem,5vw,3rem);line-height:1.15}.hub-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,300px),1fr));gap:16px}.hub-card{background:#fff;border:1px solid #dce2ec;border-radius:14px;padding:20px;overflow-wrap:anywhere}.hub-card h2,.hub-card h3{margin-top:0}.hub-card a{color:#1e40af}.hub-meta,.muted{color:#596579}.hub-empty{background:#fff;padding:20px;border-left:4px solid #1e40af}.faq{margin-top:36px}.faq details{background:#fff;border:1px solid #dce2ec;border-radius:10px;padding:14px;margin:10px 0}footer{border-top:1px solid #dce2ec;margin-top:40px}</style>' +
    '<script type="application/ld+json">' + serializeJsonLd(schema) + '</script></head><body><header class="top"><div class="wrap"><a href="/">GoGo Company</a></div></header><main class="wrap"><nav class="crumb" aria-label="Breadcrumb">' + crumbRoot + ' / ' + escapeHtml(hub.h1) + '</nav>' +
    '<header class="hero"><h1>' + escapeHtml(hub.h1) + '</h1><p>' + escapeHtml(hub.description) + '</p></header><section aria-labelledby="listing-title"><h2 id="listing-title">' + (hub.kind==="games"?"Choose a free browser game":"Latest matching updates") + '</h2>' +
    (cards ? '<div class="hub-grid">' + cards + '</div>' : fallback) + '</section>' +
    (hub.kind==="games" ? gameGuide() : '<section class="hub-guide"><h2>How to use these updates safely</h2><p>Listings are discovery aids, not a substitute for the recruiting official recruitment notice. Open the original source, confirm the organisation and advertisement number, check eligibility and age rules, review fees and dates, and apply only through an official application portal.</p><ol><li>Read the complete notification and its corrigenda.</li><li>Confirm the last date, exam schedule and required documents.</li><li>Check that the application domain belongs to the recruiting authority.</li><li>Save the submitted application and payment receipt where applicable.</li></ol></section>') +
    '<section class="faq"><h2>Frequently asked questions</h2>' +
    hub.faq.map(([q,a])=>'<details><summary>' + escapeHtml(q) + '</summary><p>' + escapeHtml(a) + '</p></details>').join("") +
    '</section><footer><div class="wrap"><p><a href="/">GoGo Company</a> · <a href="/sarkari-sarthi/">Sarkari Sarthi</a> · <a href="/pikanews/">PikaNews</a> · <a href="/arrowout/">Arrow Out!</a> · <a href="/crystalquest/">Crystal Quest</a></p><p class="muted">Always verify recruitment details with the original authority. GoGo Company is not a government agency.</p></div></footer></main></body></html>\n';
}
export async function generateHubs(root = ROOT) {
  const manifest = await readJson(root + "/sarkari-sarthi/jobs/job_manifest.json", {jobs:[]});
  const allJobs = (Array.isArray(manifest.jobs)?manifest.jobs:[]).filter(isQualityJob);
  const sitemapPath = root + "/sitemap.xml";
  let sitemap = await readFile(sitemapPath,"utf8");
  const today = new Date().toISOString().slice(0,10);
  for (const hub of HUBS) {
    const jobs = hub.keywords ? allJobs.filter(job => hub.keywords.test([job.title,job.description,job.category,job.state,job.location].filter(Boolean).join(" "))) : [];
    const path = root + "/" + hub.path;
    await mkdir(dirname(path),{recursive:true});
    await writeFile(path,renderHub(hub,jobs));
    const loc = DOMAIN + "/" + hub.path.replace(/index\.html$/,"");
    const indexable = hub.kind === "games" || jobs.length >= 5;
    sitemap = sitemap.replace(/<url>[\s\S]*?<\/url>/g, block => block.includes("<loc>" + loc + "</loc>") ? "" : block);
    if (indexable) {
      const block = '<url><loc>' + loc + '</loc><lastmod>' + today + '</lastmod><changefreq>daily</changefreq><priority>0.7</priority></url>';
      sitemap = sitemap.replace("</urlset>", "  " + block + "\n</urlset>");
    }
  }
  await writeFile(sitemapPath,sitemap.endsWith("\n")?sitemap:sitemap+"\n");
  console.log("Generated",HUBS.length,"programmatic SEO hubs.");
  return HUBS.map(hub=>hub.path);
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await generateHubs();
