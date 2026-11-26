# GoGo Company — ethical off-page SEO plan

Last reviewed: 2026-11-25  
Scope: gogocompany.in and its genuine product pages.

## Objective

Earn relevant, editorially justified references that introduce real visitors to useful GoGo pages. A backlink is not a deliverable by itself: relevance, context, referral traffic and editorial trust matter more than raw link count.

## What we can legitimately promote

| Asset | Audience | Link-worthy value |
|---|---|---|
| Arrow Out! strategy guide | Browser-puzzle players and puzzle communities | Original instructions, solving strategy and a playable game |
| Crystal Quest guide | Match-3 and casual-game communities | Accurate mechanics, level guidance and a playable 27-level game |
| Sarkari Sarthi verification guidance | Indian job seekers and career-information publishers | Source-checking guidance and clearly attributed recruitment information |
| GoGo AI Intelligence | AI developers, researchers and technology readers | Daily source-linked AI news, research discovery and provider-declared model catalogue |
| PikaNews editorial/corrections policy | Media literacy and publisher partners | Transparent attribution, correction and removal process |

Only promote a page while its content is current, useful, indexable where appropriate and consistent with the product's editorial policy.

## Outreach channels (manual, selective)

1. **Relevant communities:** share a genuinely useful guide only where self-promotion is allowed and the post answers an existing question. Do not drop links into unrelated threads.
2. **Creators and reviewers:** offer independent game reviewers, puzzle creators and technology writers access to the live product. Do not condition coverage on a followed link or positive review.
3. **Resource pages:** identify a real resource list maintained by an education, gaming or AI community. Suggest a page only when it adds something the list lacks.
4. **Partner references:** request a factual mention from genuine collaborators, event organizers or publishers where a real relationship exists.
5. **Original assets:** publish useful explainers, screenshots, methodology notes or research summaries that other writers may independently cite. Attribute third-party material and respect licenses.

## Exclusions

- No paid links, link farms, private blog networks, automated directory blasts, comment spam, spun guest posts, fake testimonials or forced reciprocal exchanges.
- Do not create accounts or submit forms automatically on third-party sites.
- Do not claim a partner, award, review, media mention or relationship that does not exist.
- Do not ask for exact-match anchor text. Natural brand or descriptive anchors are appropriate.
- Do not use third-party logos, screenshots or copyrighted assets without permission.

## Measurement

Maintain a manual record of the referring page, domain, date discovered, relevance, outreach status, response and referral visits. In Google Search Console, review Links after sufficient time has passed; in Analytics, compare referral sessions and engaged visits. Treat third-party backlink counters as estimates, not ground truth.

## Next review

After 30 days, compare new referring domains and referral visits with the baseline. Keep outreach selective; stop channels that produce irrelevant traffic or complaints. Rankings and indexing are not guaranteed.

## Open-source tooling review (2026-11-26)

### Selected for evaluation: CrawlSEO

- Repository: https://github.com/crawlseo/crawlseo
- License: MIT (verified from the repository metadata and README).
- Current repository metadata at review: public, not archived, TypeScript, 728 stars, 107 forks; last pushed 2026-11-22.
- Relevant capabilities documented upstream: Google Search Console analytics, site crawler (2,000 pages per crawl by default), Core Web Vitals, rank tracking and backlink data through optional DataForSEO BYOK.
- Important limitation: it monitors/audits backlinks; it does not ethically create or guarantee backlinks. Backlink data requires the operator's own DataForSEO key; do not assume that feature is free.
- Deployment fit: it is a separate self-hosted Next.js + PostgreSQL application. It must not be embedded into the GitHub Pages static site or modify product publishing workflows. Evaluate separately for a low-cost VPS/Oracle deployment after dependency, OAuth, secrets, resource and outbound-network review.
- Security/privacy note: the upstream README documents Google, Bing, DataForSEO, crawled sites, optional webhook/SMTP and GitHub release-check outbound traffic. Configure only required integrations; use a dedicated least-privilege Google account and secure server-side secrets.

### Not selected as the primary platform: Backlink Intelligence

- Repository: https://github.com/alok-vibe-code/backlink-intelligence
- License: MIT; repository is public and not archived.
- Repository metadata at review: Python, 3 stars, 2 forks, pushed 2026-09-26.
- It advertises prospect qualification and backlink monitoring, but its much smaller adoption and older push date make it a secondary code reference only. Audit the code and dependencies before reuse; do not connect it to production credentials.

### Adoption decision

Use CrawlSEO as an optional monitoring/audit companion, not as an automated link-building bot. First finish GoGo's technical SEO, then connect Search Console and run a crawl. Any prospect must be manually reviewed for relevance, editorial quality, real audience and spam risk. No auto-posting, paid-link schemes, PBNs, mass directory submissions or forced reciprocal links. Keep the GoGo static site independent of this dashboard.
### CrawlSEO deployment guardrails before any installation

- Upstream Compose starts separate app, worker and PostgreSQL containers. Do not assume this is suitable for a tiny free-tier VM without measuring RAM, CPU, disk and crawl load.
- Never deploy upstream defaults: replace the sample PostgreSQL password, generate a strong stable Auth secret, configure HTTPS/reverse proxy and Google OAuth redirect URIs, and keep PostgreSQL bound to loopback/private Compose networking only.
- Pin a reviewed release image rather than deploying an unpinned `:latest` tag; review upstream changes and dependency/security advisories before upgrades.
- Backlink analysis is optional and uses a separately supplied DataForSEO credential. Do not add paid API use unless the cost is explicitly approved. The initial GoGo setup should start with GSC + crawler + PageSpeed only.
- No installation or third-party credentials were changed as part of this PR. Deployment remains a separate, measured follow-up.

## 2026-11-26 follow-up — Search Console evidence and outreach prospects

### Search Console snapshot (India; 2026-11-21 through 2026-11-23)

Read-only SMEPost Search Console connection returned a free recent-three-days window only; no prior-period comparison is available.

- /about.html: 11 impressions, 0 clicks, 0% CTR, average position 6.55. This is a legacy noindex,follow redirect stub whose canonical and redirect target are /about/; it is not the page whose snippet should be rewritten. Google may still be showing stale redirect-URL data. Fresh Google URL Inspection is still needed to confirm the selected canonical.
- /about.html queries included gogo company (4 impressions, position 5), gogo (3, position 7.33), and gogo digital media (2, position 8).
- Homepage: 3 impressions, 0 clicks, average position 11.33; query rows included go company and gogo digital media.
- /sarkari-sarthi/mp-govt-jobs/: 9 impressions, 0 clicks, average position 31.11. This hub is already noindex,follow, canonical to itself and absent from the root sitemap because the current inventory does not justify a Madhya Pradesh jobs landing page. Do not re-index it just because a few impressions appeared; confirm Google’s latest inspection first.

### Changes made after the snapshot

- Improved the canonical About page title and description to include the real portfolio: browser games, AI and digital media.
- Added GoGo AI Intelligence to the About product lineup with a descriptive internal link.
- Corrected Sarkari Sarthi wording: the current data includes both official and secondary public sources; the About page now explains source/verification labels and instructs applicants to verify with the recruiting authority. It no longer claims every listing comes from official websites.
- Updated root sitemap homepage lastmod to 2026-11-26 after the homepage content change.
- Added regression coverage for the About portfolio and source-accuracy claims.
- Root robots.txt intentionally does not advertise the PikaNews Google News sitemap while that sitemap is empty. Its generator only includes reviewed original editorial pages (named author, explicit review, substantial original text and a valid recent publication date). The existing SEO validator correctly enforces this; adding the empty News sitemap to root robots.txt would be a regression.

### Outreach prospects researched

See SEO_OUTREACH_QUEUE.md. Free editorial-review candidates include OttersPlay, Zadely, IndieRadar, GAMES.GG and DLE.GAMES. These are prospects, not earned backlinks. No form or email has been submitted. Paid priority queues are deliberately excluded. Tabatu is excluded until compatible embedding/redistribution rights are confirmed.

### Open PR disposition

- #71 (programmatic category hubs), #72 (short PikaNews meta descriptions), #86 (AdSense/content quality) and #145 (all-HTML canonical audit) are stale/diverged from current main (respectively about 183, 183, 132 and 46 commits behind at review). Do not merge their old branch heads.
- #71 contains useful ideas: only build category pages where inventory supports them, and noindex thin job hubs. Port only after testing against the current manifest and generator.
- #72's generic suffix-based description expansion risks creating repetitive metadata; do not blindly port it. Improve descriptions from real article content only.
- #86 contains worthwhile content-quality ideas (a substantive job-verification guide, explicit secondary-source disclosure, and better drawer interaction). The About-page disclosure is now corrected; a separate upstream-source implementation of the guide and menu interaction remains to be reviewed.
- #145's one-canonical-per-HTML audit is valuable but must be rebased/reimplemented on current main and run across generated PikaNews, Sarkari Sarthi and game files before enabling as a hard CI gate.

### Remaining access and measurement constraints

- GSC Wizard URL Inspection and full historical reporting were unavailable because the connected GSC Wizard subscription/trial has ended. SMEPost provides only the most recent three finalized days, with no comparison.
- CrawlSEO deployment was not performed: no Desktop Commander/SSH device is connected to this session, so the Oracle VM cannot be inspected or provisioned safely here. Keep it separate from GitHub Pages; do not invent secrets or expose PostgreSQL publicly.
- No external outreach has been sent. Submissions remain a human-reviewed step; do not claim links until the published referring page is verified.
