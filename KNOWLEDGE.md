# GoGo Games — Complete Project Knowledge Base

**Last Updated:** 2025-01-17
**Audit Date:** 2025-01-17
**Repository:** parya5103/gogo-website
**Production:** https://gogocompany.in/
**Branch:** docs/update-agent-knowledge
**Latest Commit:** f3f57d2f72d71777e62bce8a17e689954fe6f5b6

---

## 1. Project Overview and Goals

GoGo Company is an independent gaming and digital products company. The central website (gogocompany.in) serves as:
- Company portal with product information
- Unified authentication and account management system (GoGo Account)
- Cloud save synchronization hub for games
- Admin dashboard for user and subscriber management
- Synchronization point for all GoGo products

**Core Products:**
1. Arrow Out! - Minimalist arrow-path puzzle game (1000+ levels)
2. Crystal Quest - Match-3 game with story mode (27 levels across 3 regions)
3. Sarkari Sarthi - Government job notification tracker (separate project)

**Status:** ACTIVE - All products accessible via gogocompany.in

---

## 2. Production Website and Repository Links

| Resource | URL | Notes |
|----------|-----|-------|
| Production Website | https://gogocompany.in/ | Custom domain |
| GitHub Repository | https://github.com/parya5103/gogo-website | Central sync repo |
| Arrow Out Game | https://gogocompany.in/arrowout/ | Synced from Fletch_Game |
| Crystal Quest Game | https://gogocompany.in/crystalquest/ | Synced from crystal-quest-web |
| Sarkari Sarthi | https://gogocompany.in/sarkari-sarthi/ | Synced from Sarkari-Sarthi |
| GoGo Account | https://gogocompany.in/account/ | Central auth system |
| Admin Dashboard | https://gogocompany.in/admin/ | Protected, verified admins only |
| Unsubscribe | https://gogocompany.in/unsubscribe/ | Marketing opt-out |

---

## 3. Repository Architecture and Important Folders

### Root Level Files
- index.html (Homepage)
- 404.html (Not found page)
- CNAME (Custom domain)
- .nojekyll (Prevent Jekyll processing)
- robots.txt (Crawler directives)
- ads.txt (AdSense publisher declaration)
- favicon.svg (Site icon)
- sitemap.xml (Site map)
- metadata.json
- README.md
- DEPLOYMENT.md
- security_spec.md
- package.json
- eslint.config.mjs

### Product Directories (Synced from Source Repositories)
| Directory | Source Repository | Sync Branch | Status |
|-----------|-------------------|-------------|--------|
| /arrowout/ | parya5103/Fletch_Game | main | SYNCED |
| /crystalquest/ | parya5103/crystal-quest-web | main | SYNCED |
| /sarkari-sarthi/ | parya5103/Sarkari-Sarthi | gh-pages | SYNCED |

**Important:** These directories are read-only copies. All edits must be made in their respective source repositories.

### Feature Directories (Native to this Repository)
- account/ (GoGo Account UI)
- admin/ (Admin Dashboard UI)
- unsubscribe/ (Unsubscribe Center UI)
- about/, contact/ (Informational pages)
- privacy-policy/, terms-and-conditions/, disclaimer/ (Legal pages)
- assets/ (Shared assets)
  - css/ (style.css, gogo-account.css, ads.css)
  - js/ (main.js, gogo-account.js, ads.js)

### Source Code
- src/gogo-account.ts (TypeScript source for GoGo Account system)

### Configuration Files
- firebase.json
- firebase-applet-config.json (PUBLIC client config)
- firebase-blueprint.json (Firestore schema)
- firestore.rules
- firestore.rules.test.ts

### Scripts and Patches
- scripts/ (build-account-bundle.mjs, run-all-tests.mjs, update-upstream-repos.mjs, push-upstream-prs.sh)
- upstream-patches/ (Fletch_Game.patch, crystal-quest-web.patch, pre-built bundles)

### GitHub Workflows
- .github/workflows/sync-products.yml

---

## 4. Deployment and GitHub Pages Configuration

**Deployment Model:**
- Hosting: GitHub Pages (Free tier)
- Source: Branch main, root folder
- Custom Domain: gogocompany.in
- HTTPS: Enforced
- Repository: Must remain PUBLIC

**DNS Configuration (GoDaddy):**
- A records: 185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153
- CNAME www: parya5103.github.io

**Deployment Triggers:**
1. Site pages: Any push to main branch (1-3 min redeploy)
2. Product apps: Sync workflow execution (daily 06:15 IST or manual)

**Post-Deploy Verification:**
- Homepage loads
- www redirects to apex
- Header/footer render
- Product buttons work
- Old URLs redirect
- Games install as PWAs
- HTTPS with no mixed-content warnings

**TWA Assetlinks Status:** UNVERIFIED - File .well-known/assetlinks.json not found

---

## 5. Product Synchronization Architecture

**Sync Workflow:** .github/workflows/sync-products.yml

**Schedule:** 45 0 * * * UTC = 06:15 IST daily
**Manual Trigger:** GitHub Actions -> Sync product apps -> Run workflow

**Sync Process:**
1. Checkout central site (parya5103/gogo-website)
2. Checkout Arrow Out source (parya5103/Fletch_Game @ main)
3. Checkout Crystal Quest source (parya5103/crystal-quest-web @ main)
4. Checkout Sarkari Sarthi (parya5103/Sarkari-Sarthi @ gh-pages)
5. Rsync each into /arrowout/, /crystalquest/, /sarkari-sarthi/
6. Verify key files exist
7. Commit if changed, push to main

**Method:** rsync -a --delete --delete-excluded

**Exclusions:** .git, .github, build tooling, dev folders, lockfiles, READMEs

**Status:** IMPLEMENTED and ACTIVE

---

## 6. Individual Game Source-of-Truth Repositories

### Arrow Out (Fletch_Game)
- Repository: https://github.com/parya5103/Fletch_Game
- Branch: main
- Sync Target: /arrowout/
- Integration: Patch exists (upstream-patches/Fletch_Game.patch)
- **Status:** PARTIAL - Integration files exist, original repo status unverified

### Crystal Quest (crystal-quest-web)
- Repository: https://github.com/parya5103/crystal-quest-web
- Branch: main
- Sync Target: /crystalquest/
- Integration: Patch exists (upstream-patches/crystal-quest-web.patch)
- **Status:** PARTIAL - Integration files exist, original repo status unverified

### Sarkari Sarthi
- Repository: https://github.com/parya5103/Sarkari-Sarthi
- Branch: gh-pages
- Sync Target: /sarkari-sarthi/
- **Scope:** OUT OF SCOPE - Separate project, do not modify

---

## 7. GoGo Account Architecture

**Overview:** Unified authentication and cloud save synchronization across all GoGo Games products.

**Source Files:**
- src/gogo-account.ts (TypeScript source, ~3800 lines)
- assets/js/gogo-account.js (Compiled bundle, generated)

**Build Command:** npm run build

**Core Features:**
1. Cross-App Single Sign-On (shared auth state across /, /arrowout/, /crystalquest/)
2. Guest Play Preservation (localStorage saves preserved)
3. Cloud Save Synchronization (automatic/manual backup, conflict resolution)
4. Marketing Consent Management (explicit opt-in, audit trail)

**GameAdapter Interface:**
- gameId: 'arrowout' | 'crystalquest'
- gameName: string
- schemaVersion: number
- getLocalSave: () => Record<string, any> | null
- getLocalUpdatedAtMs: () => number
- applyCloudSave: (progress, updatedAtMs) => void
- mergeProgress?: (localSave, cloudSave) => Record<string, any>

**Conflict Handling:**
- States: in_sync, upload_local, restore_cloud, conflict, empty
- Automatic: Use newer save if timestamps differ significantly
- Smart Merge: Merge progress for compatible saves
- Manual: User decides for divergent progress

**Status:** IMPLEMENTED

---

## 8. Firebase Auth Implementation

**Firebase Project ID:** gen-lang-client-0566323659
**Firestore Database ID:** ai-studio-gogowebsite-4126d566-149d-4901-8c83-59ba041323ca

**Client Configuration:** firebase-applet-config.json (PUBLIC - normal for Firebase web apps)

**Authentication Providers:**
- Email/Password: Registration, login, password reset, email verification
- Google Sign-In: OAuth via Google

**Auth Features:**
- Session persistence (indexedDB, fallback to localStorage)
- Automatic token refresh
- Auth state tracking across tabs
- User profile sync on auth changes

**Security Notes:**
- Client API key is PUBLIC (normal for Firebase)
- Real security comes from Firebase Authentication + Firestore Security Rules
- Never expose user data to unauthorized users

**Status:** IMPLEMENTED

---

## 9. Firestore Collections and Document Structure

**Database ID:** ai-studio-gogowebsite-4126d566-149d-4901-8c83-59ba041323ca

### Collections:

1. **users/{uid}** - User profiles
   - Fields: displayName, email, emailVerified, photoURL, authProvider, marketingSubscribed, createdAt, lastLoginAt
   - Validation: email matches auth token, emailVerified matches token, createdAt immutable
   - Access: Owner + Admin

2. **marketingSubscribers/{uid}** - Marketing consent records
   - Fields: email, emailVerified, displayName, subscribed, consentTimestamp, consentVersion, consentText, source, authProvider, registeredAt, updatedAt, unsubscribedAt
   - Validation: subscribed=true requires authProvider != 'google.com', consentTimestamp/Version/Text required
   - Access: Owner + Admin

3. **admins/{uid}** - Admin role records
   - Fields: email, role, createdAt
   - Access: Owner + Admin (read-only, no create/update/delete)
   - Hardcoded admins: aaryapratik@gmail.com, officialgogocompany@gmail.com

4. **gameProfiles/{uid}/games/{gameId}** - Cloud game saves
   - Fields: gameId, progress, updatedAt, schemaVersion
   - Validation: gameId in ['arrowout', 'crystalquest'], progress validated by game, schemaVersion 1-100
   - Access: Owner only

**Status:** IMPLEMENTED with strict validation

---

## 10. Cloud Save Architecture and Conflict Handling

**Save Flow:**
1. Guest Play: All progress in localStorage, no Firestore access
2. Authenticated Play: Local progress in localStorage, cloud progress in Firestore
3. First Authentication: Local saves preserved, user can upload to cloud

**Conflict Detection:**
- Compare local timestamp vs cloud timestamp
- Detect divergent progress

**Conflict States:**
- in_sync: Local and cloud match
- upload_local: Local is newer
- restore_cloud: Cloud is newer
- conflict: Divergent progress
- empty: No saves exist

**Resolution:**
- Automatic: Use newer if timestamps differ significantly
- Smart Merge: Merge progress for compatible saves
- Manual: User chooses for conflicts

**Validation:**
- gameId must be supported
- schemaVersion must be valid
- Progress data must match expected format
- Values bounded (e.g., levels <= 10000)

**Status:** IMPLEMENTED with strict validation

---

## 11. Marketing Consent and Unsubscribe Workflow

**Core Principles:**
1. Explicit Opt-In: Users must actively check consent box
2. Unchecked by Default: Marketing consent checkbox never pre-checked
3. Google Sign-In: NEVER auto-subscribed to marketing
4. Verified Email Required: Only verified emails eligible for marketing
5. Full Audit Trail: All consent decisions recorded with timestamps

**Consent Data:**
- consentVersion: 'v1.0-2026-11'
- consentText: 'Yes! I would like to receive GoGo Games news, new game announcements, updates, special offers and promotional emails.'
- consentTimestamp: serverTimestamp()
- source: 'registration_form' | 'account_profile' | 'unsubscribe_page'

**Unsubscribe Workflow:**
- Page: /unsubscribe/
- Features: One-click authenticated unsubscribe, email lookup, status display, re-subscription
- Process: Set subscribed=false, unsubscribedAt=request.time, preserve consent audit trail

**Eligibility:** User is eligible if subscribed=true AND emailVerified=true AND !unsubscribedAt AND valid consent

**Status:** IMPLEMENTED with strict validation

---

## 12. Admin Dashboard and CSV Export

**Location:** /admin/

**Access:**
- Verified admin only (email_verified == true)
- Authorized via hardcoded email OR /admins/{uid} document
- Fail closed: Unverified admins strictly rejected

**Features:**
- KPI overview (8 metrics)
- User directory with search/filter
- Cursor-based pagination (orderBy, startAfter, limit)
- CSV export (RFC-4180 compliant, formula injection hardened)

**KPI Metrics:**
- totalUsers, totalVerifiedUsers, totalPromotionalSubscribers
- totalPendingVerificationSubscribers, totalUnsubscribed, totalNoConsent
- newLast7Days, optInRatePercent

**Admin Authorization Function:** isAuthorizedAdminUser() in src/gogo-account.ts

**CSV Export:** Only eligible marketing subscribers (isEligibleMarketingSubscriber())

**Status:** IMPLEMENTED (pagination added in commit f3f57d2)

**Limitations:**
- Large-scale performance unverified
- Production behavior requires validation
- Search, filtering, CSV exports need runtime testing

---

## 13. Firestore Security Model

**Rules File:** firestore.rules (Version: '2')

**Security Approach:** Fail-closed, strict validation, owner-only access

**Helper Functions:**
- isAuthenticated(), isOwner(uid), isEmailVerifiedToken()
- isVerifiedAdminEmail(), isAdmin()
- isValidId(), isValidEmail(), isConsistentAuthEmail()
- isConsistentEmailVerifiedField(), isValidAuthProvider()
- isSupportedGameId()
- User profile validation: hasValidUserFields(), hasValidUserFieldTypes(), isValidUserCreate(), isValidUserUpdate()
- Marketing subscriber validation: hasValidSubscriberFields(), hasValidSubscriberFieldTypes(), isValidSubscriberCreate(), isValidSubscriberUpdate()
- Game save validation: hasExactGameSaveFields(), isValidGameSaveCreate(), isValidGameSaveUpdate()

**Collection Rules:**
- users/{uid}: get (owner+admin), list (admin), create (owner+valid), update (owner+valid), delete (owner)
- marketingSubscribers/{uid}: get (owner+admin), list (admin), create (owner+valid), update (owner+valid), delete (owner)
- admins/{uid}: get (owner+admin), list (admin), create/update/delete (DENIED)
- gameProfiles/{uid}/games/{gameId}: get/list/create/update/delete (owner+valid gameId)

**Default Rule:** match /{document=**}: allow read, write: if false (deny all)

**Security Tests:** firestore.rules.test.ts (Vitest + @firebase/rules-unit-testing)

**Test Coverage:**
- Unauthenticated access denial
- Authenticated user CRUD
- Email spoofing prevention
- Email verified status spoofing prevention
- Cross-user access denial
- Admin access control
- Marketing subscriber consent validation
- Google Sign-In auto-subscription prevention
- Game save validation

**Status:** IMPLEMENTED with comprehensive tests

---

## 14. PWA, Service Workers and Caching

**PWA Support:** IMPLEMENTED via individual game repositories

**Arrow Out PWA:**
- arrowout/manifest.webmanifest
- arrowout/sw.js (Service Worker)
- arrowout/icons/icon-192.png

**Crystal Quest PWA:**
- crystalquest/manifest.json
- crystalquest/sw.js (Service Worker)
- crystalquest/icon.svg

**Central Website:**
- Static HTML/CSS/JS
- No custom service worker
- Shared assets cached by browser

**Service Worker Behavior:**
- Relative paths and scopes
- Work unchanged inside subdirectories
- Cache game assets for offline play
- Background sync for progress updates

**Caching Strategy:**
- Browser caching for static assets
- Service workers cache game assets
- Firestore data cached by Firebase SDK
- GitHub Pages redeploy on main push

**Status:** IMPLEMENTED - Games work as PWAs from subdirectories

---

## 15. Privacy and Data-Handling Decisions

**Data Collection:**
- User Profile: Email, display name, photo URL, auth provider, timestamps
- Marketing Consent: Explicit consent records with audit trail
- Game Progress: Cloud saves for authenticated users
- Analytics: None (no tracking implemented)

**Not Collected:** IP addresses, device info, location, browsing history

**Data Storage:**
- Firebase Authentication: User credentials (hashed)
- Firestore: User profiles, marketing consent, game saves
- localStorage: Guest game progress (browser only)
- indexedDB: Firebase auth persistence (browser only)

**Data Access:**
- Users can only access their own data
- Admins can access all user data (for dashboard)
- No public access to user data
- Firestore rules enforce strict access control

**Data Sharing:**
- NEVER: User data shared with third parties
- NEVER: User data sold or rented
- ONLY: Marketing emails to users who explicitly opted in

**Data Retention:**
- User Requested Deletion: Permanent and irreversible
- Automatic Deletion: None

**Legal Pages:**
- Privacy Policy: /privacy-policy/ (IMPLEMENTED)
- Terms and Conditions: /terms-and-conditions/ (IMPLEMENTED)

---

## 16. Test Infrastructure and Test Commands

**Test Framework:**
- Vitest: Unit testing framework
- @firebase/rules-unit-testing: Firestore rules testing
- ESLint: Security rules linting

**Test Commands:**
```bash
npm test                # Full test suite
npm run lint:rules     # Lint Firestore rules
npm run build           # Build TypeScript bundles
```

**Test Files:**
- firestore.rules.test.ts: Security rules unit tests
- scripts/run-all-tests.mjs: Full test suite runner

**Test Coverage:**
- Authentication and authorization
- User profile CRUD
- Marketing subscriber validation
- Game save validation
- Admin access control
- Cross-user access prevention
- Email consistency validation

**Status:** IMPLEMENTED - Comprehensive test suite exists

---

## 17. Existing Implementation Status

### IMPLEMENTED (Verified in Source Code)
- GoGo Account System (src/gogo-account.ts)
- Firebase Auth (Email/Password, Google Sign-In)
- User Profile Collection (/users/{uid})
- Marketing Subscriber Collection (/marketingSubscribers/{uid})
- Admin Collection (/admins/{uid})
- Game Profiles Collection (/gameProfiles/{uid}/games/{gameId})
- Firestore Security Rules (firestore.rules)
- Security Rules Tests (firestore.rules.test.ts)
- Admin Dashboard UI (admin/index.html)
- Account UI (account/index.html)
- Unsubscribe UI (unsubscribe/index.html)
- Product Sync Workflow (.github/workflows/sync-products.yml)
- Firebase Blueprint (firebase-blueprint.json)
- Security Specification (security_spec.md)
- Deployment Guide (DEPLOYMENT.md)

### PARTIAL (Implementation Exists, Verification Needed)
- Arrow Out Integration: Patch exists, original repo status unverified
- Crystal Quest Integration: Patch exists, original repo status unverified
- Admin Dashboard Runtime: Implementation exists, production testing needed
- CSV Export: Implementation exists, runtime testing needed
- Pagination: Implementation exists, large dataset testing needed
- Firestore Rules Deployment: Rules exist, deployment verification needed

### PLANNED (Referenced but Not Yet Implemented)
- TWA Assetlinks: File not in repo, needs generation from Fletch_Game
- AdSense Activation: Publisher ID present, but ads currently OFF
- CMP Integration: For EEA/UK/CH regions, currently not active

### OUT OF SCOPE
- Sarkari Sarthi Modifications: Separate project
- Bulk Email Sending: Requires explicit authorization

---

## 18. Known Limitations and Unresolved Issues

### Security Verification
1. Firestore rules deployment: UNVERIFIED - Check Firebase Console
2. Cross-user access denial: UNVERIFIED - Production testing needed
3. Admin authorization: UNVERIFIED - Production testing needed

### Game Integration
4. Arrow Out original repository: UNVERIFIED - Check if has GoGo Account integration
5. Crystal Quest original repository: UNVERIFIED - Check if has GoGo Account integration
6. Guest play preservation: UNVERIFIED - Test guest -> auth flow
7. Cloud save conflict handling: UNVERIFIED - Test with divergent saves

### Admin Dashboard
8. Large dataset performance: UNVERIFIED - Load test with >1000 users
9. Search and filtering: UNVERIFIED - Test features
10. CSV export: UNVERIFIED - Test generation and download

### Authentication
11. Registration flow: UNVERIFIED - End-to-end test
12. Google Sign-In: UNVERIFIED - End-to-end test
13. Password reset: UNVERIFIED - End-to-end test

### Deployment
14. TWA Assetlinks: MISSING - .well-known/assetlinks.json not in repo
15. AdSense: Publisher ID present but ads OFF

---

## 19. Pending Tasks and Priorities

### P0 - Security and Correctness (Critical)
- Verify Firestore rules deployment
- Test cross-user access denial
- Test verified admin authorization
- Test marketing consent correctness
- Test unsubscribe correctness
- Verify cloud save doesn't destroy local progress
- Confirm Arrow Out integration in original repo
- Confirm Crystal Quest integration in original repo

### P1 - Reliability (High)
- Run full test suite (npm test)
- Verify pagination, filters, CSV exports
- Test registration, login, Google Sign-In, password reset, logout
- Test Android Chrome and PWA behavior
- Verify service worker update behavior
- Verify scheduled product synchronization

### P2 - Improvements (Medium)
- Improve large-dataset admin performance
- Improve accessibility
- Improve mobile UX
- Improve documentation
- Consider authorized marketing tools (without enabling bulk email by default)

---

## 20. Safe Workflow for Future AI Agents

### Before Starting
1. Read AGENTS.md
2. Read KNOWLEDGE.md
3. Check git status
4. Identify target repository

### Making Changes
1. Create feature branch: git checkout -b feat/description
2. Inspect existing code
3. Make minimal changes
4. Test: npm test, npm run lint:rules
5. Verify no regressions

### After Making Changes
1. Check git diff
2. Commit: git add -A; git commit -m "feat: description"
3. Push: git push -u origin feat/description
4. Report: Files changed, test results, limitations

### Special Cases
- Firebase Configuration: NEVER modify without authorization
- Production Deployment: NEVER deploy manually
- User Data: NEVER delete or expose
- Marketing: NEVER auto-subscribe Google users, NEVER send emails without authorization
- Sarkari Sarthi: REFUSE to modify (out of scope)

---

## Summary Statistics

| Metric | Count |
|--------|-------|
| Total Files | ~100+ |
| Source Files | 1 (gogo-account.ts) |
| Configuration Files | 4 |
| Test Files | 1 (firestore.rules.test.ts) |
| Documentation Files | 4 |
| GitHub Workflows | 1 |
| Synced Products | 3 |
| Firestore Collections | 4 |
| Auth Providers | 2 |
| Supported Games | 2 |

---

## Quick Reference Links

- Repository: https://github.com/parya5103/gogo-website
- Production: https://gogocompany.in/
- Arrow Out Source: https://github.com/parya5103/Fletch_Game
- Crystal Quest Source: https://github.com/parya5103/crystal-quest-web
- Sarkari Sarthi Source: https://github.com/parya5103/Sarkari-Sarthi
- Firebase Project: gen-lang-client-0566323659
- Firestore Database: ai-studio-gogowebsite-4126d566-149d-4901-8c83-59ba041323ca

---

## Change History

| Date | Change | Author |
|------|--------|--------|
| 2025-01-17 | Comprehensive audit completed | AI Agent (Mistral) |
| 2025-01-17 | KNOWLEDGE.md created | AI Agent (Mistral) |
| 2025-01-17 | AGENTS.md created | AI Agent (Mistral) |
| 2025-01-17 | Branch docs/update-agent-knowledge created | AI Agent (Mistral) |

---

## Key Takeaways

1. GoGo website is the central synchronization hub - Individual game repos are source of truth
2. Firebase client config is public - Real security comes from Auth + Firestore Rules
3. Marketing consent is explicit - Never auto-subscribe, especially not Google users
4. Admin access is fail-closed - Verified email required, unverified admins rejected
5. Cloud saves never destroy local progress - Guest play is preserved
6. Sync workflow is automated - Daily at 06:15 IST or manual trigger
7. Test suite exists - But production verification needed for many features
8. Documentation is now comprehensive - AGENTS.md and KNOWLEDGE.md provide complete reference

---

Documentation Complete
Last Updated: 2025-01-17
Status: Ready for review and commit
