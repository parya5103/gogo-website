#!/usr/bin/env node
import { readFile, writeFile, mkdir, rm } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const ROOT = process.cwd();
const DOMAIN = "https://gogocompany.in";
export const HUBS = [
  { path: "sarkari-sarthi/latest-govt-jobs/index.html", slug: "latest-govt-jobs", title: "Latest Govt Jobs 2026 | Sarkari Naukri Updates", description: "Find current government job notifications, eligibility details and application links. Check every vacancy with its original recruiting authority.", h1: "Latest Government Jobs in India", keywords: /job|recruit|vacan|bharti|notification|apply|appointment/i, kind: "jobs", faq: [["Where can I find the latest government jobs?", "Browse the current listings on Sarkari Sarthi and confirm every detail in the original recruiting authority notification."], ["How should I verify a vacancy?", "Open the source notification and check eligibility, dates, fees and the official application website before applying."]] },
  { path: "sarkari-sarthi/medical-govt-jobs/index.html", slug: "medical-govt-jobs", title: "Medical Govt Jobs 2026 | Sarkari Sarthi", description: "Browse medical government job vacancies and healthcare recruitment notices. Check eligibility, dates and source details in each original notification.", h1: "Medical Government Jobs in India", keywords: /medical|health|nursing|doctor|hospital|pharma|healthcare/i, kind: "jobs", faq: [["Where can I find medical government recruitment?", "Browse medical listings on Sarkari Sarthi, then verify the vacancy and application process with the recruiting authority."], ["What should I check before applying?", "Confirm the required qualification, registration, experience, age limit and last date in the original notice."]] },
  { path: "sarkari-sarthi/engineering-govt-jobs/index.html", slug: "engineering-govt-jobs", title: "Engineering Govt Jobs 2026 | Sarkari Sarthi", description: "Find engineering and technical government job vacancies, including relevant recruitment notices. Check qualifications, deadlines and source details before applying.", h1: "Engineering Government Jobs in India", keywords: /engineering|engineer|technical|technician|mechanical|civil|electrical/i, kind: "jobs", faq: [["Where can I find engineering government jobs?", "Browse engineering and technical listings, then confirm the role and application details with the recruiting authority."], ["Which qualification applies?", "Requirements vary by post; read the original notification for the accepted branch, degree, diploma and experience."]] },
  { path: "sarkari-sarthi/teaching-govt-jobs/index.html", slug: "teaching-govt-jobs", title: "Teaching Govt Jobs 2026 | Sarkari Sarthi", description: "Browse teaching government job vacancies and education recruitment notices. Confirm qualifications, dates and application steps with the original authority.", h1: "Teaching Government Jobs in India", keywords: /teaching|teacher|education|school|faculty|professor|lecturer/i, kind: "jobs", faq: [["Where can I find teaching government vacancies?", "Use the teaching listings as a discovery aid and verify the recruitment notice with the school, university or authority."], ["Are eligibility rules the same for every post?", "No. Check the post-specific qualification, teacher eligibility requirements and age rules in the original notice."]] },
  { path: "sarkari-sarthi/administrative-govt-jobs/index.html", slug: "administrative-govt-jobs", title: "Administrative Govt Jobs 2026 | Sarkari Sarthi", description: "Find administrative government job vacancies and public-sector office recruitment notices. Check role requirements, deadlines and original source details before applying.", h1: "Administrative Government Jobs in India", keywords: /administrative|administration|office|assistant|clerk|secretariat|officer/i, kind: "jobs", faq: [["What are administrative government jobs?", "These listings may include office, coordination, clerical and administrative roles; check the exact duties in the original notice."], ["How do I verify an administrative vacancy?", "Confirm the organisation, advertisement number, eligibility and application route with the recruiting authority."]] },
  { path: "free-online-games/index.html", slug: "free-online-games", title: "Free Online Browser Games | Play on Mobile & PC", description: "Play free browser puzzle games on mobile and desktop. Try Arrow Out! and Crystal Quest without downloading a traditional app.", h1: "Play Free Online Browser Games", keywords: null, kind: "games", faq: [["Can I play these games without downloading an app?", "Yes. Arrow Out! and Crystal Quest are playable in supported web browsers."], ["Do the games work on mobile and desktop?", "The games are designed for supported modern mobile and desktop browsers; device and browser capabilities can vary."]] }
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
async function readJson(path, fallback) { try { return JSON.parse(await readFile(path,"utf8")); } catch { return fallback; } }
const MIN_HUB_JOBS = 5;
const STALE_HUB_PATHS = ["sarkari-sarthi/admit-card", "sarkari-sarthi/sarkari-result", "sarkari-sarthi/mp-govt-jobs"];

function jobCard(job) {
  const url = safeUrl(job.url || job.original_source_url);
  if (!url) return "";
  return '<article class="hub-card"><h3><a href="' + escapeHtml(url) + '" rel="noopener noreferrer">' + escapeHtml(job.title || "Recruitment notice") + '</a></h3>' +
    '<p>' + escapeHtml((job.description || "Open the source listing for recruitment details.").slice(0, 260)) + '</p>' +
    '<p class="hub-meta">Source: ' + escapeHtml(job.source || "Source listing") + (job.category ? " · " + escapeHtml(job.category) : "") + '</p></article>';
}
function gameCards() {
  return '<article class="hub-card"><h3><a href="/arrowout/">Arrow Out! — Free Arrow Puzzle Game</a></h3><p>Solve arrow-path logic puzzles across a large level collection with touch-friendly controls.</p></article>' +
    '<article class="hub-card"><h3><a href="/crystalquest/">Crystal Quest — Free Match-3 Adventure</a></h3><p>Match magical gems through a 27-level fantasy puzzle adventure with supported PWA offline play.</p></article>';
}
export function renderHub(hub, jobs = []) {
  const cards = hub.kind === "games" ? gameCards() : jobs.map(jobCard).filter(Boolean).slice(0, 24).join("\n");
  const fallback = hub.kind === "games" ? "" : '<p class="hub-empty">No matching live entries are available in the current synced dataset. Browse the <a href="/sarkari-sarthi/">Sarkari Sarthi portal</a> for the latest collection. This page will populate when matching records are published.</p>';
  const url = DOMAIN + "/" + hub.path.replace(/index\.html$/, "");
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
    '<meta name="robots" content="index,follow,max-image-preview:large"><link rel="canonical" href="' + escapeHtml(url) + '">' +
    '<meta property="og:type" content="website"><meta property="og:title" content="' + escapeHtml(hub.title) + '"><meta property="og:description" content="' + escapeHtml(hub.description) + '"><meta property="og:url" content="' + escapeHtml(url) + '">' +
    '<style>:root{color-scheme:light;font-family:system-ui,-apple-system,"Segoe UI",sans-serif;color:#172033;background:#f7f8fc}*{box-sizing:border-box}body{margin:0;line-height:1.65}.wrap{max-width:1080px;margin:auto;padding:24px 20px}.top{background:#101827;color:#fff}.top a{color:#bfdbfe}.crumb{font-size:.95rem}.hero{padding:38px 0 24px}.hero h1{font-size:clamp(2rem,5vw,3rem);line-height:1.15}.hub-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,300px),1fr));gap:16px}.hub-card{background:#fff;border:1px solid #dce2ec;border-radius:14px;padding:20px;overflow-wrap:anywhere}.hub-card h2,.hub-card h3{margin-top:0}.hub-card a{color:#1e40af}.hub-meta,.muted{color:#596579}.hub-empty{background:#fff;padding:20px;border-left:4px solid #1e40af}.faq{margin-top:36px}.faq details{background:#fff;border:1px solid #dce2ec;border-radius:10px;padding:14px;margin:10px 0}footer{border-top:1px solid #dce2ec;margin-top:40px}</style>' +
    '<script type="application/ld+json">' + serializeJsonLd(schema) + '</script></head><body><header class="top"><div class="wrap"><a href="/">GoGo Company</a></div></header><main class="wrap"><nav class="crumb" aria-label="Breadcrumb">' + crumbRoot + ' / ' + escapeHtml(hub.h1) + '</nav>' +
    '<header class="hero"><h1>' + escapeHtml(hub.h1) + '</h1><p>' + escapeHtml(hub.description) + '</p></header><section aria-labelledby="listing-title"><h2 id="listing-title">' + (hub.kind==="games"?"Choose a free browser game":"Latest matching updates") + '</h2>' +
    (cards ? '<div class="hub-grid">' + cards + '</div>' : fallback) + '</section><section class="hub-guide"><h2>' + (hub.kind==="games"?"What makes these browser games easy to start?":"How to use these updates safely") + '</h2>' +
    (hub.kind==="games" ? '<p>Both titles open directly in a modern browser. Arrow Out! focuses on planning clear paths through a puzzle board; Crystal Quest is a match-three fantasy adventure. Use the links above to open the game page and review its controls before playing.</p>' :
      '<p>Listings are discovery aids, not a substitute for the recruiting authority\'s notice. Some records may originate from secondary employment sources and are not necessarily official or independently verified. Check the source and verification labels, open the original notice, confirm eligibility, fees and dates, and apply only through the recruiting authority\'s official portal.</p><ol><li>Read the complete notification and its corrigenda.</li><li>Confirm the last date, exam schedule and required documents.</li><li>Check that the application domain belongs to the recruiting authority.</li><li>Save the submitted application and payment receipt where applicable.</li></ol>') +
    '</section><section class="faq"><h2>Frequently asked questions</h2>' +
    hub.faq.map(([q,a])=>'<details><summary>' + escapeHtml(q) + '</summary><p>' + escapeHtml(a) + '</p></details>').join("") +
    '</section><footer><div class="wrap"><p><a href="/">GoGo Company</a> · <a href="/sarkari-sarthi/">Sarkari Sarthi</a> · <a href="/pikanews/">PikaNews</a> · <a href="/arrowout/">Arrow Out!</a> · <a href="/crystalquest/">Crystal Quest</a></p><p class="muted">Always verify recruitment details with the original authority. GoGo Company is not a government agency.</p></div></footer></main></body></html>\n';
}
export async function generateHubs(root = ROOT) {
  const manifest = await readJson(root + "/sarkari-sarthi/jobs/job_manifest.json", {jobs:[]});
  const allJobs = (Array.isArray(manifest.jobs)?manifest.jobs:[]).filter(job => job && String(job.status||"").toLowerCase()==="active" && safeUrl(job.url||job.original_source_url));
  const sitemapPath = root + "/sitemap.xml";
  let sitemap = await readFile(sitemapPath,"utf8");
  const today = new Date().toISOString().slice(0,10);
  const removeLocs = new Set(STALE_HUB_PATHS.map(path => DOMAIN + "/" + path + "/"));
  const removeSitemapBlocks = () => {
    sitemap = sitemap.replace(/<url>[\s\S]*?<\/url>/g, block => {
      const loc = block.match(/<loc>([^<]+)<\/loc>/)?.[1];
      return removeLocs.has(loc) ? "" : block;
    });
  };
  for (const path of STALE_HUB_PATHS) {
    await rm(resolve(root,path),{recursive:true,force:true});
  }
  removeSitemapBlocks();
  const generated = [];
  for (const hub of HUBS) {
    const jobs = hub.keywords ? allJobs.filter(job => hub.keywords.test([job.title,job.description,job.category,job.state,job.location].filter(Boolean).join(" "))) : [];
    const loc = DOMAIN + "/" + hub.path.replace(/index\.html$/,"");
    if (hub.kind === "jobs" && jobs.length < MIN_HUB_JOBS) {
      await rm(resolve(root,hub.path),{recursive:true,force:true});
      removeLocs.add(loc);
      removeSitemapBlocks();
      continue;
    }
    const path = root + "/" + hub.path;
    await mkdir(dirname(path),{recursive:true});
    await writeFile(path,renderHub(hub,jobs));
    const block = '<url><loc>' + loc + '</loc><lastmod>' + today + '</lastmod><changefreq>daily</changefreq><priority>0.7</priority></url>';
    if (!sitemap.includes("<loc>"+loc+"</loc>")) sitemap = sitemap.replace("</urlset>", "  "+block+"\n</urlset>");
    generated.push(hub.path);
  }
  await writeFile(sitemapPath,sitemap.endsWith("\n")?sitemap:sitemap+"\n");
  console.log("Generated",generated.length,"programmatic SEO hubs.");
  return generated;
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await generateHubs();
