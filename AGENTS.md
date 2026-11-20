# GoGo Company agent instructions

This file applies to work in parya5103/gogo-website.

## Repository architecture
- Keep the root homepage on its existing React + Vite + static-site-generation architecture. Do not replace it with a different framework for routine visual changes.
- Preserve the public product routes: /arrowout/, /crystalquest/, /sarkari-sarthi/, /pikanews/, and /gta6/.
- Preserve GoGo Account, Firebase Authentication, Cloud Firestore, legal pages, and current publishing workflows unless the owner explicitly asks for a change.
- Work on feature branches and open pull requests. Do not commit directly to main.

## Synced product folders
- arrowout/, crystalquest/, pikanews/, and sarkari-sarthi/ are generated/synced copies.
- Fix product defects in their upstream repositories first. Do not make a one-off edit in a synced folder that the next sync will overwrite.
- After an upstream merge, use the product sync workflow to propagate changes. Do not claim a sync or deployment happened until its workflow reports success.

## Product safety and data rules
- Arrow Out: never simulate a rewarded ad with a timer or grant a hint without a verified provider reward callback. Keep the three free hints. Real ads require an approved provider, a consent review, and accurate privacy disclosures.
- PikaNews: aggregated homepage/latest/trending/category pages remain noindex,follow and out of the sitemap until the editorial policy is met: four reviewed original stories overall and three for a category. Keep third-party story attribution and original-publisher links. Do not override this policy for SEO.
- Sarkari Sarthi: calculate application deadlines in Asia/Kolkata; expired/cancelled jobs must not be searchable. needs_review and unknown verification states stay withheld from public search. Never invent missing dates, eligibility, or application links.
- GTA 6 guide: verify time-sensitive platform/release/cheat claims against current authoritative sources, attribute third-party reporting, and avoid duplicate FAQ/disclaimer copy.
- Ads: AdSense/AdMob must remain fail-closed until the real consent and provider integrations are configured and tested. ads.txt authorization or an account status is not proof of live impressions or earnings.

## Security, SEO and privacy
- No visitor-facing GitHub repository links/buttons or source-repository URLs.
- Never put API keys, service-account credentials, private tokens, or user login exports in frontend code, public files, issues, or logs.
- Firebase client-side admin checks are not authorization; enforce access in Firestore Security Rules/server-side policy.
- Do not publish private login email collections or promotional lists without explicit authorization and a documented privacy basis.
- Keep canonical, robots, sitemap, structured data and visible content consistent. Do not add noindex pages to sitemaps.

## OpenUI and local inference
- The OpenUI skill/reference is in .agents/skills/openui/SKILL.md.
- OpenUI is a renderer, not a language model. Generative responses require an inference endpoint.
- OpenUI Gateway requires a server-side THESYS_API_KEY; never invent, expose, or commit one.
- A keyless setup requires a separately hosted local model endpoint (for example Ollama or llama.cpp). Do not pretend a deterministic mock is generative AI. Confirm host access and available compute before deployment.

## Validation
- Run the repository's master tests and relevant product-specific suites before merging.
- Check GitHub Actions results for build, tests, responsive, SEO, Lighthouse and security jobs as applicable.
- For synced product changes, validate the upstream source and the live GoGo route after a successful sync.
- Distinguish automated browser checks from real Android-device testing; never claim physical-device verification without doing it.
