# GoGo Company SEO keyword and landing-page matrix

Purpose: assign one primary search intent to each canonical landing page, reduce keyword cannibalization, and keep copy aligned with real product features. This is a qualitative targeting plan, not a claim about measured search volume or ranking difficulty. Re-check queries in Search Console before changing priorities.

| Canonical URL | Search intent | Primary topic | Supporting topics | Content boundary |
| --- | --- | --- | --- | --- |
| / | Brand / navigational | GoGo Company | GoGo Games, digital products, browser games | Company and product directory; do not target individual job or game queries here |
| /arrowout/ | Game / transactional | free arrow puzzle game | tap away puzzle, arrow logic game, browser puzzle | Describe actual game mechanics and supported devices |
| /crystalquest/ | Game / transactional | free match 3 game | gem puzzle, match three adventure, fantasy puzzle | Describe the 27-level game accurately |
| /free-online-games/ | Game discovery | free online browser games | mobile puzzle games, free web games | Collection page linking to the two games |
| /sarkari-sarthi/ | Recruitment discovery | government jobs and recruitment updates | sarkari naukri, recruitment notification, exam updates | Broad portal overview; avoid duplicating every individual hub |
| /sarkari-sarthi/latest-govt-jobs/ | Current listings | latest government jobs | latest sarkari naukri, recruitment notifications, apply dates | Current synced listings; verify at official source |
| /sarkari-sarthi/admit-card/ | Exam utility | government exam admit card | hall ticket, call letter, exam instructions | Admit-card records only; do not show unrelated active vacancies |
| /sarkari-sarthi/sarkari-result/ | Exam utility | sarkari result | merit list, answer key, cutoff marks | Result records only; no invented result data |
| /sarkari-sarthi/mp-govt-jobs/ | Local recruitment | Madhya Pradesh government jobs | MPESB recruitment, MP bharti, MP state vacancies | MP-specific listings only; keep empty state honest |
| /pikanews/ | News discovery / brand | PikaNews latest news | entertainment news, technology news, gaming news, business news, sports news | News portal home; link to publisher-attributed reports |
| /pikanews/latest.html | Fresh news | latest news headlines | latest entertainment news, latest technology news | Latest feed; avoid broad generic SEO claims |
| /pikanews/trending.html | Trend discovery | trending news | trending topics, popular stories | Trends page, not a substitute for editorial reporting |
| /pikanews/[category].html | Category discovery | category-specific news | category and topic terms | Each category page owns its category intent |

## Prioritization

1. Protect branded navigational searches for GoGo Company and each product name.
2. Improve the relevance and completeness of the live Sarkari Sarthi listings and their official source links before expanding job-related keywords.
3. Keep admit-card, result, and MP hubs genuinely filtered; a page with no matching data must say so and must not manufacture listings.
4. Strengthen game pages with accurate gameplay instructions, controls, screenshots, and FAQ content rather than repeating generic “free online games” text.
5. Keep PikaNews category pages distinct and make source attribution, original publication date, and links to publishers easy to find.

## Measurement

Use Google Search Console query and page exports for settled 28-day periods. Track clicks, impressions, CTR, average position, branded vs non-branded queries, country, device, and page-level overlap. Do not add estimated monthly search volumes without a named keyword-data source and collection date.

## GitHub repository About metadata

Suggested repository description (concise, factual; not a public-site footer link):

> GoGo Company website and product hub for Arrow Out!, Crystal Quest, Sarkari Sarthi and PikaNews. Responsive static site with PWA game publishing, recruitment-information discovery, publisher-attributed news, structured data and automated GitHub Actions sync workflows.

Suggested repository topics (apply only if they accurately describe the repository):

`gogocompany`, `browser-games`, `puzzle-games`, `pwa`, `static-website`, `github-pages`, `arrow-out`, `crystal-quest`, `match-3-game`, `arrow-puzzle`, `sarkari-sarthi`, `government-jobs-india`, `recruitment-updates`, `pikanews`, `news-aggregator`, `technical-seo`, `structured-data`, `sitemaps`, `indexnow`, `web-performance`.

The connected GitHub actions in this workflow support file and pull-request operations but do not expose a repository About/topics update action. Apply this description and topic set manually in GitHub repository Settings/About if desired.
