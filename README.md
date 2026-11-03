# GoGo Company Website

Official website of GoGo Company (gogocompany.in) - independent gaming and
digital products company.

## Sections

| Path | Content |
| --- | --- |
| `/` | Homepage - company intro and product cards |
| `/arrow-out/` | Arrow Out! browser puzzle game page |
| `/crystal-quest/` | Crystal Quest match-3 game page |
| `/sarkari/` | Sarkari Sarthi - government job notification tracker |
| `/about/` `/contact/` | Company info |
| `/privacy-policy/` `/terms-and-conditions/` `/disclaimer/` | Legal pages |
| `404.html` | Not-found page (noindex) |

## Architecture

- Plain static HTML/CSS/JS. No build step, no dependencies.
- `assets/js/main.js` injects the shared header and footer on every page
  (single source of truth for nav links: edit `NAV_LINKS` / `FOOTER_COLS`).
  Pages declare `<html data-root="./">` (root pages) or `data-root="../"`
  (nested pages) so relative links resolve correctly, and
  `<body data-page="...">` for the active nav state.
- Three themes via body class: `theme-gogo` (navy/blue), `theme-cq`
  (fantasy purple), `theme-sarkari` (light blue/green).
- Sarkari Sarthi data:
  - `assets/js/sarkari-data.js` holds curated listings (official sources)
    plus `MANIFEST_URL` pointing to the Sarkari-Sarthi scraper manifest
    (github.com/parya5103/Sarkari-Sarthi) and a baked-in fallback snapshot.
  - `assets/js/sarkari.js` fetches the live manifest at runtime, merges it
    with the curated listings, renders category tabs, search, and hides
    expired entries. If the fetch fails, the fallback snapshot is shown.
- All links are relative, so the site works under the project subpath
  (`parya5103.github.io/gogo-website/`) and at the domain root
  (`gogocompany.in`).

## Editing Sarkari listings

See the comment at the top of `assets/js/sarkari-data.js`. Rules: never
invent vacancies, dates, eligibility or fees; link official government
sources; unknown values say "See official notification".

## Deployment (GitHub Pages + custom domain)

See DEPLOYMENT.md.
