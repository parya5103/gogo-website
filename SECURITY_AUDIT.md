# gogo-website Security Audit

Date: 2026-11-06. Scope: parya5103/gogo-website (gogocompany.in), the
company hub that also publishes synced copies of the product apps
(arrowout/, crystalquest/, pikanews/, sarkari-sarthi/). This document
is the cross-repo overview of the 2026-11 security hardening effort;
per-repo detail lives in each repository's own SECURITY_AUDIT.md.

Severity scale: Critical / High / Medium / Low / Informational.

## Phase 1 - Visitor-facing GitHub link inventory (this repo)

Every gogo-owned page was searched (index, about, contact, disclaimer,
account, admin, unsubscribe, privacy-policy, terms-and-conditions,
404) plus assets/js/main.js, ads.js, sarkari-data.js.

Result: CLEAN. No page links github.com, shows a GitHub icon, or
submits a form to GitHub. The visitor support channel is already the
official email (officialgogocompany@gmail.com) on the contact page and
in the site schema.org JSON-LD.

Intentionally retained:
- The privacy policy's honest hosting disclosure ("GitHub Pages" as
  plain text). Legal transparency requires naming the host; it is not
  a repository link.
- README, developer docs, workflow files and CI configuration
  (developer-facing).

Findings that DID exist live in the linked product repos, fixed there:
- PikaNews frontend footer social icons linked the public repository
  (fixed in the PikaNews security PR).
- Fletch_Game (Arrow Out!, published at gogocompany.in/arrowout/)
  routed its entire contact form to GitHub issues and presented issues
  as the support channel (fixed in the Fletch_Game PR).

IMPORTANT sync note: the arrowout/, crystalquest/, pikanews/ and
sarkari-sarthi/ folders in this repo are generated copies overwritten
by the sync workflows. Their GitHub-link and admin fixes must merge
upstream first; the sync then propagates them here. The new test
section 6 in scripts/run-all-tests.mjs deliberately scans only
gogo-owned pages until that lands.

## Phase 2 - Admin surface (this repo)

The gogo /admin/ page is a Firebase-backed dashboard. Authorization is
enforced server-side by firestore.rules (default-deny, UID ownership,
verified-admin-only listing - asserted by test sections 3 and 6 of
scripts/run-all-tests.mjs), not by hidden UI. No change required.
The client-side isAuthorizedAdminUser check is UX convenience only;
the rules are the boundary.

## Phase 3 - Frontend security (this repo)

- Rendering paths use textContent / DOM APIs; ads.js builds no markup
  from remote data; sarkari-data.js only fetches static JSON with
  comments as the sole GitHub references.
- External product links use rel="noopener noreferrer" with
  target="_blank" (spot-checked index.html).
- No postMessage handlers, no unsafe URL schemes found in gogo-owned
  scripts.
- The big client-side surface (gogo-account.js bundle) was audited in
  the earlier phases of this project (consent, CSV formula-injection
  escaping, cursor pagination) and is regression-tested by sections
  1-2 of scripts/run-all-tests.mjs.

## Phase 5 - Workflow and supply-chain (this repo)

- GG-01 (Medium): Actions pinned to mutable tags (checkout v4,
  setup-node v4 across ci-tests.yml, sync-products.yml,
  sync-pikanews.yml). Fixed: all pins are now immutable commit SHAs
  with version comments.
- GG-02 (Informational): no Dependabot. Fixed: .github/dependabot.yml
  added (github-actions + npm, weekly).
- Existing permissions blocks were already least-privilege (verified
  by reading all three workflows) - no change needed.
- CodeQL deliberately NOT added here: this repo is static HTML + tiny
  JS with a bespoke test suite; CodeQL javascript would add runtime
  for negligible findings on this codebase. Revisit if a Node backend
  ever lands. (CodeQL was added to Sarkari-Sarthi and PikaNews where
  Python code runs.)

## Phase 6 - Security headers (honest limitation)

GitHub Pages serves static files and provides NO mechanism to set
response headers (no _headers file, no server config). Therefore
HSTS, X-Content-Type-Options, Referrer-Policy, Permissions-Policy and
CSP frame-ancestors CANNOT be applied on gogocompany.in while it is
hosted on GitHub Pages. A meta CSP was evaluated and rejected:
it cannot carry frame-ancestors, and an unsafe-inline-free policy
would break AdSense and the Firebase SDK without full browser
testing, so a blind meta tag would risk breaking revenue features.
This is documented rather than pretended. If the site moves to a
host with header support (or a CDN like Cloudflare in front),
implement the header set from the original audit plan.

## Remaining risk

Response headers unavailable on GitHub Pages hosting (see above).
Browser-based session tokens for GoGo Account live in IndexedDB /
localStorage (standard Firebase behavior; documented in the privacy
policy). All fixes require owner review; nothing is merged
automatically.
