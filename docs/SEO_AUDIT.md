# GoGo Company Website - SEO Audit (Round 2, 2026-11-07)

Repo: parya5103/gogo-website. Site: https://gogocompany.in/
Method: repository inspection at main a9c0b42f + FIRST LIVE-URL TESTING of gogocompany.in (the domain became reachable from the audit environment this round). No fabricated metrics anywhere.

## Why organic visibility is low (7 impressions / 1 click, owner-reported, range unverified)

Verified contributing factors, in order of importance:

1. The domain is days old and the Search Console Domain property was verified only now. Google had limited discovery signal before the property and sitemap submissions existed. This alone plausibly explains near-zero impressions; it is not a code problem.
2. No known backlinks (NOT VERIFIED - no backlink data source available). New domains rank poorly for competitive head terms without them.
3. Head keywords (free online games, sarkari job, latest news) are dominated by large established sites. Realistic near-term traffic is long-tail: individual Sarkari job pages (115+), PikaNews article pages (300+ static pages + news sitemap), and specific game queries.
4. Site quality is NOT the bottleneck: all pages render real server-side HTML content, metadata is complete, sitemaps are valid (verified live this round).

## Re-audit classification (Phase 1)

ALREADY CORRECT (verified by inspection + live fetch):
- All 10 gogo-owned pages: unique titles (10-75 ch), unique descriptions, 1 H1, absolute canonicals, correct robots directives, OG/Twitter, BreadcrumbList JSON-LD (locked by scripts/seo-tests.mjs in CI since PR #30).
- Live fetches confirmed: /, /arrowout/, /crystalquest/, /sarkari-sarthi/, /pikanews/, /about/, /contact/, /404.html all serve real content; /arrow-out/ legacy stub redirects to /arrowout/ live; ads.txt live and exact; sitemap.xml, /sarkari-sarthi/sitemap.xml, /pikanews/sitemap.xml, /pikanews/news-sitemap.xml all fetch as valid XML live.
- Homepage product cards already carry specific, accurate, non-generic descriptions (1000 levels/daily challenges for Arrow Out!, 27 levels/3 regions/story mode for Crystal Quest, official-source job listings for Sarkari Sarthi, 30-minute refresh for PikaNews).
- Arrow Out! content depth: /arrowout/about.html is a full how-to-play + features + FAQ page (exactly what search-intent guidance asks for), verified live earlier rounds.
- Lighthouse workflow: completed successfully on main runs #2 and #3 (post-merge of design-polish and SEO-suite PRs).

CRITICAL ISSUES FOUND THIS ROUND (all fixed in the PRs below):
- PikaNews sitemap listed the portal root as /pikanews/index.html while the page canonical is /pikanews/ - sitemap/canonical mismatch. Fixed upstream in PikaNews (generator + committed sitemap + new test invariant).
- arrowout/contact.html had NO canonical (index/about/privacy all have one) - duplicate-URL exposure across two origins. Fixed upstream in Fletch_Game.
- arrowout/about.html, contact.html and privacy.html were in NO sitemap (orphan-ish: linked internally, but not submitted to Google). Fixed in the gogo main sitemap.
- gogo robots.txt did not declare the PikaNews news-sitemap. Fixed.
- About page product lineup listed only 3 of 4 products (PikaNews missing) and product names were not linked. Fixed with descriptive internal links.

NOT VERIFIABLE WITHOUT EXTERNAL ACCESS:
- Actual Google index status, canonical selection, impressions/clicks by query (needs Search Console - owner has Domain property now).
- Lighthouse score values (workflow artifacts need download; logs require sign-in).
- Backlink profile.
- Real-device Core Web Vitals (LCP/INP/CLS field data).

## Fixes implemented this round

gogo-website PR (branch feat/seo-growth-round2):
1. sitemap.xml: +3 URLs (arrowout/about.html, arrowout/contact.html, arrowout/privacy.html) - now 13 URLs.
2. robots.txt: + Sitemap: https://gogocompany.in/pikanews/news-sitemap.xml (4th declaration).
3. about/index.html: all 4 products listed and linked with descriptive anchors; card-level accurate detail added.
4. scripts/seo-tests.mjs: must-list extended with the 3 arrowout sub-pages; robots.txt check now requires all 4 sitemap declarations; new check that pikanews sub-sitemaps exist and the news sitemap uses the Google news namespace.
5. .github/workflows/sync-pikanews.yml: sync now REFUSES to publish a PikaNews sitemap that lists the root as index.html (enforces the upstream fix permanently).
6. docs/SEO_AUDIT.md: this document.

Upstream product repositories (issues originated upstream; synced folders must never be edited in gogo):
- PikaNews PR #20 (branch fix/sitemap-clean-root-loc): generate_sitemap.py root entry "" -> clean https://gogocompany.in/pikanews/; committed frontend/sitemap.xml corrected identically; new test invariant forbids the index.html root loc.
- Fletch_Game PR #29 (branch fix/contact-canonical): contact.html canonical https://gogocompany.in/arrowout/contact.html.

MERGE ORDER: PikaNews #20 first, then this gogo PR. The gogo sync's new clean-URL check fails only if it runs before the PikaNews fix has been synced (collector regenerates the sitemap within ~30 min of the PikaNews merge; gogo sync publishes it within ~40 min). After both merges, one manual "Sync PikaNews" run (Actions tab) converges everything same-day.

## Keyword-to-page strategy (Phase 4)

All search volumes, CTRs and difficulty scores: NOT VERIFIED (no keyword data source). Competition judgments are qualitative estimates. No cannibalization: each product targets its own distinct intent.

- / (gogocompany.in): primary intent brand/navigation. Keywords: gogo company, gogo games. Long-tail: gogo company games, gogocompany. Competition: trivial (brand). Gap: none - brand demand grows with the products.
- /arrowout/ + /arrowout/about.html: intent browser-game discovery. Primary: arrow puzzle game. Secondary: tap away puzzle, arrow out game, free browser puzzle. Long-tail: tap away arrow puzzle free, arrow puzzle game no download, offline arrow game browser, arrow puzzle 1000 levels. Entities: PWA, offline play, daily challenge, hints. Competition: HIGH for puzzle game; the about page's how-to-play/FAQ content targets the long-tail informational queries.
- /crystalquest/: intent match-3 discovery. Primary: match 3 browser game. Secondary: free match 3 game no download, story match 3 game. Long-tail: offline match 3 browser game, match 3 game with story mode. Entities: match-3, gems, story mode, PWA. Competition: HIGH; long-tail only realistic.
- /sarkari-sarthi/ + 115 job pages: intent government-job information (India). Primary: sarkari job. Secondary: government job notification, latest sarkari naukri, sarkari result. Long-tail: per-notification queries (e.g. RRB NTPC admit card, BPSC TRE 4.0 last date) - the job detail pages with JobPosting schema are the single biggest realistic organic opportunity on the domain. Entities: admit card, answer key, syllabus, official notification. Competition: VERY HIGH head, moderate long-tail.
- /pikanews/ + 300 article pages: intent English-language news discovery (NOTE: PikaNews content is English; Hindi keyword targeting is NOT APPLICABLE - the mission brief's Hindi assumption does not match the product). Primary: latest news today english. Secondary: bollywood news, technology news today, gaming news. Long-tail: article-title queries (fresh content via news-sitemap + 30-min refresh). Competition: VERY HIGH; realistic only via news freshness and specific titles.

## Search Console owner checklist (Phase 10)

Owner reports Domain property DNS verification complete. Verify and act:

1. Property: confirm gogocompany.in (Domain) appears with verified status.
2. Sitemaps (submit all 4): https://gogocompany.in/sitemap.xml, /sarkari-sarthi/sitemap.xml, /pikanews/sitemap.xml, /pikanews/news-sitemap.xml. Check each shows Processed and note Discovered URLs count.
3. URL Inspection on the 5 primary URLs (/, /arrowout/, /crystalquest/, /sarkari-sarthi/, /pikanews/): request indexing, note Page indexing status and Google-selected canonical.
4. Pages report: review Why pages are not indexed exclusions; duplicates should show Google-selected canonical = declared canonical.
5. After traffic accrues: Core Web Vitals report (field data) and Enhancements.
6. What to send back for the next round: sitemap processed counts (screenshot), the 5 URL inspection results, the Pages-exclusions export, and the Performance report with date range (so the 7-impressions baseline can be re-measured against real data).

No indexing or submission success is claimed in this document; all of the above is pending owner evidence.

## Status summary (Phase 12)

- Baseline on-page SEO (10 pages): ALREADY EXISTED AND VERIFIED (inspection + CI suite + live fetch)
- Live URL serving, redirects, ads.txt, all 4 sitemaps fetchable: IMPLEMENTED AND VERIFIED (live fetches this round)
- PikaNews sitemap canonical mismatch: IMPLEMENTED (upstream PR #20) BUT NOT VERIFIED (CI pending at doc time; live verification after merge + sync)
- arrowout/contact.html canonical: IMPLEMENTED (upstream PR #29) BUT NOT VERIFIED
- Main sitemap + robots.txt completion (13 URLs, 4 sitemap declarations): IMPLEMENTED AND TESTED (seo-tests.mjs in CI)
- About page internal links + 4th product: IMPLEMENTED AND TESTED
- Sync-time clean-sitemap enforcement: IMPLEMENTED BUT NOT VERIFIED (first sync run after both merges)
- Lighthouse workflow execution: ALREADY EXISTED AND VERIFIED (runs completed successfully on main) - score values NOT TESTED (artifact access required)
- Google indexing / rankings / impressions growth: BLOCKED BY OWNER ACCESS (Search Console actions above)
- Core Web Vitals field data: NOT IMPLEMENTED (requires real-user traffic data)
- Backlinks: NOT VERIFIED (no data source)

## Remaining opportunities (documented, not blocking)

- Sarkari Sarthi footer brand line could link to gogocompany.in (index.html may be regenerated by its workflow - fix belongs in the generator/template, separate round).
- PikaNews footer brand line is plain text on all 18 pages (linking it means touching every page + the exact-string footer test; low same-domain SEO value, deferred).
- Original editorial content on PikaNews (aggregation excerpts alone may underperform) - product decision, not technical.
- Main sitemap has no lastmod by design (no fabricated dates).


## Round 3 — homepage relevance, content quality and off-page policy (2026-11-25)

### Findings from repository source review

- The central homepage previously used the title “GoGo Company — Free HTML5 Browser Games & Sarkari Exam Tools” and a slogan-only H1 (“Play. Prepare. Grow with GoGo.”). The title did not represent the AI hub and used a generic “Sarkari Exam Tools” label instead of the actual product brand.
- The sampled product landing pages already had distinct, descriptive titles and one H1 each: Arrow Out!, Crystal Quest, Sarkari Sarthi, PikaNews, GoGo AI Intelligence, Free Online Browser Games and GTA 6. Preserve these page-specific intents; do not force them into the homepage.
- The homepage's short visible intro was readable but could better explain the full portfolio. No broad keyword-density rewrite is justified from the source inspection alone.
- The old scripts/prerender-home.mjs and scripts/publish-site-build.mjs both hard-coded the previous H1, so changing the hero without updating those publishing guards caused CI to stop. Both guards are now aligned with the new H1.

### Changes in PR #156

- Homepage title, description, Open Graph and Twitter metadata now describe browser games, AI and digital media; the description names Arrow Out!, Crystal Quest, Sarkari Sarthi, PikaNews and GoGo AI Intelligence.
- Homepage hero now uses one descriptive H1: “GoGo Company: Browser Games, AI & Digital Media”, followed by a plain-language summary of its real destinations.
- Generated root HTML and source template are kept in sync; the social preview SVG no longer describes only games, government jobs and news.
- Build/publish guards and SEO tests now validate the new H1, exactly one homepage H1, title length and description length.
- Added docs/SEO_OFFPAGE_PLAN.md for selective, editorially earned mentions and backlinks. No outreach has been sent and no backlinks are claimed.

### Validation status

- Initial CI run exposed the stale H1 guard in the prerender/publish scripts; the failure was caused by the intentional H1 update, not by product runtime changes. The guard was corrected in the branch.
- A fresh CI run on the latest PR head is required. Do not merge until SEO validation, CI tests, responsive regression, CodeQL, security scan and frontend build/performance checks complete successfully.
- Google indexing, ranking, traffic and backlink growth are not proven by repository tests. Search Console owner access and future off-page measurement remain required.

### Next work after PR #156

1. Re-run all CI jobs and inspect failures individually; fix any regression before merge.
2. Review open SEO PRs #71, #72, #86 and #145 for merge order and overlap; do not duplicate or merge them automatically.
3. Audit page readability with rendered-page review and real user value, not arbitrary word-count targets. Improve only pages with unclear headings, long paragraphs, weak source attribution or thin original guidance.
4. Use Search Console query/page exports and Links report to prioritize follow-up content and evaluate referring domains.

- Anti-stuffing correction: the post-sync generator no longer appends a generic list of variants such as “sarkari naukri 2026” and “12th pass ki sarkari naukri” to the Sarkari Sarthi homepage. The existing job-discovery H1 and verified listings carry the intent; tests protect against reintroducing the keyword paragraph.

- AI hub heading alignment: changed the generated `/ai/` H1 to “AI News, Models & Research” in both `scripts/update-ai-hub.py` and the current generated page, so the daily updater preserves a heading aligned with its title and actual content.
- CI on the latest validated commit: SEO validation, CI Tests, frontend build/performance and security scan passed; CodeQL completed successfully. Responsive regression failed: `/sarkari-sarthi/` reports horizontal overflow at 390px and 430px. This is outside the homepage-only changes and must be investigated before treating mobile QA as green.

## Sarkari Sarthi manifest quality snapshot — 2026-11-26

The central synced manifest contained 298 records: 258 active and 40 expired. Of the active records, 224 were marked secondary_source_only, 33 needs_review and only 1 official_verified. The active snapshot had only 2 source domains, no official_notification_url or official_application_url values, and only 1 record with an organization or published_date value. Category counts were Medical 57, General 124, Engineering 30, Teaching 9, Administrative 29, SSC 1, IT 1, Railway 1, Banking 3, Defence 2 and UPSC 1.

This is not sufficient evidence for programmatic category pages. The individual detail-page JobPosting policy already requires complete official-verified evidence. The SEO hub generator now applies a separate quality gate: at least 5 fresh (14-day) official-verified records, substantial descriptions, meaningful recruitment fields, an HTTPS official notice/application URL, and at least 3 distinct source domains. Until then, job hubs remain accessible to users but carry noindex and are excluded from the sitemap. The main Sarkari Sarthi portal remains available and indexable; no records were deleted or relabelled.

## Fresh 50-page crawl — 2026-11-26 (OpenSEO free-tier crawl)

- Crawl completed 50/50 pages; the free-tier page cap stopped discovery with 71 URLs not crawled. No Lighthouse run was included.
- 4 critical internal-link failures came from Arrow Out Guide footer links pointing to non-existent /arrowout/guide/privacy.html and /arrowout/guide/contact.html. They now point to the existing /arrowout/privacy.html and /arrowout/contact.html pages.
- AI hub title was 68 characters and description 180 characters. Both have been shortened to the recommended snippet ranges.
- PikaNews latest page description was 167 characters; shortened. PikaNews terms description was 64 characters; expanded.
- Sarkari Sarthi footer used H4 directly after H2, skipping H3. Footer section headings are now H3 while retaining the existing footer-title class.
- PikaNews is a publisher-attributed news discovery feed, not a newsroom. Homepage structured data was changed from NewsMediaOrganization to WebSite with GoGo Company as publisher. Category, latest, trending and article-template pages remain noindex until original reviewed editorial content exists; the PikaNews sitemap continues to include only its canonical static pages.
- Canonicalized aliases and intentional noindex pages in the crawl are expected; do not treat them as errors. The 404s above were the only broken internal targets in this crawl.

### PikaNews source-of-truth and indexation policy

PikaNews is a publisher-attributed discovery feed, not a newsroom. Its homepage uses WebSite schema with GoGo Company as publisher. Topic hubs (Latest and categories) may be indexable only when the upstream generator's quality gate passes: sufficient recent stories, enough distinct publishers and useful excerpts. The central post-sync enhancer must preserve that source-generated robots status and sitemap membership; it must not blanket-noindex category hubs. Individual third-party story pages and the trending feed remain noindex; original editorial articles may be indexed only when they have a named author, explicit review, substantial original text and valid publication metadata. The Google News sitemap remains empty until those original editorial criteria are met.
