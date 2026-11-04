# GoGo Games — AI Coding Agent Operational Instructions

**Last Updated:** 2025-01-17  
**Audit Date:** 2025-01-17  
**Repository:** parya5103/gogo-website  
**Production:** https://gogocompany.in/  
**Branch:** docs/update-agent-knowledge

---

## 🎯 Project Identity

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

---

## 🛡️ Repository Safety Rules (MANDATORY)

### ❌ NEVER DO (Hard Boundaries)

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

### ✅ ALWAYS DO (Safety First)

1. **Use separate feature branches** and PRs for all significant changes
2. **Inspect existing architecture** before editing any code
3. **Preserve existing functionality** and backward compatibility
4. **Verify Firestore rules** against the actual Firebase project before claiming security
5. **Test cross-user access denial** before claiming security features work
6. **Run relevant tests** after making changes
7. **Report exact files changed** and test results in your response
8. **Preserve mobile-first design** and Android Chrome compatibility
9. **Maintain SEO, accessibility, PWA, and performance** standards

---

## 📁 Repository Structure

```
gogo-website/
├── index.html                    # Main homepage
├── account/                      # GoGo Account & Cloud Save UI
│   └── index.html
├── admin/                        # Protected Admin Dashboard
│   └── index.html
├── unsubscribe/                  # Marketing unsubscribe center
│   └── index.html
├── arrowout/                     # Synced Arrow Out game (from Fletch_Game)
├── crystalquest/                 # Synced Crystal Quest game
├── sarkari-sarthi/               # Synced Sarkari Sarthi portal
├── assets/
│   ├── css/                      # Shared stylesheets
│   │   ├── style.css
│   │   ├── gogo-account.css
│   │   └── ads.css
│   └── js/                       # Shared JavaScript
│       ├── main.js               # Header/footer injection
│       ├── gogo-account.js       # Compiled from src/gogo-account.ts
│       └── ads.js                # AdSense integration (currently OFF)
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
├── firestore.rules.test.ts       # Security rules unit tests
├── security_spec.md              # Security specification
├── DEPLOYMENT.md                 # Deployment guide
├── README.md                     # Project README
├── package.json
├── .nojekyll
├── CNAME
└── ads.txt
```

---

## 🔧 Coding Rules

### Before Editing
1. Read `README.md`, `DEPLOYMENT.md`, and `security_spec.md`
2. Inspect the target file and related files
3. Check `git status` and recent commits
4. Understand the existing patterns and conventions

### During Editing
1. **Make minimal, targeted changes** - solve one problem at a time
2. **Preserve existing functionality** - don't break what works
3. **Follow existing code style** - match indentation, naming, patterns
4. **No unnecessary dependencies** - avoid adding frameworks or paid services
5. **Mobile-first** - ensure Android Chrome compatibility
6. **PWA-aware** - respect service worker and caching patterns

### After Editing
1. Run `npm test` to execute the full test suite
2. Run `npm run lint:rules` to check Firestore rules
3. Verify the change doesn't break existing functionality
4. Report exact files changed and test results

---

## 🔥 Firebase Safety Rules

### Configuration Status
- **Firebase Project ID:** `gen-lang-client-0566323659`
- **Firestore Database ID:** `ai-studio-gogowebsite-4126d566-149d-4901-8c83-59ba041323ca`
- **Client API Key:** Public (in `firebase-applet-config.json`) - **NOT a secret**

### Security Model
- **Real security depends on:** Firebase Authentication + Firestore Security Rules
- **Firebase client config is public** - this is normal and expected
- **Never expose:** User records, subscriber data, admin privileges

### Marketing Consent Rules
- **Google Sign-In users:** NEVER auto-subscribed to marketing
- **Marketing consent:** Must be **optional** and **unchecked by default**
- **Subscribed field:** Only `true` with explicit consent and valid timestamp
- **Google authProvider:** Cannot have `subscribed: true` on creation

### Firestore Rules Verification
Before claiming rules are correct or deployed:
1. Verify rules file matches `firestore.rules`
2. Run `npm run lint:rules`
3. Run `npm test` (includes rules unit tests)
4. **Verify actual deployment** to Firebase project
5. Test cross-user access denial in production

### Admin Authorization
- **Verified email required:** `email_verified == true` in auth token
- **Authorized emails:** `aaryapratik@gmail.com`, `officialgogocompany@gmail.com`
- **OR:** Document exists in `/admins/{uid}`
- **Fail closed:** Unverified admins are **strictly rejected**

---

## 🎮 Game Integration Rules

### Arrow Out
- **Source:** `parya5103/Fletch_Game` (branch: `main`)
- **Synced to:** `/arrowout/` in this repository
- **Game ID:** `arrowout`
- **Integration:** Must preserve guest play and existing localStorage save formats

### Crystal Quest
- **Source:** `parya5103/crystal-quest-web` (branch: `main`)
- **Synced to:** `/crystalquest/` in this repository
- **Game ID:** `crystalquest`
- **Integration:** Must preserve guest play and existing localStorage save formats

### Cloud Save Rules
- **NEVER silently destroy or overwrite** valid local progress
- **Conflict resolution:** Side-by-side Local vs. Cloud vs. Smart Merge
- **Validation:** Bounded values, valid timestamps, schema versions
- **Access:** Owner-only (`/gameProfiles/{uid}/games/{gameId}`)

### Integration Workflow
1. Modify original game repository
2. Test in original repository
3. Push to original repository's `main` branch
4. Wait for sync workflow to copy changes (daily 06:15 IST or manual trigger)
5. **NEVER edit synced copies directly**

---

## 📊 Product Synchronization

### Sync Workflow
- **File:** `.github/workflows/sync-products.yml`
- **Schedule:** `45 0 * * *` UTC = **06:15 IST daily**
- **Method:** `rsync -a --delete --delete-excluded`
- **Exclusions:** `.git`, `.github`, build tooling, dev folders, lockfiles

### Sync Process
1. Checkout central site (`parya5103/gogo-website`)
2. Checkout Arrow Out source (`parya5103/Fletch_Game` @ `main`)
3. Checkout Crystal Quest source (`parya5103/crystal-quest-web` @ `main`)
4. Checkout Sarkari Sarthi published (`parya5103/Sarkari-Sarthi` @ `gh-pages`)
5. Rsync each into `/arrowout/`, `/crystalquest/`, `/sarkari-sarthi/`
6. Verify key files exist
7. Commit if changed, push to `main` (triggers GitHub Pages redeploy)

### Manual Trigger
- GitHub Actions tab -> "Sync product apps" -> "Run workflow"

---

## 🧪 Testing

### Test Commands
```bash
npm test                # Full test suite (rules + upstream tests)
npm run lint:rules     # Lint Firestore rules
npm run build          # Build TypeScript bundles
```

### Test Files
- `firestore.rules.test.ts` - Security rules unit tests (Vitest)
- `scripts/run-all-tests.mjs` - Full test runner

### Test Coverage
- Authentication and authorization
- User profile CRUD
- Marketing subscriber consent validation
- Game save validation
- Admin access control

---

## 📋 Workflow for AI Agents

### 1. Understanding the Task
- Read the user's request carefully
- Identify which repository is the target
- Check if it's a GoGo website task or a game repository task

### 2. Before Making Changes
- Check `git status` and current branch
- Read existing documentation (`README.md`, `DEPLOYMENT.md`, `security_spec.md`)
- Inspect the files you'll modify
- Understand the existing architecture

### 3. Making Changes
- Create a feature branch: `git checkout -b feat/description`
- Make minimal, targeted changes
- Preserve existing functionality
- Follow existing patterns

### 4. After Making Changes
- Run relevant tests
- Verify no existing functionality is broken
- Check `git diff` to see exactly what changed
- Commit with descriptive message
- Push to remote
- Open a PR (if applicable)
- Report exact files changed and test results

### 5. Special Cases

**If asked to modify Arrow Out or Crystal Quest:**
- Work in the original repository (`parya5103/Fletch_Game` or `parya5103/crystal-quest-web`)
- Test there first
- The sync workflow will copy changes to the central repository

**If asked to modify Sarkari Sarthi:**
- **REFUSE** - this is a separate project outside GoGo website scope

**If asked to modify Firebase configuration:**
- **REFUSE** without explicit authorization
- Client config is public, but rules and settings require verification

**If asked to deploy to production:**
- **REFUSE** - deployment is automatic via GitHub Pages
- Only sync workflow commits trigger redeployment

---

## 📞 Reporting

### Required in Every Response
1. **Files changed** - exact list of modified files
2. **Test results** - which tests passed/failed
3. **Verification** - what was verified and how
4. **Limitations** - what remains unverified or incomplete

### Example Report
```
Files Changed:
- src/gogo-account.ts (added validation for X)

Tests Run:
- npm test: PASSED (all 216 tests)
- npm run lint:rules: PASSED

Verification:
- Cross-user access denial tested in rules tests
- Admin authorization verified for verified emails

Limitations:
- Production Firestore rules deployment not verified
- Actual admin dashboard runtime not tested
```

---

## 🔗 Quick Reference

| Item | Location | Status |
|------|----------|--------|
| GoGo Account Source | `src/gogo-account.ts` | **IMPLEMENTED** |
| Compiled Bundle | `assets/js/gogo-account.js` | **GENERATED** |
| Firebase Config | `firebase-applet-config.json` | **PUBLIC** |
| Firestore Rules | `firestore.rules` | **IMPLEMENTED** |
| Security Tests | `firestore.rules.test.ts` | **IMPLEMENTED** |
| Sync Workflow | `.github/workflows/sync-products.yml` | **ACTIVE** |
| Admin Dashboard | `admin/index.html` | **IMPLEMENTED** |
| Account Page | `account/index.html` | **IMPLEMENTED** |
| Unsubscribe | `unsubscribe/index.html` | **IMPLEMENTED** |

---

## 📝 Change History

| Date | Change | Author |
|------|--------|--------|
| 2025-01-17 | Initial AGENTS.md created | AI Agent (Mistral) |
| 2025-01-17 | Comprehensive audit completed | AI Agent (Mistral) |

---

**Remember:** When in doubt, **ask for clarification** rather than making assumptions. Safety first, always.
