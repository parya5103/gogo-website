# AGENT_NOTES - Sarkari Sarthi Project Memory

Durable project documentation for AI agents (and humans) working on this
repo. Update this file after every meaningful verified change. Keep it
short, factual and duplicate-free. Separate confirmed facts from TODOs.

## Project purpose

Sarkari Sarthi 2.0 = independent Indian government job information
portal, live at https://gogocompany.in/sarkari-sarthi/. Static site on
GitHub Pages (gh-pages branch, published by peaceiris/actions-gh-pages)
plus a Python data pipeline on GitHub Actions. Owner: parya5103.
It is NOT a government website; every page carries that disclaimer.

## Architecture map

- Data pipeline (Python): `fetch_jobs.py` (orchestrator, `--dry-run`
  supported) -> `scraper.py` (generic portals; honest UA
  `SarkariSarthiJobPortal/2.0`, robots.txt gate BEFORE every fetch),
  `official_sources.py` (Employment News official adapter), `parser.py`
  (PDF download/extract), `job_schema.py` (normalize_job, statuses,
  verification_status, dedup keys, merge_job), `storage.py` (manifest,
  expiry, archive, backups), `detail_pages.py` (static job/<id>/ pages +
  sitemap.xml), `source_metrics.py` (per-source report ->
  logs/source_report.{json,md}).
- Frontend (no framework, zero build): `index.html` + `script.js` +
  `style.css`. Jobs are fetched client-side from
  `jobs/job_manifest.json`. `admin.html`/`admin.js` = password-gated
  manual import/edit via GitHub Contents API (token in sessionStorage).
- Tests: `tests/` pytest (pipeline) + `tests/test_script.test.js`
  jest+jsdom (frontend helpers). CI runs both on every PR/push.
- Workflow: `.github/workflows/daily-job-fetch-deploy.yml` - cron
  `30 23 * * *` (05:00 IST), pytest+jest gate, then fetch -> commit
  jobs/ job/ sitemap.xml logs/ -> deploy gh-pages (main only) ->
  Telegram/WhatsApp alerts only AFTER successful deploy -> health check
  on https://gogocompany.in/sarkari-sarthi/.

## Core data rules (do not break)

- A job expires ONLY on a verified past `last_date`. Never re-introduce
  age-based deletion (the old 15-day rule was a bug, removed).
- Expired records are KEPT (status `expired`, cap 300 in manifest,
  overflow in `jobs/expired_archive.json` - the orphan sweep must never
  delete that file, it is protected in `storage.py`).
- Unknown fields stay `null` - NEVER invent vacancies/salary/dates.
- `verification_status` labels: official_verified / official_link_pending /
  secondary_source_only / needs_review / expired / cancelled. A
  private-source-only job can never be `official_verified`.
- Duplicate signals (same URL, same advertisement_no+organization, or
  exact title + same verified last date) MERGE via `merge_job`: only
  missing fields filled, attribution kept in `source_refs`, later
  last_date = deadline extension (corrigendum).
- Manifest is backed up to `jobs/backup/` before every mutation.
- GoGo Company site (separate repo, DO NOT TOUCH) syncs
  `jobs/job_manifest.json` from gh-pages daily 06:15 IST. Manifest
  `jobs[]` core fields (`id`,`title`,`url`,`description`,
  `important_dates`,`category`) and the `/sarkari-sarthi/` path must
  stay compatible. New fields are additive only.
- Job IDs are filesystem paths (`jobs/<id>.json`): only
  `[A-Za-z0-9_-]{1,80}` is ever valid. Tested in `tests/test_security.py`.

## Source permission policy (checked 2026-11-03)

Automated fetching requires: robots.txt fetched and checked FIRST,
honest product User-Agent, no CAPTCHA/login/anti-bot bypass.
- SAFE (robots allow): freejobalert.com, fresherslive.com,
  allgovernmentjobs.in, freshersnow.com (added 2026-11-03, robots
  `User-agent: * / Allow: /`, only /wp-admin/ disallowed),
  rojgarresult.com, employmentnews.gov.in (official adapter).
- NO-SCRAPE (anti-bot / blocked / unclear -> discovery-only or manual
  admin import): sarkariresult.com (CloudFront 403, removed from
  JOB_PORTALS), kirannewsagency.com (no robots.txt), ibps.in, ssc.gov.in,
  esb.mp.gov.in, mppsc.mp.gov.in. UPSC needs JS rendering.
- PENDING robots verification (fetch tooling unreachable, do NOT
  automate until verified): ncs.gov.in, upsc.gov.in, mprojgar.gov.in.

## Upgrade phases

- Phase 0 audit + Phase 1 core data quality: DONE (PR #194 merged).
- Phase 2 source expansion: freshersnow.com added to JOB_PORTALS;
  NCS/UPSC/mprojgar remain pending robots verification.
- Phase 3 frontend quality: trust chips (verification_status) on cards,
  modal and detail pages; honest "latest" sort by last_verified (the
  old sort used the md5 job id - meaningless); bookmarks in localStorage
  with a Saved filter; extended notification fields in the modal.
- Phase 4 SEO/final: site robots.txt + sitemap reference, this file.
- Phase 5 mobile UI/UX fixes (branch `feat/mobile-menu-hero-fixes`):
  mobile menu drawer (fixed right panel, `.nav-menu.active`, backdrop,
  Escape/nav-link/backdrop close, aria-expanded/aria-controls,
  body.menu-open scroll lock; toggle is a real `<button type="button">`),
  hero reworked (min-height 100svh fallback, positive z-index stacking
  0/1/2, clamp() title, header padding), responsive `<picture>` WebP
  hero sources (hero-bg-720.webp / hero-bg-1280.webp generated by an
  idempotent ffmpeg workflow step before every deploy; browsers do NOT
  fall back when a selected <source> 404s, so the step hard-fails if
  ffmpeg is missing), duplicate escapeHTML definition removed,
  jest drawer tests added to tests/test_script.test.js.

## Verified facts / gotchas

- CI is the only Python/JS test runner available in the agent sandbox
  (no local Python/Node). `tests/` must stay green before merge.
- Workflow "Run Python tests" step splits pytest tails into `::error::`
  annotations (PYTEST-TAIL chunks) when it fails - read those on the job
  page when CI is red.
- Deploy job is skipped on pull_request events (by design).
- Third-party checks on PRs: Vercel preview, CodeRabbit, cubic AI
  reviewer (may stay in_progress; harmless).
- `admin.js` writes the manifest directly to main via GitHub Contents
  API; counters get recomputed by the next pipeline run
  (refresh_job_statuses).
- The old mobile menu bug: @media 768px had `.nav-menu{display:none}`
  with no `.nav-menu.active` display rule while script.js toggled
  `active` -> the menu could never open. The drawer fix (Phase 5) is the
  only correct pattern: off-canvas transform + `.active` slide-in.
- Telegram link is t.me/sarkarisarthi (unverified/nonexistent channel)
  and WhatsApp button uses a placeholder number. Preserved as-is by
  decision; flagged to the owner - fix only with real account details.

## Next steps

- Verify robots.txt access for ncs.gov.in / upsc.gov.in /
  mprojgar.gov.in, then decide adapters (NCS would need JS rendering).
- Monitor logs/source_report.md after nightly runs for zero-job or
  blocked sources.
- Keep this file updated with every phase.
## AdSense consent gate (2026-11-06, branch feat/adsense-consent-gate)

- assets/js/ads.js no longer guesses the visitor's region from
  navigator.language or Intl timezone (not reliable consent/geolocation
  signals; policy violation). Removed CONSENT_REGIONS,
  regionFromLanguage(), inConsentRequiredRegion().
- adsAllowed() now fails closed: no ad request anywhere while
  cmpReady is false. Owner flips cmpReady true ONLY after enabling a
  Google-certified CMP (AdSense -> Privacy & messaging built-in
  consent, or Funding Choices); Google's CMP then enforces EEA/UK/CH
  consent with its own signals.
- Placement enable/disable: set a slot id to "" in CONFIG.slots
  (sarkari-mid = 7200569170 display; sarkari-detail-bottom =
  4574405834 in-article fluid + slotAttrs). Do not invent unit ids.
- Pages carrying the static adsbygoogle loader tag (index.html +
  detail_pages.py output) are Auto-ads-ready (Anchor/Vignette/In-page/
  Multiplex are dashboard-only formats; no page code needed).
- Do NOT re-introduce browser-language/timezone consent checks.
