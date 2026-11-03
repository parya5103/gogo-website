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

Every push to `main` redeploys automatically (1-3 minutes). Check the
Actions tab or Settings -> Pages build status.

## Verification checklist after deploy

- https://gogocompany.in loads the homepage.
- https://www.gogocompany.in redirects to the apex domain.
- Header/footer render with working nav on every page (JS enabled).
- Game Play Now buttons open:
  - https://parya5103.github.io/Fletch_Game/
  - https://parya5103.github.io/crystal-quest-web/
- Sarkari Sarthi status line shows "Live Sarkari-Sarthi data" (not just
  the fallback snapshot).
- Lock icon / HTTPS works with no mixed-content warnings.
