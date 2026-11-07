# GoGo Company Website - Project Knowledge

Consolidated operational knowledge for gogo-website (gogocompany.in),
kept in-repo so context survives across sessions and machines. No
secrets here by design. Last updated: 2026-11-06.

## What this repo is

- Static company hub + legal pages (index, about, contact,
  disclaimer, 404) plus the GoGo Account system (Firebase
  Authentication + Cloud Firestore, built bundle at
  assets/js/gogo-account.js, source at src/gogo-account.ts).
- Publishes synced copies of the product apps into folders:
  arrowout/ (from Fletch_Game), crystalquest/ (from
  crystal-quest-web), pikanews/ (from PikaNews), sarkari-sarthi/
  (from Sarkari-Sarthi).

## Deployment pipeline

- GitHub Pages serves the repo. Custom domain: gogocompany.in.
- Do NOT edit synced folders (arrowout/, crystalquest/, pikanews/,
  sarkari-sarthi/) by hand: the sync workflows overwrite them from
  the upstream repositories' main branches. Fix bugs upstream.
- "Sync product apps" runs manually or on a 06:15 IST cron;
  "sync-pikanews" mirrors PikaNews. After merging an upstream fix,
  run the sync to propagate it here.
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
