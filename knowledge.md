# GoGo Company SEO & Repository Knowledge

Last verified: 2026-11-27

## Canonical production architecture
- Main site: https://gogocompany.in/
- Repository: parya5103/gogo-website (default branch: main)
- Hosting: GitHub Pages; this repository owns the custom domain.
- Product source repositories are synced into this repository; do not hand-edit synced product directories because the next sync can overwrite those edits.
- Product source repositories: Arrow Out (parya5103/Fletch_Game, main), Crystal Quest (parya5103/crystal-quest-web, main), Sarkari Sarthi (parya5103/Sarkari-Sarthi, gh-pages publishing branch), PikaNews (parya5103/PikaNews, main).
- PikaNews collection workflow runs every 30 minutes; central site sync publishes the generated frontend.
- Sarkari Sarthi job refresh and central sync are scheduled separately; verify workflow schedules before changing them.

## Public SEO surfaces verified in repository
- Root robots.txt allows crawling and references the root, Sarkari Sarthi and PikaNews sitemaps.
- Root sitemap currently lists the homepage, About, AI hub, games, guides, Sarkari Sarthi and policy pages.
- Homepage contains index,follow and a canonical URL.
- PikaNews homepage contains index,follow and a canonical URL.
- PikaNews latest.html and trending.html currently contain noindex,follow in the source repository.
- PikaNews technology and Hollywood category pages currently contain index,follow.
- PikaNews sitemap generator conditionally adds Latest/category hubs only when their live content meets freshness, excerpt-depth and publisher-diversity thresholds.
- PikaNews story pages generated from third-party RSS feeds are intentionally noindex,follow; only explicitly reviewed, substantive PikaNews original editorial stories qualify for individual article indexation and Google News sitemap inclusion.
- Sarkari Sarthi job pages are evaluated by scripts/job-indexing-policy.mjs; expired, incomplete or insufficiently verified records must not be forced into indexation.

## Important SEO safeguards
- Do not blanket-remove noindex from RSS-aggregated story pages, expired job listings, duplicate URLs, thin pages, private/account pages, or utility endpoints. Google explicitly identifies mass-produced scraped/feed pages with little added value as scaled-content abuse.
- Make useful public landing pages indexable when they provide distinct, substantive value; ensure canonical, sitemap inclusion, internal links, server-rendered content and valid structured data agree.
- A sitemap submission is a discovery hint, not an indexing guarantee.
- Never invent publication dates, job facts, authors, review status, view counts, source permissions, or structured-data properties.
- Do not mark a page indexable merely to increase URL counts. Improve the content and eligibility gates where a page is genuinely useful.

## Known build and validation commands
- npm test runs the project test suite and SEO/build validators.
- npm run build builds the account bundle.
- npm run build:site builds and publishes the site build output.
- Preserve the existing GitHub Pages and product-sync workflows.

## SEO work plan and evidence requirements
1. Verify crawl access, HTTP status, canonical, robots meta/header, rendered HTML and sitemap membership for every major public landing page.
2. Reconcile the root sitemap with product sitemaps and ensure each sitemap URL is canonical, live (200), indexable and internally linked.
3. Review GSC Page Indexing reasons, URL Inspection results and 28/90-day query/page performance. Do not claim impressions or indexing without Search Console evidence.
4. Prioritize original, useful landing pages for PikaNews topics, AI resources, games and verified recruitment information.
5. Strengthen contextual internal links and external discovery through legitimate relevant references; do not buy or fabricate backlinks.
6. Run tests, inspect diffs, and merge only verified changes. Keep this file current after each completed implementation.

## Current access limitation (2026-11-27)
- The connected GSC Wizard tools returned payment_required because the connected account has no active subscription. Therefore live Search Console property, sitemap-processing, query and page-performance evidence was not available in this session.
- A successful GitHub repository metadata read confirmed access to the public main repository. File-level changes must be tested and reviewed before merge.
