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
assert.match(section,/A &amp; B Job/);
assert.match(section,/News &lt;one&gt;/);
assert.match(section,/Arrow Out!/);
assert.match(section,/Crystal Quest/);
const hub = {path:"sarkari-sarthi/latest-govt-jobs/index.html",slug:"latest-govt-jobs",title:"Latest Govt Jobs 2026 | Sarkari Naukri Updates",description:"Find current government job notifications and verify every vacancy with the original recruiting authority.",h1:"Latest Government Jobs in India",kind:"jobs",faq:[["How verify?","Check the official notice."]]};
const page = renderHub(hub,[{title:"Recruitment <2026>",url:"https://example.gov.in/job",source:"Official"}]);
assert.match(page,/<h1>Latest Government Jobs in India<\/h1>/);
assert.match(page,/CollectionPage/);
assert.match(page,/FAQPage/);
assert.match(page,/Recruitment &lt;2026&gt;/);
assert.match(page,/rel="canonical"/);
assert.doesNotMatch(page,/\[TODO\]|placeholder/i);
const keywordSection = renderKeywordSection({
  heading: "Latest Sarkari Naukri Updates",
  intro: "Find latest govt jobs and sarkari naukri 2026.",
  faqs: [["Where to check?","Verify every notice on the official source."]]
});
assert.match(keywordSection, /Latest Sarkari Naukri Updates/);
assert.match(keywordSection, /sarkari naukri 2026/);
assert.match(keywordSection, /<details>/);
assert.doesNotMatch(renderKeywordSection({heading:"Safe",intro:'</section><script>alert("x")</script>'}), /<script\\b/i);
const keywordPage = addKeywordSection("<html><body><footer>Footer</footer></body></html>", {
  heading: "Free Arrow Puzzle Game Online",
  intro: "Play an arrow wala puzzle game."
});
assert.ok(keywordPage.indexOf("seo-keyword-content") < keywordPage.indexOf("<footer>"), "keyword context should be placed before the footer");
assert.equal(addKeywordSection(keywordPage,{heading:"Duplicate",intro:"Duplicate"}), keywordPage, "keyword section injection must be idempotent");
console.log("SEO generator tests passed.");
