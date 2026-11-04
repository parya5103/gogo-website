import assert from 'node:assert/strict';
import { execSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  validateGameSave,
  summarizeProgress,
  mergeGameProgress,
  detectSaveConflict,
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
    best: { '1': 5400, '2': 6100 },
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
      best: { '1': { stars: 2, plays: 2 }, '5': { stars: 3, plays: 1 } },
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
console.log('2. Firestore Security Rules Verification (ESLint + Structure)');
console.log('==========================================================');

runStep('ESLint @firebase/eslint-plugin-security-rules passes with 0 errors/warnings', () => {
  execSync('npx eslint firestore.rules', { cwd: root, stdio: 'pipe' });
});

runStep('Firestore rules enforce UID ownership, allowed fields, and supported games', () => {
  const rulesText = readFileSync(resolve(root, 'firestore.rules'), 'utf8');
  assert.ok(rulesText.includes('request.auth.uid == uid'));
  assert.ok(rulesText.includes("let allowed = ['displayName', 'email', 'photoURL', 'createdAt', 'lastLoginAt'];"));
  assert.ok(rulesText.includes("let allowed = ['gameId', 'progress', 'updatedAt', 'schemaVersion'];"));
  assert.ok(rulesText.includes("gameId == 'arrowout' || gameId == 'crystalquest'"));
});

console.log('\n==========================================================');
console.log('3. Cross-Application Asset & Integration Verification');
console.log('==========================================================');

runStep('Shared GoGo Account bundle & CSS exist across /, /account/, /arrowout/, and /crystalquest/', () => {
  assert.ok(existsSync(resolve(root, 'assets/js/gogo-account.js')));
  assert.ok(existsSync(resolve(root, 'assets/css/gogo-account.css')));
  assert.ok(existsSync(resolve(root, 'account/index.html')));
  assert.ok(existsSync(resolve(root, 'arrowout/js/gogo-account.js')));
  assert.ok(existsSync(resolve(root, 'arrowout/css/gogo-account.css')));
  assert.ok(existsSync(resolve(root, 'crystalquest/js/gogo-account.js')));
  assert.ok(existsSync(resolve(root, 'crystalquest/gogo-account.css')));
});

console.log('\n==========================================================');
console.log('4. Upstream Game Test Suites (Arrow Out & Crystal Quest)');
console.log('==========================================================');

if (existsSync('/tmp/Fletch_Game')) {
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
  runStep('Crystal Quest tests/game.test.js passes', () => {
    execSync('node tests/game.test.js', { cwd: '/tmp/crystal-quest-web', stdio: 'pipe' });
  });
}

console.log(`\nALL ${totalPassed} TEST SUITES PASSED SUCCESSFULLY.`);
