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


## Expanded free-tool research (16 November 2026)

This second research pass uses live Google Trends pages, current India job/education trend snapshots, Google Play search-suggestion observations, and a fresh Search Console query pull. These sources have different meanings and must not be combined into a fabricated search-volume score.

### Fresh Search Console query check

A fresh GSC Wizard query pull returned the same settled 28-day window (17 Oct–13 Nov 2026), with data available through 14 Nov:

| Query | Clicks | Impressions | CTR | Avg. position | Decision |
|---|---:|---:|---:|---:|---|
| gogo company | 1 | 10 | 10% | 3.20 | Keep brand title/name consistent |
| go company | 0 | 7 | 0% | 8.86 | Brand spelling variant; monitor |
| go go company | 0 | 5 | 0% | 3.20 | Brand spelling variant; monitor |
| aees librarian vacancy 2025 | 0 | 1 | 0% | 96.00 | Irrelevant/stale; do not target |

Coverage caveat remains: the four visible rows account for only 34.85% of impressions and 33.33% of clicks. Do not interpret missing query rows as zero demand.

### Additional keyword clusters to validate

These are phrase ideas from search-result language, product mechanics, current topic signals and audience intent. They are candidates, not measured monthly search volumes.

| Product | New phrase candidates | Best page / use | Priority / condition |
|---|---|---|---|
| GoGo Company | GoGo online games; free browser games; play games online; GoGo puzzle games | Homepage product directory | P2; use only if the homepage actually presents these products clearly |
| Arrow Out | tap away puzzle; tap puzzle game; arrow escape puzzle; arrow block puzzle; clear arrows puzzle; arrow logic game; arrow puzzle levels; relaxing arrow puzzle; offline arrow puzzle | Arrow Out landing page and how-to guide | P1; emphasize the actual tap-to-clear mechanic; do not imply offline play unless verified in the deployed build |
| Crystal Quest | match 3 puzzles; match three puzzle; gem matching game; gem match puzzle; match 3 levels; special gems match 3; relaxing match 3 game; match 3 puzzle adventure | Crystal Quest landing page and guide | P1/P2; use only features that exist in the current game |
| Sarkari Sarthi | MP Police Constable admit card 2026; MP Police Constable exam date 2026; RRB exam city intimation slip 2026; AIBE admit card 2026; SBI Clerk prelims result 2026; government job admit card 2026; government exam result 2026; latest MP government vacancy | Individual update pages / category pages | P1 only when a matching, current, verified record exists and the official notice link is present |
| PikaNews | latest technology news today; entertainment news today; Bollywood news today; gaming news today; business news today; latest film news; technology launch news; exact person/event + latest update | Crawlable category pages and individual article pages | P2 for category hubs; P1 for eligible timely articles with original context and source attribution |

### What the free public signals actually say

1. **Google Trends India (16 Nov 2026):** the live Trends page exposes current queries and related query breakdowns, but this is a time-sensitive trend snapshot—not a durable keyword-volume database. The Jobs & Education category snapshot showed terms including AIBE admit card, RRB exam city intimation slip, MP Police Constable admit card 2026, Madhya Pradesh police, and SBI Clerk prelims result. Treat these as editorial watchlist topics, not evergreen SEO targets. A trend is not proof that an admit card/result has officially been released.
2. **Official Google Trends interface:** use India, a suitable date range, and category filters; compare exact phrase variants and related/rising queries before committing a page. Trends' 0–100 scale is relative interest, not monthly search counts.
3. **Google Play search-suggestion / category research (third-party observation):** an India Play Store keyword snapshot showed tap puzzle as a suggested query (reported popularity 53/100), while triple match was reported as a strong suggestion (66/100). Match puzzle was reported at 43/100. These are Google Play app-store signals, not Google web-search volume and not proof of demand for a browser game. Use them only to learn the vocabulary puzzle players use.
4. **Google Play competitor-language review:** current arrow-puzzle listings repeatedly use phrases such as tap away, arrow puzzle, puzzle escape, tap to clear, and logic puzzle. This supports the relevance of those words to Arrow Out's actual mechanic, but also indicates a competitive category.
5. **Current Google Play puzzle charts:** arrow/logic and match/tile puzzle games appear in India's current puzzle charts. This is a product-category demand signal only; app chart position/install estimates do not equal web keyword search volume.

### Revised targeting order

- **Arrow Out:** prioritize tap away puzzle / arrow puzzle game language in the title/H1 and first visible paragraph. Explain exactly how a player clears arrows, avoids blocked paths, and progresses through levels. Use tap puzzle game, arrow escape puzzle, and arrow logic puzzle naturally in guide copy, not as a keyword list.
- **Crystal Quest:** use match 3 puzzle / match 3 game as the category language and gem matching game as the differentiator. Do not overstate features such as offline support, daily events, or level count if the live build does not provide them.
- **Sarkari Sarthi:** create timely pages only for current notifications, admit cards, results, answer keys and exam-city slips with a verified official source. For the 16 Nov trend watchlist, verify status directly with the issuing authority before writing headlines; do not publish a trend as a confirmed release.
- **PikaNews:** use category phrases as navigation labels and category page titles. Individual articles should target the exact story/entity/event query, with a clear publication date, publisher attribution, canonical URL and original context.
- **GoGo Company:** keep the homepage brand-led. Do not turn it into a generic jobs/news/games keyword landing page.

### Free tools and repeatable workflow

| Tool | Exact use in this project | How to interpret |
|---|---|---|
| Google Search Console | Export query + page rows every 28 settled days; find queries with impressions and positions 4–20 | First-party observed Google web performance; hidden query coverage must be noted |
| Google Trends | Compare up to five terms for India; inspect related/rising searches and category/date filters | Relative interest only; record selected period and geography |
| Google Search autocomplete | Enter each seed and inspect completions; repeat with how, best, free, online, for Android, and Hindi variants | Phrase discovery, not volume |
| Google People Also Ask | Capture questions for game mechanics, eligibility, admit cards and exam-result guidance | Question ideas; answer only where the product/data supports |
| Bing Webmaster Tools | Review Search Performance queries after property verification | First-party Bing performance; separate from Google data |
| Google Play autocomplete / charts | Learn app-store vocabulary and competing game naming | App-store signal only; never label it Google web volume |
| Google Keyword Planner | Optional volume/CPC range cross-check if an account is already available | Google Ads-derived ranges; do not create campaigns or incur spend |
| PageSpeed Insights + Lighthouse | Validate landing-page experience after keyword-led copy changes | Technical/UX diagnostics, not keyword research |

### Source log (free public pages reviewed)

- Google Trends India, Trending Now: https://trends.google.co.in/trending?geo=IN
- Google Trends India, Jobs & Education category snapshot: https://www.48hrstrends.com/India/job-and-education
- Google Trends India current snapshot: https://www.48hrstrends.com/India
- Google Play India arrow puzzle category/competitor review: https://www.appbrain.com/topics/arrow-puzzle-games
- Google Play India tap-puzzle keyword suggestion observation: https://appsxray.com/keyword/tap-puzzle
- Google Play India match-puzzle keyword observation: https://appsxray.com/keyword/match-puzzle
- Google Play India match-3 puzzle phrase observation: https://appsxray.com/keyword/match-3-puzzles
- Google Play India puzzle chart: https://appsxray.com/charts?category=GAME_PUZZLE&chart=trending&country=IN
- Google Search Console Performance report: https://support.google.com/webmasters/answer/7576553
- Google Trends help for Search Central: https://developers.google.com/search/docs/monitor-debug/trends-start

### Research limits / no fabricated metrics

- No paid DataForSEO/OpenSEO keyword research was run. The connected OpenSEO balance was only 5 credits; seed research costs approximately 54 credits per seed, so those credits were preserved.
- No numeric Google web monthly volume, keyword difficulty, CPC, or ranking probability is claimed for the candidate phrases.
- Third-party Play Store popularity/demand metrics are explicitly app-store signals and must not be copied into website SEO volume columns.
- Current trend phrases expire quickly. Re-check the official source and live trend snapshot on the day a timely Sarkari Sarthi/PikaNews page is published.
