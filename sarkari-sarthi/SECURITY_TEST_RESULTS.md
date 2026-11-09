# Sarkari-Sarthi Security Test Results

Date: 2026-11-06. Only checks actually run are listed. CI results for
this PR appear in the GitHub checks tab; the status observed at PR
creation is recorded in the final report.

## New automated tests (tests/test_admin_viewer.test.js, jest + jsdom)

1. Source invariants on admin.js (5 tests): no api.github.com, no
   token/sessionStorage/localStorage handling, no password hash or
   adminLoggedIn gate, no write-path functions, and the manifest fetch
   must use the relative URL jobs/job_manifest.json.
2. Runtime tests (5 tests):
   - DOMContentLoaded triggers exactly one same-origin fetch with
     Accept: application/json and no HTTP method override (read-only
     GET).
   - A manifest with a hostile job title
     (`<img src=x onerror=alert(1)><script>...` and an `<iframe>`
     department) renders as literal text: zero img/script/iframe/svg/
     object/embed nodes are created, and the full hostile string is
     present as textContent.
   - Empty manifest renders "No jobs found."
   - HTTP 404 renders a one-row error message, not a stack trace.
   - Network rejection renders an error message and leaves the table
     valid.

## Existing suites (must keep passing, unchanged by this PR)

- tests/test_script.test.js (script.js behaviour incl. sanitizeURL
  protocol policy), tests/test_security.py (job-ID path containment),
- tests/test_job_schema.py, test_detail_pages.py, test_fetch_jobs.py,
  test_official_sources.py, test_scraper_compliance.py,
  test_source_metrics.py, test_parser.py, test_notifiers.py.
- Workflow gate: the "tests" job runs `python -m pytest tests/` and
  `npx jest --ci`, so the new test file runs automatically.

## Static verification performed during the audit

- Grep of the old admin.js: confirmed the SHA-256 constant is the hash
  of the string "password" (offline comparison), confirming the login
  was bypassable knowledge.
- No visitor-facing GitHub links existed on public portal pages
  (index, job detail, category, privacy, terms, contact, about);
  the rebuilt admin.html adds none.
- New admin.js contains no innerHTML assignment with data; all cells
  use textContent (verified by reading the final file and by the
  hostile-manifest test).

## Not verified (honest gaps)

- No real browser/device test was performed in this environment: the
  viewer's visual layout, dark-mode styling and refresh button were
  not rendered outside jsdom.
- Workflow permission changes take effect only after merge; they were
  not exercised against a real deploy run.
- CodeQL and Dependabot produce their first results only after merge.
- jsdom does not execute injected scripts even if markup were
  created, so the XSS test asserts DOM structure (no executable nodes
  created) rather than "alert never fired".
