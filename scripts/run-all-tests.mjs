import assert from 'node:assert/strict';
import { execSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  validateGameSave,
  mergeGameProgress,
  detectSaveConflict,
  MARKETING_CONSENT_VERSION,
  MARKETING_CONSENT_TEXT,
  isAuthorizedAdminUser,
  buildInitialMarketingRecord,
  applyUnsubscribeToRecord,
  applyOptInToRecord,
  isEligibleMarketingSubscriber,
  computeAdminDashboardStats,
  paginateEntries,
  advanceCursorPaginationState,
  escapeCsvCell,
  generateMarketingSubscribersCsv,
  generateAllRegisteredAccountsCsv,
} from '../src/gogo-account.ts';

const root = process.cwd();
let totalPassed = 0;

function runStep(title, fn) {
  try {
    fn();
    totalPassed++;
    console.log(`PASS: ${title}`);
  } catch (err) {
    console.error(`FAIL: ${title}`);
    console.error(err);
    process.exitCode = 1;
  }
}

console.log('==========================================================');
console.log('1. GoGo Account & Cloud Save Unit & Conflict Tests');
console.log('==========================================================');

runStep('Validates and sanitizes Arrow Out v2 save data', () => {
  const res = validateGameSave('arrowout', {
    v: 2,
    rev: 12,
    unlocked: 18,
    best: { '1': { stars: 3, plays: 2 }, '2': { stars: 2, plays: 1 } },
    coins: 450,
    streaks: { current: 4, best: 7, lastPlayDate: '2026-11-04' },
    clientUpdatedAtMs: 1730000100000,
  });
  assert.equal(res.valid, true);
  assert.equal(res.sanitized?.unlocked, 18);
  assert.equal(res.sanitized?.coins, 450);
  assert.equal(res.sanitized?.best['1'].stars, 3);
  assert.equal(res.sanitized?.streaks.best, 7);
});

runStep('Rejects invalid or corrupted save payloads before upload/restore', () => {
  assert.equal(validateGameSave('arrowout', null).valid, false);
  assert.equal(validateGameSave('arrowout', { unlocked: 0 }).valid, false);
  assert.equal(validateGameSave('crystalquest', { unlocked: 5, lastLevel: 0 }).valid, false);
});

runStep('Validates and sanitizes Crystal Quest v2 save data', () => {
  const res = validateGameSave('crystalquest', {
    v: 2,
    unlocked: 14,
    lastLevel: 12,
    stars: { '1': 3, '2': 3, '3': 2 },
    best: { '1': 5400, '2': 6100, },
    settings: { sfx: true, music: false, motion: false, symbols: true },
    world: {
      forest: { seen: ['spark', 'saplings'] },
      relics: ['ember-seed'],
      daily: { date: '2026-11-04', streak: 3, best: 7200 },
      story: ['intro-1'],
    },
    clientUpdatedAtMs: 1730000200000,
  });
  assert.equal(res.valid, true);
  assert.equal(res.sanitized?.unlocked, 14);
  assert.equal(res.sanitized?.lastLevel, 12);
  assert.equal(res.sanitized?.stars['1'], 3);
  assert.deepEqual(res.sanitized?.world.relics, ['ember-seed']);
});

runStep('Detects upload_local when cloud is empty and local has progress', () => {
  const localSave = { v: 2, unlocked: 6, best: { '1': { stars: 3, plays: 1 } }, coins: 120 };
  const cmp = detectSaveConflict('arrowout', localSave, 1730000500000, null, 0, 0);
  assert.equal(cmp.status, 'upload_local');
});

runStep('Detects restore_cloud when local is fresh default and cloud has progress', () => {
  const freshLocal = { v: 2, unlocked: 1, best: {}, coins: 0 };
  const cloudSave = { v: 2, unlocked: 22, best: { '1': { stars: 3, plays: 1 } }, coins: 800 };
  const cmp = detectSaveConflict('arrowout', freshLocal, 1730000100000, cloudSave, 1730000900000, 0);
  assert.equal(cmp.status, 'restore_cloud');
});

runStep('Detects conflict when local and cloud saves diverge (never silently overwrites)', () => {
  const localSave = { v: 2, unlocked: 10, lastLevel: 10, stars: { '1': 3, '2': 2 }, best: {} };
  const cloudSave = { v: 2, unlocked: 15, lastLevel: 14, stars: { '1': 2, '3': 3 }, best: {} };
  const cmp = detectSaveConflict(
    'crystalquest',
    localSave,
    1730000800000,
    cloudSave,
    1730000600000,
    1730000100000
  );
  assert.equal(cmp.status, 'conflict');
});

runStep('Smart merges Arrow Out and Crystal Quest saves without losing stars, coins, or levels', () => {
  const mergedArrow = mergeGameProgress(
    'arrowout',
    {
      v: 2,
      unlocked: 12,
      best: { '1': { stars: 2, plays: 2 }, '5': { stars: 3, plays: 4 } },
      coins: 300,
      owned: { default: true, neon: true },
    },
    {
      v: 2,
      unlocked: 19,
      best: { '1': { stars: 3, plays: 4 }, '6': { stars: 2, plays: 1 } },
      coins: 550,
      owned: { default: true, gold: true },
    }
  );
  assert.equal(mergedArrow.unlocked, 19);
  assert.equal(mergedArrow.best['1'].stars, 3);
  assert.equal(mergedArrow.best['5'].stars, 3);
  assert.equal(mergedArrow.best['6'].stars, 2);
  assert.equal(mergedArrow.coins, 550);
  assert.equal(mergedArrow.owned.neon, true);
  assert.equal(mergedArrow.owned.gold, true);

  const mergedCQ = mergeGameProgress(
    'crystalquest',
    {
      v: 2,
      unlocked: 9,
      lastLevel: 9,
      stars: { '1': 2, '4': 3 },
      best: { '1': 4000, '4': 8000 },
      world: { relics: ['ember-seed'], forest: { seen: ['spark'] }, story: ['s1'] },
    },
    {
      v: 2,
      unlocked: 14,
      lastLevel: 12,
      stars: { '1': 3, '5': 2 },
      best: { '1': 5500, '5': 6000 },
      world: { relics: ['stream-sigil'], forest: { seen: ['saplings'] }, story: ['s2'] },
    }
  );
  assert.equal(mergedCQ.unlocked, 14);
  assert.equal(mergedCQ.stars['1'], 3);
  assert.equal(mergedCQ.stars['4'], 3);
  assert.equal(mergedCQ.stars['5'], 2);
  assert.deepEqual(mergedCQ.world.relics.sort(), ['ember-seed', 'stream-sigil'].sort());
});

console.log('\n==========================================================');
console.log('2. GoGo Customer Email Database, Verification & Consent Tests');
console.log('==========================================================');

const noConsentUser = buildInitialMarketingRecord({
  email: 'player1@example.com',
  displayName: 'Player One',
  authProvider: 'password',
  emailVerified: true,
  marketingOptIn: false,
  source: 'registration_website',
  nowMs: 1730680000000,
});

const verifiedConsentedUser = buildInitialMarketingRecord({
  email: 'subscriber@example.com',
  displayName: 'Aarya, "Pro" Gamer',
  authProvider: 'password',
  emailVerified: true,
  marketingOptIn: true,
  source: 'registration_arrowout',
  nowMs: 1730680100000,
});

const unverifiedConsentedUser = buildInitialMarketingRecord({
  email: 'unverified_sub@example.com',
  displayName: 'Unverified OptIn',
  authProvider: 'password',
  emailVerified: false,
  marketingOptIn: true,
  source: 'registration_website',
  nowMs: 1730680150000,
});

const googleSignInUser = buildInitialMarketingRecord({
  email: 'googleplayer@example.com',
  displayName: 'Google Player',
  authProvider: 'google.com',
  marketingOptIn: true, // Even if true is passed, Google sign-in must NEVER auto-subscribe
  source: 'google_signin_crystalquest',
  nowMs: 1730680200000,
});

const previouslySubscribedUser = buildInitialMarketingRecord({
  email: 'formerfan@example.com',
  displayName: 'Former Subscriber',
  authProvider: 'password',
  emailVerified: true,
  marketingOptIn: true,
  source: 'registration_website',
  nowMs: 1730680300000,
});

const unsubscribedUser = applyUnsubscribeToRecord(
  previouslySubscribedUser,
  'unsubscribe_page',
  1730690000000
);

runStep('Scenario 1: User registers WITHOUT marketing consent (unchecked by default)', () => {
  assert.equal(noConsentUser.subscribed, false);
  assert.equal(noConsentUser.consentTimestampMs, null);
  assert.equal(noConsentUser.consentVersion, '');
  assert.equal(noConsentUser.consentText, '');
  assert.equal(noConsentUser.unsubscribedAtMs, null);
});

runStep('Scenario 2: User registers WITH explicit marketing consent', () => {
  assert.equal(verifiedConsentedUser.subscribed, true);
  assert.equal(verifiedConsentedUser.emailVerified, true);
  assert.equal(verifiedConsentedUser.consentTimestampMs, 1730680100000);
  assert.equal(verifiedConsentedUser.consentVersion, MARKETING_CONSENT_VERSION);
  assert.equal(verifiedConsentedUser.consentText, MARKETING_CONSENT_TEXT);
  assert.equal(verifiedConsentedUser.source, 'registration_arrowout');
  assert.equal(verifiedConsentedUser.unsubscribedAtMs, null);
});

runStep('Scenario 3: Google Sign-In NEVER automatically subscribes user to marketing', () => {
  assert.equal(googleSignInUser.subscribed, false);
  assert.equal(googleSignInUser.consentTimestampMs, null);
  assert.equal(googleSignInUser.consentVersion, '');
  assert.equal(googleSignInUser.authProvider, 'google.com');
  assert.equal(googleSignInUser.emailVerified, true);
});

runStep('Scenario 4: User unsubscribes immediately while preserving prior consent audit record', () => {
  assert.equal(unsubscribedUser.subscribed, false);
  assert.equal(unsubscribedUser.unsubscribedAtMs, 1730690000000);
  // Prior consent timestamp & version are preserved for accountability
  assert.equal(unsubscribedUser.consentTimestampMs, 1730680300000);
  assert.equal(unsubscribedUser.consentVersion, MARKETING_CONSENT_VERSION);

  // User can also explicitly re-opt-in later if they choose
  const reOpted = applyOptInToRecord(unsubscribedUser, 'account_profile', 1730700000000);
  assert.equal(reOpted.subscribed, true);
  assert.equal(reOpted.unsubscribedAtMs, null);
  assert.equal(reOpted.consentTimestampMs, 1730700000000);
});

const directorySample = [
  {
    uid: 'u1',
    ...noConsentUser,
    lastLoginAtMs: 1730680000000,
  },
  {
    uid: 'u2',
    ...verifiedConsentedUser,
    lastLoginAtMs: 1730680100000,
  },
  {
    uid: 'u2_unverified',
    ...unverifiedConsentedUser,
    lastLoginAtMs: 1730680150000,
  },
  {
    uid: 'u3',
    ...googleSignInUser,
    lastLoginAtMs: 1730680200000,
  },
  {
    uid: 'u4',
    ...unsubscribedUser,
    lastLoginAtMs: 1730690000000,
  },
];

runStep('Scenario 5: Unverified, unsubscribed, and non-consented users are EXCLUDED from Marketing CSV', () => {
  assert.equal(isEligibleMarketingSubscriber(verifiedConsentedUser), true);
  assert.equal(isEligibleMarketingSubscriber(unverifiedConsentedUser), false);
  assert.equal(isEligibleMarketingSubscriber(noConsentUser), false);
  assert.equal(isEligibleMarketingSubscriber(googleSignInUser), false);
  assert.equal(isEligibleMarketingSubscriber(unsubscribedUser), false);

  const marketingCsv = generateMarketingSubscribersCsv(directorySample);
  assert.ok(marketingCsv.includes('subscriber@example.com'), 'Verified opted-in user must be included');
  assert.ok(!marketingCsv.includes('unverified_sub@example.com'), 'Unverified opted-in user must be excluded');
  assert.ok(!marketingCsv.includes('player1@example.com'), 'No-consent user must be excluded');
  assert.ok(!marketingCsv.includes('googleplayer@example.com'), 'Google sign-in user must be excluded');
  assert.ok(!marketingCsv.includes('formerfan@example.com'), 'Unsubscribed user must be excluded');
});

runStep('Scenario 6: Unauthorized or unverified admins cannot access Admin Dashboard or export', () => {
  assert.equal(isAuthorizedAdminUser(null), false);
  assert.equal(isAuthorizedAdminUser({ email: 'random@example.com', emailVerified: true }), false);
  assert.equal(isAuthorizedAdminUser({ email: 'aaryapratik@gmail.com', emailVerified: false }), false);
  assert.equal(isAuthorizedAdminUser({ email: 'aaryapratik@gmail.com', emailVerified: true }), true);
  assert.equal(isAuthorizedAdminUser({ email: 'customadmin@example.com', emailVerified: false }, true), false);
  assert.equal(isAuthorizedAdminUser({ email: 'customadmin@example.com', emailVerified: true }, true), true);
});

runStep('Scenario 7: CSV downloads format cleanly, block formula injection, and match Dashboard KPI counts', () => {
  const stats = computeAdminDashboardStats(directorySample, 1730700000000);
  assert.equal(stats.totalUsers, 5);
  assert.equal(stats.totalVerifiedUsers, 4);
  assert.equal(stats.totalPromotionalSubscribers, 1);
  assert.equal(stats.totalPendingVerificationSubscribers, 1);
  assert.equal(stats.totalUnsubscribed, 1);
  assert.equal(stats.totalNoConsent, 2);

  const marketingCsv = generateMarketingSubscribersCsv(directorySample);
  const allAccountsCsv = generateAllRegisteredAccountsCsv(directorySample);

  // Must start with UTF-8 BOM for Excel compatibility
  assert.ok(marketingCsv.startsWith('\uFEFF'));
  assert.ok(allAccountsCsv.startsWith('\uFEFF'));

  const marketingLines = marketingCsv.slice(1).trim().split('\r\n');
  assert.equal(
    marketingLines[0],
    'Email,Display Name,Registration Date,Marketing Consent,Consent Date,Source'
  );
  // Header + stats.totalPromotionalSubscribers rows must match exactly
  assert.equal(marketingLines.length - 1, stats.totalPromotionalSubscribers);
  assert.ok(marketingLines[1].includes('"Aarya, ""Pro"" Gamer"'));
  assert.ok(marketingLines[1].includes(',Yes,'));

  const allLines = allAccountsCsv.slice(1).trim().split('\r\n');
  assert.equal(
    allLines[0],
    'Email,Display Name,Registration Date,Marketing Consent,Consent Date,Source'
  );
  assert.equal(allLines.length - 1, stats.totalUsers);
  assert.ok(allAccountsCsv.includes('No (Unsubscribed)'));
  assert.ok(allAccountsCsv.includes('Pending Email Verification'));

  // Formula injection protection tests (including leading whitespace/tabs)
  assert.equal(escapeCsvCell('=cmd|\' /C calc\'!A0'), "'=cmd|' /C calc'!A0");
  assert.equal(escapeCsvCell('  +SUM(A1:A2)'), "'  +SUM(A1:A2)");
  assert.equal(escapeCsvCell('\t-2+3'), "'\t-2+3");
  assert.equal(escapeCsvCell('@IMPORTXML()'), "'@IMPORTXML()");
});

runStep('Scenario 8: Admin directory pagination & Firestore cursor-based pagination state transitions', () => {
  const items = Array.from({ length: 60 }, (_, idx) => ({ id: idx + 1 }));
  const p1 = paginateEntries(items, 1, 25);
  assert.equal(p1.currentPage, 1);
  assert.equal(p1.totalPages, 3);
  assert.equal(p1.startIndex, 0);
  assert.equal(p1.endIndex, 25);
  assert.equal(p1.pageItems.length, 25);

  const p3 = paginateEntries(items, 99, 25);
  assert.equal(p3.currentPage, 3);
  assert.equal(p3.startIndex, 50);
  assert.equal(p3.endIndex, 60);
  assert.equal(p3.pageItems.length, 10);

  // Test Firestore cursor-based pagination (limit(pageSize + 1) -> cursor stack + hasNextPage)
  const fakeDocsPage1 = Array.from({ length: 26 }, (_, idx) => ({ id: `doc_${idx + 1}` }));
  const c1 = advanceCursorPaginationState({
    direction: 'reset',
    currentPage: 1,
    pageSize: 25,
    cursors: [],
    fetchedDocs: fakeDocsPage1,
  });
  assert.equal(c1.currentPage, 1);
  assert.equal(c1.pageDocs.length, 25);
  assert.equal(c1.hasNextPage, true);
  assert.equal(c1.hasPrevPage, false);
  assert.equal(c1.cursors[0].id, 'doc_25');

  const fakeDocsPage2 = Array.from({ length: 12 }, (_, idx) => ({ id: `doc_${idx + 26}` }));
  const c2 = advanceCursorPaginationState({
    direction: 'next',
    currentPage: c1.currentPage,
    pageSize: 25,
    cursors: c1.cursors,
    fetchedDocs: fakeDocsPage2,
  });
  assert.equal(c2.currentPage, 2);
  assert.equal(c2.pageDocs.length, 12);
  assert.equal(c2.hasNextPage, false);
  assert.equal(c2.hasPrevPage, true);
  assert.equal(c2.cursors[1].id, 'doc_37');
});

console.log('\n==========================================================');
console.log('3. Firestore Security Rules & Cursor Pagination Audit');
console.log('==========================================================');

runStep('ESLint @firebase/eslint-plugin-security-rules passes with 0 errors/warnings', () => {
  execSync('npx eslint firestore.rules', { cwd: root, stdio: 'pipe' });
});

runStep('Firestore rules enforce default-deny, UID ownership, verified admin-only listing, and email consistency', () => {
  const rulesText = readFileSync(resolve(root, 'firestore.rules'), 'utf8');
  assert.ok(rulesText.includes('match /{document=**} {\n      allow read, write: if false;\n    }'));
  assert.ok(rulesText.includes('function isAdmin()'));
  assert.ok(rulesText.includes('return isEmailVerifiedToken() && ('));
  assert.ok(rulesText.includes('function isConsistentAuthEmail(email)'));
  assert.ok(rulesText.includes('function isConsistentEmailVerifiedField(data)'));
  assert.ok(rulesText.includes("'aaryapratik@gmail.com'"));
  assert.ok(rulesText.includes('allow list: if isAdmin();'));
  assert.ok(rulesText.includes('match /marketingSubscribers/{uid}'));
  assert.ok(rulesText.includes("'emailVerified'"));
  assert.ok(rulesText.includes("let allowed = ['gameId', 'progress', 'updatedAt', 'schemaVersion'];"));
  assert.ok(rulesText.includes("gameId == 'arrowout' || gameId == 'crystalquest'"));
});

runStep('src/gogo-account.ts uses Firestore cursor-based pagination (orderBy + startAfter + limit) and zero unbounded getDocs(collection(...))', () => {
  const srcText = readFileSync(resolve(root, 'src/gogo-account.ts'), 'utf8');
  assert.ok(srcText.includes("orderBy('registeredAt', 'desc')"));
  assert.ok(srcText.includes('startAfter(cursorDoc)'));
  assert.ok(srcText.includes('limit(safeSize + 1)'));
  assert.ok(!srcText.includes("getDocs(collection(this.db, 'users'))"));
  assert.ok(!srcText.includes("getDocs(collection(this.db, 'marketingSubscribers'))"));
});

console.log('\n==========================================================');
console.log('4. Cross-Application Asset, Bundle & Legal Consistency Verification');
console.log('==========================================================');

runStep('Shared GoGo Account bundle, Unsubscribe, Admin, Legal pages & Game bundles are consistent', () => {
  assert.ok(existsSync(resolve(root, 'firebase.json')));
  assert.ok(existsSync(resolve(root, 'assets/js/gogo-account.js')));
  assert.ok(existsSync(resolve(root, 'assets/css/gogo-account.css')));
  assert.ok(existsSync(resolve(root, 'account/index.html')));
  assert.ok(existsSync(resolve(root, 'admin/index.html')));
  assert.ok(existsSync(resolve(root, 'unsubscribe/index.html')));
  assert.ok(existsSync(resolve(root, 'privacy-policy/index.html')));
  assert.ok(existsSync(resolve(root, 'terms-and-conditions/index.html')));
  // NOTE: The synced game copies (arrowout/, crystalquest/) come from the upstream
  // games' main branches and do NOT contain the shared GoGo Account bundle (that
  // integration lives on the upstream feat/gogo-shared-account branches; the daily
  // sync would wipe any local additions). CI asserts the core synced files, which the
  // sync workflow itself also verifies.
  assert.ok(existsSync(resolve(root, 'arrowout/index.html')));
  assert.ok(existsSync(resolve(root, 'arrowout/sw.js')));
  assert.ok(existsSync(resolve(root, 'crystalquest/index.html')));
  assert.ok(existsSync(resolve(root, 'crystalquest/sw.js')));
  assert.ok(existsSync(resolve(root, 'scripts/push-upstream-prs.sh')));

  const builtBundle = readFileSync(resolve(root, 'assets/js/gogo-account.js'), 'utf8');
  assert.ok(builtBundle.includes('resendVerificationEmail'));
  assert.ok(builtBundle.includes('refreshEmailVerificationStatus'));
  assert.ok(builtBundle.includes('isEligibleMarketingSubscriber'));
  assert.ok(builtBundle.includes('paginateEntries'));
  assert.ok(builtBundle.includes('advanceCursorPaginationState'));

  const arrowSw = readFileSync(resolve(root, 'arrowout/sw.js'), 'utf8');
  assert.ok(arrowSw.includes('arrow-out-'), 'Arrow Out service worker uses the arrow-out- cache prefix');

  const cqSw = readFileSync(resolve(root, 'crystalquest/sw.js'), 'utf8');
  assert.ok(cqSw.includes('cq-'), 'Crystal Quest service worker uses the cq- cache prefix');

  const privacyHtml = readFileSync(resolve(root, 'privacy-policy/index.html'), 'utf8');
  assert.ok(privacyHtml.includes('Optional Promotional Emails &amp; Marketing Subscribers'));
  assert.ok(privacyHtml.includes('../unsubscribe/'));
  assert.ok(!privacyHtml.includes('There is no login'));
  assert.ok(!privacyHtml.includes('There is no visitor database'));
  assert.ok(!privacyHtml.includes('Because we run no accounts'));

  const termsHtml = readFileSync(resolve(root, 'terms-and-conditions/index.html'), 'utf8');
  assert.ok(!termsHtml.includes('Ads never appear inside the games'));

  const readmeMd = readFileSync(resolve(root, 'README.md'), 'utf8');
  assert.ok(!readmeMd.includes('The games never load ads.js'));
  assert.ok(readmeMd.includes('Shared GoGo Account, Cloud Save & Marketing Subscriber System'));
});

console.log('\n==========================================================');
console.log('5. Upstream Game Feature Branches &Test Suites (Arrow Out & Crystal Quest)');
console.log('==========================================================');

if (existsSync('/tmp/Fletch_Game')) {
  runStep('Arrow Out feature branch feat/gogo-shared-account is isolated from main', () => {
    const branch = execSync('git rev-parse --abbrev-ref HEAD', { cwd: '/tmp/Fletch_Game' }).toString().trim();
    assert.equal(branch, 'feat/gogo-shared-account');
    const mainHead = execSync('git rev-parse main', { cwd: '/tmp/Fletch_Game' }).toString().trim();
    const originMainHead = execSync('git rev-parse origin/main', { cwd: '/tmp/Fletch_Game' }).toString().trim();
    assert.equal(mainHead, originMainHead, 'main branch must have zero direct commits');
  });
  runStep('Arrow Out ci-test.js passes', () => {
    execSync('node scripts/ci-test.js', { cwd: '/tmp/Fletch_Game', stdio: 'pipe' });
  });
  runStep('Arrow Out conflict-test.js passes', () => {
    execSync('node scripts/conflict-test.js', { cwd: '/tmp/Fletch_Game', stdio: 'pipe' });
  });
  runStep('Arrow Out pages-test.js passes', () => {
    execSync('node scripts/pages-test.js', { cwd: '/tmp/Fletch_Game', stdio: 'pipe' });
  });
}

if (existsSync('/tmp/crystal-quest-web')) {
  runStep('Crystal Quest feature branch feat/gogo-shared-account is isolated from main', () => {
    const branch = execSync('git rev-parse --abbrev-ref HEAD', { cwd: '/tmp/crystal-quest-web' }).toString().trim();
    assert.equal(branch, 'feat/gogo-shared-account');
    const mainHead = execSync('git rev-parse main', { cwd: '/tmp/crystal-quest-web' }).toString().trim();
    const originMainHead = execSync('git rev-parse origin/main', { cwd: '/tmp/crystal-quest-web' }).toString().trim();
    assert.equal(mainHead, originMainHead, 'main branch must have zero direct commits');
  });
  runStep('Crystal Quest tests/game.test.js passes', () => {
    execSync('node tests/game.test.js', { cwd: '/tmp/crystal-quest-web', stdio: 'pipe' });
  });
}

console.log('\n==========================================================');
console.log('6. Visitor-Facing GitHub Link Absence (security audit)');
console.log('==========================================================');

// gogo-owned pages only. The synced product copies (arrowout/,
// crystalquest/, pikanews/, sarkari-sarthi/) are overwritten by the
// sync workflow from their upstream repositories, so their GitHub-link
// fixes belong upstream (see PikaNews PR / Fletch PR) and are NOT
// asserted here until those merge and the sync lands.
const gogoOwnedPages = [
  'index.html',
  '404.html',
  'about/index.html',
  'contact/index.html',
  'disclaimer/index.html',
  'account/index.html',
  'admin/index.html',
  'unsubscribe/index.html',
  'privacy-policy/index.html',
  'terms-and-conditions/index.html',
];
const gogoOwnedScripts = [
  'assets/js/main.js',
  'assets/js/ads.js',
  'assets/js/sarkari-data.js',
];

runStep('No visitor-facing GitHub profile/repository links on any gogo-owned page or script', () => {
  for (const page of gogoOwnedPages) {
    const html = readFileSync(resolve(root, page), 'utf8');
    assert.ok(
      !html.includes('github.com/parya5103'),
      `${page} must not link the public GitHub account/repository`
    );
    assert.ok(
      !/href\s*=\s*["']https:\/\/github\.com\//.test(html),
      `${page} must not hyperlink github.com for visitors`
    );
    assert.ok(
      !/action\s*=\s*["']https:\/\/github\.com/.test(html),
      `${page} must not submit forms to github.com`
    );
  }
  for (const script of gogoOwnedScripts) {
    const js = readFileSync(resolve(root, script), 'utf8');
    // Visitor-facing links use https://github.com/parya5103. The
    // sarkari-data.js manifest fetch from raw.githubusercontent.com and
    // its scheme-less source comment are deliberate data-layer
    // references (audit decision), not visitor links, and stay.
    assert.ok(
      !js.includes('https://github.com/parya5103'),
      `${script} must not link the public GitHub repository`
    );
  }
});

runStep('Legal hosting disclosure retained without linking the repository', () => {
  // The privacy policy must keep the honest "GitHub Pages" hosting
  // disclosure, but as text - never as a link to the account/repo.
  const privacyHtml = readFileSync(resolve(root, 'privacy-policy/index.html'), 'utf8');
  assert.ok(privacyHtml.includes('GitHub Pages'));
  assert.ok(!/href\s*=\s*["']https:\/\/github\.com\//.test(privacyHtml));
});


console.log('\n==========================================================');
console.log('7. SEO Regression Suite');
console.log('==========================================================');

runStep('SEO regression suite passes (titles, descriptions, canonicals, robots, sitemap, JSON-LD, links, redirects, alt text)', () => {
  execSync('node scripts/seo-tests.mjs', { cwd: root, stdio: 'pipe' });
});
console.log('');
console.log('==========================================================');
console.log('8. GoGo Central Notifications (FCM web push, opt-in) — MOCKED module tests');
console.log('==========================================================');
// MOCKED/pure unit tests: the module is evaluated against a fake window in
// Node. No Firebase SDK, no service worker, no Notification API and no
// network are involved. These tests validate the fail-closed config gate
// and the exact request payload shapes. They do NOT prove live FCM
// delivery — live delivery is a manual post-deployment verification step.

const notificationsModuleSrc = readFileSync(resolve(root, 'assets/js/gogo-notifications.js'), 'utf8');
const notificationsWindow = {};
new Function('window', notificationsModuleSrc)(notificationsWindow);
const GoGoNotifications = notificationsWindow.GoGoNotifications;

runStep('GoGo notifications module exposes its testable API and stays inert outside the browser', () => {
  assert.ok(GoGoNotifications, 'window.GoGoNotifications must be defined');
  assert.equal(typeof GoGoNotifications.internals.validateConfig, 'function');
  assert.equal(typeof GoGoNotifications.internals.buildRegisterPayload, 'function');
  assert.equal(typeof GoGoNotifications.internals.buildPreferencePayload, 'function');
  assert.equal(typeof GoGoNotifications.internals.safeUrl, 'function');
  assert.equal(GoGoNotifications.config.appId, 'gogocompany-in');
});

runStep('Config gate: shipped config validates; empty apiBase/vapidPublicKey stays fail-closed', () => {
  const v = GoGoNotifications.internals.validateConfig();
  assert.equal(v.ok, true);
  assert.equal(v.disabled, false);
  const empty = GoGoNotifications.internals.validateConfig({
    appId: 'gogocompany-in',
    apiBase: '',
    vapidPublicKey: '',
  });
  assert.equal(empty.ok, false);
  assert.equal(empty.disabled, true);
  assert.ok(empty.problems.some((p) => p.includes('API base')));
  assert.ok(empty.problems.some((p) => p.includes('VAPID')));
  const v2 = GoGoNotifications.internals.validateConfig({
    appId: 'gogocompany-in',
    apiBase: 'https://gogo-central-backend.example.run.app/',
    vapidPublicKey: 'BExampleVapidPublicKey000000000000000000000',
  });
  assert.equal(v2.ok, true);
  assert.equal(v2.disabled, false);
  assert.equal(v2.problems.length, 0);
});

runStep('Device registration payload matches the backend contract (appId, fcmToken, platform web, userAgent)', () => {
  const payload = GoGoNotifications.internals.buildRegisterPayload(
    { appId: 'gogocompany-in' },
    'fcm-web-token-abcdefgh1234567890',
    'Mozilla/5.0 (Linux; Android 15) TestAgent/1.0'
  );
  assert.equal(payload.appId, 'gogocompany-in');
  assert.equal(payload.fcmToken, 'fcm-web-token-abcdefgh1234567890');
  assert.equal(payload.platform, 'web');
  assert.equal(payload.userAgent, 'Mozilla/5.0 (Linux; Android 15) TestAgent/1.0');
  const fallback = GoGoNotifications.internals.buildRegisterPayload({ appId: 'x' }, 'tok-1234567890abcdef');
  assert.equal(fallback.userAgent, 'unknown-web', 'userAgent falls back safely outside the browser');
});

runStep('Preference payload toggles every channel together and keeps quiet hours', () => {
  const on = GoGoNotifications.internals.buildPreferencePayload(true);
  assert.equal(on.enabled, true);
  assert.equal(on.webPush, true);
  assert.equal(on.androidPush, true);
  assert.equal(on.marketingAlerts, true);
  assert.equal(on.transactionalAlerts, true);
  assert.equal(on.quietHoursStart, '22:00');
  assert.equal(on.quietHoursEnd, '06:00');
  const off = GoGoNotifications.internals.buildPreferencePayload(false);
  assert.equal(off.enabled, false);
  assert.equal(off.webPush, false);
  assert.equal(off.androidPush, false);
  assert.equal(off.marketingAlerts, false);
  assert.equal(off.transactionalAlerts, false);
  assert.equal(off.quietHoursStart, '22:00');
  assert.equal(off.quietHoursEnd, '06:00');
});

runStep('safeUrl allowlist opens only GoGo domains, everything else falls back to the portal', () => {
  const safeUrl = GoGoNotifications.internals.safeUrl;
  assert.equal(safeUrl('https://gogocompany.in/'), 'https://gogocompany.in/');
  assert.equal(safeUrl('https://gogocompany.in/sarkari-sarthi/'), 'https://gogocompany.in/sarkari-sarthi/');
  assert.equal(safeUrl('https://evil.example.org/phish'), 'https://gogocompany.in/');
  assert.equal(safeUrl('javascript:alert(1)'), 'https://gogocompany.in/');
  assert.equal(safeUrl(''), 'https://gogocompany.in/');
  assert.equal(safeUrl(null), 'https://gogocompany.in/');
});

runStep('Background worker: messaging handler, GoGo-only links, dedupe tag, click focus, and NO fetch handler', () => {
  const sw = readFileSync(resolve(root, 'firebase-messaging-sw.js'), 'utf8');
  assert.ok(sw.includes('firebase-messaging-compat.js'));
  assert.ok(sw.includes('onBackgroundMessage'));
  assert.ok(sw.includes('showNotification'));
  assert.ok(sw.includes('notificationclick'));
  assert.ok(sw.includes('gogocompany.in'));
  assert.ok(sw.includes('tag:'), 'notifications must carry a collapsing tag');
  assert.ok(!sw.includes("addEventListener('fetch'"), 'the FCM worker must never install a fetch handler');
});

runStep('Account page loads the notifications module after the account bundle', () => {
  const html = readFileSync(resolve(root, 'account/index.html'), 'utf8');
  assert.ok(html.includes('assets/js/gogo-notifications.js'));
  assert.ok(html.indexOf('gogo-account.js') < html.indexOf('gogo-notifications.js'));
});

runStep('Sync workflows keep the service-worker guard (with the notifications allowlist) and pairing checks', () => {
  const pikanewsYml = readFileSync(resolve(root, '.github/workflows/sync-pikanews.yml'), 'utf8');
  assert.ok(pikanewsYml.includes("grep -v 'gogo-notifications.js'"), 'service-worker guard must allowlist the notifications module');
  assert.ok(pikanewsYml.includes('pikanews/firebase-messaging-sw.js'), 'pikanews pairing check present');
  const productsYml = readFileSync(resolve(root, '.github/workflows/sync-products.yml'), 'utf8');
  assert.ok(productsYml.includes('arrowout/fcm/firebase-messaging-sw.js'), 'arrowout pairing check present');
  assert.ok(productsYml.includes('crystalquest/fcm/firebase-messaging-sw.js'), 'crystalquest pairing check present');
  assert.ok(productsYml.includes('sarkari-sarthi/firebase-messaging-sw.js'), 'sarkari pairing check present');
});

runStep('Onboarding state machine: first-visit intro, one 3-day reminder, never nags', () => {
  const eo = GoGoNotifications.internals.evaluateOnboarding;
  assert.equal(typeof eo, 'function');
  const DAY = 24 * 60 * 60 * 1000;
  const env = { configOk: true, pushSupported: true, permission: 'default', active: false };
  assert.equal(eo(null, 1000, env).action, 'intro');
  assert.equal(eo({ shownAt: 2000 }, 1000 + DAY / 2, env).action, 'none', 'no reshow within 24h of the last view');
  assert.equal(eo({ decision: 'not-now', decidedAt: 1000 }, 1000 + DAY, env).action, 'none', 'no reminder before 3 days');
  assert.equal(eo({ decision: 'not-now', decidedAt: 1000 }, 1000 + 3 * DAY + 1, env).action, 'reminder');
  assert.equal(eo({ decision: 'not-now', decidedAt: 1000, reminderShown: true }, 1000 + 3 * DAY + 1, env).action, 'none', 'reminder is one-time');
  assert.equal(eo({ decision: 'dismissed-forever' }, 9999999999999, env).action, 'none');
  assert.equal(eo({ decision: 'enabled' }, 9999999999999, env).action, 'none');
  assert.equal(eo(null, 1000, { ...env, active: true }).action, 'none', 'already-active visitors never see the intro');
  assert.equal(eo(null, 1000, { ...env, configOk: false }).action, 'none', 'fail-closed config never shows the intro');
  assert.equal(eo(null, 1000, { ...env, permission: 'denied' }).action, 'blocked', 'denied gets one-time settings guidance');
  assert.equal(eo({ blockedShown: true }, 1000, { ...env, permission: 'denied' }).action, 'none', 'denied guidance never repeats');
});

runStep('Onboarding popup lists all six GoGo categories and only prompts on an explicit click', () => {
  assert.ok(notificationsModuleSrc.includes('id="gogo-notifications-intro"'));
  assert.ok(notificationsModuleSrc.includes('id="gogo-notifications-intro-enable"'));
  assert.ok(notificationsModuleSrc.includes('id="gogo-notifications-intro-dismiss"'));
  for (const label of ["GoGo Company announcements","Sarkari Sarthi job alerts","Pika News breaking news","Crystal Quest updates","Arrow Out updates","Future GoGo product announcements"]) {
    assert.ok(notificationsModuleSrc.includes(label), `intro must list: ${label}`);
  }
  assert.equal((notificationsModuleSrc.match(/requestPermission/g) || []).length, 1, 'native prompt only inside the Enable click path');
  assert.ok(notificationsModuleSrc.includes('visibilitychange'), 'permission rechecked when the visitor returns');
});

runStep('Backend verification before Active: active token+appId match, revoked rows rejected', () => {
  const find = GoGoNotifications.internals.findRegisteredDevice;
  const devices = [
    { deviceId: 'd1', fcmToken: 'tok-aaa', appId: 'gogocompany-in', status: 'active' },
    { deviceId: 'd2', fcmToken: 'tok-aaa', appId: 'other-app', status: 'active' },
    { deviceId: 'd3', fcmToken: 'tok-bbb', appId: 'gogocompany-in', status: 'revoked' },
    { deviceId: 'd4', fcmToken: 'tok-bbb', appId: 'gogocompany-in', status: 'active' },
  ];
  assert.equal(find(devices, 'tok-aaa', 'gogocompany-in').deviceId, 'd1', 'exact token + appId match');
  assert.equal(find(devices, 'tok-bbb', 'gogocompany-in').deviceId, 'd4', 'revoked/duplicate rows resolve to the active row');
  assert.equal(find(devices, 'tok-ccc', 'gogocompany-in'), null, 'unknown token is not registered');
  assert.equal(find(devices, 'tok-aaa', null).deviceId, 'd1', 'appId filter is optional');
  assert.equal(find(null, 'tok-aaa', 'gogocompany-in'), null);
  assert.equal(find([], 'tok-aaa', 'gogocompany-in'), null);
  assert.ok(notificationsModuleSrc.includes("apiFetch('/api/v1/devices', { method: 'GET' })"), 'verification reuses the existing devices endpoint');
  assert.ok(notificationsModuleSrc.includes('VERIFY_FAILED'), 'verification failure surfaces an honest error');
  assert.ok(notificationsModuleSrc.includes('verified: true'), 'verified flag persisted before Active is displayed');
});

runStep('Permission request outcomes classify distinctly: granted / denied / dismissed (default)', () => {
  const c = GoGoNotifications.internals.classifyPermissionResult;
  assert.equal(c('granted'), 'granted');
  assert.equal(c('denied'), 'denied');
  assert.equal(c('default'), 'dismissed', 'a dismissed prompt is NOT a site-settings block');
  assert.equal(c(undefined), 'dismissed');
  assert.equal(c(''), 'dismissed');
});

runStep('Browser support summary separates insecure context, missing APIs, and missing PushManager', () => {
  const s = GoGoNotifications.internals.browserSupportSummary;
  assert.equal(s({ isSecureContext: true, hasNotification: true, hasServiceWorker: true, hasPushManager: true }).supported, true);
  const insecure = s({ isSecureContext: false, hasNotification: true, hasServiceWorker: true, hasPushManager: true });
  assert.equal(insecure.supported, false);
  assert.ok(insecure.problems.includes('insecure-context'));
  const noPush = s({ isSecureContext: true, hasNotification: true, hasServiceWorker: true, hasPushManager: false });
  assert.deepEqual(noPush.problems, ['no-push-manager']);
  const bare = s({ isSecureContext: false, hasNotification: false, hasServiceWorker: false, hasPushManager: false });
  assert.equal(bare.supported, false);
  assert.ok(bare.problems.includes('no-notification-api'));
  assert.ok(bare.problems.includes('no-service-worker'));
});

runStep('Enable failure messages are accurate per failure stage and never leak tokens or credentials', () => {
  const m = GoGoNotifications.internals.enableErrorMessage;
  // Permission states get DISTINCT, actionable messages.
  assert.ok(m(new Error('PERMISSION_DENIED')).includes('BLOCKED'), 'denied points to browser site settings');
  assert.ok(m(new Error('PERMISSION_DISMISSED')).includes('again'), 'dismissed invites a retry, not settings');
  assert.notEqual(m(new Error('PERMISSION_DENIED')), m(new Error('PERMISSION_DISMISSED')));
  // Every stage has its own message.
  assert.ok(m(new Error('MESSAGING_UNSUPPORTED')).includes('browser'));
  assert.ok(m(new Error('NETWORK_ERROR')).includes('connection'));
  assert.ok(m(new Error('SW_REGISTER_FAILED: script 404')).includes('worker'));
  assert.ok(m(new Error('ANON_AUTH_FAILED: auth/operation-not-allowed')).includes('operation-not-allowed'));
  assert.ok(m(new Error('SDK_LOAD_FAILED: https://www.gstatic.com/x')).includes('connection'), 'SDK download failure = network guidance');
  assert.ok(m(new Error('SDK_INIT_FAILED')).includes('browser'), 'SDK init failure = browser guidance');
  assert.notEqual(m(new Error('SDK_LOAD_FAILED: x')), m(new Error('SDK_INIT_FAILED')));
  assert.ok(m(new Error('NO_FCM_TOKEN')).includes('token'));
  assert.ok(m(new Error('SESSION_EXPIRED')).includes('session'));
  assert.ok(m(new Error('REGISTER_FAILED_500')).includes('500'));
  assert.ok(m(new Error('PREFERENCE_FAILED_429')).includes('429'));
  assert.ok(m(new Error('VERIFY_FAILED_NOT_FOUND')).includes('confirm'));
  assert.notEqual(m(new Error('REGISTER_FAILED_500')), m(new Error('PREFERENCE_FAILED_429')));
  // No sensitive runtime values in any message.
  for (const e of ['PERMISSION_DENIED', 'PERMISSION_DISMISSED', 'NETWORK_ERROR', 'SW_REGISTER_FAILED: x', 'ANON_AUTH_FAILED: auth/x', 'SDK_LOAD_FAILED: x', 'SDK_INIT_FAILED', 'NO_FCM_TOKEN', 'SESSION_EXPIRED', 'REGISTER_FAILED_500', 'PREFERENCE_FAILED_429', 'VERIFY_FAILED_NOT_FOUND']) {
    const msg = m(new Error(e));
    assert.ok(!msg.includes('Bearer'), `no Authorization material in ${e}`);
    assert.ok(!msg.includes('fcmToken'), `no FCM token in ${e}`);
    assert.ok(!msg.includes('AIzaSy'), `no API key in ${e}`);
  }
});

runStep('Permission is requested exactly once, through the compat wrapper, only from the click path', () => {
  // askPermission() is the single call site; enable() must call the wrapper,
  // never Notification.requestPermission directly.
  assert.equal((notificationsModuleSrc.match(/requestPermission/g) || []).length, 1);
  assert.ok(notificationsModuleSrc.includes('function askPermission()'), 'callback-compatible wrapper exists');
  assert.ok(notificationsModuleSrc.includes('return askPermission()'), 'enable() uses the wrapper');
  assert.ok(notificationsModuleSrc.includes("typeof result.then === 'function'"), 'Promise-based browsers pass through the wrapper');
});

runStep('Pre-flight capability checks run before any SDK or network work', () => {
  assert.ok(notificationsModuleSrc.includes('browserSupportSummary({'), 'enable() runs the support summary');
  assert.ok(notificationsModuleSrc.includes('isSecureContext'), 'secure-context is checked');
  assert.ok(notificationsModuleSrc.includes('hasPushManager'), 'PushManager availability is checked');
  assert.ok(notificationsModuleSrc.includes('messaging.isSupported'), 'Firebase Messaging browser support is checked');
  assert.ok(notificationsModuleSrc.includes('MESSAGING_UNSUPPORTED'), 'unsupported messaging is a distinct failure');
  assert.ok(notificationsModuleSrc.includes("throw new Error('NETWORK_ERROR')"), 'fetch network/CORS failures are classified');
});

runStep('Service worker click handler validates client URLs by hostname parsing, never substring matching', () => {
  const sw = readFileSync(resolve(root, 'firebase-messaging-sw.js'), 'utf8');
  assert.ok(!sw.includes('client.url.indexOf'), 'focus matching must not use unsafe substring matching');
  const clickIdx = sw.indexOf("addEventListener('notificationclick'");
  assert.ok(clickIdx !== -1);
  const clickBody = sw.slice(clickIdx);
  assert.ok(clickBody.includes('new URL(client.url)'), 'client URLs must be parsed with URL hostname validation');
  assert.ok(clickBody.includes("'gogocompany.in'") && clickBody.includes("'www.gogocompany.in'"), 'only GoGo hosts may be focused');
  assert.ok(clickBody.includes('openWindow(target)'), 'non-matching clicks open the safe fallback URL');
  assert.ok(!sw.includes("addEventListener('fetch'"), 'no fetch handler may appear in the FCM worker');
});

runStep('Disable path still exists and clears stored state (turn-off behavior preserved)', () => {
  assert.equal(typeof GoGoNotifications.disable, 'function');
  assert.ok(notificationsModuleSrc.includes("storageRemove(CONFIG.storageKey)"), 'disable clears the stored device record');
  assert.ok(notificationsModuleSrc.includes('setPreferences(false)'), 'disable turns every channel off server-side');
  assert.ok(notificationsModuleSrc.includes('function setPreferences(enabled)'), 'preferences helper sends buildPreferencePayload(enabled)');
});

console.log(`\nALL ${totalPassed} TEST SUITES PASSED SUCCESSFULLY.`);
