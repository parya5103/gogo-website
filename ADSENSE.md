# GoGo Company - AdSense Operations & Reporting Guide

This document describes the current ad integration across gogocompany.in, how serving is gated, which actions require the owner's AdSense dashboard, and how to read real performance reports. It covers GoGo Company (main site), Sarkari Sarthi and PikaNews. Games (/arrowout/, /crystalquest/) intentionally carry no website ad units of this kind.

## 1. Verified configuration (as of 2026-11-06)

- Publisher ID (all three sites): `ca-pub-2895136878543415`
- Root `ads.txt` (gogo-website repo, served at https://gogocompany.in/ads.txt):
  `google.com, pub-2895136878543415, DIRECT, f08c47fec0942fa0`
- Existing ad units (only these two exist; never invent IDs):
  - `7200569170` - responsive display unit (reused across placements)
  - `4574405834` - in-article fluid unit (Sarkari job detail pages)
- AdSense loader appears exactly once per eligible page (static `<head>` tag on GoGo/Sarkari pages; single guarded dynamic injection on PikaNews).

### Placement map

| Site | Placement key | Unit | Location |
| --- | --- | --- | --- |
| GoGo homepage | `home-mid` | 7200569170 | Mid-content, between feature cards and CTA band |
| GoGo about | `about-bottom` | 7200569170 | After the article content |
| Sarkari listing | `sarkari-mid` | 7200569170 | Between category grid and job listings |
| Sarkari job detail | `sarkari-detail-bottom` | 4574405834 | After the job article, before related jobs |
| PikaNews homepage | `home-mid` | 7200569170 | Mid-content, before Latest News |
| PikaNews homepage | `home-side` | 7200569170 | Desktop sidebar |
| PikaNews category/latest/trending | `category-mid` | 7200569170 | After the news grid, before Load More |
| PikaNews articles | `article-bottom` | 7200569170 | After article content, before the source/footer block |

Pages with no ad code (by policy): search, sources, editorial-policy, about, contact, privacy, terms, admin pages, account/unsubscribe, 404, error/empty states, and any page whose news content failed to load.

Ads never appear inside navigation, beside Apply buttons, on top of content, or mixed into news/job cards. Every manual placement is labeled "Advertisement" and only becomes visible when a real unit fills it. No popups, popunders, click interception or forced redirects are implemented anywhere, and none may be added.

## 2. How serving is gated (code)

Each site has one ad config file (kept as three deliberate copies because the products live in separate repositories and are synced into this domain):

- `assets/js/ads.js` (gogo-website)
- `assets/js/ads.js` (Sarkari-Sarthi repo, synced to /sarkari-sarthi/)
- `frontend/js/ads.js` (PikaNews repo, synced to /pikanews/)

Rules:

- `publisherId` must be non-empty.
- `cmpReady` must be `true`. While it is `false` (current state), no ad request is made for any visitor anywhere (fail closed).
- Browser language and timezone are never used as consent or geolocation signals (they are not reliable). Consent requirements are handled by Google's certified CMP after the owner enables it, not by site code.
- Setting a placement's slot ID to `""` in `CONFIG.slots` disables that single placement without touching page HTML.

## 3. Owner dashboard actions (require AdSense account access)

Approval first - do not resubmit or remove the site:

1. Check site status for gogocompany.in under Sites. Current status reported by owner: "Getting ready". Ads serve only after Google approves the site; until then manual placements stay empty (this is normal, not a bug).
2. Privacy & messaging: enable Google's built-in consent messaging for EEA/UK (this is a Google-certified CMP; it requires no extra site code). Verify the consent message preview.
3. Only after step 2 is live and verified: set `cmpReady: true` in the three ads.js files listed above (one line each), and merge. EEA/UK/CH visitors then see ads only after consent via the certified CMP; other regions serve normally.
4. Ads -> By site -> Auto ads: enable and configure Auto ads for gogocompany.in:
   - In-page ads (responsive placements within content)
   - Anchor ads (mobile top/bottom, dismissible)
   - Vignette ads (full-screen interstitial between page loads; use Google's frequency controls)
   - Multiplex ads (content-recommendation style units)
   Use the mobile and desktop previews in the dashboard; save/apply. Changes can take hours to a few days to take effect. Auto ads need no extra page code on pages that already carry the loader tag (all GoGo/Sarkari eligible pages do; PikaNews loads the loader after `cmpReady` is true).
   - If Auto ads density feels too high, reduce formats or placements in the dashboard (never hack spacing or clicks in code).
5. Verify serving: open a few pages (homepage, a Sarkari job detail page, a PikaNews article) and confirm real ads appear with the "Advertisement" label where applicable, no layout overlap, and no unexpected popups. Vignette/anchor behavior is controlled by Google's format settings.

## 4. Reporting (real metrics only)

All numbers come from the AdSense Reports section. Nothing in the sites simulates or estimates earnings.

Where to find each metric (Reports -> the report type shown):

- Page RPM: Reports -> "Entire account by day" or a custom report; add the "Page RPM" column.
- Impression RPM: same report; add "Impression RPM".
- Ad impressions: add "Ad impressions" (and "Ad unit impressions" for per-unit views).
- Viewability: add "Active View viewability" (measured on active-view-enabled units).
- Click-through rate: add "Ad CTR" (clicks come from real users; never encourage or simulate clicks).
- Estimated earnings: Reports -> "Entire account by day"; also the Home overview.
- Page-level performance: Reports -> "Pages" (enable page-level reports if asked); shows RPM/earnings per URL - use it to compare homepage vs Sarkari detail pages vs PikaNews articles.
- Per-site comparison: Reports -> "Sites" (gogocompany.in covers all three products since they share the domain).

Recommended routine: weekly review of Page RPM, Impression RPM, impressions and viewability per site section; monthly review of page-level performance to decide which placements earn their space. Disable underperforming placements by clearing their slot ID in the site's ads.js `CONFIG.slots`.

## 5. Policy guardrails (keep these true)

- No forced popups, popunders, click interception, deceptive redirects, or ads triggered by arbitrary clicks.
- No auto-refresh or impression inflation.
- No ad placements on admin, error, empty-search, thin-content or unsuitable pages.
- Consent via Google-certified CMP only; ads stay off when required consent signals are unavailable (`cmpReady` false).
- Manual units always carry a visible "Advertisement" label.
- Exactly one AdSense loader per page; never add a second script tag.
- Never change approval or consent flags in code without verifying the real account configuration first.
