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
- GitHub repository access is available. Do not claim live GSC performance, indexing or traffic improvements without fresh Search Console evidence.

## PikaNews five-phase collector upgrade (2026-11-27)
- PikaNews source repository: parya5103/PikaNews.
- Implementation PR #98 was successfully squash-merged into main on 2026-11-27.
- Merge commit: c228caf748a9288b4993ab11f99d257d52783b6c.
- PR: https://github.com/parya5103/PikaNews/pull/98 (branch feat/news-collector-five-phase-upgrade).
- Scope: conditional HTTP requests (ETag/Last-Modified), Actions-cached feed bodies and source health, safe redirect checks, bounded retry/backoff, JSON Feed parsing, RSS/Atom/JSON Feed discovery helper, health/priority-aware fetch order, limited reading-context extraction, and sitemap-to-page/canonical/robots validation.
- PikaNews README.md and PikaNews/knowledge.md document the architecture and indexation policy.
- The PikaNews static-first architecture and central GoGo publishing sync remain unchanged; no second Pages deploy was added.
- Newly discovered publishers are not automatically activated. Review availability, attribution, reuse permissions, region/language and image policy first.
- Third-party RSS article pages remain noindex; original editorial and topic-hub eligibility gates remain in force.
- The user confirmed on 2026-11-27 that PikaNews CI/tests passed after merge. The connected GitHub status endpoint had earlier returned no status rows, so this remains user-reported confirmation rather than independently verified run metadata.

## Root sitemap integrity gate (2026-11-27)
- Added `scripts/validate-root-sitemap.mjs` on branch `seo/root-sitemap-integrity-2026-11`.
- The validator checks the root sitemap is advertised by root robots.txt, rejects duplicate/query/fragment/non-canonical-host URLs, resolves each listed URL to a published local HTML file, checks canonical alignment, rejects noindex pages in the sitemap, and validates optional lastmod syntax.
- Added the validator to the `npm test` chain before the existing SEO build checks.
- This is a build-time consistency safeguard; it does not prove Google crawled or indexed a URL and does not predict rankings.
- Validation has not yet been run in a local checkout or GitHub Actions in this session. Merge only after CI confirms the current sitemap and all generated pages pass.
- PR will be linked here after creation; product sync workflows and synced product directories remain untouched.


## SEO regression fixes discovered during PR validation (2026-11-27)
- The GoGo repository's `Build frontend performance assets` workflow exposed two existing SEO regression failures in `scripts/seo-tests.mjs`: Arrow Out guide privacy/contact links resolved under the wrong directory, and the AI hub meta description measured 180 characters against the project's 160-character limit.
- AI hub source `ai/index.html` updated on this branch: meta description shortened to 131 characters while retaining AI news, models, pricing, research, open-source and original-source intent; document locale changed to `en-IN`.
- Arrow Out source repository `parya5103/Fletch_Game` PR #68 was squash-merged successfully (merge commit `a28bb9997a8a95f510d486a77869a4d6deaff715`) after CI Tests, CI and Security scan all passed. It fixes all four guide privacy/contact links to resolve to product-root pages. Do not edit the synced `gogo-website/arrowout/` copy manually.
- The first PR #168 workflow attempt failed in the existing SEO regression suite on those two issues. The AI change is now committed to this branch and the Arrow Out source fix is in PR #68; rerun CI after the latest commits and require green checks before merging PR #168.
- PR #168: https://github.com/parya5103/gogo-website/pull/168
- Arrow Out PR #68: https://github.com/parya5103/Fletch_Game/pull/68

- Arrow Out source PR #68 is merged; the central product-sync workflow must publish the updated `gh-pages` site copy before the central responsive regression can confirm the production route. The GoGo source PR remains open pending its latest CI.


## Sarkari Sarthi mobile and homepage SEO fix (2026-11-27)
- Source repository PR #252 was squash-merged into `parya5103/Sarkari-Sarthi` main (merge commit `c352a2f9fa70964b9fce1118553f8447542bf78f`).
- Fixes off-canvas navigation horizontal overflow by clipping translated mobile drawer overflow at the root viewport, including a fallback for browsers without `overflow-x: clip`.
- Aligns homepage document language to `en-IN`, adds explicit `index,follow` robots and `og:locale=en_IN`, and connects the Sarkari Sarthi WebSite schema to GoGo Company publisher and parent WebSite entities.
- Does not alter job facts, JobPosting schema eligibility, expiry logic, verification labels or sitemap policy.
- Central sync reads Sarkari Sarthi from its `gh-pages` branch; the merged main-branch changes become live only after the Sarkari publishing workflow updates `gh-pages` and the central `sync-products.yml` workflow copies it to GoGo Company. The sync schedule is 06:15 IST after the product's 05:00 IST publishing run.
- No CI run was returned for PR #252 by the connected workflow-run lookup. The change is merged, but live responsive confirmation is still pending the product publish and central responsive regression.


## Follow-up CI evidence and source fixes (2026-11-27 23:50 IST)
- PR #168 head commit `d549bc1b26fcc086e464b86817fa267724c610aa` was checked against GitHub Actions. Security scan and CodeQL passed; SEO validation, CI Tests, Build frontend performance assets, and Responsive regression failed.
- The SEO validator itself reports 98 checks passed and only one failure: Arrow Out guide links still resolve incorrectly in the central synced copy. Source fix Fletch_Game PR #68 is merged; central product sync must run before this copy changes.
- CI Tests log states all 52 test suites passed, but the overall job still fails because the same SEO regression command exits non-zero. Do not report the overall workflow as green.
- Responsive regression found horizontal overflow on `/sarkari-sarthi/` at 390px (document width 413px) and 430px (document width 433px). The offender is the closed fixed `#navMenu` drawer positioned outside the viewport.
- New Sarkari Sarthi source PR #253 changes the closed mobile drawer to `display:none`, restores `display:flex` only for `.active`, and constrains drawer width to viewport minus 24px. This avoids relying on root clipping alone. PR: https://github.com/parya5103/Sarkari-Sarthi/pull/253
- PR #253 is open; its CodeQL, security scan and scheduled publishing workflows were in progress at last inspection. Do not merge until applicable checks complete. After merge, run the Sarkari publishing workflow, then central product sync, then rerun responsive regression.
- PR #168 remains open and must not be merged until all required CI checks pass. Its new root sitemap validator still needs a green CI run after product source fixes sync.


## Follow-up: Sarkari Sarthi PR #253 merged; product publishing/sync pending (2026-11-27)
- Sarkari Sarthi PR #253 was squash-merged after its PR checks completed successfully: CodeQL, Security scan, and the PR-triggered Daily Job Fetch and Deploy workflow's test job all passed. Merge commit: `1ff5a64e0733d545d486d18fbd7f0b2f418b9201`.
- Source change in `style.css`: the closed mobile navigation drawer uses `display:none`; `.nav-menu.active` restores `display:flex`; width is capped at `min(280px, calc(100vw - 24px))`. Homepage metadata/schema changes from PR #252 remain in place.
- The PR-triggered Daily Job Fetch and Deploy run did not publish: its `fetch-and-deploy` and health-check jobs were skipped because the run was a `pull_request` event. A later main-branch publish has now updated Sarkari Sarthi `gh-pages`; verified published `style.css` blob: `b7e6953edcb6faad2bb40ea180ad5ece5299c7bc`, and the mobile `.nav-menu` rule now uses `display:none` while `.nav-menu.active` restores `display:flex`.
- GoGo `sync-products.yml` reads Sarkari Sarthi from `gh-pages` and Arrow Out from Fletch_Game `main`. Its schedule is 06:15 IST. At 00:00 IST on 2026-11-28, the central sync had not yet been verified; wait for or manually dispatch the next sync, then rerun the responsive regression.
- PR #168 latest head at inspection: `6257f414f368bacdd85379208a0d1ad66443dd23`. Security scan and CodeQL passed; SEO validation, CI Tests, Build frontend performance assets, and Responsive regression failed.
- SEO validation: 98 checks passed; the sole failure is the stale central Arrow Out guide copy, which still has `privacy.html` / `contact.html` links instead of the source-fixed `../privacy.html` / `../contact.html`. Arrow Out source PR #68 is merged; central sync remains required.
- CI Tests: the suite fails on that same SEO regression check; the log also shows a Vite dependency-scan warning, but the fatal assertion is the stale Arrow Out guide link. Do not treat the warning as the root failure.
- Responsive regression: the checked-in central Sarkari copy still had the old fixed off-canvas drawer. At 390px, `#navMenu` extended to x=657 (document scroll width 413px); at 430px it extended to x=710 (document scroll width 433px). This is expected to clear only after the new Sarkari `gh-pages` publication and GoGo product sync.
- Frontend performance build itself succeeded; its subsequent regression-suite step failed on the same Arrow Out SEO assertion.
- PR #168 must remain unmerged until the current source-publish/sync sequence completes and all required checks pass. Do not hand-edit the synced `arrowout/` or `sarkari-sarthi/` directories to mask stale product sources.


## Product sync regression repair (2026-11-28)
- CI had been testing stale copies in the GoGo PR branch even though the source repositories already contained the fixes.
- Refreshed `sarkari-sarthi/style.css` from the published `gh-pages` branch of `parya5103/Sarkari-Sarthi`; the closed mobile drawer now uses `display:none` and the active drawer explicitly uses `display:flex` with a viewport-bounded width.
- Refreshed `arrowout/guide/index.html` from `main` of `parya5103/Fletch_Game`; privacy/contact links now resolve to `/arrowout/privacy.html` and `/arrowout/contact.html`.
- These are source-synchronized copies, not independent product edits. The normal `Sync product apps` workflow remains the canonical publisher after merge.


## Mobile overflow follow-up (2026-11-28)
- Latest PR #168 responsive run (46050545266) still fails on the Sarkari Sarthi route: at 390px the document scroll width is 413px; at 430px it is 433px. The report lists no individual overflowing element, so the exact layout contributor is not yet isolated.
- Added horizontal overflow containment to the authoritative Sarkari Sarthi gh-pages stylesheet (body overflow-x: clip with a hidden fallback for browsers without clip) in commit 874059752a1483ffcbc9aca3cb7d454ae18e4b87.
- Synced the GoGo PR branch copy to this source change. Rerun responsive regression at 320/360/390/430px before considering the fix verified. Do not merge PR #168 while the regression check is red.


## PR #168 merged and post-merge verification (2026-11-28)
- PR #168 (`SEO: add root sitemap integrity validation`) was merged by the repository owner into `main` at merge commit `52a2d3d7744b2a6859758cadf1251f0057d9fb3a`. The earlier pre-merge instructions in this file are superseded by this merge record.
- Confirmed on the default `main` branch that `sarkari-sarthi/style.css` includes the horizontal overflow containment (`overflow-x: clip` with fallback), and the root sitemap integrity validator and its test integration are merged.
- Post-merge checks observed: SEO validation passed; frontend performance asset build passed; CI Tests passed; Security scan passed (Trivy and Gitleaks jobs); Scorecard passed. CodeQL, Responsive regression, and Lighthouse were still in progress at last check. Do not mark these three green until their completed conclusions are fetched.
- GitHub Pages build and deployment for the merge completed successfully (run 46052316284). This confirms deployment workflow success, not a live-browser verification of every route or Google indexing.
- Follow up after outstanding checks: inspect responsive report at 320/360/390/430px; if it fails, fix the actual offender rather than relying only on page-level overflow clipping. Review Lighthouse metrics and remediate any regressions. Then continue the priority roadmap: PikaNews crawl/indexability and original editorial value, Sarkari Sarthi source verification/expiry/schema, then game landing-page search intent.


## PR #168 post-merge verification (2026-11-28)
- PR #168 merged to main as `52a2d3d7744b2a6859758cadf1251f0057d9fb3a`; GitHub Pages deployment completed successfully.
- The post-merge main run on commit `5ca30fd7003c53cf9de37051858efeb87849046b` passed CI Tests, SEO validation, Build frontend performance assets, Responsive regression, Lighthouse, CodeQL, Security scan, and Scorecard supply-chain security.
- Responsive regression now passes after the Sarkari Sarthi source CSS overflow-containment update; the authoritative source is `parya5103/Sarkari-Sarthi` branch `gh-pages`.
- PikaNews source main advanced to `fd02adedbe` (2026-11-27 17:33 UTC) after the last central PikaNews sync commit `84821f71f2` (14:55 UTC). The current upstream sitemap lists `entertainment.html`, while the central copy still lists `technology.html`; this is a stale product-sync copy, not a sitemap validator failure.
- Triggered the existing PikaNews immediate-refresh path by updating the workflow trigger comment in `.github/workflows/sync-pikanews.yml` (commit `00757474a55539a06a6fe32dea927faae90b537f`). The workflow verifies source/central sitemap equality and homepage robots/canonical tags before publishing. Confirm its run and deployment before treating PikaNews as fully synced.
- Aggregated third-party article pages remain noindex; the News sitemap is intentionally empty until reviewed, substantial original PikaNews editorial qualifies. Do not index thin aggregated story pages just to increase URL count.


## PikaNews sync and GSC follow-up (2026-11-28)
- Immediate PikaNews refresh workflow run `46052713334` completed successfully, including source checkout, rsync publication, persistent SEO enhancements, Google News sitemap regeneration, sitemap/metadata validation, PSEO hub refresh, IndexNow ping, commit, and GoGo notification.
- Central sync commit: `62693f24787a62bd66d227f19f6a9226c5ffb3ca`. Verified the published `pikanews/sitemap.xml` is byte-for-byte equal to the upstream `PikaNews/frontend/sitemap.xml`; homepage has `index,follow` and canonical `https://gogocompany.in/pikanews/`.
- The post-sync GitHub Pages deployment for commit `62693f24787a62bd66d227f19f6a9226c5ffb3ca` was still pending at the last check; do not claim the newly synced PikaNews content is live until that run succeeds.
- PikaNews collector stats at `2026-11-27T17:32:59Z`: 395 fetched, 122 new, 273 duplicates, 1 source error, 10 articles without valid publication dates, 0 expired. Next data-quality follow-up: identify the failed source and inspect date parsing/feeds for the 10 undated records; never fabricate publication dates.
- PikaNews indexing policy remains intentional: aggregator article pages are noindex; News sitemap remains empty until reviewed, substantial original editorial meets the publisher/author/content gate. Do not index RSS excerpts to inflate indexed URL count.
- SMEPost Search Console property `sc-domain:gogocompany.in` currently grants only `free_recent_three_days` access (no comparison period); latest finalized window returned was 2026-11-22 through 2026-11-24. Sample observations: PikaNews homepage 7 impressions/0 clicks/avg position 9.43; GoGo homepage 6/0/8.50; canonical About page 5/0/5.20; MP Govt Jobs hub 17/0/20.88. These are small-sample observations, not trend conclusions.
- The MP Govt Jobs hub is correctly `noindex` while it has zero qualifying official-verified records; do not remove noindex or add it to the sitemap until the programmatic hub quality gate is met. Old `/about.html` impressions appear to be a legacy redirect; canonical About page is `/about/`.
- GSC Wizard tools are unavailable because that account has no active subscription; SMEPost free access is limited to the latest three settled days. A 28-day comparative SEO report requires restored longer-range Search Console access.
