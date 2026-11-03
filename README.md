# GoGo Company Website

Official website of GoGo Company (gogocompany.in) - independent gaming and
digital products company. This site is the central portal for three products:

| Product | GoGo page | Product site (opens in a new tab) |
| --- | --- | --- |
| Arrow Out! | `/arrow-out/` | https://parya5103.github.io/Fletch_Game/ |
| Crystal Quest (Gem Legends) | `/crystal-quest/` | https://parya5103.github.io/crystal-quest-web/ |
| Sarkari Sarthi (full portal) | `/sarkari/` | https://parya5103.github.io/Sarkari-Sarthi/ |

Product sites are separate repositories and deployments; this website only
links to them (`target="_blank" rel="noopener noreferrer"`, no iframes, no
embedding). The product repositories themselves are not part of this site.

## Other pages

| Path | Content |
| --- | --- |
| `/` | Homepage - company intro and product cards |
| `/about/` `/contact/` | Company info |
| `/privacy-policy/` `/terms-and-conditions/` `/disclaimer/` | Legal pages |
| `404.html` | Not-found page (noindex) |

## Architecture

- Plain static HTML/CSS/JS. No build step, no dependencies.
- `assets/js/main.js` injects the shared header and footer on every page
  (single source of truth for nav links: edit `NAV_LINKS` / `FOOTER_COLS`).
  Pages declare `<html data-root="./">` (root pages) or `data-root="../"`
  (nested pages) so relative links resolve correctly, and
  `<body data-page="...">` for the active nav state. Every product page also
  has an explicit "GoGo Company home" back link above the hero.
- Three themes via body class: `theme-gogo` (navy/blue), `theme-cq`
  (fantasy purple), `theme-sarkari` (light blue/green).
- All links are relative, so the site works under the project subpath
  (`parya5103.github.io/gogo-website/`) and at the domain root
  (`gogocompany.in`).

## Sarkari Sarthi listings (data + freshness)

The `/sarkari/` page combines two data sources:

1. **Curated listings** (`SARKARI_LISTINGS` in `assets/js/sarkari-data.js`):
   hand-checked entries from official government sites (ssc.gov.in,
   rrbapply.gov.in, bpsc.bihar.gov.in, ibps.in, upsc.gov.in, state boards).
2. **Scraper data** from the Sarkari-Sarthi repository
   (github.com/parya5103/Sarkari-Sarthi). Its GitHub Actions workflow
   (`daily-job-fetch-deploy.yml`) runs `fetch_jobs.py` daily at 5 AM IST,
   commits `jobs/job_manifest.json` to its `main` branch, and deploys the
   full portal to GitHub Pages. This site reads that same manifest at:

   `https://raw.githubusercontent.com/parya5103/Sarkari-Sarthi/main/jobs/job_manifest.json`

   - `sarkari.js` fetches it on every page load (live state), shows the
     manifest's `last_updated` timestamp in the status line, and merges
     detail-page listings with the curated ones.
   - If the fetch fails, an embedded snapshot (`SARKARI_SNAPSHOT`, baked in
     from the same manifest) is shown instead (fallback state) with a retry
     button (error state).
   - Expired listings (last date before today) are hidden automatically.
   - Only detail-page entries are used (URLs ending in a numeric id);
     category/junk pages in the manifest are filtered out.

Rules for listing data: never invent vacancies, dates, eligibility or fees;
link official government sources; unknown values say "See official
notification". See the comment at the top of `assets/js/sarkari-data.js`.

## Deployment (GitHub Pages + custom domain)

Deployed from branch `main`, folder root. See DEPLOYMENT.md for the
one-time Pages + GoDaddy DNS setup and the post-deploy verification
checklist.
