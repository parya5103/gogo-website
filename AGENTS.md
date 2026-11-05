# GoGo Games - AI Coding Agent Operational Instructions

**Last Updated:** 2025-11-05  
**Audit Date:** 2025-11-05  
**Repository:** parya5103/gogo-website  
**Production:** https://gogocompany.in/  
**Branch:** docs/update-agent-knowledge

---

## Project Identity

**GoGo Company** is an independent gaming and digital products company. This repository (`parya5103/gogo-website`) is the **central website and synchronization repository** for:
- GoGo Company website (gogocompany.in)
- Arrow Out! game portal
- Crystal Quest game portal
- Sarkari Sarthi job tracker portal

**Critical:** Individual game repositories remain the **source of truth** for their respective games:
- Arrow Out: `parya5103/Fletch_Game` (branch: `main`)
- Crystal Quest: `parya5103/crystal-quest-web` (branch: `main`)
- Sarkari Sarthi: `parya5103/Sarkari-Sarthi` (branch: `gh-pages`)

**Sarkari Sarthi** is a **separate project** and must NOT be modified by GoGo website tasks unless explicitly authorized.

**Brand Language Note:** The word "Sarkari" should only appear as part of the full product name "Sarkari Sarthi". Use alternatives like "Government", "government job", "Government job listings" for standalone references.

---

## Repository Safety Rules (MANDATORY)

### NEVER DO (Hard Boundaries)

1. **DO NOT overwrite original game repositories** with copies from the central repository
2. **DO NOT modify synced product copies** (`/arrowout/`, `/crystalquest/`, `/sarkari-sarthi/`) as a substitute for modifying their original repositories
3. **DO NOT commit directly to `main`** unless explicitly authorized by the repository owner
4. **DO NOT merge PRs** without explicit user approval
5. **DO NOT delete existing user data** or save systems
6. **DO NOT change deployment, sync schedules, or Firebase production configuration** without authorization
7. **DO NOT expose user records** or subscriber data to unauthorized users
8. **DO NOT automatically subscribe Google sign-in users** to marketing (must remain optional and unchecked by default)
9. **DO NOT send promotional emails** or perform bulk marketing without explicit authorization
10. **DO NOT weaken Firestore rules** to make a feature work
11. **DO NOT claim Firebase rules are deployed** unless deployment is verified
12. **DO NOT modify** `parya5103/Fletch_Game`, `parya5103/crystal-quest-web`, or `parya5103/Sarkari-Sarthi` repositories
13. **DO NOT use standalone "Sarkari"** - only use "Sarkari Sarthi" as full product name

### ALWAYS DO (Safety First)

1. **Use separate feature branches** and PRs for all significant changes
2. **Inspect existing architecture** before editing any code
3. **Preserve existing functionality** and backward compatibility
4. **Verify Firestore rules** against the actual Firebase project before claiming security
5. **Test cross-user access denial** before claiming security features work
6. **Run relevant tests** after making changes (`npm test`, `npm run lint:rules`)
7. **Report exact files changed** and test results in your response
8. **Preserve mobile-first design** and Android Chrome compatibility
9. **Maintain SEO, accessibility, PWA, and performance** standards
10. **Add proper ARIA labels and semantic HTML** for accessibility
11. **Use skip-to-content links** on all pages
12. **Ensure focus states** are visible for all interactive elements

---

## Repository Structure

```
gogo-website/
├── index.html                    # Main homepage
├── 404.html                      # Not found page
├── CNAME                         # Custom domain
├── .nojekyll                     # Prevent Jekyll processing
├── robots.txt                    # Crawler directives
├── ads.txt                       # AdSense publisher declaration
├── favicon.svg                   # Site icon
├── sitemap.xml                   # Site map
├── README.md                     # Project readme
├── DEPLOYMENT.md                 # Deployment instructions
├── security_spec.md              # Security specifications
├── package.json                  # Node.js dependencies
├── eslint.config.mjs             # ESLint configuration
├── account/                      # GoGo Account & Cloud Save UI
│   └── index.html
├── admin/                        # Protected Admin Dashboard
│   └── index.html
├── unsubscribe/                  # Marketing unsubscribe center
│   └── index.html
├── about/                        # About page
│   └── index.html
├── contact/                      # Contact page
│   └── index.html
├── disclaimer/                   # Disclaimer page
│   └── index.html
├── privacy-policy/               # Privacy policy
│   └── index.html
├── terms-and-conditions/         # Terms and conditions
│   └── index.html
├── arrowout/                     # Synced Arrow Out game (from Fletch_Game)
├── crystalquest/                 # Synced Crystal Quest game
├── sarkari-sarthi/               # Synced Sarkari Sarthi portal
├── assets/
│   ├── css/                      # Shared stylesheets
│   │   ├── style.css            # Main styles + skip-link, loading skeleton, back-to-top
│   │   ├── gogo-account.css     # Account system styles + focus states
│   │   └── ads.css              # AdSense styles
│   └── js/                       # Shared JavaScript
│       ├── main.js               # Header/footer injection, skip-link, back-to-top
│       ├── gogo-account.js       # Compiled from src/gogo-account.ts
│       └── ads.js                # AdSense integration
├── src/
│   └── gogo-account.ts           # TypeScript source for GoGo Account system
├── scripts/                      # Build and test scripts
│   ├── build-account-bundle.mjs
│   ├── run-all-tests.mjs
│   ├── update-upstream-repos.mjs
│   └── push-upstream-prs.sh
├── upstream-patches/             # Patches for original game repos
│   ├── Fletch_Game.patch
│   ├── Fletch_Game-feat-gogo-shared-account.bundle
│   ├── crystal-quest-web.patch
│   └── crystal-quest-web-feat-gogo-shared-account.bundle
├── .github/
│   └── workflows/
│       └── sync-products.yml     # Product synchronization workflow
├── firebase.json                 # Firebase project config
├── firebase-applet-config.json   # Firebase client config (PUBLIC)
├── firebase-blueprint.json       # Firestore schema blueprint
├── firestore.rules               # Firestore Security Rules
└── firestore.rules.test.ts        # Firestore rules unit tests
```

---

## Coding Rules

### Before Editing
1. **Read AGENTS.md and KNOWLEDGE.md** - Understand the project before making changes
2. **Inspect the current code** - Understand existing patterns and architecture
3. **Check Git history** - Understand why previous decisions were made
4. **Verify with source code** - Primary evidence comes from actual code, not assumptions

### During Editing
1. **Make minimal, targeted changes** - Small, focused changes are safer
2. **Preserve backward compatibility** - Don't break existing functionality
3. **Follow existing patterns** - Match the repository's coding style
4. **Add accessibility features** - ARIA labels, focus states, semantic HTML
5. **Maintain mobile-first** - Test on Android Chrome first

### After Editing
1. **Run tests** - Execute `npm test` and verify all 19 test suites pass
2. **Run lint** - Execute `npm run lint:rules` and verify 0 errors
3. **Test manually** - Verify changes work as expected in browser
4. **Report results** - Document exact files changed and test outcomes

---

## Firebase Safety

### Firebase Configuration
- Firebase API configuration in `firebase-applet-config.json` is **PUBLIC client configuration**, not a private secret
- **Real security depends on Firebase Authentication and Firestore Security Rules**
- Never expose this configuration as a secret

### Security Rules
- **Default-deny**: Firestore rules must enforce deny-all by default
- **UID ownership**: Users can only access their own data (`users/{uid}`)
- **Verified admin**: Admin access requires verified email and admin flag
- **Marketing consent**: Must be explicit and unchecked by default
- **Never weaken rules** to make a feature work - fix the feature instead

### Marketing and Subscribers
- **Marketing consent must remain optional and unchecked by default**
- **Google sign-in must NEVER automatically subscribe a user** to marketing
- **Preserve existing subscription preferences** when users update their accounts
- **Do not send promotional emails** without explicit authorization
- **Do not perform bulk marketing operations** without explicit authorization

---

## Game Integration

### Arrow Out and Crystal Quest
- **Separate products** with their own repositories
- **Preserve guest play** - Don't require accounts for gameplay
- **Preserve existing localStorage save formats** - Cloud saves must work with existing local saves
- **Cloud saves must never silently destroy or overwrite valid local progress**
- **Keep account integration consistent** across website and original game repositories

### Synchronization Workflow
- Products are synced from their original repositories using `rsync --delete`
- Sync workflow: `.github/workflows/sync-products.yml`
- **Never modify synced product copies** - Edit the original repositories instead
- **Source of truth**: Original game repositories (Fletch_Game, crystal-quest-web, Sarkari-Sarthi)

### Sarkari Sarthi
- **Separate project** outside GoGo website integration scope
- **Do not modify** Sarkari Sarthi files or integrations
- **Technical references allowed**: CSS classes, JS identifiers, repo names can use "sarkari"
- **Public brand wording**: Use "Government" or "government job" instead of standalone "Sarkari"

---

## Testing Requirements

### Test Suite
- **Command**: `npm test`
- **Expected**: ALL 19 TEST SUITES PASSED SUCCESSFULLY
- **Do not report tests as passed** unless actually executed and output is available

### Test Categories
1. GoGo Account & Cloud Save Unit & Conflict Tests (7 tests)
2. GoGo Customer Email Database, Verification & Consent Tests (8 tests)
3. Firestore Security Rules & Cursor Pagination Audit (3 tests)
4. Cross-Application Asset, Bundle & Legal Consistency Verification (1 test)

### Linting
- **Command**: `npm run lint:rules`
- **Expected**: 0 errors/warnings
- **Do not claim lint passes** unless actually executed

---

## Quality Standards

### SEO
- Unique title and description for each public page
- Canonical URLs using absolute paths
- Open Graph meta tags (og:title, og:description, og:url, og:image)
- Twitter card meta tags (twitter:card, twitter:title, twitter:description, twitter:image)
- BreadcrumbList JSON-LD schema
- Organization and WebSite JSON-LD schema on homepage

### Accessibility
- Skip-to-content link on all pages
- ARIA labels on all interactive elements
- Focus states for all interactive elements (buttons, links, form controls)
- Semantic HTML (proper use of h1-h6, nav, main, footer, etc.)
- Role attributes for better screen reader support
- Color contrast meets WCAG AA standards (4.5:1 for normal text)
- Keyboard navigation support

### Performance
- Mobile-first design
- Lightweight pages (fast loading)
- Minimal JavaScript
- Efficient CSS

### UX
- Consistent button styling
- Loading states for async operations
- Error states with clear messages
- Back-to-top button for long pages
- Clear navigation and structure

---

## Change History

| Date | Change | Author |
|------|--------|--------|
| 2025-01-17 | Initial AGENTS.md created | AI Agent |
| 2025-11-05 | Updated with brand language rules, accessibility standards, recent improvements | AI Agent |

---

## Quick Reference

- **Production**: https://gogocompany.in/
- **Repository**: https://github.com/parya5103/gogo-website
- **Test Command**: `npm test`
- **Lint Command**: `npm run lint:rules`
- **Build Command**: `npm run build`
- **Main Branch**: main
- **Docs Branch**: docs/update-agent-knowledge
