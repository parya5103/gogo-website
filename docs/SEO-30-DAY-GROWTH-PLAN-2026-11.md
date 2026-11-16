# GoGo Company — 30-Day Free SEO Growth Plan (16 November 2026)

## Current baseline and guardrails

Google Search Console property: `sc-domain:gogocompany.in`.

Latest settled 28-day baseline (17 Oct–13 Nov 2026): **66 impressions, 3 clicks, 4.55% CTR, average position 6.97**. The visible query set is almost entirely brand searches. Treat this as a small early baseline; do not promise rankings or invent keyword volume.

All work below is designed for free tools and organic distribution. No paid links, link farms, automated directory blasts, mass AI guest posts, or purchased traffic.

## Pillar 4 — crawl and indexing operations

The live Search Console sitemap report (16 Nov 2026) lists four submitted sitemaps:

| Sitemap | Submitted URLs | Last Google download | Warnings / errors |
|---|---:|---|---|
| `/sitemap.xml` | 13 | 15 Nov 2026 | 0 / 0 |
| `/sarkari-sarthi/sitemap.xml` | 186 | 15 Nov 2026 | 0 / 0 |
| `/pikanews/sitemap.xml` | 1,017 | 15 Nov 2026 | 0 / 0 |
| `/pikanews/news-sitemap.xml` | 300 | 14 Nov 2026 | 0 / 0 |

Google deprecated the sitemap report's indexed-URL count; a null indexed count is not a failure. Use URL Inspection, page-level Search Console impressions, and the Indexing report for indexing evidence.

### Implemented in the central-site PR

- Sitemap refresh is connected to the product-sync workflows.
- Last-modified values are derived from changed files or Git history rather than blindly refreshed on every run.
- New/untracked generated article pages are included in the changed-URL scan.
- IndexNow notifications are attempted for changed HTML URLs.
- A public IndexNow verification key file is included in the branch.
- A dependency-free SEO validation script and GitHub Actions workflow validate homepage metadata, JSON-LD and sitemap structure.

**Activation condition:** these changes are not live until the central-site PR is merged and deployed. After deployment, verify the key file is publicly reachable, check IndexNow settings/history, and re-submit the root and child sitemaps in Search Console if needed. An IndexNow 202 response means accepted for key validation, not confirmed indexing.

## Pillar 5 — ethical off-page growth

### Free channels and what to publish

| GoGo product | Link-worthy asset | Appropriate audience |
|---|---|---|
| GoGo Company | Clear product directory and company/about page | People discovering the GoGo ecosystem |
| Arrow Out | Original gameplay guide, level-solving tips, short gameplay clips | Puzzle-game communities and indie-game directories |
| Crystal Quest | Match-3 strategy guide, special-gem/combination guide, short gameplay clips | Casual/mobile puzzle-game communities |
| Sarkari Sarthi | Original explainer on checking official vacancy notices, eligibility and deadlines | Students, job seekers, education communities |
| PikaNews | Transparent source directory, editorial/corrections policy, useful original explainers | Readers and publishers interested in source transparency |

Use only real accounts and genuine communities. Follow each community's self-promotion rules. Share a guide when it answers a question; do not post repetitive links or fake reviews.

### Free distribution channels

- YouTube: publish short original game demonstrations and link to the exact game/guide page in the description.
- Relevant Reddit/Discord/Facebook communities: contribute useful answers first; share a page only when directly relevant and permitted.
- Indie-game directories: submit Arrow Out and Crystal Quest only where free submissions are allowed and the listing accepts browser games.
- GitHub READMEs and release notes: link from the source repositories to the public product pages and user guides. Keep repository links/buttons off the public GoGo product pages, as intended.
- Publisher outreach: contact a publisher only when PikaNews has a genuine correction, attribution, or collaboration reason. Never imply endorsement or ask for manipulative reciprocal links.
- Job-seeker communities: share Sarkari Sarthi explainers that point users back to official recruitment notices; do not claim government affiliation.

Do not create a Google Business Profile unless GoGo Company has a real eligible customer-facing location or service-area business. A website-only digital brand should not invent a storefront.

## 30-day execution calendar

| Days | Actions | Evidence of completion |
|---|---|---|
| 1–3 | Confirm brand names, canonical URLs, favicon/social assets, about/contact/legal/source pages; verify every sitemap URL is intentional | No duplicate canonicals; live pages return 200; sitemap report remains error-free |
| 4–7 | Publish/refresh one useful Arrow Out guide and one Crystal Quest guide; make the how-to content match actual game mechanics | Guide pages are crawlable, internally linked and included in the relevant sitemap |
| 8–10 | Publish a Sarkari Sarthi explainer about checking eligibility, dates and official application links; do not create empty state/category pages | Explainer links to real, current official sources |
| 11–13 | Improve PikaNews source-directory and editorial-policy discoverability; review static article source attribution and date fields | Source and policy links visible; static article pages show publisher attribution |
| 14–17 | Publish original short gameplay demos for both games; link to the matching product page and guide | Original video URLs and referral links recorded |
| 18–21 | Make a small number of relevant, rule-compliant community contributions; submit to only a few genuine free directories | Record each placement, URL, audience fit and referral activity |
| 22–24 | Check Search Console queries/pages; compare brand vs non-brand, country/device and page-level CTR | Save a dated 28-day report; identify actual queries, not guessed volumes |
| 25–27 | Improve titles/descriptions only for pages with impressions and weak CTR; add relevant internal links from guides to product pages | Before/after metadata and internal-link changes recorded |
| 28–30 | Verify sitemap downloads, IndexNow key reachability/submission history after deployment, URL Inspection for priority URLs; plan next month from observed data | No sitemap errors; priority URLs have recorded inspection outcomes; next-month action list |

## Free measurement toolkit

- Google Search Console: actual Google queries, page performance, URL Inspection and sitemap reports.
- Google Trends: India interest, seasonal changes and related/rising query ideas; values are relative, not monthly search counts.
- Google Search autocomplete and People Also Ask: wording and question discovery, not volume measurement.
- Bing Webmaster Tools: free Bing query/crawl data after verification.
- PageSpeed Insights and Lighthouse: Core Web Vitals and performance diagnostics.
- Rich Results Test and Schema Markup Validator: structured-data syntax/eligibility checks.
- Google Alerts: monitor mentions of GoGo Company and product names.
- GA4 and Looker Studio: free referral/organic traffic reporting if connected and configured.
- GitHub Actions: free CI checks within the account's included usage limits.

## Weekly KPI review

Track these by URL and product, not just site-wide:

1. Google impressions and clicks, brand vs non-brand.
2. CTR and average position for queries with enough impressions to be meaningful.
3. Pages with impressions, pages with clicks, and pages returning 404/5xx.
4. Search Console sitemap warnings/errors and URL Inspection outcomes.
5. Referral visits from legitimate placements; ignore raw backlink counts without relevance.
6. Core Web Vitals field data when enough Chrome UX Report data exists.

The goal for the first 30 days is to establish clean crawl/indexing signals, publish useful product-specific content and earn a small number of relevant mentions. Ranking gains depend on competition, demand, content quality and Google's systems; they cannot be guaranteed.


## Official technical references

- [Google Search Central: Google Trends](https://developers.google.com/search/docs/monitor-debug/trends-start)
- [Google Search Console: Performance report](https://support.google.com/webmasters/answer/7576553)
- [IndexNow FAQ](https://www.indexnow.org/faq) and [protocol documentation](https://www.indexnow.org/documentation) — key-file requirements and HTTP response meanings.
- [PageSpeed Insights](https://pagespeed.web.dev/)
- [Rich Results Test](https://search.google.com/test/rich-results)
- [Schema Markup Validator](https://validator.schema.org/)
