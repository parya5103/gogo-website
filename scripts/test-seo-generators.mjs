import assert from "node:assert/strict";
import { decodeEntities, parseGoogleTrendsRss, renderTrendingSection, safeUrl, serializeJsonLd as serializeHomeJsonLd } from "./update-trending-seo.mjs";
import { renderHub, escapeHtml, serializeJsonLd as serializeHubJsonLd } from "./generate-pseo-hubs.mjs";
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
for (const product of ["Arrow Out!","Crystal Quest","Sarkari Sarthi","PikaNews","GTA 6"]) assert.ok(section.includes(product),"Homepage product directory is missing: "+product);
assert.doesNotMatch(section,/A &amp; B Job|News &lt;one&gt;|Trending searches in India/,"external feeds must not be republished as homepage content");
const hub = {path:"sarkari-sarthi/latest-govt-jobs/index.html",slug:"latest-govt-jobs",title:"Latest Govt Jobs 2026 | Sarkari Naukri Updates",description:"Find current government job notifications and verify every vacancy with the original recruiting authority.",h1:"Latest Government Jobs in India",kind:"jobs",faq:[["How verify?","Check the official notice."]]};
const page = renderHub(hub,[{title:"Recruitment <2026>",url:"https://example.gov.in/job",source:"Official"}]);
assert.match(page,/<h1>Latest Government Jobs in India<\/h1>/);
assert.match(page,/CollectionPage/);
assert.match(page,/FAQPage/);
assert.match(page,/Recruitment &lt;2026&gt;/);
assert.match(page,/rel="canonical"/);\nassert.match(page,/<meta name="robots" content="noindex,follow,max-image-preview:large">/,"thin job hubs must stay out of the index");
assert.doesNotMatch(page,/\[TODO\]|placeholder/i);
const gamesHub = {path:"free-online-games/index.html",slug:"free-online-games",title:"Free Online Browser Games | Play on Mobile & PC",description:"Play two free browser puzzle games on mobile or PC: Arrow Out! has 1,000 tap-away levels; Crystal Quest has 27 match-3 fantasy levels.",h1:"Play Free Online Browser Games",kind:"games",faq:[["Can I play these games without downloading an app?","Yes. Both games run in supported browsers."]]};
const gamesPage = renderHub(gamesHub);\nassert.match(gamesPage,/<meta name="robots" content="index,follow,max-image-preview:large">/,"substantial games hub may be indexed");
for (const phrase of [
  "Choose the puzzle style that fits you",
  "Arrow Out! — a tap-away arrow puzzle",
  "Crystal Quest — a 27-level match-3 adventure",
  "Read the complete Arrow Out! game guide",
  "Read the Crystal Quest match-3 guide",
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
