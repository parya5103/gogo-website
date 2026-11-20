# GoGo Company frontend release QA checklist

## Build and SEO
- [ ] `npm ci`
- [ ] `npm run build` (existing Account and notifications bundles)
- [ ] `npm run build:site` (Vite, SSR, feed snapshot, allowlisted publish)
- [ ] `npm test`
- [ ] Confirm the initial response HTML contains the hero, four portal links, Organization JSON-LD, Brand Disambiguation and FAQ text without JavaScript.
- [ ] Validate the JSON-LD graph with Schema.org Validator / Google Rich Results Test.
- [ ] Confirm canonical URLs, robots directives and sitemap entries for `/`, `/about/`, `/contact/`, `/disclaimer/` and `/privacy-policy/`.
- [ ] Confirm the PikaNews root remains noindex until its editorial/indexing threshold is met.
- [ ] Confirm the root sitemap does not include noindex PikaNews listing URLs.

## Deployment safety
- [ ] Confirm `CNAME`, `robots.txt`, `sitemap.xml`, root `firebase-messaging-sw.js`, `assets/js/gogo-account.js` and `assets/js/gogo-notifications.min.js` are unchanged by the Vite publisher.
- [ ] Confirm `arrowout/`, `crystalquest/`, `sarkari-sarthi/` and `pikanews/` remain present and load their own standalone entry points.
- [ ] Confirm the publisher only writes root `index.html` and `assets/gogo-home/`.
- [ ] Confirm the product sync workflows still own product directory updates and do not copy a generic root build output.

## Responsive and accessibility
- [ ] Test 320px, 360px, 390px, 768px, 1024px, 1280px and 1440px widths.
- [ ] Test mobile menu open/close, Escape dismissal, focus order and visible focus rings.
- [ ] Test keyboard-only access to every link, theme toggle, account action and FAQ disclosure.
- [ ] Test light and dark modes, including system preference and persisted selection.
- [ ] Verify WCAG AA text contrast: at least 4.5:1 for normal text and 3:1 for large text and meaningful UI graphics.
- [ ] Verify reduced-motion preference disables nonessential transitions and smooth scrolling.
- [ ] Check that no horizontal overflow or clipped focus indicator appears at narrow widths.

## Firebase Account, Cloud Save and FCM
- [ ] Open GoGo Account from the navbar and bento account card; confirm the existing Firebase bundle loads only after an explicit click.
- [ ] Test login, registration, logout and session persistence.
- [ ] Test Arrow Out and Crystal Quest cloud-save upload, restore and conflict flows without resetting existing local progress.
- [ ] Confirm guest play remains available.
- [ ] Confirm the root FCM service worker is unchanged and notifications remain opt-in.
- [ ] Test notification permission denied, dismissed and granted states; no permission prompt should occur without a user action.

## Ads and Core Web Vitals
- [ ] Confirm no AdSense request is sent while the consent/CMP gate is false.
- [ ] Confirm the ad wrapper reserves at least 250px before any ad request; check CLS during consent-approved fill.
- [ ] Run PageSpeed Insights for mobile and desktop after deployment; inspect LCP, INP, CLS, TBT and accessibility findings.
- [ ] Re-test after cache warm-up and on a throttled mobile connection.
- [ ] Treat Lighthouse lab scores as diagnostics, not a guarantee of real-user field Core Web Vitals.

## Live feed freshness
- [ ] Confirm the Sarkari snapshot includes only active, unexpired records with HTTPS source URLs.
- [ ] Confirm PikaNews stories show the original publisher and link to its HTTPS page.
- [ ] Confirm Google Trends chips are shown only when the RSS feed returns data; otherwise the page states that trends are unavailable.
- [ ] Confirm feed refresh workflow runs after upstream manifest/latest-feed commits.
