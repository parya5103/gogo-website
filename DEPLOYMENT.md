# Deployment Guide - gogocompany.in

Hosted free on GitHub Pages from repo `parya5103/gogo-website` (must stay
public - Pages on the Free plan does not serve private repos).

## One-time setup

1. Enable Pages: repo Settings -> Pages -> Source: "Deploy from a branch"
   -> Branch: `main` / folder `(root)` -> Save.
2. Custom domain: Settings -> Pages -> Custom domain -> `gogocompany.in`
   -> Save. The `CNAME` file in the repo root already declares this.
   Wait for DNS check to pass (can take a few minutes to hours).
3. Enforce HTTPS: once the certificate is issued, tick "Enforce HTTPS"
   on the same Settings page.

## GoDaddy DNS setup (for gogocompany.in)

On the domain's DNS management page, set:

| Type | Name | Value | TTL |
| --- | --- | --- | --- |
| A | @ | 185.199.108.153 | 600 |
| A | @ | 185.199.109.153 | 600 |
| A | @ | 185.199.110.153 | 600 |
| A | @ | 185.199.111.153 | 600 |
| CNAME | www | parya5103.github.io | 1 h |

Remove any conflicting A/CNAME records for @ and www (including GoDaddy
parking records). Propagation usually completes within 30 minutes to a few
hours. GitHub then redirects www -> apex domain automatically.

## Updating the site

- Site pages (homepage, legal pages, redirects): every push to `main`
  redeploys automatically (1-3 minutes).
- Product apps (`/arrowout/`, `/crystalquest/`, `/sarkari-sarthi/`):
  published by the "Sync product apps" workflow (daily 06:15 IST, or run
  it manually from the Actions tab). See README.md for how updates
  propagate from each product repository.

## TWA assetlinks.json (Arrow Out! Android app)

The Arrow Out! Android app (TWA) verifies itself against
`https://gogocompany.in/.well-known/assetlinks.json`. That file must
contain the real SHA-256 fingerprint of the app signing key - never a
guessed or copied value.

1. In `parya5103/Fletch_Game`, run the "TWA APK build" workflow and
   download the `assetlinks.json` file from the build artifact.
2. In THIS repository, add the file at path
   `.well
-known/assetlinks.json` with exactly the generated contents
   and commit to `main`.
3. Verify `https://gogocompany.in/.well-known/assetlinks.json` opens
   in a browser.

Until this file exists the APK still runs, but Chrome shows the browser
URL bar instead of the full-screen app. Also set the Play Store listing's
developer website to `https://gogocompany.in/` so app-ads.txt is
findable there.

## Verification checklist after deploy

- https://gogocompany.in loads the homepage.
- https://www.gogocompany.in redirects to the apex domain.
- Header/footer render with working nav on every page (JS enabled).
- Product buttons open (in a new tab, same domain):
  - https://gogocompany.in/arrowout/
  - https://gogocompany.in/crystalquest/
  - https://gogocompany.in/sarkari-sarthi/
- Old URLs redirect: /arrow-out/ -> /arrowout/, /crystal-quest/ ->
  /crystalquest/, /sarkari/ -> /sarkari-sarthi/.
- After the first sync run, the games install as PWAs from the new paths
  and work offline; the Sarkari portal shows current job data.
- Lock icon / HTTPS works with no mixed-content warnings.
