# Sarkari-Sarthi Security Audit

Date: 2026-11-06. Scope: parya5103/Sarkari-Sarthi (live at
gogocompany.in/sarkari-sarthi/). Audit covers the admin area
(admin.js / admin.html), visitor-facing pages, the deploy workflow,
and supply-chain posture. Severity scale: Critical / High / Medium /
Low / Informational.

## Findings

### SS-01 (Critical) - Fake browser-side admin authentication
- File: admin.js (old version).
- Behavior: a hardcoded SHA-256 password hash
  (`ADMIN_PASSWORD_HASH`) was checked in the browser, and
  `sessionStorage.adminLoggedIn === 'true'` was the only "authorization"
  for showing the dashboard.
- Evidence: `ADMIN_PASSWORD_HASH = "8c6976e5b541..."` (the SHA-256 of
  the literal string "password"); `showDashboard()` only flipped CSS
  display properties.
- Impact: the hash is public (view-source), so anyone could recover or
  brute-force it offline and "log in". sessionStorage is fully
  attacker-controlled, so the gate could also be bypassed without the
  password at all. This provided zero real protection while looking
  like an admin login.
- Fix: removed. No client-side authentication exists anymore. The page
  is now an unauthenticated, read-only data viewer. Real
  authentication for edits happens server-side at GitHub (web UI /
  Actions), which static hosting cannot replicate. See
  SECURITY_REMEDIATION.md for the required backend if browser-based
  editing is ever needed.
- Test: tests/test_admin_viewer.test.js source invariants assert the
  hash, `hashPassword`, `checkPassword` and `adminLoggedIn` never
  return.

### SS-02 (High) - GitHub PAT typed into the page and stored in sessionStorage
- File: admin.js (old version), admin.html GitHub Settings card.
- Behavior: the operator pasted a personal access token into the page;
  it was stored in `sessionStorage.ghToken` and sent as an
  `Authorization` header to api.github.com from the visitor's browser.
- Impact: any XSS, browser extension, shared device or shoulder-surfing
  incident leaked a token capable of writing to the repository.
- Fix: removed entirely. No token handling exists in the new
  admin.js. Repository operations now happen through the GitHub web UI
  or Actions where the token lives server-side in GitHub Secrets.
- Test: source invariant test asserts no `ghToken`, `sessionStorage`,
  `localStorage`, `Authorization` or `api.github.com` strings remain.

### SS-03 (High) - Direct write path from the browser to main
- File: admin.js (old version).
- Behavior: `updateManifestOnGithub()` PUT the job manifest directly
  to the `main` branch; `triggerScraper()` dispatched the deploy
  workflow from the browser.
- Impact: any code execution in the browser (or a stolen token) could
  rewrite the production manifest with no review, no CI gate and no
  audit trail beyond a generic commit.
- Fix: removed. The viewer can only `GET` the published
  `jobs/job_manifest.json` from the same origin. All writes go through
  GitHub's authenticated surface.
- Test: source invariant test asserts no PUT method, no
  `updateManifestOnGithub`, no `triggerScraper`, no `deleteJob` /
  `saveJobData`.

### SS-04 (Medium) - Deploy workflow ran with default (broad) token permissions
- File: .github/workflows/daily-job-fetch-deploy.yml (old version).
- Behavior: no `permissions:` block, so every job (including the
  pull_request-triggered test job) received the repository default
  token scopes.
- Impact: a compromise of any job had far more access than needed
  (principle of least privilege violation).
- Fix: top-level `permissions: contents: read`; only the
  fetch-and-deploy job escalates to `contents: write` (it must push job
  data and publish Pages). PR-triggered test jobs stay read-only.

### SS-05 (Medium) - Actions pinned to mutable tags
- File: .github/workflows/daily-job-fetch-deploy.yml.
- Behavior: all actions referenced mutable version tags (v3/v4/v5).
- Impact: a compromised upstream tag retag could execute arbitrary
  code in the deploy workflow with write access to main.
- Fix: every action is now pinned to an immutable commit SHA with the
  version kept as a comment (checkout v4, setup-python v5,
  setup-node v4, cache v3, upload-artifact v4,
  peaceiris/actions-gh-pages v3).

### SS-06 (Informational) - No automated dependency/supply-chain scanning
- Fix: added .github/dependabot.yml (github-actions + pip + npm,
  weekly) and .github/workflows/codeql.yml (python + javascript,
  scheduled and on PRs).

## XSS posture

The old admin table rendering already used `textContent` for job
fields (good). The new viewer keeps that discipline and the test suite
now proves it: a manifest containing `<img onerror>`, `<script>` and
`<iframe>` markup in job titles/departments renders as literal text
with zero executable nodes.

## Visitor-facing GitHub links

None found on the portal's public pages. The rebuilt admin.html also
contains no GitHub links. Internal references (workflow files, this
document) are developer-facing and intentionally retained.

## Remaining risk

The published manifest is world-readable by design (it is the site's
data). The viewer is unauthenticated by design; it exposes nothing
that the public site does not already render. Real admin security now
depends entirely on GitHub account security: strong account password,
2FA, and fine-grained tokens if any local tooling is ever added.
