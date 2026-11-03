# GoGo Company Website

Official website of GoGo Company (gogocompany.in) - independent gaming and
digital products company. This site is the central portal and the ONLY
deployment that owns the custom domain `gogocompany.in`.

## Products (unified domain)

All three products run directly under gogocompany.in:

| Product | Final URL | Source repository |
| --- | --- | --- |
| Arrow Out! (full game) | https://gogocompany.in/arrowout/ | github.com/parya5103/Fletch_Game (branch `main`) |
| Crystal Quest (full game) | https://gogocompany.in/crystalquest/ | github.com/parya5103/crystal-quest-web (branch `main`) |
| Sarkari Sarthi (full portal) | https://gogocompany.in/sarkari-sarthi/ | github.com/parya5103/Sarkari-Sarthi (branch `gh-pages`) |

Old product paths redirect to the new ones (query strings preserved by
JavaScript):

- `/arrow-out/` -> `/arrowout/`
- `/crystal-quest/` -> `/crystalquest/`
- `/sarkari/` -> `/sarkari-sarthi/`

## Product hosting and updates (sync workflow)

`.github/workflows/sync-products.yml` publishes the latest production
source of each product into this repository:

1. Checks out the three source repositories at their published branches
   (see table above).
2. Copies each app into its directory with `rsync` (non-site files like
   `.github`, build tooling, dev folders and lockfiles are excluded).
3. Commits to `main` ONLY when a product actually changed, which makes
   GitHub Pages redeploy automatically.

How updates propagate:

- Arrow Out / Crystal Quest: push to the product repo's `main` branch ->
  next sync run publishes it to `/arrowout/` or `/crystalquest/`.
- Sarkari Sarthi: its own daily workflow (05:00 IST) scrapes jobs, commits
  `jobs/` to its `main` and republishes its `gh-pages` branch -> our sync
  (06:15 IST daily) copies that published site into `/sarkari-sarthi/`,
  so job data stays current.
- The sync also runs manually: Actions tab -> "Sync product apps" ->
  "Run workflow". After the first merge of the workflow, run it once
  manually to publish the three directories.
- The product repositories remain the single source of truth; nothing is
  hand-edited inside `/arrowout/`, `/crystalquest/` or `/sarkari-sarthi/`
  (edits there would be overwritten by the next sync).

## Other pages

| Path | Content |
| --- | --- |
| `/` | Homepage - company intro and product cards |
| `/about/` `/contact/` | Company info |
| `/privacy-policy/` `/terms-and-conditions/` `/disclaimer/` | Legal pages |
| `404.html` | Not-found page (noindex) |

## Architecture

- Plain static HTML/CSS/JS. No build step, no dependencies, no iframes.
- `assets/js/main.js` injects the shared header and footer on every page
  (single source of truth for nav links: edit `NAV_LINKS` / `FOOTER_COLS`).
  Pages declare `<html data-root="./">` (root pages) or `data-root="../"`
  (nested pages) so relative links resolve correctly, and
  `<body data-page="...">` for the active nav state.
- Three themes via body class: `theme-gogo` (navy/blue), `theme-cq`
  (fantasy purple), `theme-sarkari` (light blue/green).
- `.nojekyll` at the root keeps GitHub Pages from processing the synced
  product apps through Jekyll.
- The games' PWA manifests and service workers use relative paths and
  scopes, so they work unchanged inside their subdirectories.
- `assets/js/sarkari-data.js` and `assets/js/sarkari.js` are retained from
  the old Sarkari promo page (now a redirect); they are not referenced by
  any page anymore.

## Deployment (GitHub Pages + custom domain)

Deployed from branch `main`, folder root. See DEPLOYMENT.md for the
one-time Pages + GoDaddy DNS setup and the post-deploy verification
checklist.
