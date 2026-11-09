# Sarkari-Sarthi Security Remediation

Date: 2026-11-06. This file describes what was changed, what needs
manual/owner action, and how to roll back.

## What was changed (this PR)

1. admin.js fully rewritten as a read-only viewer:
   - removed: hardcoded password hash, hashPassword/checkPassword,
     adminLoggedIn gate, ghToken/ghRepo settings, triggerScraper,
     editJob, deleteJob, saveJobData, job modal logic,
     updateManifestOnGithub (the direct PUT to main).
   - kept/improved: same-origin relative fetch of
     jobs/job_manifest.json, DocumentFragment batch rendering,
     textContent-only cells (no innerHTML with manifest data).
2. admin.html reduced to the read-only viewer UI: login overlay,
   GitHub Settings card, Actions card and the job edit modal are gone;
   a notice explains why.
3. tests/test_admin_viewer.test.js added: source invariants (no fake
   auth, no tokens, no GitHub API, no write paths) plus runtime
   rendering tests including a hostile-manifest XSS attempt.
4. daily-job-fetch-deploy.yml: least-privilege permissions
   (contents: read by default, contents: write only for the
   fetch-and-deploy job) and SHA-pinned actions.
5. .github/dependabot.yml added (github-actions, pip, npm; weekly).
6. .github/workflows/codeql.yml added (python + javascript).
7. SECURITY_AUDIT.md and SECURITY_TEST_RESULTS.md added.

## Why the admin login was removed instead of "fixed"

A static GitHub Pages site executes entirely in the visitor's
browser. Any password check, hidden UI element or storage flag is
client-side and therefore attacker-controlled. There is no way to do
real authentication without a server. Faking it (as the old code did)
is worse than not having it, because it looks like protection.

## Current trusted edit path (no backend needed)

- Edit job JSON files / manifest directly in the GitHub web UI
  (github.com repo page). GitHub enforces real account
  authentication, 2FA and full audit history.
- Trigger the scraper from the Actions tab ("Run workflow" on
  daily-job-fetch-deploy.yml). The token used is the ephemeral
  in-workflow GITHUB_TOKEN, never a personal token in a browser.

## Minimum backend required if a browser admin UI is ever wanted

Documented for future reference; NOT built (no budget, no server):
- A server (e.g. a small free-tier host) that holds the GitHub
  credential server-side.
- Real login: server-side sessions with HttpOnly + Secure + SameSite
  cookies, login throttling and rate limits.
- CSRF tokens on every state-changing request.
- Server-side authorization on every endpoint (role checks), audit
  logging, session expiry and logout invalidation.
- The browser admin would call only this backend; no token would ever
  reach client-side JavaScript.

## Owner actions (manual, outside this PR)

1. Merge this PR after CI passes (no auto-merge by policy).
2. If any PAT was ever pasted into the old admin page on a shared
   device, rotate it (GitHub Settings -> Developer settings).
   The old code stored it in sessionStorage until the tab closed.
3. Ensure the GitHub account has 2FA enabled (it is the only admin
   boundary now).
4. Optional: enable branch protection on main with required checks
   (the "tests" job) in repo Settings -> Branches.
5. After merge, the gogo-website "Sync product apps" workflow (manual
   or 06:15 IST cron) copies the new admin.js/admin.html into the
   gogo repo's /sarkari-sarthi/ folder for the live site.

## Rollback

Revert the merge commit (`git revert -m 1 <merge-sha>`). The old
admin.js/admin.html return from history. Rolling back restores the
insecure login, so prefer fixing forward if anything breaks.
