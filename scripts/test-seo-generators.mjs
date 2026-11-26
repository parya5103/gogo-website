import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { decodeEntities, parseGoogleTrendsRss, renderTrendingSection, safeUrl, serializeJsonLd as serializeHomeJsonLd } from "./update-trending-seo.mjs";
import { renderHub, escapeHtml, isQualityJob, isIndexableJobHub, serializeJsonLd as serializeHubJsonLd } from "./generate-pseo-hubs.mjs";
import { addKeywordSection, renderKeywordSection } from "./seo-keyword-content.mjs";

assert.equal(decodeEntities("&amp;lt;script&amp;gt;"), "&lt;script&gt;", "RSS entities must be decoded exactly once");
assert.equal(decodeEntities("&#x110000;"), "&#x110000;", "Out-of-range numeric entities must remain inert");
const hostileText = { headline: "</script><img src=x>&", description: "A & B" };
for (const serialize of [serializeHomeJsonLd, serializeHubJsonLd]) {
  const encoded = serialize(hostileText);
  assert.doesNotMatch(encoded, /[<>&]/, "JSON-LD script data must not contain raw HTML delimiters");
  assert.deepEqual(JSON.parse(encoded), hostileText, "Safe JSON-LD serialization must preserve source data");
}
const trends = parseGoogleTrendsRss('<rss><channel><item><title>SSC &amp; Railway</title><link>https://trends.google.com/item</link><ht:approx_traffic>20K+</ht:approx_traffic></item></channel></rss>');
assert.equal(trends.length,1);
assert.equal(trends[0].title,"SSC & Railway");
assert.equal(safeUrl("javascript:alert(1)"),null);
assert.equal(escapeHtml('<script>'),"&lt;script&gt;");
const section = renderTrendingSection({jobs:[{title:"A & B Job",url:"https://example.gov.in/job"}],news:[{title:"News <one>",url:"https://publisher.example/story",source:"Publisher"}],trends});
assert.match(section,/GOGO-TRENDING-START/);
assert.match(section,/Explore GoGo Company products/);
assert.match(section,/href="\/arrowout\/strategy\.html"/,"Homepage generator must retain the Arrow Out strategy link");
assert.match(section,/href="\/crystalquest\/strategy\.html"/,"Homepage generator must retain the Crystal Quest strategy link");
for (const product of ["Arrow Out!","Crystal Quest","Sarkari Sarthi","PikaNews","GTA 6"]) assert.ok(section.includes(product),"Homepage product directory is missing: "+product);
assert.doesNotMatch(section,/A &amp; B Job|News &lt;one&gt;|Trending searches in India/,"external feeds must not be republished as homepage content");
const hub = {path:"sarkari-sarthi/latest-govt-jobs/index.html",slug:"latest-govt-jobs",title:"Latest Govt Jobs 2026 | Sarkari Naukri Updates",description:"Find current government job notifications and verify every vacancy with the original recruiting authority.",h1:"Latest Government Jobs in India",kind:"jobs",faq:[["How verify?","Check the official notice."]]};
const page = renderHub(hub,[{title:"Recruitment <2026>",url:"https://example.gov.in/job",source:"Official"}]);
assert.match(page,/<h1>Latest Government Jobs in India<\/h1>/);
assert.match(page,/CollectionPage/);
assert.match(page,/FAQPage/);
assert.match(page,/Recruitment &lt;2026&gt;/);
assert.match(page,/rel="canonical"/);
assert.match(page,/<meta name="robots" content="noindex,follow,max-image-preview:large">/,"thin job hubs must stay out of the index");
assert.doesNotMatch(page,/\[TODO\]|placeholder/i);

const qualityNow = new Date("2026-11-26T12:00:00Z");
const qualityJob = (id, host) => ({
  id,
  status: "active",
  verification_status: "official_verified",
  description: "This official recruitment notice explains the post, eligibility, selection process, required documents and application steps in substantial detail. ".repeat(2),
  organization: "Example Recruiting Authority",
  vacancies: 12,
  qualification: "Graduate degree",
  age_limit: "18 to 30 years",
  important_dates: { last_date: "2026-12-10" },
  official_notification_url: "https://authority.gov.in/notice.pdf",
  official_application_url: "https://authority.gov.in/apply",
  salary: "As per official pay scale",
  selection_process: "Written examination and document verification",
  source: host,
  url: "https://" + host + "/jobs/" + id,
  last_verified: "2026-11-25T10:00:00Z"
});
assert.equal(isQualityJob(qualityJob("good-1", "jobs-a.example"), qualityNow), true,
  "only fresh, complete, official-verified recruitment records should qualify");
assert.equal(isQualityJob({ ...qualityJob("secondary-1", "jobs-a.example"), verification_status: "secondary_source_only" }, qualityNow), false);
assert.equal(isQualityJob({ ...qualityJob("stale-1", "jobs-a.example"), last_verified: "2026-10-01T10:00:00Z" }, qualityNow), false);
assert.equal(isQualityJob({ ...qualityJob("missing-1", "jobs-a.example"), official_notification_url: null, official_application_url: null }, qualityNow), false);
const sourceDiverseJobs = [
  qualityJob("a1", "jobs-a.example"),
  qualityJob("a2", "jobs-a.example"),
  qualityJob("b1", "jobs-b.example"),
  qualityJob("b2", "jobs-b.example"),
  qualityJob("c1", "jobs-c.example")
];
assert.equal(isIndexableJobHub(sourceDiverseJobs, qualityNow), true,
  "a job hub needs at least five fresh quality records from at least three distinct publishers");
assert.equal(isIndexableJobHub(sourceDiverseJobs.slice(0, 4), qualityNow), false,
  "a hub with fewer than five quality records must remain noindex");
assert.equal(isIndexableJobHub(sourceDiverseJobs.map(job => ({ ...job, url: "https://jobs-a.example/" + job.id })), qualityNow), false,
  "a hub dominated by fewer than three source domains must remain noindex");
assert.equal(isIndexableJobHub(sourceDiverseJobs.map(job => ({ ...job, verification_status: "secondary_source_only" })), qualityNow), false,
  "secondary-source-only listings must not qualify an SEO hub for indexing");

const gamesHub = {path:"free-online-games/index.html",slug:"free-online-games",title:"Free Online Browser Games | Play on Mobile & PC",description:"Play two free browser puzzle games on mobile or PC: Arrow Out! has 1,000 tap-away levels; Crystal Quest has 27 match-3 fantasy levels.",h1:"Play Free Online Browser Games",kind:"games",faq:[["Can I play these games without downloading an app?","Yes. Both games run in supported browsers."]]};
const gamesPage = renderHub(gamesHub);
assert.match(gamesPage,/<meta name="robots" content="index,follow,max-image-preview:large">/,"substantial games hub may be indexed");
for (const phrase of [
  "Choose the puzzle style that fits you",
  "Arrow Out! — a tap-away arrow puzzle",
  "Crystal Quest — a 27-level match-3 adventure",
  "Read the complete Arrow Out! tap-away puzzle guide",
  "Arrow Out! strategy guide",
  "Read the Crystal Quest match-3 browser game guide",
  "Crystal Quest strategy guide",
  "How to start playing",
  "Which game should you try first?"
]) assert.ok(gamesPage.includes(phrase), "Generated games hub is missing: " + phrase);

const keywordSection = renderKeywordSection({
  heading: "Latest Sarkari Naukri Updates",
  intro: "Find latest govt jobs and sarkari naukri 2026.",
  faqs: [["Where to check?","Verify every notice on the official source."]]
});
assert.match(keywordSection, /Latest Sarkari Naukri Updates/);
assert.match(keywordSection, /sarkari naukri 2026/);
assert.match(keywordSection, /<details>/);
assert.doesNotMatch(renderKeywordSection({heading:"Safe",intro:'</section><script>alert("x")</script>'}), /<script\\b/i);
const keywordPage = addKeywordSection("<html><body><main><article>Content</article></main><footer>Footer</footer></body></html>", {
  heading: "Free Arrow Puzzle Game Online",
  intro: "Play an arrow wala puzzle game."
});
assert.ok(keywordPage.indexOf("seo-keyword-content") < keywordPage.indexOf("</main>"), "keyword context should stay inside the semantic content area");
assert.ok(keywordPage.indexOf("seo-keyword-content") > keywordPage.indexOf("<main>"), "keyword context must not precede main content");
assert.equal(addKeywordSection(keywordPage,{heading:"Duplicate",intro:"Duplicate"}), keywordPage, "keyword section injection must be idempotent");
const gameShell = '<html><body><div id="app"><footer class="game-controls">Controls</footer></div></body></html>';
assert.equal(addKeywordSection(gameShell,{heading:"No game injection",intro:"Do not alter gameplay."}), gameShell, "game shells without a semantic main must remain untouched");
console.log("SEO generator tests passed.");

const publishedGamesHub = await readFile(new URL("../free-online-games/index.html", import.meta.url), "utf8");
assert.ok(publishedGamesHub.includes('href="/arrowout/guide/"'), "game hub must link to the canonical Arrow Out guide");
assert.ok(publishedGamesHub.includes('href="/crystalquest/guide/"'), "game hub must link to the canonical Crystal Quest guide");
assert.ok(!publishedGamesHub.includes('/arrowout/about.html'), "legacy Arrow Out guide URL must not be linked");
assert.ok(!publishedGamesHub.includes('/crystalquest/guide.html'), "legacy Crystal Quest guide URL must not be linked");
