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

### Landing-page evidence from the same 28-day window

Search Console's page report (17 Oct–13 Nov 2026) shows:

- GoGo homepage: 45 impressions, 2 clicks, 4.44% CTR, average position 5.64.
- GoGo About page: 12 impressions, 1 click, 8.33% CTR, average position 6.08.
- Arrow Out: 3 impressions, 0 clicks, average position 5.33.
- PikaNews: 1 impression, 0 clicks, average position 10.
- Sarkari Sarthi homepage: 0 impressions; three individual job-detail URLs each had 1 impression (one at position 96, two around positions 9–10).
- Crystal Quest homepage: 0 impressions.

This supports prioritizing brand clarity and useful product-specific landing content. It does not establish search volume for the candidate keywords, and zero impressions in a short window does not prove zero demand.

## Keyword map and page ownership

Priority is based on product fit, likely intent, current site capability, and the manual search-result landscape—not a fabricated volume or difficulty score.

| Product / page | Primary candidate phrase | Supporting phrase ideas | Intent | Priority |
|---|---|---|---|---|
| GoGo hub `/` | GoGo Company | GoGo Company games; GoGo digital products; GoGo browser games | Navigational / brand | P1 |
| Arrow Out `/arrowout/` | tap-away arrow puzzle game | free arrow puzzle game; arrow puzzle game online; arrow logic puzzle; play arrow puzzle in browser; arrow escape puzzle; mobile arrow puzzle game | Play now | P1 |
| Arrow Out guide `/arrowout/about.html` | how to play Arrow Out | arrow puzzle rules; how to solve arrow puzzles; arrow puzzle tips | Informational | P2 |
| Crystal Quest `/crystalquest/` | free match-3 puzzle game | match 3 game online; free gem matching game; browser match-3 game; mobile match-3 puzzle; 27-level match-3 game | Play now | P1 |
| Crystal Quest guide `/crystalquest/guide.html` | how to play Crystal Quest | match 3 tips; gem combos; match 3 strategy; special gems guide | Informational | P2 |
| Sarkari Sarthi `/sarkari-sarthi/` | latest government jobs 2026 | sarkari naukri 2026; govt job vacancy 2026; latest government job notifications; government jobs in India | Fresh listings | P1 |
| Sarkari Sarthi state/category pages | MP government jobs 2026 | Madhya Pradesh govt vacancy; MPPSC recruitment 2026; MP police vacancy 2026; 10th pass government jobs; 12th pass government jobs; graduate government jobs | State / qualification | P1 only where matching live data exists |
| Sarkari Sarthi supporting pages | government job admit card 2026 | government exam results 2026; answer key 2026; government job syllabus | Update / utility | P2; only publish when real records exist |
| PikaNews homepage `/pikanews/` | latest news headlines | latest entertainment news; technology news; gaming news; business news; sports news | News discovery | P2 |
| PikaNews category pages | Bollywood news | Hollywood news; technology news; gaming news; business news; sports news; entertainment news | Category browsing | P2 |
| PikaNews article pages | exact article subject + event/person | exact headline variants; entity + latest update; event + date | News / long-tail | P1 per eligible article |

### Manual search-result review

A free Google search-result review found established browser-game pages already using broad terms such as “free arrow puzzle game” and “match 3 game online.” This means those phrases are relevant to the category but are not evidence of low competition. The better first-page strategy is to make the product pages satisfy specific gameplay intent:

- Arrow Out: lead with “tap-away arrow puzzle game,” explain the tap-to-launch mechanic, 1,000-level progression, hints and daily challenges, and use “free arrow puzzle game” as a natural secondary phrase.
- Crystal Quest: lead with “free match-3 puzzle game,” then explain the 27 levels, special gems, daily challenge and offline-capable PWA accurately.
- Sarkari Sarthi: broad government-job terms are dominated by fresh vacancy-list pages. Compete only on real state/qualification/category pages with verified dates, eligibility and official application links.
- PikaNews: avoid trying to rank the homepage for generic “latest news.” Focus on category discovery and specific article subjects with source attribution and original context.

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


## Official references

- [Google Search Central: Get started with Google Trends](https://developers.google.com/search/docs/monitor-debug/trends-start) — Explore terms by country, date range and category; review Top and Rising related queries; compare findings with Search Console.
- [Google Search Console: Search results Performance report](https://support.google.com/webmasters/answer/7576553) — Query/page dimensions, clicks, impressions, CTR and average position.
- [Google Search Console: common performance-report tasks](https://support.google.com/webmasters/answer/17010961) — Filter a query and inspect which pages appeared for it.


## Supplemental keyword expansion — free-tool review (16 November 2026)

This section restores candidate phrases found in the expanded free-tool research and adds a small set of fresh India Jobs & Education trend signals. These are **research candidates**, not verified monthly Google search volumes. Third-party trend bands are approximate observations and do not confirm an exam notice, result, admit-card release, or application window.

### GoGo Company hub

- GoGo online games
- play games online
- free browser games
- online puzzle games

Keep the homepage primarily brand-led. Use these only where the page visibly introduces the actual games; do not create a generic keyword doorway.

### Arrow Out

- tap away puzzle
- tap puzzle game
- arrow escape puzzle
- arrow block puzzle
- clear arrows puzzle
- arrow logic game
- arrow puzzle levels
- relaxing arrow puzzle
- offline arrow puzzle — use only while offline play is verified on the deployed PWA

Use the natural phrase “tap-away arrow puzzle game” as the primary intent. Explain the real tap-to-launch mechanic and only mention features that are present in the shipped build.

### Crystal Quest

- match 3 puzzles
- match three puzzle
- gem matching game
- gem match puzzle
- match 3 levels
- special gems match 3
- relaxing match 3 game
- match 3 puzzle adventure

Use “match-3 puzzle game” / “match 3 game” naturally, with “gem matching game” as a supporting descriptor. Keep level counts, offline claims, daily challenges and special-gem claims synchronized with the current game build.

### Sarkari Sarthi — trend-led candidate phrases

- AIBE admit card 2026
- RRB exam city intimation slip 2026
- MP Police Constable admit card 2026
- MP Police Constable exam date 2026
- SBI Clerk prelims result 2026
- ICSI CSEET result 2026
- scholarship news / scholarship update 2026
- SSC GD PET/PST admit card 2026
- RRB Group D result 2026
- RRB ALP CBT 1 answer key 2026
- JEE Advanced 2026
- UTET result 2026
- government job admit card 2026
- government exam result 2026
- latest MP government vacancy

**Publishing gate:** add a keyword to a live listing/article only after checking the issuing authority's current notice page and recording its official URL, notice date, status and relevant candidate details. A trend is not proof that a result/admit card/answer key is out. Avoid “out”, “released” or confirmed dates until the official source verifies them. Remove or update year-specific targets when the cycle becomes stale.

### PikaNews

- latest technology news today
- entertainment news today
- Bollywood news today
- gaming news today
- business news today
- latest film news
- technology launch news
- exact entity / product / event + latest update

Use category phrases on crawlable category hubs that actually exist. Use the exact story, entity and event on individual article pages; add publisher attribution and original context. “Today” terms require genuinely fresh timestamps and must not be hard-coded into evergreen pages.

### Free evidence reviewed for this expansion

- Google Trends India — https://trends.google.co.in/trending?geo=IN (relative interest and related/rising searches; not monthly volume).
- India Jobs & Education trend snapshot, updated 16 November 2026 — https://www.48hrstrends.com/India/job-and-education (third-party observed trend bands; partial coverage).
- India trend roundup, 14 November 2026 — https://resulttoday.in/india-job-education-search-trends-14-november-2026/ (secondary trend context; official-source checks still required).
- MPESB 2026 exam schedule — https://esb.mp.gov.in/exams_schedule/Exam_schedule_2026.pdf (official calendar; tentative schedule, not confirmation of every individual release).
- Arrow-puzzle competitor phrase review — https://www.appbrain.com/topics/arrow-puzzle-games and https://appsxray.com/keyword/tap-puzzle (store/category language, not web-search volume).
- Match-puzzle store-language review — https://appsxray.com/keyword/match-puzzle and https://appsxray.com/charts?category=GAME_PUZZLE&chart=trending&country=IN (store discovery signals, not web-search volume).

### Interpretation limits

- Google Trends uses relative interest; third-party trend trackers can have partial coverage and approximate lower-bound bands.
- App-store keyword suggestion popularity is not Google web-search volume.
- No keyword difficulty, CPC, monthly search volume, ranking guarantee or traffic forecast is asserted here.
- Recheck time-sensitive exam phrases against official notices before publishing and refresh this section as trends change.
