# Gogo Company Website

Official website of Gogo Company — an independent Indian technology, digital media and web gaming organization headquartered in Indore, Madhya Pradesh, India, founded by Pratik Arya.

**Official website:** https://gogocompany.in/  
**Company profile:** https://gogocompany.in/about/

This repository contains the central portal and the ONLY deployment that owns the custom domain `gogocompany.in`.

## Products (unified domain)

All products and the GTA 6 guide run directly under gogocompany.in:

| Product | Final URL | Source repository |
| --- | --- | --- |
| Arrow Out! (full game) | https://gogocompany.in/arrowout/ | github.com/parya5103/Fletch_Game (branch `main`) |
| Crystal Quest (full game) | https://gogocompany.in/crystalquest/ | github.com/parya5103/crystal-quest-web (branch `main`) |
| Sarkari Sarthi (full portal) | https://gogocompany.in/sarkari-sarthi/ | github.com/parya5103/Sarkari-Sarthi (branch `gh-pages`) |
| PikaNews (news portal) | https://gogocompany.in/pikanews/ | github.com/parya5103/PikaNews (branch `main`) |
| GoGo AI Intelligence (AI news & model hub) | https://gogocompany.in/ai/ | This repository (`ai/`, daily collector workflow) |

Old product paths redirect to the new ones (query strings preserved by
JavaScript):

- `/arrow-out/` -> `/arrowout/`
- `/crystal-quest/` -> `/crystalquest/`
- `/sarkari/` -> `/sarkari-sarthi/`

## Product hosting and updates (sync workflows)

`.github/workflows/sync-products.yml` publishes the latest production
source of Arrow Out, Crystal Quest and Sarkari Sarthi into this
repository, and `.github/workflows/sync-pikanews.yml` publishes PikaNews.
The product and PikaNews workflows use the same `sync-products` concurrency group, so they can never
race each other into a failed push.

1. They check out the product source repositories at their published
   branches (see table above).
2. They copy each app into its directory with `rsync` (non-site files like
   `.github`, build tooling, dev folders and lockfiles are excluded).
3. They commit to `main` ONLY when a product actually changed, which makes
   GitHub Pages redeploy automatically.

How updates propagate:

- Arrow Out / Crystal Quest: push to the product repo's `main` branch ->
  next sync run publishes it to `/arrowout/` or `/crystalquest/`.
- Sarkari Sarthi: its own daily workflow (05:00 IST) scrapes jobs, commits
  `jobs/` to its `main` and republishes its `gh-pages` branch -> our sync
  (06:15 IST daily) copies that published site into `/sarkari-sarthi/`,
  so job data stays current.
- PikaNews: its own collector workflow (every 30 minutes, :00/:30 UTC)
  fetches RSS feeds, commits fresh `news_json/` data, stats, the sitemap,
  the Google News sitemap (`news-sitemap.xml`), the RSS feed and the
  generated static article pages (`news/<slug>/`) to its `main` -> our
  sync-pikanews workflow (:10/:40 UTC) publishes the frontend plus that
  data into `/pikanews/`, so news stays current. The sync verification
  requires the news sitemap and refuses sitemaps that still list
  query-parameter article URLs.
- Both product syncs also run manually: Actions tab -> "Sync product apps" or
  "Sync PikaNews" -> "Run workflow".
- The product repositories remain the single source of truth; nothing is
  hand-edited inside `/arrowout/`, `/crystalquest/`, `/sarkari-sarthi/` or
  `/pikanews/` (edits there would be overwritten by the next sync).

## AdSense readiness (NOT yet active)

The AdSense publisher ID and existing ad-unit IDs are configured, but advertising is
currently OFF because `cmpReady` is `false` in the central and PikaNews loaders.
No ad requests are made until the required certified consent setup is verified
and the site is approved for serving.

- `assets/js/ads.js` - central, shared integration. Config at the top:
  `publisherId` (empty = fully off), `cmpReady` (EEA/UK/CH gate) and
  per-slot IDs. Guarded against duplicate script injection.
- `assets/css/ads.css` - ad unit styles; every ad is labelled
  "Advertisement" and visually separated from content.
- Website ad slots exist on informational pages (homepage mid-content,
  about-page bottom), while the games manage their own optional AdSense /
  AdMob placements via their own `js/ads.js` modules. Ads are never styled
  as job listings.
- PikaNews ships its own `frontend/js/ads.js` following the same rules:
  one loader per page, the same verified GoGo publisher ID, the existing
  responsive display unit, honest "Advertisement" labels and the same
  `cmpReady` fail-closed gate. Placements are limited to one homepage /
  category mid-content slot, the desktop sidebar and after-article-content
  positions, and never appear on legal, search-result, error or
  under-construction pages.
- EEA / UK / Switzerland: ads stay disabled for those regions until a
  Google-certified CMP (e.g. Funding Choices) handles consent. Set
  `cmpReady: true` only after that works - in the central loader and in
  the PikaNews loader alike.
- `ads.txt.example` documents the ads.txt format. `ads.txt` at the root
  contains the Google AdSense publisher declaration. PikaNews relies on
  this single root `ads.txt`; no duplicate exists under `/pikanews/`.

## Shared GoGo Account, Cloud Save & Marketing Subscriber System

A unified Firebase Authentication + Cloud Firestore bundle (`src/gogo-account.ts` -> compiled to `assets/js/gogo-account.js` and synced into `arrowout/js/gogo-account.js` and `crystalquest/js/gogo-account.js`) provides:

- **Cross-App Single Sign-On (`gogocompany.in`)**: Email/Password registration & login, Email Verification, Google Sign-In, Password Reset, and Account Deletion across `/`, `/arrowout/`, and `/crystalquest/`. Guest play remains enabled by default.
- **Game Cloud Save & Conflict Resolution**: Automatic & manual cloud backup to `gameProfiles/{uid}/games/{gameId}` with side-by-side Local vs. Cloud vs. Smart Merge conflict resolution.
- **Explicit Marketing Consent & Unsubscribe**: Optional, unchecked-by-default marketing consent during registration stored in `marketingSubscribers/{uid}`. Only verified emails with explicit consent are exported to promotional CSV lists.
- **Protected Admin Dashboard (`/admin/`)**: Fail-closed admin dashboard (restricted by Firestore Security Rules to verified admins) with 6 KPIs, registration trends, search/filter, pagination, and RFC-4180 / formula-injection-hardened CSV exports.

Build & test commands:

```bash
npm run build:account   # Bundles src/gogo-account.ts -> assets/js/gogo-account.js
npm test                # Runs unit tests, ESLint security rules check, and upstream game tests
```

## Other pages

| Path | Content |
| --- | --- |
| `/` | Homepage - company intro and product cards |
| `/ai/` | Global AI news, model catalogue, pricing metadata, research and open-source AI resources; refreshed daily by `.github/workflows/refresh-ai-hub.yml` |
| `/account/` | GoGo Account & Cloud Save management |
| `/unsubscribe/` | Email marketing preference & one-click authenticated unsubscribe center |
| `/admin/` | Protected GoGo Admin Dashboard (verified admins only) |
| `/about/` `/contact/` | Company info |
| `/privacy-policy/` `/terms-and-conditions/` `/disclaimer/` | Legal pages |
| `404.html` | Not-found page (noindex) |

## GoGo AI Intelligence Hub

- `ai/index.html` is generated as static, crawlable HTML with canonical metadata, JSON-LD, original-source links and responsive sections.
- `scripts/update-ai-hub.py` collects public RSS/Atom feeds from AI labs, Hugging Face and arXiv, plus OpenRouter's public model catalogue. It needs no LLM API key.
- `ai/data/ai-news.json` and `ai/data/model-catalogue.json` retain the latest source-backed snapshots; failed source fetches do not erase previous news.
- `ai/feed.xml` exposes a dedicated RSS feed. The main sitemap is refreshed with the AI hub's last-modified date.
- Model context windows and prices are provider-declared metadata, not a quality leaderboard. Benchmark comparisons link to their original providers; no scores are fabricated.
- The scheduled refresh runs daily at 08:50 IST in its own concurrency group, so it does not cancel product/PikaNews sync jobs. If another publisher updates `main` at the same time, the collector safely fetches, rebases and retries its push up to three times.

## Architecture

- Static HTML/CSS/JS served directly on GitHub Pages (`gogocompany.in`), with `assets/js/gogo-account.js` pre-bundled from TypeScript (`src/gogo-account.ts`) so no server runtime is required in production.
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
  scopes, so they work unchanged inside their subdirectories. PikaNews
  ships no service worker at all.
- `assets/js/sarkari-data.js` and `assets/js/sarkari.js` are retained from
  the old Sarkari promo page (now a redirect); they are not referenced by
  any page anymore.

## Deployment (GitHub Pages + custom domain)

Deployed from branch `main`, folder root. See DEPLOYMENT.md for the
one-time Pages + GoDaddy DNS setup and the post-deploy verification
checklist.


## SEO quality and growth

- The homepage title, description and single H1 describe GoGo Company as a browser-games, AI and digital-media hub; product names and search intents belong on their own relevant landing pages.
- Keep keyword use natural. Do not repeat exact-match phrases, inject generic SEO paragraphs into aggregated feeds, or create thin pages solely to target a query.
- Keep page titles, descriptions, H1s, visible copy, canonical URLs, robots directives, structured data and sitemap membership aligned.
- Use `npm run build:site` followed by the SEO/build validation commands in CI after homepage-source changes.
- Off-page growth is editorial and relationship-led: earn relevant mentions through useful original guides, genuine partner/resource pages and product showcases. Do not buy links, use automated submissions, private blog networks or reciprocal-link schemes. See `docs/SEO_OFFPAGE_PLAN.md`.
- Search Console impressions, clicks, indexing and Core Web Vitals are measured outcomes; code validation alone does not prove Google ranking or traffic growth.
