# GoGo Company — Developer Research & Search Intent Plan

Updated: 2026-11-19

## Scope and guardrails

This plan covers GoGo Company, Sarkari Sarthi, PikaNews, Arrow Out! and Crystal Quest. Preserve the current application architectures, public routes, deployment/sync order, existing data formats, game rules, save compatibility and English-only UI/content. Search intent may include natural English and Hinglish/Roman-Hindi phrases; do not create translated pages, Hindi UI, `/hi/` routes or hreflang declarations. Do not add a phrase to a page if the product does not actually satisfy that intent.

## Search-intent implementation in this branch

The post-sync SEO enhancer now adds one visible, escaped, idempotent search-intent section with concise FAQs to the four product landing pages:

- **Sarkari Sarthi:** latest government jobs, govt job vacancy, sarkari naukri 2026, central government jobs, Madhya Pradesh government jobs, admit cards and sarkari results. Vacancy eligibility and dates must always be checked against the original official notice.
- **PikaNews:** Bollywood news today, gaming news India, technology news India, business news India, and natural Hinglish queries such as “aaj ki Bollywood khabar”. Articles retain publisher attribution and original-source links; this does not claim PikaNews is the original publisher.
- **Arrow Out!:** arrow puzzle game online, free arrow puzzle game, arrow wala puzzle game, 1,000 arrow-path logic levels and no-download browser play.
- **Crystal Quest:** match 3 puzzle game, online match 3 game, free match-3 puzzle game, magical gems and a candy-crush-style gem adventure. Copy explicitly distinguishes the original game from Candy Crush.

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
