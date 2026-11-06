# gogo-website Security Remediation

Date: 2026-11-06. What changed in this repo, what needs owner
action, and how to roll back.

## Changes in this PR

1. scripts/run-all-tests.mjs: new section 6 "Visitor-Facing GitHub
   Link Absence". Scans all gogo-owned pages and the three gogo-owned
   scripts for github.com/parya5103 references, github.com hyperlinks
   and forms submitting to github.com; separately asserts the privacy
   policy keeps its "GitHub Pages" hosting disclosure as text without
   linking github.com. Synced product folders are excluded until the
   upstream PRs merge (see below).
2. .github/workflows/ci-tests.yml, sync-products.yml,
   sync-pikanews.yml: all actions pinned to immutable commit SHAs.
3. .github/dependabot.yml added (github-actions + npm, weekly).
4. SECURITY_AUDIT.md and SECURITY_TEST_RESULTS.md added.
5. KNOWLEDGE.md added: consolidated public project knowledge
   (architecture, deployment pipeline, sync behaviour, gotchas) so
   operational context survives outside any single session/machine.

## No code changes elsewhere

gogo-owned pages were already clean of visitor-facing GitHub links
and the /admin/ dashboard already enforces authorization in
firestore.rules (server-side). Nothing was weakened or restyled.

## Cross-repo coordination (merge order matters)

The same audit produced PRs in the linked product repositories:
- PikaNews (feat/security-hardening): footer GitHub icons -> email,
  API hardening, HMAC webhook, Dependabot, CodeQL, security docs.
- Sarkari-Sarthi (feat/security-hardening): fake browser admin login
  removed, read-only viewer, least-privilege workflow permissions,
  SHA-pinned actions, Dependabot, CodeQL, security docs.
- Fletch_Game (fix/remove-visitor-github-links): contact form
  rerouted from GitHub issues to email.

Suggested merge order (all with owner approval, never auto-merged):
1. PikaNews and Fletch_Game PRs (independent).
2. Sarkari-Sarthi security PR.
3. This PR.
4. Run "Sync product apps" (or wait for the 06:15 IST cron) so the
   fixed pikanews/, arrowout/ and sarkari-sarthi/ copies land here.
5. Extend test section 6 to the synced folders once they contain the
   upstream fixes (one-line change to gogoOwnedPages in
   scripts/run-all-tests.mjs).

## Owner actions (outside this PR)

- Review and merge the four PRs listed above.
- Consider enabling branch protection on main with required checks
  (repo Settings -> Branches).
- If any personal access token was ever pasted into the old Sarkari
  admin page, rotate it (GitHub Settings -> Developer settings).
- Security headers cannot be configured on GitHub Pages; revisit if
  the hosting setup ever changes (see SECURITY_AUDIT.md Phase 6).

## Rollback

Revert the merge commit (`git revert -m 1 <merge-sha>`). Each change
is isolated to tests, workflow pin comments, dependabot config and
new documents; no runtime product code changes are in this PR, so
reverting cannot break the live site.
