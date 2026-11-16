# GoGo Company Structured Data Map — 16 November 2026

This audit records the structured data found in the upstream source repositories and the central-site SEO branch. It does not promise Google rich-result eligibility or ranking gains.

## Verified schema by product

| URL / template | Schema.org type | Source | Notes |
|---|---|---|---|
| `https://gogocompany.in/` | `Organization`, `WebSite`, `ItemList`, `BreadcrumbList` | Central-site PR branch `seo/production-foundation-2026` | One `@graph`; brand entity and four product destinations. No invented social profiles or SearchAction. |
| `/arrowout/` | `VideoGame` | `parya5103/Fletch_Game:index.html` | Name, real gameplay description, browser/mobile platform, genre and publisher. |
| `/crystalquest/` | `VideoGame` | `parya5103/crystal-quest-web:index.html` | Name, 27-level gameplay description, genre, platform and publisher. |
| Sarkari Sarthi individual job pages | `JobPosting` | `parya5103/Sarkari-Sarthi:detail_pages.py` | Generated only when title, description, publication date, organization, structured location and an official apply/notice route are present. Uses `validThrough` when a real last date exists. |
| PikaNews static story pages | `NewsArticle`, `BreadcrumbList` | `parya5103/PikaNews:scripts/generate_article_pages.py` | Uses actual headline, publication/collection timestamps, source URL, category and image; author is included only when the feed provides one. |

## Implementation rules

1. Keep `JobPosting` on individual job detail pages, not on the generic jobs homepage. Do not mark expired/cancelled vacancies as currently open; dates and visible status must agree.
2. Keep `NewsArticle` on actual story pages with visible article content and source attribution. Do not invent PikaNews bylines when the feed has no author.
3. `VideoGame` and `Organization` structured data describe entities but do not guarantee a Google rich result.
4. Do not add generic `FAQPage` markup unless the same FAQs are visibly present and useful on that page. Do not add `SearchAction` until a functioning search endpoint is verified.
5. Keep schema fields consistent with visible page content, canonical URL, publisher and dates. Structured data must never claim a feature or status the user cannot see.
6. Validate JSON-LD syntax and required fields after every generator/template change. Use Google's Rich Results Test for supported Google result types and Schema Markup Validator for broader Schema.org syntax; a valid schema does not guarantee display.

## Validation status

- Central homepage JSON-LD graph is covered by the central SEO validation workflow; it checks parseability and the required graph node types.
- Arrow Out and Crystal Quest source files contain `VideoGame` JSON-LD. Crystal Quest's favicon declaration is being added separately in its source-repository PR.
- Sarkari Sarthi's `job_posting_jsonld` builder has explicit required-field gates and safely escapes untrusted text before placing JSON-LD in HTML.
- PikaNews's static article generator emits per-article `NewsArticle` and `BreadcrumbList` blocks from real collected fields.
- Live Rich Results Test/Schema Validator checks have not been run for every generated page. Do not claim all rich results are approved.

## Source references

- [GoGo Company central repository](https://github.com/parya5103/gogo-website)
- [Arrow Out source](https://github.com/parya5103/Fletch_Game/blob/main/index.html)
- [Crystal Quest source](https://github.com/parya5103/crystal-quest-web/blob/main/index.html)
- [Sarkari Sarthi JobPosting generator](https://github.com/parya5103/Sarkari-Sarthi/blob/main/detail_pages.py)
- [PikaNews article generator](https://github.com/parya5103/PikaNews/blob/main/scripts/generate_article_pages.py)
- [Google Rich Results Test](https://search.google.com/test/rich-results)
- [Schema Markup Validator](https://validator.schema.org/)
