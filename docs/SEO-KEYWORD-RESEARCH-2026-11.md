# GoGo Company SEO Keyword Research — India (16 November 2026)

## Scope and evidence rules

This is a free-tool keyword plan for the GoGo Company hub and its four products. It deliberately separates measured first-party data from candidate phrases. No paid keyword API, paid rank tracker, or paid SEO credits were used.

### First-party Search Console baseline

Property: `sc-domain:gogocompany.in` (verified and readable).

Latest settled 28-day web-search window returned by Search Console: **17 October–13 November 2026**.

- Site totals: **66 impressions, 3 clicks, 4.55% CTR, average position 6.97**.
- Google exposed only four query rows. They cover about **34.85% of impressions** and **33.33% of clicks**; the rest are hidden/anonymized by Search Console.
- Visible queries: `gogo company` (1 click, 10 impressions, position 3.2), `go company` (7 impressions, position 8.86), `go go company` (5 impressions, position 3.2), and `aees librarian vacancy 2025` (1 impression, position 96).
- The AEES query is a stale, unrelated term. Do not target it or create a page for it.
- No meaningful non-brand product query is visible yet. This is an early baseline, not proof that the proposed non-brand terms have search volume.

### Live on-page audit and crawl baseline (16 November 2026)

The connected GSC Wizard audit fetched the five live product/hub URLs successfully (HTTP 200); all five were indexable. There were three low-severity thin-content notices: GoGo homepage (275 words), PikaNews homepage (286 words), and Sarkari Sarthi homepage (289 words). Arrow Out (789 words) and Crystal Quest (386 words) had no on-page issues in this audit; Crystal Quest's favicon was not detected. Follow-up source-repository PRs were opened to add the missing Crystal Quest favicon declaration and improve PikaNews's visible publisher-attribution context. The GoGo homepage copy was expanded in this PR branch.

Google Search Console currently lists four submitted sitemaps (root, Sarkari Sarthi, PikaNews web, and PikaNews news); each reported zero warnings and zero errors at the latest download. The IndexNow settings panel has no key configured yet. The key file and notification workflow in the central-site PR are not live until merge/deployment, so do not claim IndexNow is active.

## Keyword map and page ownership

Priority is based on product fit, likely intent, current site capability, and the manual search-result landscape—not a fabricated volume or difficulty score.

| Product / page | Primary candidate phrase | Supporting phrase ideas | Intent | Priority |
|---|---|---|---|---|
| GoGo hub `/` | GoGo Company | GoGo Company games; GoGo digital products; GoGo browser games | Navigational / brand | P1 |
| Arrow Out `/arrowout/` | free arrow puzzle game | arrow puzzle game online; arrow logic puzzle; play arrow puzzle in browser; arrow escape puzzle; mobile arrow puzzle game | Play now | P1 |
| Arrow Out guide `/arrowout/about.html` | how to play Arrow Out | arrow puzzle rules; how to solve arrow puzzles; arrow puzzle tips | Informational | P2 |
| Crystal Quest `/crystalquest/` | free match 3 puzzle game | match 3 game online; gem matching game; browser match 3 game; mobile match 3 puzzle | Play now | P1 |
| Crystal Quest guide `/crystalquest/guide.html` | how to play Crystal Quest | match 3 tips; gem combos; match 3 strategy; special gems guide | Informational | P2 |
| Sarkari Sarthi `/sarkari-sarthi/` | latest government jobs 2026 | sarkari naukri 2026; govt job vacancy 2026; latest government job notifications; government jobs in India | Fresh listings | P1 |
| Sarkari Sarthi state/category pages | MP government jobs 2026 | Madhya Pradesh govt vacancy; MPPSC recruitment 2026; MP police vacancy 2026; 10th pass government jobs; 12th pass government jobs; graduate government jobs | State / qualification | P1 only where matching live data exists |
| Sarkari Sarthi supporting pages | government job admit card 2026 | government exam results 2026; answer key 2026; government job syllabus | Update / utility | P2; only publish when real records exist |
| PikaNews homepage `/pikanews/` | latest news headlines | latest entertainment news; technology news; gaming news; business news; sports news | News discovery | P2 |
| PikaNews category pages | Bollywood news | Hollywood news; technology news; gaming news; business news; sports news; entertainment news | Category browsing | P2 |
| PikaNews article pages | exact article subject + event/person | exact headline variants; entity + latest update; event + date | News / long-tail | P1 per eligible article |

### Important targeting rules

1. Keep one primary intent per URL. Do not make the GoGo homepage compete with product pages for generic job or news phrases.
2. Use the current year only on pages whose listings or content are genuinely refreshed for that year. Avoid evergreen hard-coded dates that become stale.
3. Do not create thin pages for every keyword variation. Build a useful category or guide only when the product has matching content/data.
4. Sarkari Sarthi must show accurate status, eligibility, important dates, and official-source links. Never optimize an expired or unverified listing as an active vacancy.
5. PikaNews is a source-attributed news aggregator. For each article, preserve publisher attribution and add original context/value where possible; do not simply mass-publish near-identical RSS excerpts to chase keywords.
6. Do not use the obsolete `meta keywords` tag. It does not improve Google rankings.

## Free keyword research stack

| Tool | Use | Cost / limitation |
|---|---|---|
| Google Search Console | Real queries, clicks, impressions, CTR, position, page/query matching | Free; only shows queries for which the site appeared and hides some low-volume queries |
| Google Trends | Compare India interest, language variants, seasonality, related and rising searches | Free; relative index, not absolute monthly search volume |
| Google Search autocomplete + People Also Ask | Real phrasing, question variants, long-tail ideas | Free; suggestions are not volume estimates |
| Google search results (manual top-10 review) | Check intent, competing page types, SERP features, and whether the site can satisfy the query | Free; no numeric keyword difficulty |
| Bing Webmaster Tools | Bing query data and keyword research after domain verification | Free; Bing demand is not Google demand |
| Google Keyword Planner | Optional cross-check for broad demand ranges and CPC | Free tool access can require Google Ads account setup/billing details; do not create or run an ad campaign just for this project |

Official guidance: Google Trends supports related/rising query research and geography filters; Search Console remains the source of truth for this site's actual Google query performance. Trends values are relative interest, not exact search counts.

## Initial action order

1. Keep GoGo Company branded query coverage clean and consistent.
2. Improve Arrow Out and Crystal Quest landing-page/guide relevance around the exact gameplay users receive.
3. Improve Sarkari Sarthi category discovery only for job categories and state pages backed by current, accurate records.
4. Improve PikaNews crawlable category/article pages, but prioritize unique reporting context, attribution, and indexable static article URLs over raw article volume.
5. Re-check GSC after 28 settled days. Promote a candidate to a measured target only after Search Console shows relevant impressions or Google Trends/Autocomplete confirms the phrasing is appropriate.

## Measurement guardrails

- Do not label candidate terms as high-volume, low-competition, or easy without a source that actually measured those properties.
- Do not promise page-one rankings.
- Track each URL's impressions, clicks, CTR, and average position separately; site-wide averages can hide product-level differences.
- Treat hidden/anonymized Search Console queries as a coverage limitation, not as zero demand.
