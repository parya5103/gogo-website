# GoGo Company Website - Project Knowledge

Consolidated operational knowledge for gogo-website (gogocompany.in),
kept in-repo so context survives across sessions and machines. No
secrets here by design. Last updated: 2026-11-27 (GSC CTR review, SEO changes, PikaNews sync verification and documentation corrections).

## What this repo is

- Static company hub + legal pages (index, about, contact,
  disclaimer, 404) plus the GoGo Account system (Firebase
  Authentication + Cloud Firestore, built bundle at
  assets/js/gogo-account.js, source at src/gogo-account.ts).
- Publishes synced copies of the product apps into folders:
  arrowout/ (from Fletch_Game), crystalquest/ (from
  crystal-quest-web), pikanews/ (from PikaNews), sarkari-sarthi/
  (from the Sarkari Sarthi published site).
- Also hosts the GoGo AI Intelligence hub: ai/index.html generated from
  public RSS/Atom feeds (AI labs, Hugging Face, arXiv) + the OpenRouter
  public model catalogue by scripts/update-ai-hub.py, refreshed daily at
  08:50 IST by refresh-ai-hub.yml. No LLM API key; failed feeds never
  erase previous data; model prices/context are provider-declared metadata.

## Deployment pipeline

- GitHub Pages serves the repo. Custom domain: gogocompany.in.
- Do NOT edit synced folders (arrowout/, crystalquest/, pikanews/,
  sarkari-sarthi/) by hand: the sync workflows overwrite them from
  the upstream repositories' main branches. Fix bugs upstream.
- "Sync product apps" runs manually or on a 06:15 IST cron;
  "sync-pikanews" mirrors PikaNews. After merging an upstream fix,
  run the sync to propagate it here.
- VERIFIED 2026-11-24: sync-products.yml currently checks out
  parya5103/Sarkari-Sarthi @gh-pages as the Sarkari Sarthi published-site
  source. The unhyphenated repository name is not the active source.
- Feature branches + PRs only. Merge only when the owner explicitly requests it and the diff, CI state, and compatibility have been reviewed. Never merge an open PR solely because it is open; never commit feature changes directly to main.

## Key tests and gates

- scripts/run-all-tests.mjs is the master suite (CI runs it via
  .github/workflows/ci-tests.yml). Sections: account/cloud-save,
  consent/CSV, firestore.rules audit, bundle/legal consistency,
  upstream game clones, visitor-facing GitHub link absence.
- firestore.rules is the ONLY real authorization boundary for the
  /admin/ dashboard and account data. The client-side
  isAuthorizedAdminUser check is UX convenience, never security.
- Upstream repos have their own suites: Sarkari (pytest + jest),
  PikaNews (pytest, with string invariants that also scan comments),
  Fletch_Game (scripts/pages-test.js), Crystal Quest
  (tests/game.test.js).

## GoGo tag and central backend integration

- A Google Tag Manager web container (GTM-TH4NX8MH) is the active container in the current GoGo-owned site files. Preserve existing placements and avoid duplicate loads. Synced product folders are managed separately by their upstream repositories.
- assets/js/gogo-notifications.js + firebase-messaging-sw.js wire the GoGo
  Central FCM backend (opt-in notifications; config gates fail closed).
- After a successful product sync, the workflow posts a product-update event
  to POST /api/v1/automation/publish on the central backend with a GitHub
  Actions OIDC token (audience gogo-central-notifications). Do not weaken
  that auth or hardcode credentials.

## Advertising (Google AdSense)

- Loader and placements live in assets/js/ads.js (shared design with
  the product apps' ads.js). Ads stay DISABLED by design until the
  Google-certified CMP consent signal (cmpReady) is available;
  per-placement disable works by leaving the slot id empty in the
  CONFIG slots map.
- Operational guide: see ADSENSE.md (PR #17) for the approval state,
  dashboard-only Auto ads steps, and the real-metrics reporting list.
- Site approval state lives in the AdSense dashboard, never in code.

## Known constraints

- GitHub Pages cannot set HTTP response headers (HSTS, nosniff,
  CSP frame-ancestors etc.). See SECURITY_AUDIT.md Phase 6.
- PikaNews main moves roughly every 30 minutes (collector commits);
  branch off main right before opening a PR there.
- Google-specific gotcha: apitest string tests in PikaNews scan
  comments too, so never leave account IDs or "ca-pub-" strings in
  comment text of test-scanned files.

## Security docs (2026-11 audit)

- SECURITY_AUDIT.md: findings and the cross-repo overview.
- SECURITY_REMEDIATION.md: what changed, merge order, owner
  actions, rollback.
- SECURITY_TEST_RESULTS.md: what was actually tested and what was
  not.


## Verified state and guardrails (2026-11-21)

- Root homepage remains React + Vite + SSG (frontend source, generated static output). PR #108 fixed frontend CI path filters. The live homepage was inspected with TinyFish: server-rendered content, canonical/indexable metadata, product navigation and FAQ interactions were present. Do not rebuild the architecture solely for visual polish; preserve product routes and account flow.
- PR #110 improved the synced portfolio copies: public Sarkari counts distinguish current listings from withheld review records, stale/unverified records are not treated as verified vacancies, the Arrow Out fake rewarded-hint timer was removed from the synced copy, and duplicate GTA 6 FAQ/disclaimer text was cleaned up. Main CI, responsive, build, Lighthouse, SEO and security checks passed.
- PikaNews homepage is `index,follow` with the clean `/pikanews/` canonical and is included in its product sitemap. Individual third-party aggregated story pages remain `noindex,follow` and excluded from both regular and Google News sitemaps. Only source-diverse topic hubs meeting the live quality thresholds enter the regular sitemap; the Google News sitemap is reserved for reviewed original editorial. Never confuse the homepage/topic-hub policy with individual aggregated-story policy.
- Arrow Out source of truth is parya5103/Fletch_Game. PR #61 removed the fake five-second rewarded-ad timer from the upstream game, disabled the unavailable rewarded-hint button, and updated public About/Privacy/README/AdMob copy. Three free hints remain. No real rewarded provider or advertising SDK is enabled; do not simulate an ad reward.
- Sarkari Sarthi uses India-local dates for application deadlines. PR #13 changed deadline calculations to Asia/Kolkata; UTC evening runs must not keep already-expired Indian deadlines active. Latest manifest snapshot: 176 records, 155 status-active, 21 expired, 114 Needs Review. The public search applies stricter verification/freshness eligibility; manifest active counts are not the same as publicly searchable current listings. Missing dates must not be guessed.
- PikaNews, Arrow Out, Crystal Quest and Sarkari Sarthi folders are synced copies. Make fixes in their upstream repositories first; use the product-sync workflow to propagate them. The current Arrow Out synced copy already contains the fake-demo removal from PR #110, and upstream PR #61 is now merged.
- AdSense/AdMob remain disabled until required consent and provider integrations are actually configured and verified. The shared AdSense loader uses a fail-closed CMP gate (cmpReady=false). Never claim revenue or real ad serving based on a placeholder, connected-provider label, ads.txt authorization or account status alone.
- Public pages must not expose GitHub repository links/buttons. The master test suite includes visitor-facing GitHub-link absence checks.
- OpenUI reference skill lives at .agents/skills/openui/SKILL.md. No OpenUI agent/app or local inference endpoint is currently configured. OpenUI rendering still requires model inference; Gateway requires a server-side THESYS_API_KEY. Do not add fake model responses or place secrets in client code. A keyless alternative requires a separately hosted local model endpoint (for example Ollama/llama.cpp) and an authorized connection to that host.


## SEO quality improvement round (2026-11-25)

- Working branch: `seo/content-quality-audit-2026-11` (feature branch; do not merge without owner approval).
- Re-audit found that the homepage title still described the portfolio as “Sarkari Exam Tools” and omitted the AI hub, while the hero H1 (“Play. Prepare. Grow with GoGo.”) was brand-friendly but did not state the site's main topics. The source is `frontend/index.html` + `frontend/src/App.jsx`; the root `index.html` is generated output and must remain in sync.
- Proposed homepage positioning: title “GoGo Company | Browser Games, AI & Digital Media”; description names Arrow Out!, Crystal Quest, Sarkari Sarthi, PikaNews and GoGo AI Intelligence; one descriptive H1 names browser games, AI and digital media. This is a focused relevance improvement, not a ranking guarantee.
- Existing product landing pages already have distinct titles and one relevant H1 in the sampled source review. Keep product-specific intent on each product page; do not force every keyword onto the homepage.
- Backlinks cannot be manufactured safely by code. Follow the ethical outreach plan in `docs/SEO_OFFPAGE_PLAN.md`; no paid links, PBNs, bulk directories or automated link exchanges.
- Validation updates require checking the prerendered build output and SEO tests. This change has not been run locally in this GitHub-only session; CI results must be checked on the PR before merge.
- Existing open SEO PRs (#71, #72, #86, #145) are separate work and must be reviewed for overlap/merge order rather than silently merged or overwritten.

- First PR checks exposed a stale hard-coded H1 expectation in `scripts/prerender-home.mjs` (it required the old “Play. Prepare.” slogan). The SEO build and responsive jobs stopped at that guard, before their downstream checks. Updated the prerender guard to the new descriptive H1 and corrected the new H1/meta validation regexes; rerun CI and inspect all job results before marking validation complete.

- Follow-up CI showed React server rendering HTML-escapes the ampersand in the H1 as `&amp;`. The prerender and publish guards were updated to check the serialized HTML entity, matching the actual rendered output. Re-run CI on the new head; previous failure is not a product runtime failure.

- CI exposed a stale repository-name assertion in `scripts/run-all-tests.mjs`: it expected the nonexistent `parya5103/sarkarisarthi` and prohibited the actual source. Verified GitHub repository `parya5103/Sarkari-Sarthi` exists and its `gh-pages` branch exists; corrected the test and README/knowledge to match the live workflow. No sync source or workflow behavior was changed.

- To avoid keyword stuffing, removed the generic search-term paragraph from the Sarkari Sarthi homepage post-sync enhancement. Its existing H1 (“Latest Government Jobs in India”), page-specific title/description, real job listings and official-source verification remain the search-intent signals. The regression test now protects that useful H1 and forbids the artificial keyword-list copy.

- The GoGo AI Intelligence hub had a poetic H1 that omitted its actual search intent. Updated both its daily generator (`scripts/update-ai-hub.py`) and current generated `ai/index.html` to the concise descriptive H1 “AI News, Models & Research”; daily refresh will preserve it.

- Latest validation snapshot (2026-11-25): SEO validation, CI Tests, frontend build/performance and security scan passed on the current feature branch; responsive regression reported horizontal overflow on `/sarkari-sarthi/` at 390px and 430px in the previous completed run. This is not a verified fix and remains a separate mobile QA item. CodeQL completed successfully; the responsive regression remains failed on `/sarkari-sarthi/` at 390px and 430px and is not fixed by this PR.

- CI rerun found the prerender content guard relied on brittle raw-HTML substring checks. It now normalizes rendered visible text (scripts/styles/tags/entities/whitespace) before checking the homepage H1, brand disambiguation and FAQ heading. Awaiting a fresh full CI run.

- Latest GitHub Actions logs pinpointed a JavaScript syntax error in the new prerender guard: regex literals contained doubled backslashes, so the closing script/style regex parsed an invalid flags sequence. Corrected the regex literals to normal JavaScript regex syntax. This is a CI-only validation-script fix; verify the next PR run before merging.

- Next CI run parsed the regexes successfully but the FAQ guard still had a doubled backslash (`\\s`) in its whitespace matcher, causing a false negative. Corrected it to JavaScript `\s+` so the check accepts the rendered heading whitespace. Recheck the complete CI suite; the current branch has not been merged or deployed.

- 2026-11-26: PR #156 branch was synchronized with current `main` using a two-parent merge commit while preserving the newest generated PikaNews/AI datasets. Responsive regression root cause confirmed: the closed fixed `.nav-menu` drawer is translated beyond the viewport and inflates document scroll width on narrow screens. Added mobile-only horizontal clipping at the document boundary; verify drawer open/close, keyboard access, and the complete responsive matrix before merge.

## 2026-11-26 SEO continuation — post PR #156

- PR #156 is merged; main is now the active source of truth. The mobile drawer overflow guard was also restored in the Sarkari Sarthi source repository and central product copy after sync overwrote it.
- About page SEO/content accuracy improved on main: title/description now describe games, AI and digital media; GoGo AI Intelligence is linked in the portfolio; Sarkari Sarthi is accurately described as mixing official and secondary public sources with verification labels. Do not claim all jobs are officially verified.
- Root sitemap homepage lastmod updated to 2026-11-26 because the homepage content changed. Do not advertise PikaNews news-sitemap in root robots.txt while it is empty; the news-sitemap generator intentionally admits only reviewed original editorial (named author, explicit review, 1,200+ chars, valid publication date, recent window).
- Search Console evidence from SMEPost is limited to 2026-11-21..2026-11-23, India, free recent-three-days mode. About legacy redirect URL: 11 impressions, 0 clicks, avg position 6.55; branded query gogo company 4 impressions at position 5; gogo digital media 2 at position 8. Homepage: 3 impressions, 0 clicks, avg position 11.33. Sarkari /mp-govt-jobs/: 9 impressions, 0 clicks, avg position 31.11, but it is already noindex and excluded from sitemap because supported inventory is insufficient. Treat the old URL impressions as a reason to inspect, not a reason to index the thin page.
- Added docs/SEO_OUTREACH_QUEUE.md with verified free browser-game listing prospects, factual Arrow Out!/Crystal Quest submission copy, no-paid/no-reciprocal-link guardrails and measurement fields. No external forms/emails have been submitted; no backlink is claimed.
- docs/SEO_OFFPAGE_PLAN.md now records GSC evidence, why the empty PikaNews News sitemap is intentionally not declared, and how stale SEO PRs must be ported safely.
- Stale open SEO PRs #71/#72/#86/#145 are not safe to merge as-is: they are diverged and 46–183 commits behind current main. Port selected ideas to a fresh branch after checking current generated sources. Avoid generic meta-description suffixes and thin pSEO indexing.
- GSC Wizard URL Inspection/full historical reports are blocked by expired subscription; SMEPost currently exposes only 3 finalized days and no comparison. CrawlSEO has not been deployed because no authorized remote/SSH device is connected; do not guess Oracle credentials, secrets or deploy defaults.


## 2026-11-26 PR and backlink outreach continuation

- GitHub PR audit for `parya5103/gogo-website`: merged #148 (CodeQL init 4.39.4), #149 (CodeQL upload-sarif 4.39.4), and #151 (CodeQL analyze 4.39.4). These are narrow pinned-action updates. No site source or GitHub Pages publishing workflow was changed by these merges.
- The remaining 14 open PRs were inspected by metadata and changed-file/patch review. Do not merge stale/non-mergeable branches as-is. #145 canonical audit, #72 PikaNews descriptions, #71 programmatic hubs, #78 Sarkari published-output, #86 AdSense/content quality, and #109 OpenUI renderer have diverged from current main and need selective port/rebase plus fresh tests. #57 upload-artifact v7 is non-mergeable. #83 terms wording must be reconciled with the live optional GoGo Account/cloud-save implementation before merge. Major dependency PRs #153 Vite 8, #150 plugin-react 6, #24 Firebase 13, #23 rules-unit-testing 6, #22 esbuild 0.28, and #10 Vitest 5 are not approved for blind merge; validate supported Node engines, account build, tests and deploy workflow first. At the 2026-11-26 audit, all 14 remaining open PRs were closed with explicit audit rationale in each PR body; see the latest PR cleanup entry below.
- Earned-link outreach started with no paid placement and no reciprocal-link promises. PlayNewt accepted Arrow Out! submission #515 (status URL recorded in docs/SEO_OUTREACH_QUEUE.md; review pending) and accepted Crystal Quest submission #11322032 (review pending). GAMES.GG accepted free listing requests for Arrow Out! and Crystal Quest; both are queued for editorial review, with the free queue showing up to six weeks. None is a published backlink yet; verify the public listing URL and link attribute before marking earned.
- just1more.games Arrow Out! form was filled and submitted through the browser, but Cloudflare Turnstile appeared and no success confirmation was visible. Treat it as unconfirmed; do not count it as a submission or backlink until checked.
- OpenSEO backlink-overview lookup for gogocompany.in was blocked because the connected organization has insufficient credits. Do not retry until credits are available; use free/manual checks in the meantime. No backlink count or referring-domain metric is currently verified.
- Continue outreach only to relevant free editorial browser-game directories. Track accepted, pending, published, declined, link rel attribute, and referral traffic separately. Never claim ranking impact from a pending listing.


## 2026-11-26 PR cleanup and expanded earned-link outreach

- Cleared all 14 remaining open PRs after reviewing metadata, diffs, divergence and available workflow runs. No unsafe PR was merged merely to empty the queue. Each PR body records why it was closed and what must happen before reopening. The PRs were #153, #150, #145, #109, #23, #86, #83, #78, #72, #71, #24, #22, #57 and #10. The three previously merged CodeQL PRs #148/#149/#151 and documentation PR #159 remain merged.
- Specific gate evidence: Vite 8 PR #153 and React plugin 6 PR #150 were 42 commits behind/diverged and their CI Tests, SEO validation, responsive regression and frontend performance runs failed. Rules Testing 6 PR #23 was 127 commits behind/diverged; its CI Tests, SEO validation and frontend performance runs failed, and the package requires Node >=24.12 with Firebase 13 peer compatibility. Firebase 13 PR #24 requires coordinated Node/runtime/auth/rules validation. Other stale PRs ranged from 58 to 649 commits behind and were closed rather than merged into current main.
- SEO/content ideas in stale PRs #145/#86/#72/#71 and Sarkari data-quality changes in #78 are not discarded as product priorities; selectively port only after checking current main, source-of-truth product repos, noindex policy, supported data inventory and tests.
- Expanded free game directory submissions: Still Online accepted both Crystal Quest and Arrow Out! for manual review. OpenPlayer.One Arrow Out! form was fully prepared but its CSRF/anti-bot validation repeatedly failed, so it is NOT submitted. Central India Tech offers free basic listings but requires an account; no credentials were available, so no listing was submitted.
- GSC Wizard now refuses all calls because the connected subscription/trial has ended. OpenSEO backlink overview is also blocked by insufficient credits. Until access is restored, do not claim verified referring-domain counts or backlink metrics; manually verify published pages and use available analytics referrals.
- Keep PR queue empty by opening fresh, narrowly scoped PRs from current main, with CI evidence and accurate docs. Never merge a major dependency bump without full gates and Node engine compatibility.


## 2026-11-26 backlink outreach verification

- Updated `docs/SEO_OUTREACH_QUEUE.md` with the latest live product identity/contact verification, directory checks, account/login blockers, SubmitForBacklinks suitability and current measurement limits.
- Foundplay's same-name “Arrow Out” page is a different game: it links to remix.gg and credits @Splendor_Defi. Do not claim it as GoGo's listing. OpenPlayer.One search also returned mismatched FRVR/1987-game entities and no successful submission confirmation.
- The connected SubmitForBacklinks account has no submissions and its product taxonomy has no browser-game category. Do not submit GoGo games under unrelated SaaS categories or add a reciprocal badge without a genuinely eligible listing and an owner-approved visible placement.
- The official Arrow Out! contact page publishes `officialgogocompany@gmail.com`; use it only for legitimate editor follow-up. The product pages confirm Arrow Out! and Crystal Quest: Gem Legends are GoGo-hosted browser games.
- Current keyword guest data is suggestion-only except limited cached metrics; the cached `sarkari naukri` volume is 1.22M India/Google monthly searches, with -18% trend. Ads competition is not organic SEO difficulty.
- SMEPost GSC access is restricted to 2026-11-21..2026-11-23; GSC Wizard is subscription-blocked and OpenSEO credits are insufficient. Do not claim verified backlink counts, referring domains or referral growth.
- A Central India Tech browser profile was prepared for owner sign-in; no company profile has been submitted. See the outreach queue for the setup step and verified prospects.


- Final just1more.games check (2026-11-26): the form is free and requires no login, payment, reciprocal link or CAPTCHA; email is optional. However, its public search resolved “Arrow Out!” to NISHAD GAMES' `arrowsout.io` and “Crystal Quest” to a DOS/Mac classic. Both are unrelated same-name games, so no submission was made. Use only GoGo's canonical game URLs and the full title “Crystal Quest: Gem Legends” in future outreach.


- Four free editorial outreach emails were prepared as Gmail drafts for OttersPlay and Zadely (one per GoGo game). They were not sent; owner review and explicit send action remain required. See `docs/SEO_OUTREACH_QUEUE.md`.
- Secure browser sign-in setup links were generated for Central India Tech and Desh Crux. Both are free company-directory prospects, but no account or company profile has been submitted. Do not ask the owner for passwords in chat.


## 2026-11-27 — same-day Search Console and SEO update

- Read-only Search Console sample for India is limited to 2026-11-21..2026-11-23 (free recent-three-days access; no period comparison). Homepage: 6 impressions, 0 clicks, average position 9.5. Canonical About page: 4 impressions, 0 clicks, average position 4.25. Legacy `/about.html` redirect URL: 34 impressions, 1 click, average position 6.15 across all countries. PikaNews: 8 impressions, 0 clicks, average position 9.25. Sarkari Sarthi root: 5 impressions, 0 clicks, average position 14.4. AI hub: 1 impression. Arrow Out and Crystal Quest each had 1 impression in this sample. These are very small samples, not monthly traffic estimates.
- India-filtered query rows showed `gogo digital media` on both About (2 impressions, position 8) and homepage (1 impression, position 19), a possible but low-volume intent overlap. The About title/description now target company story/founder intent; homepage remains the main portfolio/category destination. This is a snippet/intent refinement, not a ranking guarantee.
- About page copy now uses the full public product name “Crystal Quest: Gem Legends” and accurately describes Sarkari Sarthi as a mixed-source recruitment information portal with source and verification context. Its sitemap lastmod is updated to 2026-11-27.
- At inspection, the upstream PikaNews sitemap (`parya5103/PikaNews/frontend/sitemap.xml`) contained 16 URLs, including 9 indexable topic/listing hubs beyond the 7 URLs in the synced `gogo-website/pikanews/sitemap.xml`. The upstream repository is the source of truth; never hand-edit the synced `pikanews/` folder. The central `sync-pikanews.yml` workflow runs every 30 minutes and supports manual dispatch. A new CI guard compares the published sitemap with the upstream-generated sitemap so future drift fails visibly.
- Correction to earlier historical notes: the PikaNews homepage is indexable; third-party aggregated story pages remain noindex. The sitemap policy must preserve that distinction.
- No traffic increase, new backlink, or indexing result is claimed from these code/document changes. Verify the sync workflow and recheck Search Console after Google recrawls.

- The 2026-11-27 CI failure in the AI-hub check exposed a stale generator/test title contract and stale PikaNews hub assertions. Aligned the daily AI-hub generator with its concise published title (“AI News & Model Updates | GoGo AI Intelligence”) and made the PikaNews regression check respect the live policy: qualified topic hubs are indexable and listed; unqualified hubs and Trending stay noindex/out of sitemap.


## 2026-11-27 — post-merge deployment and documentation verification

- PR #165 merged as `76cd5d83dc14413c84be93cb806deb59c98d6c92`; its About-intent, AI title-contract and PikaNews sitemap/hub-policy validation changes are on `main`.
- Verified PikaNews sync run #109 (`45942749653`) completed successfully. Its sync, SEO enhancements, Google News sitemap generation, validation, topic-hub refresh, sitemap/IndexNow and commit steps all completed successfully; only the optional Central notification step was skipped.
- Verified the central Pages deployment run (`45942784361`) completed successfully after the sync.
- Compared `parya5103/PikaNews/frontend/sitemap.xml` with `parya5103/gogo-website/pikanews/sitemap.xml`: both contain the same 16 URLs and have the same blob SHA (`5a4cba6e86769ac131f6b4a2adedd695b5d9f4a1`). Do not hand-edit the central synced sitemap.
- Corrected stale agent/knowledge guidance: PikaNews homepage is indexable; only qualified source-diverse topic hubs are eligible for indexing, while unqualified hubs, Trending and individual third-party story pages remain noindex. Google News sitemap is reserved for reviewed original editorial.
- Corrected the stale GTM container ID in these docs to the active ID observed in current GoGo-owned files: `GTM-TH4NX8MH` (the prior `GTM-T5MRTKJZ` note was outdated). No tracking code or analytics configuration was changed.
- The live PikaNews page's static HTML explains the feed and source policy; its headlines are populated client-side, so a text-only crawl showing loading placeholders is not proof that the feed is broken. No live-feed runtime claim is made from that crawl.

- Test correction from PR #166 CI (2026-11-27): PikaNews Latest is currently indexable and listed; Hollywood, Entertainment, Technology, Gaming, World and Science are also eligible. Trending, Bollywood, Business and Sports remain noindex and excluded. The offline SEO regression test now asserts each page's actual robots directive and sitemap membership instead of incorrectly forcing every listing page to noindex.
