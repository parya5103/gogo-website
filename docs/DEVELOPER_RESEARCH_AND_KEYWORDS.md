# GoGo Company — Developer Research & Search Intent Plan

Updated: 2026-11-19

## Scope and guardrails

This plan covers GoGo Company, Sarkari Sarthi, PikaNews, Arrow Out! and Crystal Quest. Preserve the current application architectures, public routes, deployment/sync order, existing data formats, game rules, save compatibility and English-only UI/content. Search intent may include natural English and Hinglish/Roman-Hindi phrases; do not create translated pages, Hindi UI, `/hi/` routes or hreflang declarations. Do not add a phrase to a page if the product does not actually satisfy that intent.

## Search-intent implementation in this branch

The post-sync SEO enhancer adds visible, escaped, idempotent search-intent sections with concise FAQs to the Sarkari Sarthi and PikaNews landing pages and the crawlable Arrow Out guide. Crystal Quest keeps its full-screen game shell free of extra content overlays; its match-3 search intent is carried by its title, description and VideoGame metadata.

- **Sarkari Sarthi:** latest government jobs, govt job vacancy, sarkari naukri 2026, central government jobs, Madhya Pradesh government jobs, admit cards and sarkari results. Vacancy eligibility and dates must always be checked against the original official notice.
- **PikaNews:** Bollywood news today, gaming news India, technology news India, business news India, and natural Hinglish queries such as “aaj ki Bollywood khabar”. Articles retain publisher attribution and original-source links; this does not claim PikaNews is the original publisher.
- **Arrow Out!:** arrow puzzle game online, free arrow puzzle game, arrow wala puzzle game, 1,000 arrow-path logic levels and no-download browser play. Visible search-intent copy lives on `/arrowout/about.html`, not inside the full-screen gameplay shell.
- **Crystal Quest:** match 3 puzzle game, online match 3 game, free match-3 puzzle game, magical gems and a candy-crush-style gem adventure. Title/description and VideoGame metadata carry the search intent; no long text block is injected into the full-screen game UI. Copy explicitly distinguishes the original game from Candy Crush.

Keyword phrases are used in context, not repeated as a keyword list. Existing canonical URLs and product routes are preserved. Meta descriptions are kept within 155 characters for these landing pages. Automated validation checks the visible content, target phrase and metadata lengths.

## Developer findings from official documentation

### 1. PWA and service-worker lifecycle

Reference: https://web.dev/learn/pwa/service-workers

- Keep caches versioned and remove only known obsolete cache names.
- Ensure the offline fallback is available from the active cache before relying on it.
- Handle waiting/activation updates deliberately; avoid silently replacing a running game session.
- Verify fresh install, upgrade from an older cache, offline navigation, and recovery after a failed network request.
- Do not cache authenticated or user-specific API responses as public static assets.

**Project application:** GoGo site shell, Sarkari Sarthi and PikaNews offline shell; Arrow Out and Crystal Quest must retain their existing save/game state semantics.

### 2. Government job structured data

Reference: https://developers.google.com/search/docs/appearance/structured-data/job-posting

- Put JobPosting structured data on a single, genuine job-detail page, not the jobs collection page.
- Keep title, hiring organization, location, datePosted and validThrough consistent with visible content and source notice.
- Expired/closed vacancies must be updated or removed from the eligible job-search experience and structured data.
- Never invent salary, employer, date, location or eligibility when the source does not provide it.
- The application route and structured-data URL must be canonical and crawlable.

**Project application:** Sarkari Sarthi source adapters, job detail generator, manifest/status transitions and schema tests.

### 3. News sitemap and article trust

Reference: https://developers.google.com/search/docs/crawling-indexing/sitemaps/news-sitemap

- Keep the News sitemap limited to recently published articles (Google's guidance is a rolling two-day window).
- Keep the regular XML sitemap separate; older articles can remain in the regular sitemap if they remain useful and indexable.
- Ensure publication date, modification date, headline, publisher and canonical URL agree with the rendered article.
- Clearly attribute source publishers and link to the original report. Do not imply aggregated excerpts are original reporting.
- Remove thin, duplicate, withdrawn or tombstoned content from sitemaps.

**Project application:** PikaNews article generator, RSS/news sitemap generation and retention/tombstone workflow.

### 4. API and authentication security

References:
- https://cheatsheetseries.owasp.org/cheatsheets/REST_Security_Cheat_Sheet.html
- https://firebase.google.com/docs/auth

- Enforce authorization on the server for every protected endpoint; hiding admin controls in the browser is not authorization.
- Validate and normalize request data at the API boundary; use allow-lists for state-changing operations.
- Use HTTPS, short-lived/session-aware authentication and least-privilege admin roles.
- Keep secrets in server-side environment configuration; Firebase web configuration is not a substitute for Firestore/Storage security rules.
- Test unauthenticated, wrong-role and malformed requests, including direct API calls.

**Project application:** GoGo central backend, Firebase rules, Sarkari Sarthi admin and notification endpoints. No permission or rules change is made by this SEO branch.

### 5. Core Web Vitals and media

Reference: https://web.dev/articles/top-cwv

- Reserve image dimensions/aspect ratios to reduce layout shift.
- Lazy-load below-the-fold images, but do not lazy-load the LCP/hero image.
- Serve appropriately sized modern image formats and provide a real fallback when a remote image fails.
- Reduce long main-thread tasks and measure INP/LCP/CLS on mobile devices.
- Check keyboard access, focus visibility, contrast and reduced-motion behavior alongside performance.

**Project application:** GoGo landing pages, PikaNews image cards, Sarkari listing cards and game launch pages.

### 6. Browser-game runtime and compatibility

Research direction: keep the current dependency-free HTML5/Canvas game architecture. Use requestAnimationFrame for rendering, scale the canvas to device pixel ratio while bounding excessive pixel counts, prefer Pointer Events for unified touch/mouse input, and profile on real low/mid-range Android devices. Preserve game-specific mechanics, deterministic level data, save keys and import/export formats. Any runtime change must have a regression test before implementation.

**Project application:** Arrow Out and Crystal Quest. This SEO change does not modify either game's gameplay engine or save format.

## Verification still required before release

- Run the repository's full `npm test` pipeline on the PR branch.
- Inspect generated landing pages to confirm the new section appears once and does not cover navigation, canvas or footer content.
- Check canonical URLs, sitemap entries, structured data and page metadata after the post-sync generator runs.
- Run Lighthouse/mobile checks and test offline install/update flows on real Android devices.
- Review backend/API/Firebase rules separately before claiming security improvements; this document is research guidance, not proof that those controls have been audited or fixed.

## Explicit non-goals

No Hindi-language site, translations, hreflang, new URL structure, keyword stuffing, invented news/job data, game logic changes, new dependencies, or changes to existing production API contracts.


## Additional verified implementation findings (2026-11-19)

### Sarkari Sarthi
- Existing detail-page generation already avoids emitting JobPosting JSON-LD when the job is expired/cancelled or lacks required official-source facts.
- Closed job detail pages remain available as reference pages with a visible closed-state banner and `noindex,follow`; closed/unverified entries are excluded from the active job sitemap.
- The frontend already excludes records whose application deadline has passed. The follow-up patch additionally excludes explicit `verification_status=expired|cancelled` and `status=closed` from live search results.
- Sitemap `lastmod` now prefers `modified_at` / `updated_at`, falls back to the source-verification timestamp, validates the date, and never substitutes the current build time. Invalid timestamps are omitted.

### PikaNews
- Current feed pipeline is an automated third-party aggregation service, not an original-reporting newsroom. Existing category pages already contain crawlable category-specific introductions and publisher-attribution guidance.
- Individual aggregated story pages remain accessible to readers but are `noindex,follow`, excluded from regular and Google News sitemaps, and do not receive NewsArticle JSON-LD.
- A future story can become indexable only when the record explicitly identifies original editorial content, has review approval, at least 1,200 characters of substantive original text, a named author and a valid publication date.
- NewsArticle publisher is PikaNews; `dateModified` is emitted only from explicit `modified_at` / `updated_at`, never from collection time. The regular sitemap prefers a real modification date and falls back to publication date.
- PikaNews homepage first featured image and article hero images load eagerly with high priority and reserved dimensions; category cards reserve 640×360 dimensions, prioritize the first visible image and lazy-load subsequent cards. The dynamic article fallback also reserves image dimensions.
- The GoGo post-sync enhancer preserves article-level noindex instead of overriding it to index. The GoGo News sitemap builder independently checks editorial eligibility, schema and robots state.

### Arrow Out! and Crystal Quest
- Arrow Out already has a crawlable About/how-to-play page, server-rendered explanatory text and a no-JavaScript fallback; its game entry point is not the only discoverable content.
- Arrow Out's current renderer already scales its Canvas for device pixel ratio and uses Pointer Events in its input path. Do not add a second input/render loop or change the puzzle engine without measured evidence.
- Crystal Quest uses a Canvas 2D renderer with device-pixel-ratio scaling capped at 2, a requestAnimationFrame render loop, and Pointer Events for board interaction. Preserve this architecture; do not add duplicate input/render loops.
- Real-device Android performance testing remains a release verification task; repository-level checks cannot substitute for a physical low/mid-range phone.

### GoGo Central Backend security
- The current backend contains server-side Firebase ID-token verification with revocation checks, server-derived admin RBAC, strict Zod request schemas, HTTPS-origin CORS allowlisting, rate limiting, production sandbox-auth blocking and an executable security regression suite.
- These are repository-level findings, not a fresh proof of the currently deployed Render configuration. Verify the live service's environment, health and CI/deployment state before declaring production security complete.
- The current Render service is live on commit `e27eef9`; the sampled 2026-11-18 to 2026-11-19 ERROR log query returned no entries. Render's `healthCheckPath` is blank, so configure a public 2xx health endpoint as a separate operational hardening step after verifying the exact route.
- `SEC-18` remains marked partially fixed in `SECURITY.md`; do not label the entire security backlog fully closed.

### Search Console verification snapshot
- Connected and readable Search Console property: `sc-domain:gogocompany.in`.
- For 2026-10-19 through 2026-11-15: 3 clicks, 90 impressions, 3.33% CTR, average position 6.94 (small early sample; comparison period had no data). The latest settled query rows through 2026-11-16 showed only branded/navigation terms (gogo company, go company, go go company, pikanews, arrowout) plus one irrelevant long-tail query; no meaningful non-brand target keyword was yet producing clicks.
- Query rows exposed only 33.3% of total clicks and 38.9% of impressions (66.7% / 61.1% hidden), so query-level totals must not be inferred by summing visible rows.
- Four submitted sitemaps were readable with zero reported warnings/errors: root sitemap (21 URLs), Sarkari Sarthi sitemap (185 submitted), PikaNews sitemap (1,016 submitted), and PikaNews News sitemap (99 submitted). Google no longer returns indexed counts in the sitemap report. These are pre-change baseline counts; the PikaNews sitemap is expected to shrink to category/static pages and the News sitemap may be empty until qualifying original editorial is published.
- Sitemap URL performance showed 4/21 root sitemap URLs, 5/202 sampled Sarkari Sarthi URLs, and no impressions for the first 100 PikaNews News sitemap URLs in the selected range. This is not proof that every zero-impression URL is unindexed.
- URL Inspection passed for the homepage, PikaNews homepage, Sarkari Sarthi homepage and Crystal Quest homepage. Arrow Out About, PikaNews Bollywood category and a sampled PikaNews article were reported as unknown to Google at inspection time.
- CrUX has no Core Web Vitals field record for `https://gogocompany.in` on PHONE or ALL devices. Do not report this as a CWV pass or failure; use Lighthouse lab runs and real Android device testing until field data is available.


### On-page crawl audit (8 live URLs, 2026-11-19)

- Audit summary: 8 URLs fetched, 7 indexable, 1 canonicalised, 6 total issues (0 critical, 0 high, 1 medium, 5 low). All audited pages returned HTTP 200 and had a viewport declaration. No missing image alt text or structured-data parsing errors were reported.
- GoGo homepage: no on-page issues; 792 words, 19 internal links, self-canonical.
- Arrow Out game page: no on-page issues; 790 words, self-canonical. Its guide page has 608 words and a self-canonical, but lacked structured data; PR #44 adds matching WebPage/FAQPage JSON-LD, a GoGo favicon and regression checks for guide metadata.
- Crystal Quest: no on-page issues; 454 words, self-canonical.
- PikaNews homepage: 541 words and self-canonical; the prior title was 67 characters and was shortened in this branch to reduce SERP truncation. Bollywood category page had no on-page issues and 539 words.
- Sarkari Sarthi homepage baseline: title 75 characters, meta description 190 characters, and 293 words. The existing PR keyword enhancement replaces this with a concise title/description and adds visible explanatory content.
- `/about/` is a legacy duplicate canonicalised to `/about.html`; the homepage already links to the canonical `/about.html` company profile. Do not treat the legacy alias as a separate indexable company page.
- Live HTML response times in this crawl ranged from 143–230 ms, but this is fetch latency only, not a Core Web Vitals or real-device performance result.
