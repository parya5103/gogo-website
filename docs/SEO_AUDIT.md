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
