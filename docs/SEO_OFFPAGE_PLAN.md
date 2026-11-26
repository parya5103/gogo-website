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
