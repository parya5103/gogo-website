# GoGo Games - Complete Project Knowledge Base

**Last Updated:** 2025-11-05  
**Audit Date:** 2025-11-05  
**Repository:** parya5103/gogo-website  
**Production:** https://gogocompany.in/  
**Latest Commit:** 23b97e9287c47a68747c3f394744d63c5ef8088b  
**Branch:** main  
**Previous Audit Commit:** f3f57d2f72d71777e62bce8a17e689954fe6f5b6

---

## 1. Project Overview and Goals

GoGo Company is an independent gaming and digital products company. The central website (gogocompany.in) serves as:
- Company portal with product information
- Unified authentication and account management system (GoGo Account)
- Cloud save synchronization hub for games
- Admin dashboard for user and subscriber management
- Synchronization point for all GoGo products

**Core Products:**
1. **Arrow Out!** - Minimalist arrow-path puzzle game (1000+ levels)
   - Repository: parya5103/Fletch_Game
   - Status: ACTIVE, synced to /arrowout/
   
2. **Crystal Quest** - Match-3 game with story mode (27 levels across 3 regions)
   - Repository: parya5103/crystal-quest-web
   - Status: ACTIVE, synced to /crystalquest/
   
3. **Sarkari Sarthi** - Government job notification tracker
   - Repository: parya5103/Sarkari-Sarthi
   - Status: ACTIVE, synced to /sarkari-sarthi/
   - Note: Separate project, must NOT be modified by GoGo website tasks

**Overall Status:** ACTIVE - All products accessible via gogocompany.in

**Brand Language Update (2025-11-05):**
- The word "Sarkari" should only appear as part of the full product name "Sarkari Sarthi"
- Use alternatives: "Government", "government job", "Government job listings", "government exam"
- All standalone "Sarkari" references have been replaced across the website

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
| About | https://gogocompany.in/about/ | Company information |
| Contact | https://gogocompany.in/contact/ | Contact form |
| Privacy Policy | https://gogocompany.in/privacy-policy/ | Privacy statement |
| Terms & Conditions | https://gogocompany.in/terms-and-conditions/ | Terms of service |
| Disclaimer | https://gogocompany.in/disclaimer/ | Disclaimer |

---

## 3. Repository Architecture and Important Folders

### Root Level Files
- `index.html` - Main homepage
- `404.html` - Not found page
- `CNAME` - Custom domain configuration
- `.nojekyll` - Prevent Jekyll processing
- `robots.txt` - Crawler directives
- `ads.txt` - AdSense publisher declaration (pub-2895136878543415)
- `favicon.svg` - Site icon
- `sitemap.xml` - Site map with all pages
- `README.md` - Project readme
- `DEPLOYMENT.md` - Deployment instructions
- `security_spec.md` - Security specifications
- `package.json` - Node.js dependencies
- `eslint.config.mjs` - ESLint configuration
- `AGENTS.md` - AI agent operational instructions
- `KNOWLEDGE.md` - Complete project knowledge base

### Product Directories (Synced from Source Repositories)
| Directory | Source Repository | Sync Branch | Status |
|-----------|-------------------|-------------|--------|
| `/arrowout/` | parya5103/Fletch_Game | main | SYNCED |
| `/crystalquest/` | parya5103/crystal-quest-web | main | SYNCED |
| `/sarkari-sarthi/` | parya5103/Sarkari-Sarthi | gh-pages | SYNCED |

**Important:** These directories are read-only copies. All edits must be made in their respective source repositories.

### Feature Directories (Native to this Repository)
- `account/` - GoGo Account UI
  - `index.html` - Account page with loading state
- `admin/` - Admin Dashboard UI
  - `index.html` - Admin page with loading state
- `unsubscribe/` - Unsubscribe Center UI
  - `index.html` - Unsubscribe page with loading state
- `about/` - About page
  - `index.html` - Company information
- `contact/` - Contact page
  - `index.html` - Contact form
- `disclaimer/` - Disclaimer page
  - `index.html` - Legal disclaimer
- `privacy-policy/` - Privacy policy
  - `index.html` - Privacy statement
- `terms-and-conditions/` - Terms and conditions
  - `index.html` - Terms of service

### Assets
- `assets/css/` - Shared stylesheets
  - `style.css` - Main styles (theme-gogo, skip-link, loading skeleton, back-to-top, focus states)
  - `gogo-account.css` - Account system styles (focus states for account trigger)
  - `ads.css` - AdSense styles
- `assets/js/` - Shared JavaScript
  - `main.js` - Header/footer injection, skip-to-content link, back-to-top button, ARIA labels
  - `gogo-account.js` - Compiled from src/gogo-account.ts
  - `ads.js` - AdSense integration

### Source Code
- `src/gogo-account.ts` - TypeScript source for GoGo Account system (3686 lines)

### Configuration Files
- `firebase.json` - Firebase project configuration
- `firebase-applet-config.json` - Firebase client config (PUBLIC)
- `firebase-blueprint.json` - Firestore schema blueprint
- `firestore.rules` - Firestore Security Rules
- `firestore.rules.test.ts` - Firestore rules unit tests

### Scripts and Patches
- `scripts/build-account-bundle.mjs` - Build script for account bundle
- `scripts/run-all-tests.mjs` - Test runner
- `scripts/update-upstream-repos.mjs` - Upstream repository updater
- `scripts/push-upstream-prs.sh` - PR pusher script
- `upstream-patches/` - Patches for original game repos
  - `Fletch_Game.patch`
  - `Fletch_Game-feat-gogo-shared-account.bundle`
  - `crystal-quest-web.patch`
  - `crystal-quest-web-feat-gogo-shared-account.bundle`

### GitHub Workflows
- `.github/workflows/sync-products.yml` - Product synchronization workflow

---

## 4. Deployment and GitHub Pages Configuration

### Deployment Method
- **Hosting**: GitHub Pages with custom domain gogocompany.in
- **Branch**: main branch deployed automatically
- **Custom Domain**: gogocompany.in (CNAME configured)

### Product Synchronization
- **Workflow**: `.github/workflows/sync-products.yml`
- **Method**: rsync --delete from source repositories
- **Products Synced**:
  - Arrow Out from parya5103/Fletch_Game
  - Crystal Quest from parya5103/crystal-quest-web
  - Sarkari Sarthi from parya5103/Sarkari-Sarthi
- **Note**: Sync workflow copies products from their original repositories to this central repository

### Build Process
- **No build required** for static HTML/CSS/JS
- **TypeScript compilation**: `npm run build` compiles src/gogo-account.ts to assets/js/gogo-account.js
- **esbuild**: Used for TypeScript compilation

### Development Server
- **Command**: `npm run dev` or `npm start`
- **Script**: server.js (Express server)

---

## 5. Product Synchronization Architecture

### Central Hub Model
- **gogo-website** is the central website and synchronization repository
- **Individual product repos** are the source of truth for their products
- **Sync workflow** copies products from source repos to gogo-website

### Sync Workflow Details
- **Trigger**: Manual or scheduled (previously configured for 45 0 * * * UTC / 06:15 IST)
- **Method**: rsync --delete (removes files in target that don't exist in source)
- **Direction**: Source repo -> gogo-website
- **Important**: Never edit synced copies directly - edit the source repositories

### Protected Areas
- `/arrowout/` - Synced from Fletch_Game
- `/crystalquest/` - Synced from crystal-quest-web
- `/sarkari-sarthi/` - Synced from Sarkari-Sarthi

**Rule**: Never modify these directories directly in gogo-website. Edit their respective source repositories.

---

## 6. Individual Game Source-of-Truth Repositories

### Arrow Out
- **Repository**: parya5103/Fletch_Game
- **Branch**: main
- **Status**: ACTIVE
- **Sync Target**: /arrowout/
- **Game Type**: Puzzle game (arrow-path)
- **Features**: 1000+ levels, hints, daily challenges
- **PWA**: Yes, with service worker and manifest

### Crystal Quest
- **Repository**: parya5103/crystal-quest-web
- **Branch**: main
- **Status**: ACTIVE
- **Sync Target**: /crystalquest/
- **Game Type**: Match-3 game
- **Features**: 27 levels, 3 regions, story mode, daily challenge, offline PWA
- **PWA**: Yes, with service worker and manifest

### Sarkari Sarthi
- **Repository**: parya5103/Sarkari-Sarthi
- **Branch**: gh-pages
- **Status**: ACTIVE (separate project)
- **Sync Target**: /sarkari-sarthi/
- **Product Type**: Government job notification tracker
- **Note**: Do NOT modify as part of GoGo website tasks

---

## 7. GoGo Account Architecture

### Overview
- **Purpose**: Unified player identity across all GoGo products
- **Features**: Sign in, sign up, Google sign-in, password reset, email verification, cloud save
- **Data Storage**: Cloud Firestore
- **Authentication**: Firebase Authentication

### Account Features
1. **Email/Password Authentication**
   - Registration with email and password
   - Sign in/out
   - Password reset
   - Email verification

2. **Google Sign-In**
   - One-click sign-in with Google
   - **Important**: Does NOT automatically subscribe to marketing
   - Marketing consent remains optional and unchecked by default

3. **Cloud Save**
   - Backup and restore game progress
   - Conflict detection and smart merging
   - Never silently overwrites newer local or cloud progress
   - Works with Arrow Out and Crystal Quest

4. **Profile Management**
   - View profile information
   - Update email and password
   - Delete account (permanent, removes all data)

### Cloud Save Conflict Handling
- **upload_local**: When cloud is empty and local has progress
- **restore_cloud**: When local is fresh default and cloud has progress
- **conflict**: When local and cloud saves diverge
- **Resolution**: Smart merge without data loss (stars, coins, levels preserved)

### Guest Play
- **Preserved**: Guest play is always available
- **Local Storage**: Existing localStorage save formats are preserved
- **Optional**: Cloud save is optional, not required for gameplay

---

## 8. Firebase Auth Implementation

### Authentication Providers
1. **Email/Password** - Standard email and password authentication
2. **Google Sign-In** - OAuth with Google

### Auth Flow
1. User signs up with email/password or Google
2. User is created in Firebase Authentication
3. User profile is created in Firestore (`users/{uid}`)
4. Marketing consent is explicitly opt-in (unchecked by default)
5. Email verification is sent (optional but recommended)

### Account Linking
- **Not implemented**: Multiple auth providers for same account
- **Current**: Each auth method creates separate account
- **Future**: Consider linking if needed

### Session Management
- **Persistence**: Browser session persistence
- **Token refresh**: Automatic token refresh
- **Sign out**: Clears session and tokens

---

## 9. Firestore Collections and Document Structure

### Collections

#### users/{uid}
- **Purpose**: User profile and preferences
- **Documents**: One per user
- **Fields**:
  - `uid` (string): User ID from Firebase Auth
  - `email` (string): User's email address
  - `displayName` (string, optional): Display name
  - `photoURL` (string, optional): Profile photo URL
  - `emailVerified` (boolean): Email verification status
  - `createdAt` (timestamp): Account creation time
  - `lastLoginAt` (timestamp): Last login time
  - `marketingConsent` (boolean): Explicit marketing consent (default: false)
  - `marketingConsentGivenAt` (timestamp, optional): When consent was given
  - `isAdmin` (boolean): Admin status (default: false)

#### marketingSubscribers/{uid}
- **Purpose**: Marketing email subscribers (explicit opt-in only)
- **Documents**: One per subscriber
- **Fields**:
  - `uid` (string): User ID
  - `email` (string): Email address
  - `subscribedAt` (timestamp): Subscription time
  - `unsubscribedAt` (timestamp, optional): Unsubscription time
  - `source` (string): How they subscribed (e.g., "registration", "account-settings")
  - `isActive` (boolean): Current subscription status

#### gameProfiles/{uid}/games/{gameId}
- **Purpose**: Game-specific profiles and saves
- **Documents**: One per game per user
- **Fields**:
  - `gameId` (string): Game identifier (e.g., "arrowout", "crystalquest")
  - `userId` (string): User ID
  - `data` (object): Game-specific save data
  - `updatedAt` (timestamp): Last update time
  - `createdAt` (timestamp): Creation time

### Security Rules
- **Default**: Deny all access
- **Read/Write**: Only allowed for authenticated users with matching UID
- **Admin**: Only allowed for verified admins
- **Marketing**: Only users with explicit consent can be in marketingSubscribers

---

## 10. Cloud Save Architecture and Conflict Handling

### Save Data Structure
- **Arrow Out**: Levels completed, stars earned, coins collected, hints used
- **Crystal Quest**: Levels completed, stars earned, region progress
- **Format**: Versioned JSON with validation

### Validation
- **Before upload**: Validate and sanitize save data
- **Before restore**: Validate save data matches expected format
- **Reject**: Invalid or corrupted save payloads

### Conflict Scenarios
1. **Cloud empty, local has progress**: Upload local to cloud
2. **Local fresh, cloud has progress**: Restore cloud to local
3. **Both have progress, different**: Smart merge
   - Preserve all progress (levels, stars, coins)
   - Take maximum values where applicable
   - Never lose data

### Offline Support
- **Local first**: Play offline with local saves
- **Sync when online**: Upload/download when connection restored
- **Conflict handling**: Smart merge when both changed offline

---

## 11. Marketing Consent and Unsubscribe Workflow

### Consent Model
- **Opt-in only**: Marketing consent is explicitly optional
- **Unchecked by default**: Checkbox is never pre-checked
- **Google Sign-In**: NEVER automatically subscribes users
- **Explicit action required**: User must actively check the box

### Consent Flow
1. User registers or signs in
2. Marketing consent checkbox is displayed (unchecked)
3. User optionally checks the box
4. Consent is stored in Firestore (`users/{uid}.marketingConsent`)
5. If consent given, user is added to `marketingSubscribers/{uid}`

### Unsubscribe Flow
1. User visits /unsubscribe/
2. User signs in (if not already)
3. User sees their current subscription status
4. User can unsubscribe immediately
5. `marketingSubscribers/{uid}.isActive` is set to false
6. `unsubscribedAt` timestamp is recorded
7. **Important**: Account and cloud saves remain intact

### CSV Export
- **Eligibility**: Only verified, subscribed, consented users
- **Excluded**: Unverified, unsubscribed, non-consented users
- **Format**: Clean CSV, formula injection protected
- **Access**: Admin-only, verified admins only

---

## 12. Admin Dashboard and CSV Export

### Dashboard Features
- **User Directory**: List all registered users
- **Subscriber Directory**: List all marketing subscribers
- **KPIs**: Total users, active subscribers, verified users
- **Search**: Search users by email, name, UID
- **Filters**: Filter by subscription status, verification status
- **Pagination**: Cursor-based pagination (orderBy + startAfter + limit)
- **CSV Export**: Export subscriber list with protection

### Pagination
- **Method**: Cursor-based (not offset-based)
- **Implementation**: orderBy + startAfter + limit
- **Benefits**: Efficient for large datasets, consistent results
- **Batch size**: Configurable (default: 50 per batch)

### CSV Export Protection
- **Formula injection**: Protected by proper escaping
- **Data validation**: Only exports eligible users
- **Format**: Clean, parseable CSV
- **KPI matching**: CSV counts match dashboard KPIs

### Admin Authorization
- **Requirement**: Verified admin (email verified + isAdmin = true)
- **Firestore Rules**: Enforce admin-only access
- **Verification**: Must be verified before accessing admin features

---

## 13. Firestore Security Model

### Security Rules Principles
1. **Default-deny**: All access is denied by default
2. **UID ownership**: Users can only access their own data
3. **Admin verification**: Admin access requires email verification
4. **Explicit consent**: Marketing requires explicit opt-in

### Rule Structure
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Default deny
    match /{document=**} {
      allow read, write: if false;
    }
    
    // User data - only owner can access
    match /users/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
    
    // Marketing subscribers - only owner or admin
    match /marketingSubscribers/{uid} {
      allow read: if request.auth != null && (request.auth.uid == uid || isAdmin());
      allow write: if false; // Only through cloud functions
    }
    
    // Game profiles - only owner
    match /gameProfiles/{uid}/games/{gameId} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
  }
}
```

### Admin Check Function
```javascript
function isAdmin() {
  return request.auth != null && 
         request.auth.token.email_verified == true &&
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
}
```

### Deployment Status
- **Source code**: Verified in repository (firestore.rules)
- **Deployment verification**: UNVERIFIED (requires Firebase Console access)
- **Test status**: Unit tests pass (firestore.rules.test.ts)

---

## 14. PWA, Service Workers and Caching

### PWA Status
- **Main website**: No service worker (static site, fast loading)
- **Arrow Out**: Has service worker and manifest (PWA enabled)
- **Crystal Quest**: Has service worker and manifest (PWA enabled)
- **Sarkari Sarthi**: Has service worker (PWA enabled)

### Caching Strategy
- **Static assets**: Browser caching via HTTP headers
- **Service workers**: Individual games manage their own caching
- **Update mechanism**: New deployments can update without manual cache clearing

### Offline Support
- **Games**: Offline play supported with localStorage
- **Cloud sync**: Sync when connection restored
- **Main site**: Works offline (static HTML)

---

## 15. Privacy and Data-Handling Decisions

### Data Collection
- **Minimal**: Only collect what's necessary
- **No tracking**: No analytics or tracking implemented
- **Explicit consent**: Marketing consent is opt-in only
- **User control**: Users can delete their data at any time

### Data Storage
- **Location**: Firebase Firestore (Cloud Firestore)
- **Encryption**: Data encrypted at rest and in transit
- **Access**: Strictly controlled by Firestore Security Rules
- **Retention**: User data retained until account deletion

### Data Deletion
- **Account deletion**: Permanent, removes all user data
- **Scope**: users/{uid}, marketingSubscribers/{uid}, gameProfiles/{uid}/games/*
- **Irreversible**: Once deleted, data cannot be recovered

### Email Handling
- **Marketing emails**: Only sent to explicit opt-in subscribers
- **No spam**: No bulk emails without authorization
- **Unsubscribe**: Immediate, never affects account or saves

---

## 16. Test Infrastructure and Test Commands

### Test Suite Overview
- **Framework**: Vitest + custom test scripts
- **Total tests**: 19 test suites
- **Coverage**: GoGo Account, Cloud Save, Marketing, Admin, Security Rules

### Test Commands
```bash
# Run all tests
npm test

# Lint Firestore rules
npm run lint:rules

# Build account bundle
npm run build

# Start development server
npm run dev
npm start
```

### Test Results (2025-11-05)
- **All 19 test suites**: PASSED
- **Lint checks**: 0 errors/warnings
- **Status**: All tests passing after recent improvements

### Test Categories
1. **GoGo Account & Cloud Save Unit & Conflict Tests** (7 tests)
   - Validates and sanitizes Arrow Out v2 save data
   - Rejects invalid or corrupted save payloads
   - Validates and sanitizes Crystal Quest v2 save data
   - Detects upload_local, restore_cloud, and conflict scenarios
   - Smart merges without losing stars, coins, or levels

2. **GoGo Customer Email Database, Verification & Consent Tests** (8 tests)
   - User registers WITHOUT marketing consent (unchecked by default)
   - User registers WITH explicit marketing consent
   - Google Sign-In NEVER automatically subscribes user
   - User unsubscribes immediately while preserving consent audit record
   - Unverified, unsubscribed, and non-consented users EXCLUDED from Marketing CSV
   - Unauthorized or unverified admins cannot access Admin Dashboard or export
   - CSV downloads format cleanly, block formula injection, match Dashboard KPI counts
   - Admin directory pagination & Firestore cursor-based pagination state transitions

3. **Firestore Security Rules & Cursor Pagination Audit** (3 tests)
   - ESLint @firebase/eslint-plugin-security-rules passes with 0 errors/warnings
   - Firestore rules enforce default-deny, UID ownership, verified admin-only listing, email consistency
   - src/gogo-account.ts uses Firestore cursor-based pagination (orderBy + startAfter + limit) and zero unbounded getDocs(collection(...))

4. **Cross-Application Asset, Bundle & Legal Consistency Verification** (1 test)
   - Shared GoGo Account bundle, Unsubscribe, Admin, Legal pages & Game bundles are consistent

---

## 17. Existing Implementation Status

### IMPLEMENTED Features

#### Core Website
- [x] Static HTML/CSS/JS website
- [x] Mobile-first responsive design
- [x] Custom domain (gogocompany.in)
- [x] GitHub Pages hosting
- [x] All informational pages (About, Contact, Legal)
- [x] Custom 404 page

#### SEO
- [x] Unique titles and descriptions for all pages
- [x] Canonical URLs (absolute paths)
- [x] Open Graph meta tags (og:title, og:description, og:url, og:image)
- [x] Twitter card meta tags (twitter:card, twitter:title, twitter:description, twitter:image)
- [x] Organization JSON-LD schema
- [x] WebSite JSON-LD schema
- [x] BreadcrumbList JSON-LD schema (all pages)
- [x] Sitemap.xml
- [x] Robots.txt
- [x] ads.txt (AdSense)

#### Accessibility
- [x] Skip-to-content link (all pages)
- [x] ARIA labels on interactive elements
- [x] Focus states for all interactive elements
- [x] Semantic HTML (h1-h6 hierarchy)
- [x] Role attributes (navigation, contentinfo, menubar, list, listitem)
- [x] Loading states for async pages
- [x] Error states with clear messages
- [x] Back-to-top button (all pages)

#### GoGo Account
- [x] Email/password authentication
- [x] Google Sign-In
- [x] Password reset
- [x] Email verification
- [x] Cloud save (Arrow Out, Crystal Quest)
- [x] Conflict detection and smart merging
- [x] Profile management
- [x] Account deletion

#### Marketing
- [x] Explicit opt-in consent (unchecked by default)
- [x] Google Sign-In never auto-subscribes
- [x] Unsubscribe center
- [x] CSV export (admin-only)
- [x] Formula injection protection

#### Admin Dashboard
- [x] User directory
- [x] Subscriber directory
- [x] KPIs
- [x] Search and filters
- [x] Cursor-based pagination
- [x] CSV export

#### Firebase
- [x] Authentication (Email/Password, Google)
- [x] Firestore database
- [x] Security rules
- [x] Unit tests for security rules

#### Sync Workflow
- [x] rsync-based synchronization
- [x] Product sync from source repositories
- [x] GitHub Actions workflow

### PARTIALLY IMPLEMENTED Features
- [ ] PWA for main website (games have PWA, main site does not)
- [ ] Analytics integration (not implemented, privacy-first)

### PLANNED Features
- [ ] Blog/News section
- [ ] Testimonials
- [ ] Game screenshots gallery
- [ ] Video previews
- [ ] Social media links
- [ ] Newsletter signup (beyond current marketing consent)

### UNVERIFIED Features
- [ ] Firestore rules deployment (requires Firebase Console access)
- [ ] Admin dashboard runtime (requires production Firebase)
- [ ] Auth flows (requires Firebase setup)
- [ ] Cloud save (requires Firebase setup)
- [ ] Mobile viewport at 360px, 390px (requires device testing)
- [ ] Desktop layout (requires visual testing)
- [ ] Color contrast verification (requires manual review)

---

## 18. Known Limitations and Unresolved Issues

### Current Limitations
1. **No Analytics**: No tracking or analytics implemented (privacy-first decision)
2. **No PWA for main site**: Only games have service workers and manifests
3. **No newsletter system**: Marketing is opt-in but no automated newsletter sending
4. **Firebase dependency**: Cloud save and auth require Firebase setup

### Unresolved Issues
1. **Firestore rules deployment**: Cannot verify without Firebase Console access
2. **Admin dashboard testing**: Requires production Firebase to test
3. **Auth flow testing**: Requires Firebase setup to test
4. **Cloud save testing**: Requires Firebase setup to test
5. **Mobile testing**: Requires physical devices at 360px, 390px viewports
6. **Desktop testing**: Requires visual verification
7. **Color contrast**: Needs manual verification for WCAG AA compliance

### Technical Debt
1. **package-lock.json**: Large file (5363 lines) from npm install
2. **Minification**: CSS/JS not minified (not critical for static site)
3. **Button consistency**: Only btn-primary and btn-ghost used (good)

---

## 19. Pending Tasks and Priorities

### P0 - Security and Correctness (Critical)
- [x] Brand language cleanup (COMPLETED 2025-11-05)
- [x] SEO improvements (COMPLETED 2025-11-05)
- [x] Accessibility improvements (COMPLETED 2025-11-05)
- [ ] Verify Firestore rules deployment (UNVERIFIED)
- [ ] Test cross-user access denial (UNVERIFIED)
- [ ] Test verified admin authorization (UNVERIFIED)
- [ ] Test marketing consent and unsubscribe correctness (UNVERIFIED)
- [ ] Verify cloud save does not destroy local progress (UNVERIFIED)
- [ ] Confirm original game repository integration (UNVERIFIED)

### P1 - Reliability (Important)
- [x] Run full test suite (COMPLETED 2025-11-05 - ALL 19 PASSED)
- [x] Twitter cards added to all pages (COMPLETED 2025-11-05)
- [x] Skip-to-content link added (COMPLETED 2025-11-05)
- [x] ARIA labels added (COMPLETED 2025-11-05)
- [x] Error states and loading skeletons added (COMPLETED 2025-11-05)
- [x] Canonical URLs standardized (COMPLETED 2025-11-05)
- [x] Viewport meta on all pages (COMPLETED 2025-11-05)
- [ ] Verify pagination, filters and CSV exports (UNVERIFIED)
- [ ] Test registration, login, Google sign-in, password reset, logout (UNVERIFIED)
- [ ] Test Android Chrome and PWA behavior (UNVERIFIED)
- [ ] Verify service worker update behavior (UNVERIFIED)
- [ ] Verify scheduled product synchronization (UNVERIFIED)
- [ ] Color contrast verification (UNVERIFIED)
- [ ] Focus styles for all interactive elements (COMPLETED 2025-11-05)
- [ ] Mobile viewport checks at 360px, 390px (UNVERIFIED)
- [ ] Desktop layout checks (UNVERIFIED)

### P2 - Improvements (Polish)
- [x] Heading hierarchy standardized (COMPLETED 2025-11-05)
- [x] Breadcrumbs schema added (COMPLETED 2025-11-05)
- [x] OG image specificity improved (COMPLETED 2025-11-05)
- [x] Button consistency verified (COMPLETED 2025-11-05)
- [x] Back-to-top button added (COMPLETED 2025-11-05)
- [ ] CSS/JS minification (SKIPPED - not critical)
- [ ] Mobile menu testing (UNVERIFIED)
- [ ] Desktop navigation hover states (UNVERIFIED)

### P3 - Future Enhancements
- [ ] Blog/News section
- [ ] Testimonials
- [ ] Game screenshots
- [ ] Video previews
- [ ] Social media links
- [ ] Newsletter signup
- [ ] Analytics integration

---

## 20. Safe Workflow for Future AI Agents

### Step 1: Read Documentation
1. Read AGENTS.md for operational instructions
2. Read KNOWLEDGE.md for project knowledge
3. Understand the repository structure
4. Review recent commits and Git history

### Step 2: Inspect Current State
1. Check out the main branch
2. Run `npm install` to install dependencies
3. Run `npm test` to verify all tests pass
4. Run `npm run lint:rules` to verify linting passes
5. Review all files before making changes

### Step 3: Create Feature Branch
1. Create a new branch: `git checkout -b feat/your-feature-name`
2. Never work directly on main
3. Use descriptive branch names

### Step 4: Make Changes
1. Make minimal, targeted changes
2. Follow existing patterns and conventions
3. Preserve backward compatibility
4. Add accessibility features (ARIA, focus states)
5. Maintain SEO and performance standards

### Step 5: Test Changes
1. Run `npm test` after changes
2. Run `npm run lint:rules` after changes
3. Test manually in browser
4. Verify mobile-first design

### Step 6: Commit and Push
1. Commit with descriptive message
2. Push to remote: `git push -u origin feat/your-feature-name`
3. Create PR for review

### Step 7: Wait for Approval
1. Never merge without explicit user approval
2. Address any feedback or issues
3. Wait for user to merge the PR

### Step 8: Clean Up
1. Delete feature branch after merge (optional)
2. Update documentation if needed
3. Verify changes in production

---

## Change History

| Date | Change | Author |
|------|--------|--------|
| 2025-01-17 | Initial KNOWLEDGE.md created | AI Agent |
| 2025-11-05 | Updated with recent improvements: brand language cleanup, SEO, accessibility, UX | AI Agent |

---

## Quick Reference

- **Production**: https://gogocompany.in/
- **Repository**: https://github.com/parya5103/gogo-website
- **Main Branch**: main
- **Latest Commit**: 23b97e9287c47a68747c3f394744d63c5ef8088b
- **Test Command**: `npm test` (19 test suites)
- **Lint Command**: `npm run lint:rules` (0 errors)
- **Build Command**: `npm run build`
- **Status**: All tests passing, all improvements merged to main
