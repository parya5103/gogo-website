# GoGo Company React homepage

## Architecture
The homepage hero, five-product collection, principles and closing CTA are React components in `assets/js/gogo-home-react.js`. The existing shared GoGo header/footer, account loader, AdSense loader, product routes and static SEO/company information remain in place. React is loaded as a version-pinned ESM dependency through esm.sh; the import map ensures ReactDOM and the app use the same React module instance.

## Design direction
Original GoGo visual system: editorial typography, calm indigo/navy palette, orbit-style product illustration, differentiated product accents, responsive product cards and a compact mobile navigation-compatible layout. Reduced-motion preferences are respected.

## Open-source references
- [Cruip Open React Template](https://github.com/cruip/open-react-template): layout hierarchy and product storytelling reference.
- [Shadcn Landing Page](https://github.com/leoMirandaa/shadcn-landing-page): component-based React section composition; MIT.
- [Launch UI](https://github.com/launch-ui/launch-ui): reusable landing-page component patterns; MIT.

These repositories are inspiration and reference only. No full template source, proprietary assets or third-party branding are copied into GoGo.

## SEO and compatibility
- Root title, canonical, social metadata and JSON-LD are retained.
- About, identity FAQ, product trend links and policy content remain crawlable static HTML.
- A no-JavaScript fallback links to all five products.
- No product app folder or game engine is modified.
- Current GitHub Pages deployment remains branch-root; no bundler or build pipeline migration is required for this isolated homepage.

## Operational note
React is fetched from the pinned esm.sh version. If the CDN is unavailable, the no-JavaScript fallback remains available, but the interactive React homepage will not render. A future self-hosted bundled React build can remove this external runtime dependency once a controlled build-and-publish pipeline is introduced.
