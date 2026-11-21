# GoGo Company React homepage architecture

## Scope

The central homepage is built with React 19, Vite and Tailwind CSS v4. The homepage is statically rendered during the build and then hydrated in the browser. The rest of the website remains static HTML, and the four product portals continue to be published from their own source repositories.

## Commands

- `npm run dev`: existing Express development server.
- `npm run build`: existing GoGo Account and notifications bundle build.
- `npm run build:site`: Vite production build, SSR homepage rendering and allowlisted publication to the repository root.
- `npm test`: existing account, SEO, schema and product regression suites plus homepage SSG checks.

## Source layout

- `frontend/index.html`: homepage document shell, theme bootstrap, metadata and organization/FAQ JSON-LD.
- `frontend/src/App.jsx`: ThemeProvider, navigation, hero, bento product tiles, trust sections, FAQ and footer.
- `frontend/src/styles.css`: Tailwind v4 entry, semantic light/dark tokens, responsive and reduced-motion styles.
- `vite.config.js`: Vite root and local asset output configuration.
- `scripts/prerender-home.mjs`: renders the product-first homepage without importing third-party job/news excerpts or volatile Google Trends RSS into the company homepage.
- `scripts/publish-site-build.mjs`: publishes only root `index.html` and `assets/gogo-home/`.

## Safe publishing boundary

The publisher intentionally does not copy a general-purpose `dist/` directory over the repository. It only replaces the generated homepage and its dedicated hashed asset directory. It verifies that these remain unchanged:

- `CNAME`, `robots.txt`, `sitemap.xml`
- `firebase-messaging-sw.js`
- `assets/js/gogo-account.js`, `assets/js/gogo-notifications.min.js`
- `arrowout/`, `crystalquest/`, `sarkari-sarthi/`, `pikanews/`

The product sync workflows remain the source of truth for the product directories. Do not edit files inside those directories in the central repository.

## Live feed behavior

The company homepage deliberately does not reproduce job listings, news excerpts or volatile search-trend keyword lists. It links visitors to each dedicated product portal, where the source-specific information and editorial context belong. This keeps the homepage focused on the GoGo Company entity and its product hierarchy.

## Theme and account integration

A small inline script applies the saved or system theme before the first paint. The React ThemeProvider persists the user's selection. The homepage account buttons keep the existing `data-gogo-open-account` contract; `assets/js/main.js` loads the established Firebase account bundle on demand. The central notifications module and root FCM service worker are not replaced.

## Ads and layout stability

The homepage reserves a 250px ad region. Existing central ads remain fail-closed until the certified consent-management requirements are satisfied. A configured publisher ID alone does not authorize ad requests.

## Hosting and performance notes

GitHub Pages continues to serve the repository root on the existing custom domain. The Vite build is copied through an explicit allowlist; it does not switch the Pages source or delete product paths. No paid UI kit, font, hosting or runtime animation library is introduced.

Lighthouse/PageSpeed scores are environment- and field-data-dependent and cannot be guaranteed by source code alone. The PR should be checked at mobile and desktop widths after GitHub Actions publishes the build. Track LCP, CLS and INP; do not treat a lab score as a field Core Web Vitals guarantee.
