# GoGo Company Website - Project Knowledge

Consolidated operational knowledge for gogo-website (gogocompany.in),
kept in-repo so context survives across sessions and machines. No
secrets here by design. Last updated: 2026-11-24 (documentation-sync audit).

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
- Feature branches + PRs only. Never merge without owner approval.
  Never commit directly to main.

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

- A Google Tag Manager web container (GTM-T5MRTKJZ) is installed once per
  GoGo-owned HTML page (13 pages including index, legal pages and redirect
  stubs). Synced product folders are intentionally excluded; product repos
  need their own tag if wanted.
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
- PikaNews aggregated homepage intentionally stays noindex,follow and outside the root sitemap until its editorial policy is met: four reviewed original stories overall, three for a category. PR #112 restored this guardrail after PR #111 temporarily changed the directive; PR #113 was closed without merge. Do not index an aggregator page by overriding the editorial policy.
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
