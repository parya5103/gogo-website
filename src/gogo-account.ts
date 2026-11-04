import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import {
  getAuth,
  setPersistence,
  indexedDBLocalPersistence,
  browserLocalPersistence,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  signOut,
  updateProfile,
  deleteUser,
  EmailAuthProvider,
  reauthenticateWithCredential,
  reauthenticateWithPopup,
  type Auth,
  type User,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  getDocFromServer,
  setDoc,
  deleteDoc,
  serverTimestamp,
  Timestamp,
  type Firestore,
} from 'firebase/firestore';
import firebaseAppletConfig from '../firebase-applet-config.json' with { type: 'json' };

// =========================================================
// 1. Error Handling & Types (Per Firebase Security Guidelines)
// =========================================================

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  };
}

export type SupportedGameId = 'arrowout' | 'crystalquest';

export interface GameAdapter {
  gameId: SupportedGameId;
  gameName: string;
  schemaVersion: number;
  getLocalSave: () => Record<string, any> | null;
  getLocalUpdatedAtMs: () => number;
  applyCloudSave: (progress: Record<string, any>, updatedAtMs: number) => void;
  mergeProgress?: (localSave: Record<string, any>, cloudSave: Record<string, any>) => Record<string, any>;
}

export interface ProgressSummary {
  gameId: SupportedGameId;
  headline: string;
  subline: string;
  scoreMetric: number;
  updatedAtMs: number;
  isEmptyDefault: boolean;
}

export interface ConflictComparison {
  status: 'in_sync' | 'upload_local' | 'restore_cloud' | 'conflict' | 'empty';
  reason: string;
  localSummary: ProgressSummary;
  cloudSummary: ProgressSummary;
}

// =========================================================
// 2. Marketing Consent & Admin Constants + Pure Functions
// =========================================================

export const MARKETING_CONSENT_VERSION = 'v1.0-2026-11';
export const MARKETING_CONSENT_TEXT =
  'Yes! I would like to receive GoGo Games news, new game announcements, updates, special offers and promotional emails.';

export const AUTHORIZED_ADMIN_EMAILS = ['aaryapratik@gmail.com', 'officialgogocompany@gmail.com'];

export interface SubscriberRecordInput {
  email: string;
  displayName: string;
  subscribed: boolean;
  consentTimestampMs: number | null;
  consentVersion: string;
  consentText: string;
  source: string;
  authProvider: 'password' | 'google.com';
  registeredAtMs: number;
  updatedAtMs: number;
  unsubscribedAtMs: number | null;
}

export interface AdminDirectoryEntry {
  uid: string;
  email: string;
  displayName: string;
  authProvider: 'password' | 'google.com';
  registeredAtMs: number;
  lastLoginAtMs: number;
  subscribed: boolean;
  consentTimestampMs: number | null;
  consentVersion: string;
  consentText: string;
  source: string;
  unsubscribedAtMs: number | null;
}

export function isAuthorizedAdminUser(
  user: { email?: string | null; emailVerified?: boolean } | null | undefined,
  hasAdminDoc = false
): boolean {
  if (!user) return false;
  if (hasAdminDoc) return true;
  const email = (user.email || '').trim().toLowerCase();
  return Boolean(user.emailVerified && AUTHORIZED_ADMIN_EMAILS.includes(email));
}

export function detectCurrentSourceSurface(): string {
  if (typeof window === 'undefined') return 'registration_form';
  const path = window.location.pathname || '/';
  if (path.includes('/arrowout')) return 'arrowout';
  if (path.includes('/crystalquest')) return 'crystalquest';
  if (path.includes('/unsubscribe')) return 'unsubscribe_page';
  if (path.includes('/account')) return 'account_page';
  return 'gogo_website';
}

export function buildInitialMarketingRecord(params: {
  email: string;
  displayName: string;
  marketingOptIn: boolean;
  authProvider: 'password' | 'google.com';
  source: string;
  nowMs?: number;
}): SubscriberRecordInput {
  const now = params.nowMs ?? Date.now();
  // Never automatically subscribe Google sign-in users unless explicitly opted in
  const subscribed = params.authProvider === 'google.com' ? false : Boolean(params.marketingOptIn);
  return {
    email: params.email.trim().slice(0, 254),
    displayName: (params.displayName.trim() || 'GoGo Player').slice(0, 100),
    subscribed,
    consentTimestampMs: subscribed ? now : null,
    consentVersion: subscribed ? MARKETING_CONSENT_VERSION : '',
    consentText: subscribed ? MARKETING_CONSENT_TEXT : '',
    source: (params.source || 'registration_form').slice(0, 64),
    authProvider: params.authProvider,
    registeredAtMs: now,
    updatedAtMs: now,
    unsubscribedAtMs: null,
  };
}

export function applyUnsubscribeToRecord(
  existing: SubscriberRecordInput,
  source = 'unsubscribe_page',
  nowMs = Date.now()
): SubscriberRecordInput {
  return {
    ...existing,
    subscribed: false,
    source: source.slice(0, 64),
    updatedAtMs: nowMs,
    unsubscribedAtMs: nowMs,
    // Keep prior consentTimestampMs, consentVersion, and consentText for audit accountability
  };
}

export function applyOptInToRecord(
  existing: SubscriberRecordInput,
  source = 'account_profile',
  nowMs = Date.now()
): SubscriberRecordInput {
  return {
    ...existing,
    subscribed: true,
    consentTimestampMs: nowMs,
    consentVersion: MARKETING_CONSENT_VERSION,
    consentText: MARKETING_CONSENT_TEXT,
    source: source.slice(0, 64),
    updatedAtMs: nowMs,
    unsubscribedAtMs: null,
  };
}

export function escapeCsvCell(value: unknown): string {
  const raw = String(value ?? '');
  // Prevent CSV formula injection when opened in Excel / Google Sheets
  const safe = /^[=+\-@]/.test(raw) ? `'${raw}` : raw;
  if (/[",\r\n]/.test(safe)) {
    return `"${safe.replace(/"/g, '""')}"`;
  }
  return safe;
}

export function formatIsoDateForCsv(ms: number | null | undefined): string {
  if (!ms || ms <= 0 || !Number.isFinite(ms)) return '';
  try {
    return new Date(ms).toISOString().replace('T', ' ').slice(0, 19) + ' UTC';
  } catch {
    return '';
  }
}

export const CSV_HEADER_COLUMNS = [
  'Email',
  'Display Name',
  'Registration Date',
  'Marketing Consent',
  'Consent Date',
  'Source',
];

/**
 * Generates the Promotional Marketing Subscribers CSV.
 * STRICT REQUIREMENT: Only exports users who have explicitly subscribed (subscribed === true)
 * and have NOT unsubscribed.
 */
export function generateMarketingSubscribersCsv(entries: AdminDirectoryEntry[]): string {
  const subscribedOnly = entries.filter((e) => e.subscribed === true && !e.unsubscribedAtMs);
  const rows: string[] = [CSV_HEADER_COLUMNS.map(escapeCsvCell).join(',')];

  for (const item of subscribedOnly) {
    rows.push(
      [
        item.email,
        item.displayName,
        formatIsoDateForCsv(item.registeredAtMs),
        'Yes',
        formatIsoDateForCsv(item.consentTimestampMs),
        item.source || 'registration_form',
      ]
        .map(escapeCsvCell)
        .join(',')
    );
  }

  return '\uFEFF' + rows.join('\r\n');
}

/**
 * Generates the All Registered Accounts CSV (for account administration only).
 */
export function generateAllRegisteredAccountsCsv(entries: AdminDirectoryEntry[]): string {
  const rows: string[] = [CSV_HEADER_COLUMNS.map(escapeCsvCell).join(',')];

  for (const item of entries) {
    const consentStatus = item.subscribed
      ? 'Yes'
      : item.unsubscribedAtMs
      ? 'No (Unsubscribed)'
      : 'No';
    rows.push(
      [
        item.email,
        item.displayName,
        formatIsoDateForCsv(item.registeredAtMs),
        consentStatus,
        formatIsoDateForCsv(item.consentTimestampMs),
        item.source || item.authProvider,
      ]
        .map(escapeCsvCell)
        .join(',')
    );
  }

  return '\uFEFF' + rows.join('\r\n');
}

// =========================================================
// 3. Constants & Storage Keys for Game Cloud Saves
// =========================================================

const CLOUD_META_STORAGE_KEY = 'gogo.cloudSyncMeta.v1';
const CLOUD_ENABLED_STORAGE_KEY = 'gogo.cloudBackupEnabled.v1';
const ARROW_STORAGE_KEY = 'arrowOut.v2';
const CRYSTAL_STORAGE_KEY = 'crystal-quest-save-v1';
const CRYSTAL_META_KEY = 'crystal-quest-cloud-meta-v1';

// =========================================================
// 4. Pure Validation, Summary, Conflict & Merge Logic
// =========================================================

function clampInt(val: unknown, min: number, max: number, fallback: number): number {
  const n = typeof val === 'number' ? Math.floor(val) : parseInt(String(val ?? ''), 10);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, n));
}

export function validateGameSave(
  gameId: SupportedGameId,
  rawData: unknown
): { valid: boolean; reason?: string; sanitized?: Record<string, any> } {
  if (!rawData || typeof rawData !== 'object' || Array.isArray(rawData)) {
    return { valid: false, reason: 'Save data must be a non-null object.' };
  }
  const src = rawData as Record<string, any>;

  if (gameId === 'arrowout') {
    const rawUnlocked = Number(src.unlocked ?? src.unlockedStage ?? src.currentStage);
    if (!Number.isFinite(rawUnlocked) || Math.floor(rawUnlocked) < 1 || Math.floor(rawUnlocked) > 10000) {
      return { valid: false, reason: 'Arrow Out save requires valid unlocked level >= 1.' };
    }
    const unlocked = Math.floor(rawUnlocked);

    const best: Record<string, { stars: number; plays: number }> = {};
    const bestSrc = src.best ?? src.completed;
    if (bestSrc && typeof bestSrc === 'object' && !Array.isArray(bestSrc)) {
      for (const [k, v] of Object.entries(bestSrc)) {
        const lv = parseInt(k, 10);
        if (lv >= 1 && lv <= 10000 && v && typeof v === 'object') {
          best[String(lv)] = {
            stars: clampInt((v as any).stars, 0, 3, 0),
            plays: clampInt((v as any).plays ?? 1, 0, 1000000, 1),
          };
        }
      }
    }

    const statsSrc = src.stats && typeof src.stats === 'object' ? src.stats : {};
    const streaksSrc = src.streaks && typeof src.streaks === 'object' ? src.streaks : {};
    const winStreakSrc = src.winStreak && typeof src.winStreak === 'object' ? src.winStreak : {};
    const dailySrc = src.daily && typeof src.daily === 'object' ? src.daily : {};
    const loginRewardsSrc = src.loginRewards && typeof src.loginRewards === 'object' ? src.loginRewards : {};
    const settingsSrc = src.settings && typeof src.settings === 'object' ? src.settings : {};

    const cleanBoolMap = (m: unknown): Record<string, boolean> => {
      const out: Record<string, boolean> = {};
      if (m && typeof m === 'object' && !Array.isArray(m)) {
        for (const [k, v] of Object.entries(m)) {
          if (v === true) out[String(k).slice(0, 48)] = true;
        }
      }
      return out;
    };

    const owned = cleanBoolMap(src.owned);
    owned.default = true;
    const ownedBoards = cleanBoolMap(src.ownedBoards);
    ownedBoards.default = true;

    const clientUpdatedAtMs = clampInt(
      src.clientUpdatedAtMs ?? src.updatedAtMs,
      0,
      9999999999999,
      Date.now()
    );

    const sanitized: Record<string, any> = {
      v: 2,
      rev: clampInt(src.rev, 0, 1000000000, 0),
      unlocked,
      best,
      cur: src.cur && typeof src.cur === 'object' && !Array.isArray(src.cur) ? src.cur : null,
      sound: src.sound !== false,
      music: Boolean(src.music),
      vibration: src.vibration !== false,
      theme: src.theme === 'light' ? 'light' : 'dark',
      installHidden: Boolean(src.installHidden),
      stats: {
        totalPlays: clampInt(statsSrc.totalPlays, 0, 10000000, 0),
        totalWins: clampInt(statsSrc.totalWins, 0, 10000000, 0),
        totalStars: clampInt(statsSrc.totalStars, 0, 10000000, 0),
        hintsUsed: clampInt(statsSrc.hintsUsed, 0, 10000000, 0),
        mistakes: clampInt(statsSrc.mistakes, 0, 10000000, 0),
      },
      achievements: cleanBoolMap(src.achievements),
      daily: {
        lastDate: typeof dailySrc.lastDate === 'string' ? dailySrc.lastDate.slice(0, 16) : null,
        completed: Boolean(dailySrc.completed),
        stars: clampInt(dailySrc.stars, 0, 3, 0),
      },
      coins: clampInt(src.coins, 0, 1000000, 0),
      bonusClaimed: cleanBoolMap(src.bonusClaimed),
      winStreak: {
        current: clampInt(winStreakSrc.current, 0, 100000, 0),
        best: clampInt(winStreakSrc.best, 0, 100000, 0),
      },
      chestClaimed: cleanBoolMap(src.chestClaimed),
      starChestClaimed: cleanBoolMap(src.starChestClaimed),
      storySeen: cleanBoolMap(src.storySeen),
      skin: typeof src.skin === 'string' ? src.skin.slice(0, 32) : 'default',
      owned,
      boardSkin: typeof src.boardSkin === 'string' ? src.boardSkin.slice(0, 32) : 'default',
      ownedBoards,
      loginRewards: {
        lastClaim: typeof loginRewardsSrc.lastClaim === 'string' ? loginRewardsSrc.lastClaim.slice(0, 16) : null,
        streak: clampInt(loginRewardsSrc.streak, 0, 100000, 0),
      },
      streaks: {
        current: clampInt(streaksSrc.current ?? src.streak, 0, 100000, 0),
        best: clampInt(streaksSrc.best ?? src.bestStreak, 0, 100000, 0),
        lastPlayDate: typeof streaksSrc.lastPlayDate === 'string' ? streaksSrc.lastPlayDate.slice(0, 16) : null,
      },
      settings: {
        reducedMotion: Boolean(settingsSrc.reducedMotion),
        notifications: Boolean(settingsSrc.notifications),
        reminderMinutes: [60, 90, 120].includes(Number(settingsSrc.reminderMinutes))
          ? Number(settingsSrc.reminderMinutes)
          : 90,
        systemNotifications: Boolean(settingsSrc.systemNotifications),
        notificationPrompted: Boolean(settingsSrc.notificationPrompted),
        pushReminders: Boolean(settingsSrc.pushReminders),
        seenOnboarding: Boolean(settingsSrc.seenOnboarding),
      },
      clientUpdatedAtMs,
    };

    return { valid: true, sanitized };
  }

  if (gameId === 'crystalquest') {
    const rawUnlocked = Number(src.unlocked);
    const rawLastLevel = Number(src.lastLevel ?? src.unlocked);
    if (
      !Number.isFinite(rawUnlocked) ||
      Math.floor(rawUnlocked) < 1 ||
      Math.floor(rawUnlocked) > 10000 ||
      !Number.isFinite(rawLastLevel) ||
      Math.floor(rawLastLevel) < 1 ||
      Math.floor(rawLastLevel) > 10000
    ) {
      return { valid: false, reason: 'Crystal Quest save requires valid unlocked and lastLevel >= 1.' };
    }
    const unlocked = Math.floor(rawUnlocked);
    const lastLevel = Math.floor(rawLastLevel);

    const stars: Record<string, number> = {};
    if (src.stars && typeof src.stars === 'object' && !Array.isArray(src.stars)) {
      for (const [k, v] of Object.entries(src.stars)) {
        const lvl = parseInt(k, 10);
        if (lvl >= 1 && lvl <= 10000) {
          stars[String(lvl)] = clampInt(v, 0, 3, 0);
        }
      }
    }

    const best: Record<string, number> = {};
    if (src.best && typeof src.best === 'object' && !Array.isArray(src.best)) {
      for (const [k, v] of Object.entries(src.best)) {
        const lvl = parseInt(k, 10);
        if (lvl >= 1 && lvl <= 10000) {
          best[String(lvl)] = clampInt(v, 0, 100000000, 0);
        }
      }
    }

    const settingsSrc = src.settings && typeof src.settings === 'object' ? src.settings : {};
    const worldSrc = src.world && typeof src.world === 'object' ? src.world : {};
    const forestSeen = Array.isArray(worldSrc.forest?.seen)
      ? worldSrc.forest.seen.map((x: any) => String(x).slice(0, 40)).slice(0, 100)
      : [];
    const relics = Array.isArray(worldSrc.relics)
      ? worldSrc.relics.map((x: any) => String(x).slice(0, 40)).slice(0, 100)
      : [];
    const story = Array.isArray(worldSrc.story)
      ? worldSrc.story.map((x: any) => String(x).slice(0, 40)).slice(0, 100)
      : [];
    const dailySrc = worldSrc.daily && typeof worldSrc.daily === 'object' ? worldSrc.daily : {};

    const clientUpdatedAtMs = clampInt(
      src.clientUpdatedAtMs ?? src.updatedAtMs,
      0,
      9999999999999,
      Date.now()
    );

    const sanitized: Record<string, any> = {
      v: 2,
      unlocked,
      stars,
      best,
      lastLevel: Math.min(lastLevel, unlocked),
      settings: {
        sfx: settingsSrc.sfx !== false,
        music: settingsSrc.music !== false,
        motion: Boolean(settingsSrc.motion),
        symbols: Boolean(settingsSrc.symbols ?? settingsSrc.contrast),
      },
      world: {
        forest: { seen: Array.from(new Set(forestSeen)) },
        relics: Array.from(new Set(relics)),
        daily: {
          date: typeof dailySrc.date === 'string' ? dailySrc.date.slice(0, 16) : '',
          streak: clampInt(dailySrc.streak, 0, 100000, 0),
          best: clampInt(dailySrc.best, 0, 100000, 0),
        },
        story: Array.from(new Set(story)),
      },
      clientUpdatedAtMs,
    };

    return { valid: true, sanitized };
  }

  return { valid: false, reason: `Unsupported gameId: ${String(gameId)}` };
}

export function summarizeProgress(
  gameId: SupportedGameId,
  rawSave: Record<string, any> | null | undefined,
  explicitUpdatedAtMs?: number
): ProgressSummary {
  if (!rawSave || typeof rawSave !== 'object') {
    return {
      gameId,
      headline: 'No Save Data',
      subline: 'Fresh start',
      scoreMetric: 0,
      updatedAtMs: 0,
      isEmptyDefault: true,
    };
  }

  const updatedAtMs = clampInt(
    explicitUpdatedAtMs ?? rawSave.clientUpdatedAtMs ?? rawSave.updatedAtMs,
    0,
    9999999999999,
    0
  );

  if (gameId === 'arrowout') {
    const unlocked = clampInt(rawSave.unlocked ?? rawSave.unlockedStage ?? rawSave.currentStage, 1, 10000, 1);
    const bestObj =
      (rawSave.best ?? rawSave.completed) && typeof (rawSave.best ?? rawSave.completed) === 'object'
        ? rawSave.best ?? rawSave.completed
        : {};
    let completedCount = 0;
    let totalStars = 0;
    for (const v of Object.values(bestObj)) {
      if (v && typeof v === 'object') {
        const s = clampInt((v as any).stars, 0, 3, 0);
        if (s > 0) completedCount++;
        totalStars += s;
      }
    }
    const coins = clampInt(rawSave.coins, 0, 1000000, 0);
    const bestStreak = clampInt(rawSave.streaks?.best ?? rawSave.bestStreak, 0, 100000, 0);
    const isEmptyDefault = unlocked <= 1 && completedCount === 0 && coins === 0 && bestStreak === 0;
    const scoreMetric = unlocked * 1000 + totalStars * 25 + completedCount * 50 + coins + bestStreak * 5;

    return {
      gameId,
      headline: `Level ${unlocked} Unlocked`,
      subline: `${completedCount} levels cleared • ${totalStars} ★ • ${coins} coins • Streak ${bestStreak}`,
      scoreMetric,
      updatedAtMs,
      isEmptyDefault,
    };
  }

  // crystalquest
  const unlocked = clampInt(rawSave.unlocked, 1, 10000, 1);
  const starsObj = rawSave.stars && typeof rawSave.stars === 'object' ? rawSave.stars : {};
  let totalStars = 0;
  let clearedLevels = 0;
  for (const v of Object.values(starsObj)) {
    const s = clampInt(v, 0, 3, 0);
    if (s > 0) clearedLevels++;
    totalStars += s;
  }
  const relicsCount = Array.isArray(rawSave.world?.relics) ? rawSave.world.relics.length : 0;
  const dailyBest = clampInt(rawSave.world?.daily?.best, 0, 100000, 0);
  const isEmptyDefault = unlocked <= 1 && totalStars === 0 && relicsCount === 0 && dailyBest === 0;
  const scoreMetric = unlocked * 1000 + totalStars * 30 + relicsCount * 40 + dailyBest * 10;

  return {
    gameId,
    headline: `Level ${unlocked} Unlocked`,
    subline: `${totalStars} ★ earned • ${clearedLevels} levels cleared • ${relicsCount} relics`,
    scoreMetric,
    updatedAtMs,
    isEmptyDefault,
  };
}

export function mergeGameProgress(
  gameId: SupportedGameId,
  localRaw: Record<string, any>,
  cloudRaw: Record<string, any>
): Record<string, any> {
  const vLocal = validateGameSave(gameId, localRaw);
  const vCloud = validateGameSave(gameId, cloudRaw);
  if (!vLocal.valid && vCloud.valid) return vCloud.sanitized!;
  if (vLocal.valid && !vCloud.valid) return vLocal.sanitized!;
  if (!vLocal.valid && !vCloud.valid) return {};

  const a = vLocal.sanitized!;
  const b = vCloud.sanitized!;
  const now = Date.now();

  if (gameId === 'arrowout') {
    const mergedBest: Record<string, { stars: number; plays: number }> = { ...(b.best || {}) };
    for (const [lv, localRec] of Object.entries(a.best || {})) {
      const cloudRec = mergedBest[lv];
      if (!cloudRec) {
        mergedBest[lv] = localRec as any;
      } else {
        mergedBest[lv] = {
          stars: Math.max((localRec as any).stars || 0, cloudRec.stars || 0),
          plays: Math.max((localRec as any).plays || 1, cloudRec.plays || 1),
        };
      }
    }

    const newer = (a.clientUpdatedAtMs || 0) >= (b.clientUpdatedAtMs || 0) ? a : b;
    const mergedUnlocked = Math.max(a.unlocked || 1, b.unlocked || 1);

    let calcStars = 0;
    let calcWins = 0;
    for (const rec of Object.values(mergedBest)) {
      if (rec.stars > 0) {
        calcWins++;
        calcStars += rec.stars;
      }
    }

    return {
      v: 2,
      rev: Math.max(a.rev || 0, b.rev || 0) + 1,
      unlocked: mergedUnlocked,
      best: mergedBest,
      cur: a.cur || b.cur || null,
      sound: newer.sound !== false,
      music: Boolean(newer.music),
      vibration: newer.vibration !== false,
      theme: newer.theme === 'light' ? 'light' : 'dark',
      installHidden: Boolean(a.installHidden || b.installHidden),
      stats: {
        totalPlays: Math.max(a.stats?.totalPlays || 0, b.stats?.totalPlays || 0, calcWins),
        totalWins: Math.max(a.stats?.totalWins || 0, b.stats?.totalWins || 0, calcWins),
        totalStars: Math.max(a.stats?.totalStars || 0, b.stats?.totalStars || 0, calcStars),
        hintsUsed: Math.max(a.stats?.hintsUsed || 0, b.stats?.hintsUsed || 0),
        mistakes: Math.max(a.stats?.mistakes || 0, b.stats?.mistakes || 0),
      },
      achievements: { ...(b.achievements || {}), ...(a.achievements || {}) },
      daily: {
        lastDate: newer.daily?.lastDate || a.daily?.lastDate || b.daily?.lastDate || null,
        completed: Boolean(a.daily?.completed || b.daily?.completed),
        stars: Math.max(a.daily?.stars || 0, b.daily?.stars || 0),
      },
      coins: Math.max(a.coins || 0, b.coins || 0),
      bonusClaimed: { ...(b.bonusClaimed || {}), ...(a.bonusClaimed || {}) },
      winStreak: {
        current: Math.max(a.winStreak?.current || 0, b.winStreak?.current || 0),
        best: Math.max(a.winStreak?.best || 0, b.winStreak?.best || 0),
      },
      chestClaimed: { ...(b.chestClaimed || {}), ...(a.chestClaimed || {}) },
      starChestClaimed: { ...(b.starChestClaimed || {}), ...(a.starChestClaimed || {}) },
      storySeen: { ...(b.storySeen || {}), ...(a.storySeen || {}) },
      skin: newer.skin || 'default',
      owned: { ...(b.owned || {}), ...(a.owned || {}), default: true },
      boardSkin: newer.boardSkin || 'default',
      ownedBoards: { ...(b.ownedBoards || {}), ...(a.ownedBoards || {}), default: true },
      loginRewards: {
        lastClaim: newer.loginRewards?.lastClaim || a.loginRewards?.lastClaim || b.loginRewards?.lastClaim || null,
        streak: Math.max(a.loginRewards?.streak || 0, b.loginRewards?.streak || 0),
      },
      streaks: {
        current: Math.max(a.streaks?.current || 0, b.streaks?.current || 0),
        best: Math.max(a.streaks?.best || 0, b.streaks?.best || 0),
        lastPlayDate: newer.streaks?.lastPlayDate || a.streaks?.lastPlayDate || b.streaks?.lastPlayDate || null,
      },
      settings: { ...(newer.settings || a.settings) },
      clientUpdatedAtMs: now,
    };
  }

  // crystalquest
  const mergedStars: Record<string, number> = { ...(b.stars || {}) };
  for (const [lvl, s] of Object.entries(a.stars || {})) {
    mergedStars[lvl] = Math.max(mergedStars[lvl] || 0, Number(s) || 0);
  }
  const mergedBest: Record<string, number> = { ...(b.best || {}) };
  for (const [lvl, score] of Object.entries(a.best || {})) {
    mergedBest[lvl] = Math.max(mergedBest[lvl] || 0, Number(score) || 0);
  }
  const newer = (a.clientUpdatedAtMs || 0) >= (b.clientUpdatedAtMs || 0) ? a : b;
  const mergedUnlocked = Math.max(a.unlocked || 1, b.unlocked || 1);

  return {
    v: 2,
    unlocked: mergedUnlocked,
    stars: mergedStars,
    best: mergedBest,
    lastLevel: Math.min(Math.max(a.lastLevel || 1, b.lastLevel || 1), mergedUnlocked),
    settings: { ...(newer.settings || a.settings) },
    world: {
      forest: {
        seen: Array.from(new Set([...(b.world?.forest?.seen || []), ...(a.world?.forest?.seen || [])])),
      },
      relics: Array.from(new Set([...(b.world?.relics || []), ...(a.world?.relics || [])])),
      daily: {
        date: newer.world?.daily?.date || a.world?.daily?.date || b.world?.daily?.date || '',
        streak: Math.max(a.world?.daily?.streak || 0, b.world?.daily?.streak || 0),
        best: Math.max(a.world?.daily?.best || 0, b.world?.daily?.best || 0),
      },
      story: Array.from(new Set([...(b.world?.story || []), ...(a.world?.story || [])])),
    },
    clientUpdatedAtMs: now,
  };
}

export function detectSaveConflict(
  gameId: SupportedGameId,
  localSave: Record<string, any> | null,
  localUpdatedAtMs: number,
  cloudSave: Record<string, any> | null,
  cloudUpdatedAtMs: number,
  lastSyncedAtMs = 0
): ConflictComparison {
  const localSummary = summarizeProgress(gameId, localSave, localUpdatedAtMs);
  const cloudSummary = summarizeProgress(gameId, cloudSave, cloudUpdatedAtMs);

  if (localSummary.isEmptyDefault && cloudSummary.isEmptyDefault) {
    return {
      status: 'empty',
      reason: 'Both local and cloud saves are at default initial state.',
      localSummary,
      cloudSummary,
    };
  }

  if (!cloudSave || cloudSummary.isEmptyDefault) {
    return {
      status: 'upload_local',
      reason: 'Local device has progress and no cloud backup exists yet.',
      localSummary,
      cloudSummary,
    };
  }

  if (!localSave || localSummary.isEmptyDefault) {
    return {
      status: 'restore_cloud',
      reason: 'Cloud backup has progress while this device has a fresh save.',
      localSummary,
      cloudSummary,
    };
  }

  const sameMetric = localSummary.scoreMetric === cloudSummary.scoreMetric;
  const sameHeadline = localSummary.headline === cloudSummary.headline && localSummary.subline === cloudSummary.subline;
  const timeDiffMs = Math.abs((localSummary.updatedAtMs || 0) - (cloudSummary.updatedAtMs || 0));

  if (sameMetric && sameHeadline) {
    return {
      status: 'in_sync',
      reason: 'Local and cloud progress match.',
      localSummary,
      cloudSummary,
    };
  }

  if (
    lastSyncedAtMs > 0 &&
    Math.abs(cloudSummary.updatedAtMs - lastSyncedAtMs) < 3000 &&
    localSummary.updatedAtMs > lastSyncedAtMs &&
    localSummary.scoreMetric >= cloudSummary.scoreMetric
  ) {
    return {
      status: 'upload_local',
      reason: 'Local save advanced since the last cloud sync on this device.',
      localSummary,
      cloudSummary,
    };
  }

  const reason =
    timeDiffMs > 1000
      ? localSummary.updatedAtMs > cloudSummary.updatedAtMs
        ? 'Local save was modified more recently than your cloud save, or contains different progress.'
        : 'Your GoGo Cloud Save is newer than the save on this device.'
      : 'Local save and GoGo Cloud Save contain different game progress.';

  return {
    status: 'conflict',
    reason,
    localSummary,
    cloudSummary,
  };
}

// =========================================================
// 5. Default LocalStorage Game Adapters
// =========================================================

interface CloudSyncMetaStore {
  arrowout?: { localUpdatedAtMs: number; lastSyncedAtMs: number };
  crystalquest?: { localUpdatedAtMs: number; lastSyncedAtMs: number };
}

function readSyncMeta(): CloudSyncMetaStore {
  try {
    const raw = localStorage.getItem(CLOUD_META_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function writeSyncMeta(gameId: SupportedGameId, patch: Partial<{ localUpdatedAtMs: number; lastSyncedAtMs: number }>) {
  try {
    const current = readSyncMeta();
    current[gameId] = {
      localUpdatedAtMs: patch.localUpdatedAtMs ?? current[gameId]?.localUpdatedAtMs ?? Date.now(),
      lastSyncedAtMs: patch.lastSyncedAtMs ?? current[gameId]?.lastSyncedAtMs ?? 0,
    };
    localStorage.setItem(CLOUD_META_STORAGE_KEY, JSON.stringify(current));
  } catch {
    // Ignore storage quota errors
  }
}

function createDefaultAdapters(): Record<SupportedGameId, GameAdapter> {
  return {
    arrowout: {
      gameId: 'arrowout',
      gameName: 'Arrow Out',
      schemaVersion: 2,
      getLocalSave: () => {
        try {
          const w = window as any;
          if (w.ArrowStorage && typeof w.ArrowStorage.getCloudSave === 'function') {
            return w.ArrowStorage.getCloudSave();
          }
          const raw = localStorage.getItem(ARROW_STORAGE_KEY);
          if (!raw) return null;
          return JSON.parse(raw);
        } catch {
          return null;
        }
      },
      getLocalUpdatedAtMs: () => {
        try {
          const w = window as any;
          if (w.ArrowStorage && typeof w.ArrowStorage.getLocalUpdatedAt === 'function') {
            const ts = w.ArrowStorage.getLocalUpdatedAt();
            if (ts > 0) return ts;
          }
          return readSyncMeta().arrowout?.localUpdatedAtMs || 0;
        } catch {
          return 0;
        }
      },
      applyCloudSave: (progress: Record<string, any>, updatedAtMs: number) => {
        const validated = validateGameSave('arrowout', progress);
        if (!validated.valid || !validated.sanitized) return;
        const clean = { ...validated.sanitized };
        delete clean.clientUpdatedAtMs;
        try {
          const w = window as any;
          if (w.ArrowStorage && typeof w.ArrowStorage.applyCloudSave === 'function') {
            w.ArrowStorage.applyCloudSave(clean, updatedAtMs);
          } else {
            localStorage.setItem(ARROW_STORAGE_KEY, JSON.stringify(clean));
          }
          writeSyncMeta('arrowout', { localUpdatedAtMs: updatedAtMs, lastSyncedAtMs: updatedAtMs });
        } catch {
          // Ignore offline/quota errors
        }
      },
      mergeProgress: (localSave, cloudSave) => mergeGameProgress('arrowout', localSave, cloudSave),
    },
    crystalquest: {
      gameId: 'crystalquest',
      gameName: 'Crystal Quest',
      schemaVersion: 2,
      getLocalSave: () => {
        try {
          const w = window as any;
          if (w.CQSave && typeof w.CQSave.getCloudSave === 'function') {
            return w.CQSave.getCloudSave();
          }
          const raw = localStorage.getItem(CRYSTAL_STORAGE_KEY);
          if (!raw) return null;
          return JSON.parse(raw);
        } catch {
          return null;
        }
      },
      getLocalUpdatedAtMs: () => {
        try {
          const w = window as any;
          if (w.CQSave && typeof w.CQSave.getLocalUpdatedAt === 'function') {
            const ts = w.CQSave.getLocalUpdatedAt();
            if (ts > 0) return ts;
          }
          const metaRaw = localStorage.getItem(CRYSTAL_META_KEY);
          if (metaRaw) {
            const meta = JSON.parse(metaRaw);
            if (meta && typeof meta.updatedAtMs === 'number') return meta.updatedAtMs;
          }
          return readSyncMeta().crystalquest?.localUpdatedAtMs || 0;
        } catch {
          return 0;
        }
      },
      applyCloudSave: (progress: Record<string, any>, updatedAtMs: number) => {
        const validated = validateGameSave('crystalquest', progress);
        if (!validated.valid || !validated.sanitized) return;
        const clean = { ...validated.sanitized };
        delete clean.clientUpdatedAtMs;
        try {
          const w = window as any;
          if (w.CQSave && typeof w.CQSave.applyCloudSave === 'function') {
            w.CQSave.applyCloudSave(clean, updatedAtMs);
          } else {
            localStorage.setItem(CRYSTAL_STORAGE_KEY, JSON.stringify(clean));
            localStorage.setItem(CRYSTAL_META_KEY, JSON.stringify({ updatedAtMs }));
          }
          writeSyncMeta('crystalquest', { localUpdatedAtMs: updatedAtMs, lastSyncedAtMs: updatedAtMs });
        } catch {
          // Ignore quota errors
        }
      },
      mergeProgress: (localSave, cloudSave) => mergeGameProgress('crystalquest', localSave, cloudSave),
    },
  };
}

// =========================================================
// 6. Firebase Service & GoGo Account + Marketing + Admin Controller
// =========================================================

class GoGoAccountManager {
  public app!: FirebaseApp;
  public auth!: Auth;
  public db!: Firestore;
  public currentUser: User | null = null;
  public userProfile: Record<string, any> | null = null;
  public subscriberProfile: Record<string, any> | null = null;
  public hasAdminDoc = false;
  public cloudSaves: Partial<
    Record<SupportedGameId, { progress: Record<string, any>; updatedAtMs: number; schemaVersion: number }>
  > = {};
  public conflictQueue: Array<{
    gameId: SupportedGameId;
    comparison: ConflictComparison;
    localData: Record<string, any>;
    cloudData: Record<string, any>;
  }> = [];
  public syncStatus: Record<SupportedGameId, 'idle' | 'syncing' | 'synced' | 'conflict' | 'offline' | 'error'> = {
    arrowout: 'idle',
    crystalquest: 'idle',
  };

  // Admin dashboard state
  public adminLoading = false;
  public adminError: string | null = null;
  public adminEntries: AdminDirectoryEntry[] = [];
  public adminActiveView: 'subscribers' | 'accounts' = 'subscribers';
  public adminFilterStatus: 'all' | 'subscribed' | 'unsubscribed' | 'no_consent' = 'subscribed';
  public adminSearchQuery = '';

  private adapters: Record<SupportedGameId, GameAdapter> = createDefaultAdapters();
  private activeModalTab: 'login' | 'register' | 'forgot' | 'profile' | 'conflict' | 'delete' = 'login';
  private isModalOpen = false;
  private statusMessage: { type: 'info' | 'success' | 'error'; text: string } | null = null;
  private debounceTimers: Partial<Record<SupportedGameId, ReturnType<typeof setTimeout>>> = {};
  private pendingOfflineSync: Set<SupportedGameId> = new Set();
  private listeners: Array<(user: User | null) => void> = [];
  private isInitialized = false;
  private pendingRegistrationConsent: boolean | null = null;

  public init() {
    if (this.isInitialized) return;
    this.isInitialized = true;

    const runtimeConfig = (window as any).GOGO_FIREBASE_CONFIG || firebaseAppletConfig;
    this.app = getApps().length ? getApp() : initializeApp(runtimeConfig);
    this.auth = getAuth(this.app);
    this.db = getFirestore(this.app, runtimeConfig.firestoreDatabaseId);

    setPersistence(this.auth, indexedDBLocalPersistence)
      .catch(() => setPersistence(this.auth, browserLocalPersistence))
      .catch((err) => {
        console.warn('[GoGoAccount] Auth persistence fallback warning:', err);
      });

    this.testConnection();

    onAuthStateChanged(this.auth, async (user) => {
      this.currentUser = user;
      if (user) {
        if (this.activeModalTab === 'login' || this.activeModalTab === 'register' || this.activeModalTab === 'forgot') {
          this.activeModalTab = 'profile';
        }
        const initialOptIn = this.pendingRegistrationConsent;
        this.pendingRegistrationConsent = null;
        await this.ensureUserProfileAndSubscriber(user, undefined, initialOptIn);
        await this.checkAdminRole(user);
        await this.syncAllGamesOnLogin();
        if (typeof document !== 'undefined' && document.getElementById('gogo-admin-page-root')) {
          if (this.isAdmin()) {
            await this.loadAdminDirectory();
          }
        }
      } else {
        this.userProfile = null;
        this.subscriberProfile = null;
        this.hasAdminDoc = false;
        this.cloudSaves = {};
        this.conflictQueue = [];
        this.adminEntries = [];
        this.syncStatus = { arrowout: 'idle', crystalquest: 'idle' };
        if (this.activeModalTab === 'profile' || this.activeModalTab === 'delete' || this.activeModalTab === 'conflict') {
          this.activeModalTab = 'login';
        }
      }
      this.notifyListeners();
      this.renderAllUI();
    });

    window.addEventListener('online', () => {
      if (this.currentUser && this.isCloudBackupEnabled()) {
        for (const gameId of Array.from(this.pendingOfflineSync)) {
          this.pendingOfflineSync.delete(gameId);
          this.syncGame(gameId, { silent: true });
        }
      }
      this.renderAllUI();
    });

    window.addEventListener('offline', () => {
      this.renderAllUI();
    });

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.mountDOM());
    } else {
      this.mountDOM();
    }
  }

  private async testConnection() {
    try {
      await getDocFromServer(doc(this.db, 'test', 'connection'));
    } catch (error) {
      if (error instanceof Error && error.message.includes('the client is offline')) {
        console.error('Please check your Firebase configuration. The client appears to be offline.');
      }
    }
  }

  public handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
    const errInfo: FirestoreErrorInfo = {
      error: error instanceof Error ? error.message : String(error),
      authInfo: {
        userId: this.auth?.currentUser?.uid,
        email: this.auth?.currentUser?.email,
        emailVerified: this.auth?.currentUser?.emailVerified,
        isAnonymous: this.auth?.currentUser?.isAnonymous,
        tenantId: this.auth?.currentUser?.tenantId,
        providerInfo:
          this.auth?.currentUser?.providerData.map((provider) => ({
            providerId: provider.providerId,
            displayName: provider.displayName,
            email: provider.email,
            photoUrl: provider.photoURL,
          })) || [],
      },
      operationType,
      path,
    };
    console.error('Firestore Error: ', JSON.stringify(errInfo));
    throw new Error(JSON.stringify(errInfo));
  }

  public isAdmin(): boolean {
    return isAuthorizedAdminUser(this.currentUser, this.hasAdminDoc);
  }

  private async checkAdminRole(user: User) {
    if (!navigator.onLine) return;
    if (isAuthorizedAdminUser(user, false)) {
      this.hasAdminDoc = true;
      return;
    }
    try {
      const adminSnap = await getDoc(doc(this.db, 'admins', user.uid));
      this.hasAdminDoc = adminSnap.exists();
    } catch {
      this.hasAdminDoc = false;
    }
  }

  public isCloudBackupEnabled(): boolean {
    try {
      const val = localStorage.getItem(CLOUD_ENABLED_STORAGE_KEY);
      if (val === null) return true;
      return val === 'true';
    } catch {
      return true;
    }
  }

  public setCloudBackupEnabled(enabled: boolean) {
    try {
      localStorage.setItem(CLOUD_ENABLED_STORAGE_KEY, enabled ? 'true' : 'false');
    } catch {
      // Ignore storage error
    }
    if (enabled && this.currentUser) {
      this.syncAllGamesOnLogin();
    }
    this.renderAllUI();
  }

  public registerGameAdapter(adapter: Partial<GameAdapter> & { gameId: SupportedGameId }) {
    const existing = this.adapters[adapter.gameId];
    this.adapters[adapter.gameId] = {
      ...existing,
      ...adapter,
    };
    if (this.currentUser && this.isCloudBackupEnabled()) {
      this.syncGame(adapter.gameId, { silent: true });
    }
  }

  public notifyLocalSaveModified(gameId: SupportedGameId, updatedAtMs = Date.now()) {
    writeSyncMeta(gameId, { localUpdatedAtMs: updatedAtMs });
    if (!this.currentUser || !this.isCloudBackupEnabled()) {
      this.renderAllUI();
      return;
    }
    if (this.conflictQueue.some((c) => c.gameId === gameId)) {
      this.renderAllUI();
      return;
    }
    if (this.debounceTimers[gameId]) {
      clearTimeout(this.debounceTimers[gameId]);
    }
    this.debounceTimers[gameId] = setTimeout(() => {
      this.uploadLocalToCloud(gameId, { silent: true });
    }, 1000);
  }

  public onAuthChange(cb: (user: User | null) => void) {
    this.listeners.push(cb);
    if (this.isInitialized) cb(this.currentUser);
  }

  private notifyListeners() {
    for (const cb of this.listeners) {
      try {
        cb(this.currentUser);
      } catch (e) {
        console.warn('[GoGoAccount] Listener error:', e);
      }
    }
  }

  // =========================================================
  // 7. User Profile & Marketing Subscriber Firestore Operations
  //    (/users/{uid} and /marketingSubscribers/{uid})
  // =========================================================

  private getPrimaryAuthProvider(user: User): 'password' | 'google.com' {
    const isGoogle = user.providerData.some((p) => p.providerId === 'google.com');
    return isGoogle ? 'google.com' : 'password';
  }

  public async ensureUserProfileAndSubscriber(
    user: User,
    customDisplayName?: string,
    explicitMarketingOptIn?: boolean | null
  ) {
    if (!navigator.onLine) return;

    const authProvider = this.getPrimaryAuthProvider(user);
    const userPath = `users/${user.uid}`;
    const subPath = `marketingSubscribers/${user.uid}`;
    const userRef = doc(this.db, 'users', user.uid);
    const subRef = doc(this.db, 'marketingSubscribers', user.uid);

    try {
      const [userSnap, subSnap] = await Promise.all([getDoc(userRef), getDoc(subRef)]);

      const displayName =
        (
          customDisplayName ||
          user.displayName ||
          (userSnap.exists() ? userSnap.data().displayName : '') ||
          (user.email ? user.email.split('@')[0] : 'GoGo Player')
        )
          .trim()
          .slice(0, 100) || 'GoGo Player';

      const email = (user.email || (userSnap.exists() ? userSnap.data().email : '') || 'player@gogocompany.in')
        .trim()
        .slice(0, 254);

      const rawPhoto = user.photoURL || (userSnap.exists() ? userSnap.data().photoURL : '') || '';
      const photoURL = /^https?:\/\//i.test(rawPhoto) ? rawPhoto.slice(0, 2048) : '';

      // Determine marketing subscription status:
      // 1. If subscriber record already exists, NEVER overwrite their existing choice on login!
      // 2. If new registration, only subscribe if explicitMarketingOptIn === true AND provider !== google.com auto-login
      let currentSubscribed = false;
      if (subSnap.exists()) {
        currentSubscribed = Boolean(subSnap.data().subscribed);
        this.subscriberProfile = subSnap.data();
        // If displayName changed, sync displayName while preserving consent/unsubscribe fields
        if (customDisplayName && subSnap.data().displayName !== displayName) {
          const prevSub = subSnap.data();
          const updatedSub = {
            email: prevSub.email || email,
            displayName,
            subscribed: Boolean(prevSub.subscribed),
            consentTimestamp: prevSub.consentTimestamp ?? null,
            consentVersion: prevSub.consentVersion || '',
            consentText: prevSub.consentText || '',
            source: prevSub.source || detectCurrentSourceSurface(),
            authProvider: prevSub.authProvider || authProvider,
            registeredAt: prevSub.registeredAt,
            updatedAt: serverTimestamp(),
            unsubscribedAt: prevSub.unsubscribedAt ?? null,
          };
          await setDoc(subRef, updatedSub);
          this.subscriberProfile = { ...prevSub, ...updatedSub, updatedAt: Timestamp.now() };
        }
      } else {
        // Creating initial marketingSubscribers/{uid} record
        // Google Sign-In is NEVER auto-subscribed. Email registration is ONLY subscribed if checkbox was checked.
        const optedIn = authProvider === 'google.com' ? false : Boolean(explicitMarketingOptIn === true);
        currentSubscribed = optedIn;
        const sourceSurface =
          authProvider === 'google.com'
            ? `google_signin_${detectCurrentSourceSurface()}`
            : `registration_${detectCurrentSourceSurface()}`;

        const createSubPayload = {
          email,
          displayName,
          subscribed: optedIn,
          consentTimestamp: optedIn ? serverTimestamp() : null,
          consentVersion: optedIn ? MARKETING_CONSENT_VERSION : '',
          consentText: optedIn ? MARKETING_CONSENT_TEXT : '',
          source: sourceSurface.slice(0, 64),
          authProvider,
          registeredAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          unsubscribedAt: null,
        };
        await setDoc(subRef, createSubPayload);
        this.subscriberProfile = {
          ...createSubPayload,
          consentTimestamp: optedIn ? Timestamp.now() : null,
          registeredAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        };
      }

      // Sync /users/{uid}
      if (!userSnap.exists()) {
        const createUserPayload = {
          displayName,
          email,
          photoURL,
          authProvider,
          marketingSubscribed: currentSubscribed,
          createdAt: serverTimestamp(),
          lastLoginAt: serverTimestamp(),
        };
        await setDoc(userRef, createUserPayload);
        this.userProfile = { ...createUserPayload, createdAt: Timestamp.now(), lastLoginAt: Timestamp.now() };
      } else {
        const prevUser = userSnap.data();
        const updateUserPayload = {
          displayName,
          email,
          photoURL,
          authProvider: prevUser.authProvider || authProvider,
          marketingSubscribed: currentSubscribed,
          createdAt: prevUser.createdAt,
          lastLoginAt: serverTimestamp(),
        };
        await setDoc(userRef, updateUserPayload);
        this.userProfile = { ...prevUser, ...updateUserPayload, lastLoginAt: Timestamp.now() };
      }
    } catch (error) {
      try {
        this.handleFirestoreError(error, OperationType.WRITE, `${userPath} | ${subPath}`);
      } catch {
        // Structured error logged
      }
    }
  }

  public async updateMarketingPreference(subscribe: boolean, source = detectCurrentSourceSurface()) {
    if (!this.currentUser) {
      this.setStatus('error', 'Please sign in to manage your email preferences.');
      return;
    }
    if (!navigator.onLine) {
      this.setStatus('error', 'You are currently offline. Please reconnect to update email preferences.');
      return;
    }

    const user = this.currentUser;
    const uid = user.uid;
    const subRef = doc(this.db, 'marketingSubscribers', uid);
    const userRef = doc(this.db, 'users', uid);
    const authProvider = this.getPrimaryAuthProvider(user);

    try {
      const [subSnap, userSnap] = await Promise.all([getDoc(subRef), getDoc(userRef)]);
      const displayName =
        (user.displayName || (userSnap.exists() ? userSnap.data().displayName : '') || 'GoGo Player')
          .trim()
          .slice(0, 100);
      const email = (user.email || (userSnap.exists() ? userSnap.data().email : '') || 'player@gogocompany.in')
        .trim()
        .slice(0, 254);

      if (!subSnap.exists()) {
        const payload = {
          email,
          displayName,
          subscribed: subscribe,
          consentTimestamp: subscribe ? serverTimestamp() : null,
          consentVersion: subscribe ? MARKETING_CONSENT_VERSION : '',
          consentText: subscribe ? MARKETING_CONSENT_TEXT : '',
          source: source.slice(0, 64),
          authProvider,
          registeredAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          unsubscribedAt: subscribe ? null : serverTimestamp(),
        };
        await setDoc(subRef, payload);
        this.subscriberProfile = {
          ...payload,
          consentTimestamp: subscribe ? Timestamp.now() : null,
          registeredAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
          unsubscribedAt: subscribe ? null : Timestamp.now(),
        };
      } else {
        const prev = subSnap.data();
        const payload = {
          email: prev.email || email,
          displayName: prev.displayName || displayName,
          subscribed: subscribe,
          // Preserve prior consentTimestamp/Version/Text on unsubscribe for accountability; set fresh on opt-in
          consentTimestamp: subscribe ? serverTimestamp() : prev.consentTimestamp ?? null,
          consentVersion: subscribe ? MARKETING_CONSENT_VERSION : prev.consentVersion || '',
          consentText: subscribe ? MARKETING_CONSENT_TEXT : prev.consentText || '',
          source: source.slice(0, 64),
          authProvider: prev.authProvider || authProvider,
          registeredAt: prev.registeredAt,
          updatedAt: serverTimestamp(),
          unsubscribedAt: subscribe ? null : serverTimestamp(),
        };
        await setDoc(subRef, payload);
        this.subscriberProfile = {
          ...prev,
          ...payload,
          consentTimestamp: subscribe ? Timestamp.now() : prev.consentTimestamp ?? null,
          updatedAt: Timestamp.now(),
          unsubscribedAt: subscribe ? null : Timestamp.now(),
        };
      }

      if (userSnap.exists()) {
        const prevUser = userSnap.data();
        await setDoc(userRef, {
          displayName: prevUser.displayName || displayName,
          email: prevUser.email || email,
          photoURL: prevUser.photoURL || '',
          authProvider: prevUser.authProvider || authProvider,
          marketingSubscribed: subscribe,
          createdAt: prevUser.createdAt,
          lastLoginAt: serverTimestamp(),
        });
        this.userProfile = { ...prevUser, marketingSubscribed: subscribe };
      }

      this.setStatus(
        'success',
        subscribe
          ? 'You are now subscribed to GoGo Games updates and promotional emails.'
          : 'You have been unsubscribed from GoGo promotional emails immediately.'
      );
      this.renderAllUI();
    } catch (error) {
      this.setStatus('error', 'Could not update your marketing subscription preference.');
      try {
        this.handleFirestoreError(error, OperationType.WRITE, `marketingSubscribers/${uid}`);
      } catch {
        // Logged
      }
    }
  }

  // =========================================================
  // 8. Admin Directory & CSV Export Operations (/admin/)
  // =========================================================

  public async loadAdminDirectory() {
    if (!this.currentUser || !this.isAdmin()) {
      this.adminError = 'Access Denied: Only authorized GoGo Administrators can access customer & subscriber data.';
      this.renderAllUI();
      return;
    }

    this.adminLoading = true;
    this.adminError = null;
    this.renderAllUI();

    try {
      const [usersSnap, subsSnap] = await Promise.all([
        getDocs(collection(this.db, 'users')),
        getDocs(collection(this.db, 'marketingSubscribers')),
      ]);

      const usersMap = new Map<string, Record<string, any>>();
      usersSnap.forEach((d) => usersMap.set(d.id, d.data()));

      const subsMap = new Map<string, Record<string, any>>();
      subsSnap.forEach((d) => subsMap.set(d.id, d.data()));

      const allUids = new Set<string>([...usersMap.keys(), ...subsMap.keys()]);
      const combined: AdminDirectoryEntry[] = [];

      for (const uid of allUids) {
        const u = usersMap.get(uid);
        const s = subsMap.get(uid);

        const toMs = (t: any): number => {
          if (!t) return 0;
          if (t instanceof Timestamp) return t.toMillis();
          if (typeof t.toMillis === 'function') return t.toMillis();
          if (typeof t.seconds === 'number') return t.seconds * 1000;
          if (typeof t === 'number') return t;
          return 0;
        };

        const registeredAtMs = toMs(s?.registeredAt) || toMs(u?.createdAt) || 0;
        const lastLoginAtMs = toMs(u?.lastLoginAt) || toMs(s?.updatedAt) || registeredAtMs;
        const subscribed = s ? Boolean(s.subscribed) : Boolean(u?.marketingSubscribed);
        const consentTimestampMs = toMs(s?.consentTimestamp) || null;
        const unsubscribedAtMs = toMs(s?.unsubscribedAt) || null;
        const authProvider: 'password' | 'google.com' =
          (s?.authProvider || u?.authProvider) === 'google.com' ? 'google.com' : 'password';

        combined.push({
          uid,
          email: String(s?.email || u?.email || ''),
          displayName: String(s?.displayName || u?.displayName || 'GoGo Player'),
          authProvider,
          registeredAtMs,
          lastLoginAtMs,
          subscribed,
          consentTimestampMs,
          consentVersion: String(s?.consentVersion || ''),
          consentText: String(s?.consentText || ''),
          source: String(s?.source || (u ? 'account_registration' : '')),
          unsubscribedAtMs,
        });
      }

      combined.sort((a, b) => b.registeredAtMs - a.registeredAtMs);
      this.adminEntries = combined;
      this.adminLoading = false;
      this.renderAllUI();
    } catch (error) {
      this.adminLoading = false;
      this.adminError = 'Permission denied by Firestore Security Rules or network error.';
      this.renderAllUI();
      try {
        this.handleFirestoreError(error, OperationType.LIST, 'users | marketingSubscribers');
      } catch {
        // Logged
      }
    }
  }

  public downloadAdminCsv(mode: 'marketing_only' | 'all_accounts') {
    if (!this.currentUser || !this.isAdmin()) {
      this.setStatus('error', 'Unauthorized: Only an administrator can export CSV files.');
      return;
    }

    const csvContent =
      mode === 'marketing_only'
        ? generateMarketingSubscribersCsv(this.adminEntries)
        : generateAllRegisteredAccountsCsv(this.adminEntries);

    const dateTag = new Date().toISOString().slice(0, 10);
    const filename =
      mode === 'marketing_only'
        ? `gogo-marketing-subscribers-${dateTag}.csv`
        : `gogo-all-registered-accounts-${dateTag}.csv`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  }

  // =========================================================
  // 9. Cloud Save Sync & Conflict Resolution (/gameProfiles/{uid}/games/{gameId})
  // =========================================================

  public async syncAllGamesOnLogin() {
    if (!this.currentUser) return;
    await Promise.all([
      this.syncGame('arrowout', { silent: true }),
      this.syncGame('crystalquest', { silent: true }),
    ]);
    if (this.conflictQueue.length > 0) {
      this.activeModalTab = 'conflict';
      this.openModal('conflict');
    }
    this.renderAllUI();
  }

  public async syncGame(gameId: SupportedGameId, opts: { silent?: boolean } = {}) {
    if (!this.currentUser) return;
    if (!navigator.onLine) {
      this.syncStatus[gameId] = 'offline';
      this.pendingOfflineSync.add(gameId);
      this.renderAllUI();
      return;
    }

    this.syncStatus[gameId] = 'syncing';
    this.renderAllUI();

    const uid = this.currentUser.uid;
    const path = `gameProfiles/${uid}/games/${gameId}`;
    const saveRef = doc(this.db, 'gameProfiles', uid, 'games', gameId);
    const adapter = this.adapters[gameId];

    try {
      const snap = await getDoc(saveRef);
      const localRaw = adapter.getLocalSave();
      const localUpdatedAtMs = adapter.getLocalUpdatedAtMs();
      const lastSyncedAtMs = readSyncMeta()[gameId]?.lastSyncedAtMs || 0;

      let cloudProgress: Record<string, any> | null = null;
      let cloudUpdatedAtMs = 0;

      if (snap.exists()) {
        const data = snap.data();
        const vCloud = validateGameSave(gameId, data.progress);
        if (vCloud.valid && vCloud.sanitized) {
          cloudProgress = vCloud.sanitized;
          const serverMs = data.updatedAt instanceof Timestamp ? data.updatedAt.toMillis() : 0;
          cloudUpdatedAtMs = cloudProgress.clientUpdatedAtMs || serverMs || Date.now();
          this.cloudSaves[gameId] = {
            progress: cloudProgress,
            updatedAtMs: cloudUpdatedAtMs,
            schemaVersion: data.schemaVersion || 2,
          };
        }
      } else {
        delete this.cloudSaves[gameId];
      }

      if (!this.isCloudBackupEnabled()) {
        this.syncStatus[gameId] = 'idle';
        this.renderAllUI();
        return;
      }

      const comparison = detectSaveConflict(
        gameId,
        localRaw,
        localUpdatedAtMs,
        cloudProgress,
        cloudUpdatedAtMs,
        lastSyncedAtMs
      );

      if (comparison.status === 'empty' || comparison.status === 'in_sync') {
        if (cloudUpdatedAtMs > 0) {
          writeSyncMeta(gameId, {
            localUpdatedAtMs: cloudUpdatedAtMs,
            lastSyncedAtMs: cloudUpdatedAtMs,
          });
        }
        this.syncStatus[gameId] = 'synced';
      } else if (comparison.status === 'upload_local' && localRaw) {
        await this.uploadLocalToCloud(gameId, { silent: opts.silent });
      } else if (comparison.status === 'restore_cloud' && cloudProgress) {
        adapter.applyCloudSave(cloudProgress, cloudUpdatedAtMs);
        this.syncStatus[gameId] = 'synced';
        if (!opts.silent) {
          this.setStatus('success', `Restored ${adapter.gameName} progress from GoGo Cloud.`);
        }
      } else if (comparison.status === 'conflict' && localRaw && cloudProgress) {
        this.syncStatus[gameId] = 'conflict';
        this.conflictQueue = this.conflictQueue.filter((c) => c.gameId !== gameId);
        this.conflictQueue.push({
          gameId,
          comparison,
          localData: localRaw,
          cloudData: cloudProgress,
        });
      }
    } catch (error) {
      this.syncStatus[gameId] = 'error';
      try {
        this.handleFirestoreError(error, OperationType.GET, path);
      } catch {
        // Logged structured error
      }
    }

    this.renderAllUI();
  }

  public async uploadLocalToCloud(gameId: SupportedGameId, opts: { silent?: boolean } = {}) {
    if (!this.currentUser) return false;
    if (!navigator.onLine) {
      this.syncStatus[gameId] = 'offline';
      this.pendingOfflineSync.add(gameId);
      this.renderAllUI();
      return false;
    }

    const adapter = this.adapters[gameId];
    const localRaw = adapter.getLocalSave();
    if (!localRaw) return false;

    const nowMs = Date.now();
    const localUpdatedAtMs = adapter.getLocalUpdatedAtMs() || nowMs;
    const validated = validateGameSave(gameId, {
      ...localRaw,
      clientUpdatedAtMs: localUpdatedAtMs,
    });

    if (!validated.valid || !validated.sanitized) {
      if (!opts.silent) {
        this.setStatus('error', validated.reason || 'Invalid save data format.');
      }
      return false;
    }

    const uid = this.currentUser.uid;
    const path = `gameProfiles/${uid}/games/${gameId}`;
    const saveRef = doc(this.db, 'gameProfiles', uid, 'games', gameId);

    this.syncStatus[gameId] = 'syncing';
    this.renderAllUI();

    try {
      const payload = {
        gameId,
        progress: validated.sanitized,
        updatedAt: serverTimestamp(),
        schemaVersion: adapter.schemaVersion || 2,
      };
      await setDoc(saveRef, payload);

      this.cloudSaves[gameId] = {
        progress: validated.sanitized,
        updatedAtMs: localUpdatedAtMs,
        schemaVersion: adapter.schemaVersion || 2,
      };
      writeSyncMeta(gameId, {
        localUpdatedAtMs,
        lastSyncedAtMs: localUpdatedAtMs,
      });
      this.conflictQueue = this.conflictQueue.filter((c) => c.gameId !== gameId);
      this.syncStatus[gameId] = 'synced';
      if (!opts.silent) {
        this.setStatus('success', `${adapter.gameName} backed up to GoGo Cloud.`);
      }
      this.renderAllUI();
      return true;
    } catch (error) {
      this.syncStatus[gameId] = 'error';
      if (!opts.silent) {
        this.setStatus('error', `Could not upload ${adapter.gameName} save to cloud.`);
      }
      this.renderAllUI();
      try {
        this.handleFirestoreError(error, OperationType.WRITE, path);
      } catch {
        return false;
      }
    }
  }

  public async resolveConflict(
    gameId: SupportedGameId,
    resolution: 'use_cloud' | 'keep_local' | 'smart_merge' | 'later'
  ) {
    const item = this.conflictQueue.find((c) => c.gameId === gameId);
    if (!item) return;

    const adapter = this.adapters[gameId];

    if (resolution === 'later') {
      this.conflictQueue = this.conflictQueue.filter((c) => c.gameId !== gameId);
      if (this.conflictQueue.length === 0) {
        this.activeModalTab = 'profile';
      }
      this.setStatus('info', `Kept ${adapter.gameName} in local-only mode for this session.`);
      this.renderAllUI();
      return;
    }

    if (resolution === 'use_cloud') {
      const cloudTs = item.comparison.cloudSummary.updatedAtMs || Date.now();
      adapter.applyCloudSave(item.cloudData, cloudTs);
      this.conflictQueue = this.conflictQueue.filter((c) => c.gameId !== gameId);
      this.syncStatus[gameId] = 'synced';
      this.setStatus('success', `Restored ${adapter.gameName} progress from GoGo Cloud.`);
    } else if (resolution === 'keep_local') {
      const now = Date.now();
      adapter.applyCloudSave(item.localData, now);
      await this.uploadLocalToCloud(gameId, { silent: false });
    } else if (resolution === 'smart_merge') {
      const merged = mergeGameProgress(gameId, item.localData, item.cloudData);
      const now = Date.now();
      adapter.applyCloudSave(merged, now);
      await this.uploadLocalToCloud(gameId, { silent: false });
      this.setStatus('success', `Merged local & cloud progress for ${adapter.gameName}!`);
    }

    if (this.conflictQueue.length === 0 && this.activeModalTab === 'conflict') {
      this.activeModalTab = 'profile';
    }
    this.renderAllUI();
  }

  // =========================================================
  // 10. Authentication Actions (Register, Login, Google, Reset, Logout, Delete)
  // =========================================================

  private formatAuthError(err: any): string {
    const code = String(err?.code || '');
    switch (code) {
      case 'auth/email-already-in-use':
        return 'An account with this email already exists. Try signing in instead.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/weak-password':
        return 'Password must be at least 6 characters long.';
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'Incorrect email or password. Please check your credentials and try again.';
      case 'auth/popup-closed-by-user':
        return 'Google sign-in popup was closed before completing login.';
      case 'auth/popup-blocked':
        return 'Sign-in popup was blocked by your browser. Please allow popups for this site.';
      case 'auth/unauthorized-domain':
        return 'This domain is not yet added to Firebase Authorized Domains. Add gogocompany.in in Firebase Console → Authentication → Settings → Authorized domains.';
      case 'auth/operation-not-allowed':
        return 'This sign-in provider is not enabled yet in Firebase Console → Authentication → Sign-in method.';
      case 'auth/requires-recent-login':
        return 'For your security, please re-enter your password or sign in with Google again before deleting your account.';
      case 'auth/network-request-failed':
        return 'Network error. Please check your internet connection — guest gameplay continues offline.';
      default:
        return err?.message || 'Authentication request failed. Please try again.';
    }
  }

  public async registerWithEmail(
    displayName: string,
    email: string,
    password: string,
    marketingOptIn = false
  ) {
    const cleanName = displayName.trim();
    const cleanEmail = email.trim();
    if (!cleanName || cleanName.length > 100) {
      this.setStatus('error', 'Please enter a display name (1 to 100 characters).');
      return;
    }
    if (password.length < 6) {
      this.setStatus('error', 'Password must be at least 6 characters.');
      return;
    }
    this.setStatus('info', 'Creating your GoGo Account...');
    this.pendingRegistrationConsent = Boolean(marketingOptIn);
    try {
      const cred = await createUserWithEmailAndPassword(this.auth, cleanEmail, password);
      await updateProfile(cred.user, { displayName: cleanName });
      await this.ensureUserProfileAndSubscriber(cred.user, cleanName, Boolean(marketingOptIn));
      this.activeModalTab = 'profile';
      this.setStatus(
        'success',
        `Welcome to GoGo, ${cleanName}! Your account is ready.${
          marketingOptIn ? ' You are subscribed to GoGo Games updates.' : ''
        }`
      );
      this.renderAllUI();
    } catch (err) {
      this.pendingRegistrationConsent = null;
      this.setStatus('error', this.formatAuthError(err));
    }
  }

  public async loginWithEmail(email: string, password: string) {
    this.setStatus('info', 'Signing in to your GoGo Account...');
    try {
      await signInWithEmailAndPassword(this.auth, email.trim(), password);
      this.activeModalTab = 'profile';
      this.setStatus('success', 'Signed in! Syncing your game progress...');
      this.renderAllUI();
    } catch (err) {
      this.setStatus('error', this.formatAuthError(err));
    }
  }

  public async loginWithGoogle() {
    this.setStatus('info', 'Opening Google Sign-In...');
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const cred = await signInWithPopup(this.auth, provider);
      // Google sign-in NEVER auto-subscribes the user to marketing
      await this.ensureUserProfileAndSubscriber(cred.user, undefined, false);
      this.activeModalTab = 'profile';
      this.setStatus('success', `Signed in as ${cred.user.displayName || cred.user.email}!`);
      this.renderAllUI();
    } catch (err) {
      this.setStatus('error', this.formatAuthError(err));
    }
  }

  public async sendPasswordReset(email: string) {
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      this.setStatus('error', 'Please enter your account email address.');
      return;
    }
    this.setStatus('info', 'Sending password reset email...');
    try {
      await sendPasswordResetEmail(this.auth, cleanEmail);
      this.setStatus('success', `Password reset instructions sent to ${cleanEmail}. Check your inbox!`);
    } catch (err) {
      this.setStatus('error', this.formatAuthError(err));
    }
  }

  public async updateDisplayName(newName: string) {
    if (!this.currentUser) return;
    const clean = newName.trim().slice(0, 100);
    if (!clean) {
      this.setStatus('error', 'Display name cannot be empty.');
      return;
    }
    try {
      await updateProfile(this.currentUser, { displayName: clean });
      await this.ensureUserProfileAndSubscriber(this.currentUser, clean);
      this.setStatus('success', 'Display name updated!');
      this.renderAllUI();
    } catch (err) {
      this.setStatus('error', this.formatAuthError(err));
    }
  }

  public async logout() {
    try {
      await signOut(this.auth);
      this.activeModalTab = 'login';
      this.setStatus('info', 'Signed out. Your local game saves remain safely on this device.');
      this.renderAllUI();
    } catch (err) {
      this.setStatus('error', this.formatAuthError(err));
    }
  }

  public async deleteAccountAndData(reauthPassword?: string) {
    const user = this.auth.currentUser;
    if (!user) return;
    const uid = user.uid;

    this.setStatus('info', 'Deleting your cloud saves, subscriber record, and GoGo Account...');
    try {
      if (reauthPassword && user.email) {
        const credential = EmailAuthProvider.credential(user.email, reauthPassword);
        await reauthenticateWithCredential(user, credential);
      }

      // 1. Delete Cloud Game Saves
      for (const gameId of ['arrowout', 'crystalquest'] as SupportedGameId[]) {
        const gameRef = doc(this.db, 'gameProfiles', uid, 'games', gameId);
        try {
          await deleteDoc(gameRef);
        } catch (err) {
          try {
            this.handleFirestoreError(err, OperationType.DELETE, `gameProfiles/${uid}/games/${gameId}`);
          } catch {
            // Continue cleanup
          }
        }
      }

      // 2. Delete Marketing Subscriber Record
      const subRef = doc(this.db, 'marketingSubscribers', uid);
      try {
        await deleteDoc(subRef);
      } catch (err) {
        try {
          this.handleFirestoreError(err, OperationType.DELETE, `marketingSubscribers/${uid}`);
        } catch {
          // Continue cleanup
        }
      }

      // 3. Delete User Profile Document
      const userRef = doc(this.db, 'users', uid);
      try {
        await deleteDoc(userRef);
      } catch (err) {
        try {
          this.handleFirestoreError(err, OperationType.DELETE, `users/${uid}`);
        } catch {
          // Continue cleanup
        }
      }

      // 4. Delete Firebase Auth User
      await deleteUser(user);

      this.currentUser = null;
      this.userProfile = null;
      this.subscriberProfile = null;
      this.cloudSaves = {};
      this.activeModalTab = 'login';
      this.setStatus(
        'success',
        'Your GoGo Account and cloud data have been permanently deleted. Local device progress was preserved.'
      );
      this.renderAllUI();
    } catch (err: any) {
      if (err?.code === 'auth/requires-recent-login') {
        const usesGoogle = user.providerData.some((p) => p.providerId === 'google.com');
        if (usesGoogle && !reauthPassword) {
          try {
            await reauthenticateWithPopup(user, new GoogleAuthProvider());
            await this.deleteAccountAndData();
            return;
          } catch (reauthErr) {
            this.setStatus('error', this.formatAuthError(reauthErr));
            return;
          }
        }
      }
      this.setStatus('error', this.formatAuthError(err));
    }
  }

  // =========================================================
  // 11. UI Rendering (Modal, /account/, /unsubscribe/, /admin/)
  // =========================================================

  public setStatus(type: 'info' | 'success' | 'error', text: string) {
    this.statusMessage = { type, text };
    this.renderAllUI();
  }

  public openModal(tab?: 'login' | 'register' | 'forgot' | 'profile' | 'conflict' | 'delete') {
    if (tab) {
      this.activeModalTab = tab;
    } else {
      this.activeModalTab = this.currentUser
        ? this.conflictQueue.length > 0
          ? 'conflict'
          : 'profile'
        : 'login';
    }
    this.statusMessage = null;
    this.isModalOpen = true;
    this.renderAllUI();
  }

  public closeModal() {
    this.isModalOpen = false;
    this.renderAllUI();
  }

  private mountDOM() {
    if (!document.getElementById('gogo-account-modal-backdrop')) {
      const backdrop = document.createElement('div');
      backdrop.id = 'gogo-account-modal-backdrop';
      backdrop.className = 'gogo-modal-backdrop';
      backdrop.setAttribute('aria-hidden', 'true');
      backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) this.closeModal();
      });
      document.body.appendChild(backdrop);
    }

    document.addEventListener('click', (e) => {
      const target = (e.target as HTMLElement)?.closest<HTMLElement>(
        '[data-gogo-open-account], [data-gogo-action], [data-gogo-tab]'
      );
      if (!target) return;

      if (target.hasAttribute('data-gogo-open-account')) {
        e.preventDefault();
        const tabAttr = target.getAttribute('data-gogo-open-account');
        const requestedTab =
          tabAttr === 'login' || tabAttr === 'register' || tabAttr === 'profile' || tabAttr === 'conflict'
            ? tabAttr
            : undefined;
        this.openModal(requestedTab);
        return;
      }

      const tab = target.getAttribute('data-gogo-tab') as any;
      if (tab) {
        e.preventDefault();
        this.statusMessage = null;
        this.activeModalTab = tab;
        this.renderAllUI();
        return;
      }

      const action = target.getAttribute('data-gogo-action');
      if (!action) return;
      e.preventDefault();

      switch (action) {
        case 'close-modal':
          this.closeModal();
          break;
        case 'google-login':
          this.loginWithGoogle();
          break;
        case 'logout':
          this.logout();
          break;
        case 'toggle-cloud':
          this.setCloudBackupEnabled(!this.isCloudBackupEnabled());
          break;
        case 'subscribe-marketing': {
          const src = target.getAttribute('data-source') || detectCurrentSourceSurface();
          this.updateMarketingPreference(true, src);
          break;
        }
        case 'unsubscribe-marketing': {
          const src = target.getAttribute('data-source') || detectCurrentSourceSurface();
          this.updateMarketingPreference(false, src);
          break;
        }
        case 'admin-switch-view': {
          const v = target.getAttribute('data-view') as 'subscribers' | 'accounts';
          if (v) {
            this.adminActiveView = v;
            this.adminFilterStatus = v === 'subscribers' ? 'subscribed' : 'all';
            this.renderAllUI();
          }
          break;
        }
        case 'admin-filter-status': {
          const st = target.getAttribute('data-status') as any;
          if (st) {
            this.adminFilterStatus = st;
            this.renderAllUI();
          }
          break;
        }
        case 'admin-refresh':
          this.loadAdminDirectory();
          break;
        case 'admin-export-marketing-csv':
          this.downloadAdminCsv('marketing_only');
          break;
        case 'admin-export-accounts-csv':
          this.downloadAdminCsv('all_accounts');
          break;
        case 'sync-game': {
          const gId = target.getAttribute('data-game-id') as SupportedGameId;
          if (gId) this.syncGame(gId, { silent: false });
          break;
        }
        case 'upload-game': {
          const gId = target.getAttribute('data-game-id') as SupportedGameId;
          if (gId) this.uploadLocalToCloud(gId, { silent: false });
          break;
        }
        case 'resolve-conflict': {
          const gId = target.getAttribute('data-game-id') as SupportedGameId;
          const choice = target.getAttribute('data-choice') as any;
          if (gId && choice) this.resolveConflict(gId, choice);
          break;
        }
      }
    });

    document.addEventListener('input', (e) => {
      const input = e.target as HTMLInputElement;
      if (input && input.id === 'gogo-admin-search-input') {
        this.adminSearchQuery = input.value;
        this.renderAdminTableOnly();
      }
    });

    document.addEventListener('submit', (e) => {
      const form = (e.target as HTMLElement)?.closest<HTMLFormElement>('form[data-gogo-form]');
      if (!form) return;
      e.preventDefault();
      const formType = form.getAttribute('data-gogo-form');
      const fd = new FormData(form);

      if (formType === 'login') {
        this.loginWithEmail(String(fd.get('email') || ''), String(fd.get('password') || ''));
      } else if (formType === 'register') {
        const marketingConsent = fd.get('marketingConsent') === 'yes';
        this.registerWithEmail(
          String(fd.get('displayName') || ''),
          String(fd.get('email') || ''),
          String(fd.get('password') || ''),
          marketingConsent
        );
      } else if (formType === 'forgot') {
        this.sendPasswordReset(String(fd.get('email') || ''));
      } else if (formType === 'update-profile') {
        this.updateDisplayName(String(fd.get('displayName') || ''));
      } else if (formType === 'delete-account') {
        this.deleteAccountAndData(String(fd.get('password') || ''));
      }
    });

    this.renderAllUI();
  }

  private escapeHtml(str: unknown): string {
    return String(str ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  private formatTimestamp(ms: number): string {
    if (!ms || ms <= 0) return 'Never';
    try {
      return new Date(ms).toLocaleString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Recently';
    }
  }

  private renderDashboardHtml(isEmbeddedPage: boolean): string {
    const user = this.currentUser;
    const statusHtml = this.statusMessage
      ? `<div class="gogo-alert gogo-alert-${this.statusMessage.type}" role="status">${this.escapeHtml(
          this.statusMessage.text
        )}</div>`
      : '';

    const closeBtnHtml = isEmbeddedPage
      ? ''
      : `<button type="button" class="gogo-modal-close" data-gogo-action="close-modal" aria-label="Close GoGo Account">✕</button>`;

    if (!user) {
      const tab =
        this.activeModalTab === 'register' || this.activeModalTab === 'forgot'
          ? this.activeModalTab
          : 'login';

      return `
        <div class="gogo-account-card ${isEmbeddedPage ? 'gogo-account-card-page' : ''}">
          <div class="gogo-account-header">
            <div class="gogo-brand-badge">
              <span class="gogo-brand-dot"></span>
              <span>GOGO ACCOUNT</span>
            </div>
            ${closeBtnHtml}
          </div>
          <h2 class="gogo-account-title">
            ${
              tab === 'login'
                ? 'Sign in to GoGo'
                : tab === 'register'
                ? 'Create GoGo Account'
                : 'Reset Your Password'
            }
          </h2>
          <p class="gogo-account-subtitle">
            One account for GoGo Games, Arrow Out &amp; Crystal Quest with automatic cloud save backup.
          </p>

          <div class="gogo-tab-bar" role="tablist">
            <button type="button" role="tab" class="gogo-tab-btn ${tab === 'login' ? 'active' : ''}" data-gogo-tab="login">Sign In</button>
            <button type="button" role="tab" class="gogo-tab-btn ${tab === 'register' ? 'active' : ''}" data-gogo-tab="register">Register</button>
            <button type="button" role="tab" class="gogo-tab-btn ${tab === 'forgot' ? 'active' : ''}" data-gogo-tab="forgot">Reset Password</button>
          </div>

          ${statusHtml}

          ${
            tab === 'login'
              ? `
            <form data-gogo-form="login" class="gogo-form">
              <label class="gogo-field">
                <span>Email Address</span>
                <input type="email" name="email" required autocomplete="email" placeholder="you@example.com" />
              </label>
              <label class="gogo-field">
                <span>Password</span>
                <input type="password" name="password" required autocomplete="current-password" minlength="6" placeholder="••••••••" />
              </label>
              <button type="submit" class="gogo-btn gogo-btn-primary">Sign In</button>
            </form>
          `
              : tab === 'register'
              ? `
            <form data-gogo-form="register" class="gogo-form">
              <label class="gogo-field">
                <span>Player Display Name</span>
                <input type="text" name="displayName" required maxlength="100" autocomplete="name" placeholder="PlayerOne" />
              </label>
              <label class="gogo-field">
                <span>Email Address</span>
                <input type="email" name="email" required autocomplete="email" placeholder="you@example.com" />
              </label>
              <label class="gogo-field">
                <span>Password (6+ characters)</span>
                <input type="password" name="password" required autocomplete="new-password" minlength="6" placeholder="Create a strong password" />
              </label>
              <label class="gogo-consent-checkbox">
                <input type="checkbox" name="marketingConsent" value="yes" />
                <span>${this.escapeHtml(MARKETING_CONSENT_TEXT)} <em>(Optional)</em></span>
              </label>
              <button type="submit" class="gogo-btn gogo-btn-primary">Create GoGo Account</button>
            </form>
          `
              : `
            <form data-gogo-form="forgot" class="gogo-form">
              <label class="gogo-field">
                <span>Account Email Address</span>
                <input type="email" name="email" required autocomplete="email" placeholder="you@example.com" />
              </label>
              <button type="submit" class="gogo-btn gogo-btn-primary">Send Password Reset Link</button>
            </form>
          `
          }

          <div class="gogo-divider"><span>OR CONTINUE WITH</span></div>

          <button type="button" class="gogo-btn gogo-btn-google" data-gogo-action="google-login">
            <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            <span>Continue with Google</span>
          </button>

          <p class="gogo-guest-note">
            Google sign-in never subscribes you to promotional emails automatically. Guest gameplay always works offline.
          </p>
        </div>
      `;
    }

    const displayName =
      user.displayName || this.userProfile?.displayName || user.email?.split('@')[0] || 'GoGo Player';
    const email = user.email || this.userProfile?.email || '';
    const initial = displayName.charAt(0).toUpperCase();
    const cloudEnabled = this.isCloudBackupEnabled();
    const isMarketingSubscribed = Boolean(this.subscriberProfile?.subscribed);

    if (this.activeModalTab === 'conflict' && this.conflictQueue.length > 0) {
      const conflict = this.conflictQueue[0];
      const adapter = this.adapters[conflict.gameId];
      return `
        <div class="gogo-account-card ${isEmbeddedPage ? 'gogo-account-card-page' : ''}">
          <div class="gogo-account-header">
            <div class="gogo-brand-badge gogo-badge-warn">
              <span class="gogo-brand-dot"></span>
              <span>SAVE CONFLICT DETECTED</span>
            </div>
            ${closeBtnHtml}
          </div>
          <h2 class="gogo-account-title">${this.escapeHtml(adapter.gameName)} Save Choice</h2>
          <p class="gogo-account-subtitle">${this.escapeHtml(conflict.comparison.reason)}</p>
          ${statusHtml}

          <div class="gogo-conflict-grid">
            <div class="gogo-conflict-box">
              <div class="gogo-conflict-tag">THIS DEVICE (LOCAL)</div>
              <h4>${this.escapeHtml(conflict.comparison.localSummary.headline)}</h4>
              <p>${this.escapeHtml(conflict.comparison.localSummary.subline)}</p>
              <span class="gogo-conflict-time">Updated: ${this.escapeHtml(
                this.formatTimestamp(conflict.comparison.localSummary.updatedAtMs)
              )}</span>
              <button type="button" class="gogo-btn gogo-btn-secondary" data-gogo-action="resolve-conflict" data-game-id="${
                conflict.gameId
              }" data-choice="keep_local">
                Keep Local &amp; Upload
              </button>
            </div>

            <div class="gogo-conflict-box">
              <div class="gogo-conflict-tag gogo-tag-cloud">GOGO CLOUD SAVE</div>
              <h4>${this.escapeHtml(conflict.comparison.cloudSummary.headline)}</h4>
              <p>${this.escapeHtml(conflict.comparison.cloudSummary.subline)}</p>
              <span class="gogo-conflict-time">Updated: ${this.escapeHtml(
                this.formatTimestamp(conflict.comparison.cloudSummary.updatedAtMs)
              )}</span>
              <button type="button" class="gogo-btn gogo-btn-secondary" data-gogo-action="resolve-conflict" data-game-id="${
                conflict.gameId
              }" data-choice="use_cloud">
                Restore Cloud Save
              </button>
            </div>
          </div>

          <div class="gogo-conflict-actions">
            <button type="button" class="gogo-btn gogo-btn-primary" data-gogo-action="resolve-conflict" data-game-id="${
              conflict.gameId
            }" data-choice="smart_merge">
              Smart Merge Both (Recommended — Keeps Highest Stage &amp; All Stars)
            </button>
            <button type="button" class="gogo-btn gogo-btn-ghost" data-gogo-action="resolve-conflict" data-game-id="${
              conflict.gameId
            }" data-choice="later">
              Decide Later (Stay Local for Now)
            </button>
          </div>
        </div>
      `;
    }

    if (this.activeModalTab === 'delete') {
      const hasPasswordProvider = user.providerData.some((p) => p.providerId === 'password');
      return `
        <div class="gogo-account-card ${isEmbeddedPage ? 'gogo-account-card-page' : ''}">
          <div class="gogo-account-header">
            <div class="gogo-brand-badge gogo-badge-danger">
              <span class="gogo-brand-dot"></span>
              <span>DELETE GOGO ACCOUNT</span>
            </div>
            ${closeBtnHtml}
          </div>
          <h2 class="gogo-account-title">Permanently Delete Account?</h2>
          <p class="gogo-account-subtitle">
            This will permanently delete your GoGo Account profile (<strong>${this.escapeHtml(
              email
            )}</strong>), marketing subscription record, and cloud backups for Arrow Out and Crystal Quest from Firestore. Your local device saves will not be erased.
          </p>
          ${statusHtml}
          <form data-gogo-form="delete-account" class="gogo-form">
            ${
              hasPasswordProvider
                ? `
              <label class="gogo-field">
                <span>Confirm Your Password to Delete</span>
                <input type="password" name="password" required autocomplete="current-password" placeholder="Enter your password" />
              </label>
            `
                : ''
            }
            <button type="submit" class="gogo-btn gogo-btn-danger">Permanently Delete My Account &amp; Cloud Data</button>
            <button type="button" class="gogo-btn gogo-btn-ghost" data-gogo-tab="profile">Cancel &amp; Return to Profile</button>
          </form>
        </div>
      `;
    }

    const gameCardsHtml = (['arrowout', 'crystalquest'] as SupportedGameId[])
      .map((gameId) => {
        const adapter = this.adapters[gameId];
        const localRaw = adapter.getLocalSave();
        const localSummary = summarizeProgress(gameId, localRaw, adapter.getLocalUpdatedAtMs());
        const cloudInfo = this.cloudSaves[gameId];
        const cloudSummary = summarizeProgress(gameId, cloudInfo?.progress, cloudInfo?.updatedAtMs);
        const status = this.syncStatus[gameId];
        const hasConflict = this.conflictQueue.some((c) => c.gameId === gameId);
        const playHref = gameId === 'arrowout' ? '/arrowout/' : '/crystalquest/';

        const badgeLabel = !navigator.onLine
          ? 'Offline (Local Saved)'
          : hasConflict
          ? 'Conflict Needs Choice'
          : status === 'syncing'
          ? 'Syncing...'
          : cloudInfo
          ? 'Cloud Synced'
          : 'Local Only';

        return `
          <div class="gogo-game-save-card">
            <div class="gogo-game-save-top">
              <div>
                <h4>${this.escapeHtml(adapter.gameName)}</h4>
                <span class="gogo-sync-pill gogo-sync-${hasConflict ? 'conflict' : status}">${this.escapeHtml(
          badgeLabel
        )}</span>
              </div>
              <a href="${playHref}" class="gogo-mini-link">Play →</a>
            </div>
            <div class="gogo-save-stats">
              <div>
                <small>This Device</small>
                <strong>${this.escapeHtml(localSummary.headline)}</strong>
                <span>${this.escapeHtml(localSummary.subline)}</span>
              </div>
              <div>
                <small>Cloud Backup</small>
                <strong>${this.escapeHtml(cloudInfo ? cloudSummary.headline : 'No Cloud Backup Yet')}</strong>
                <span>${this.escapeHtml(
                  cloudInfo
                    ? `${cloudSummary.subline} • ${this.formatTimestamp(cloudSummary.updatedAtMs)}`
                    : 'Click Sync Now to upload'
                )}</span>
              </div>
            </div>
            <div class="gogo-game-save-actions">
              ${
                hasConflict
                  ? `<button type="button" class="gogo-btn gogo-btn-warn gogo-btn-sm" data-gogo-tab="conflict">Resolve Conflict</button>`
                  : `
                <button type="button" class="gogo-btn gogo-btn-secondary gogo-btn-sm" data-gogo-action="sync-game" data-game-id="${gameId}">
                  Sync Now
                </button>
                <button type="button" class="gogo-btn gogo-btn-ghost gogo-btn-sm" data-gogo-action="upload-game" data-game-id="${gameId}">
                  Force Upload Local
                </button>
              `
              }
            </div>
          </div>
        `;
      })
      .join('');

    const adminBannerHtml = this.isAdmin()
      ? `
      <div class="gogo-admin-shortcut">
        <div>
          <strong>GoGo Admin Access Verified</strong>
          <span>Manage registered accounts, marketing subscribers &amp; CSV exports</span>
        </div>
        <a href="/admin/" class="gogo-btn gogo-btn-primary gogo-btn-sm">Open Admin Dashboard →</a>
      </div>
    `
      : '';

    return `
      <div class="gogo-account-card ${isEmbeddedPage ? 'gogo-account-card-page' : ''}">
        <div class="gogo-account-header">
          <div class="gogo-brand-badge">
            <span class="gogo-brand-dot"></span>
            <span>GOGO ACCOUNT ACTIVE</span>
          </div>
          ${closeBtnHtml}
        </div>

        <div class="gogo-profile-banner">
          <div class="gogo-avatar">${this.escapeHtml(initial)}</div>
          <div class="gogo-profile-meta">
            <h3>${this.escapeHtml(displayName)}</h3>
            <p>${this.escapeHtml(email)}</p>
          </div>
          <button type="button" class="gogo-btn gogo-btn-ghost gogo-btn-sm" data-gogo-action="logout">Sign Out</button>
        </div>

        ${statusHtml}
        ${adminBannerHtml}

        <form data-gogo-form="update-profile" class="gogo-inline-form">
          <input type="text" name="displayName" value="${this.escapeHtml(
            displayName
          )}" maxlength="100" required aria-label="Display Name" placeholder="Display Name" />
          <button type="submit" class="gogo-btn gogo-btn-secondary gogo-btn-sm">Update Name</button>
        </form>

        <div class="gogo-cloud-toggle-row">
          <div>
            <strong>Automatic Cloud Save Backup</strong>
            <p>Sync progress across GoGo Website, Arrow Out &amp; Crystal Quest</p>
          </div>
          <button type="button" class="gogo-switch ${cloudEnabled ? 'on' : ''}" data-gogo-action="toggle-cloud" aria-pressed="${cloudEnabled}">
            <span class="gogo-switch-knob"></span>
          </button>
        </div>

        <div class="gogo-cloud-toggle-row">
          <div>
            <strong>GoGo Games Promotional Emails</strong>
            <p>${
              isMarketingSubscribed
                ? 'Subscribed to new game announcements, updates &amp; special offers.'
                : 'Not subscribed to promotional emails. You can opt in or unsubscribe anytime.'
            }</p>
          </div>
          ${
            isMarketingSubscribed
              ? `<button type="button" class="gogo-btn gogo-btn-ghost gogo-btn-sm" data-gogo-action="unsubscribe-marketing" data-source="account_profile">Unsubscribe</button>`
              : `<button type="button" class="gogo-btn gogo-btn-secondary gogo-btn-sm" data-gogo-action="subscribe-marketing" data-source="account_profile">Subscribe</button>`
          }
        </div>

        <div class="gogo-games-section">
          <div class="gogo-section-header">
            <span>CONNECTED GAME PROGRESS</span>
            <span>${navigator.onLine ? 'Online' : 'Offline Mode'}</span>
          </div>
          ${gameCardsHtml}
        </div>

        <div class="gogo-account-footer">
          <a href="/unsubscribe/" class="gogo-footer-subtle-link">Email Unsubscribe Center</a>
          <span>·</span>
          <button type="button" class="gogo-danger-link" data-gogo-tab="delete">Delete Account &amp; Cloud Data...</button>
        </div>
      </div>
    `;
  }

  private renderUnsubscribePageHtml(): string {
    const user = this.currentUser;
    const statusHtml = this.statusMessage
      ? `<div class="gogo-alert gogo-alert-${this.statusMessage.type}" role="status">${this.escapeHtml(
          this.statusMessage.text
        )}</div>`
      : '';

    if (!user) {
      return `
        <div class="gogo-account-card gogo-account-card-page">
          <h2 class="gogo-account-title">Manage Email Preferences &amp; Unsubscribe</h2>
          <p class="gogo-account-subtitle">
            Sign in to your GoGo Account to immediately unsubscribe from promotional emails or review your consent record.
          </p>
          ${statusHtml}
          <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:14px;">
            <button type="button" class="gogo-btn gogo-btn-primary" data-gogo-open-account="login" data-gogo-custom-label="true">
              Sign In to Unsubscribe
            </button>
          </div>
        </div>
      `;
    }

    const isSubscribed = Boolean(this.subscriberProfile?.subscribed);
    const email = user.email || this.subscriberProfile?.email || '';

    return `
      <div class="gogo-account-card gogo-account-card-page">
        <h2 class="gogo-account-title">GoGo Email Subscription Preferences</h2>
        <p class="gogo-account-subtitle">
          Account: <strong>${this.escapeHtml(email)}</strong> · Current Status: <strong>${
      isSubscribed ? 'Subscribed (Opted-In)' : 'Unsubscribed (No Promotional Emails)'
    }</strong>
        </p>
        ${statusHtml}
        <div class="gogo-unsubscribe-box">
          <p style="margin:0 0 14px;color:#cbd5e1;font-size:0.92rem;line-height:1.5;">
            ${
              isSubscribed
                ? 'You are currently opted in to receive GoGo Games news, new game announcements, updates, and special offers. Click below to unsubscribe immediately.'
                : 'You are not receiving promotional emails from GoGo Company. Your game saves and GoGo Account remain fully active.'
            }
          </p>
          <div style="display:flex;gap:10px;flex-wrap:wrap;">
            ${
              isSubscribed
                ? `<button type="button" class="gogo-btn gogo-btn-danger" data-gogo-action="unsubscribe-marketing" data-source="unsubscribe_page">Unsubscribe Immediately</button>`
                : `<button type="button" class="gogo-btn gogo-btn-secondary" data-gogo-action="subscribe-marketing" data-source="unsubscribe_page">Opt In to GoGo Games Updates</button>`
            }
            <a href="/account/" class="gogo-btn gogo-btn-ghost">Back to GoGo Account</a>
          </div>
        </div>
      </div>
    `;
  }

  private getFilteredAdminEntries(): AdminDirectoryEntry[] {
    const q = this.adminSearchQuery.trim().toLowerCase();
    return this.adminEntries.filter((entry) => {
      if (this.adminFilterStatus === 'subscribed' && !entry.subscribed) return false;
      if (this.adminFilterStatus === 'unsubscribed' && (entry.subscribed || !entry.unsubscribedAtMs)) return false;
      if (this.adminFilterStatus === 'no_consent' && (entry.subscribed || entry.unsubscribedAtMs)) return false;

      if (q) {
        const matchEmail = entry.email.toLowerCase().includes(q);
        const matchName = entry.displayName.toLowerCase().includes(q);
        const matchSource = (entry.source || '').toLowerCase().includes(q);
        if (!matchEmail && !matchName && !matchSource) return false;
      }
      return true;
    });
  }

  private renderAdminTableRowsHtml(): string {
    const filtered = this.getFilteredAdminEntries();
    if (filtered.length === 0) {
      return `
        <tr>
          <td colspan="6" style="text-align:center;padding:28px;color:#94a3b8;">
            No matching records found for the current filter.
          </td>
        </tr>
      `;
    }

    return filtered
      .map((item) => {
        const statusText = item.subscribed
          ? 'Yes (Subscribed)'
          : item.unsubscribedAtMs
          ? 'Unsubscribed'
          : 'No Consent';
        const statusClass = item.subscribed
          ? 'gogo-admin-status-yes'
          : item.unsubscribedAtMs
          ? 'gogo-admin-status-unsub'
          : 'gogo-admin-status-no';

        return `
          <tr>
            <td class="gogo-mono-cell">${this.escapeHtml(item.email)}</td>
            <td>${this.escapeHtml(item.displayName)}</td>
            <td class="gogo-mono-cell">${this.escapeHtml(formatIsoDateForCsv(item.registeredAtMs) || '—')}</td>
            <td><span class="${statusClass}">${this.escapeHtml(statusText)}</span></td>
            <td class="gogo-mono-cell">${this.escapeHtml(
              item.consentTimestampMs ? formatIsoDateForCsv(item.consentTimestampMs) : '—'
            )}</td>
            <td>${this.escapeHtml(item.source || item.authProvider)}</td>
          </tr>
        `;
      })
      .join('');
  }

  private renderAdminTableOnly() {
    const tbody = document.getElementById('gogo-admin-table-body');
    const countEl = document.getElementById('gogo-admin-filtered-count');
    if (tbody) {
      tbody.innerHTML = this.renderAdminTableRowsHtml();
    }
    if (countEl) {
      countEl.textContent = `${this.getFilteredAdminEntries().length} records shown`;
    }
  }

  private renderRegistrationTrendsHtml(): string {
    const days = 7;
    const now = new Date();
    const buckets: Array<{ label: string; dateKey: string; total: number; subscribed: number }> = [];

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateKey = d.toISOString().slice(0, 10);
      const label = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      buckets.push({ label, dateKey, total: 0, subscribed: 0 });
    }

    const bucketMap = new Map(buckets.map((b) => [b.dateKey, b]));
    const sourceCounts = new Map<string, { total: number; subscribed: number }>();

    for (const entry of this.adminEntries) {
      if (entry.registeredAtMs > 0) {
        const key = new Date(entry.registeredAtMs).toISOString().slice(0, 10);
        const b = bucketMap.get(key);
        if (b) {
          b.total += 1;
          if (entry.subscribed) b.subscribed += 1;
        }
      }
      const src = entry.source || entry.authProvider || 'direct';
      const prev = sourceCounts.get(src) || { total: 0, subscribed: 0 };
      prev.total += 1;
      if (entry.subscribed) prev.subscribed += 1;
      sourceCounts.set(src, prev);
    }

    const maxDaily = Math.max(1, ...buckets.map((b) => b.total));
    const barsHtml = buckets
      .map((b) => {
        const totalPct = Math.max(6, Math.round((b.total / maxDaily) * 100));
        const subPct = b.total > 0 ? Math.round((b.subscribed / maxDaily) * 100) : 0;
        return `
          <div class="gogo-trend-col" title="${this.escapeHtml(
            `${b.label}: ${b.total} registered (${b.subscribed} subscribed)`
          )}">
            <div class="gogo-trend-bar-track">
              <div class="gogo-trend-bar-total" style="height:${totalPct}%"></div>
              ${
                subPct > 0
                  ? `<div class="gogo-trend-bar-sub" style="height:${subPct}%"></div>`
                  : ''
              }
            </div>
            <strong class="gogo-trend-val">${b.total}</strong>
            <span class="gogo-trend-lbl">${this.escapeHtml(b.label)}</span>
          </div>
        `;
      })
      .join('');

    const topSources = Array.from(sourceCounts.entries())
      .sort((a, b) => b[1].total - a[1].total)
      .slice(0, 4);

    const sourcesHtml =
      topSources.length === 0
        ? `<p class="gogo-trend-empty">No registration sources recorded yet.</p>`
        : topSources
            .map(
              ([src, stats]) => `
            <div class="gogo-source-row">
              <span class="gogo-mono-cell">${this.escapeHtml(src)}</span>
              <span><strong>${stats.subscribed}</strong> opt-in / ${stats.total} total</span>
            </div>
          `
            )
            .join('');

    return `
      <div class="gogo-admin-trends-grid">
        <div class="gogo-admin-trend-card">
          <div class="gogo-admin-trend-head">
            <strong>Registration Trends (Last 7 Days)</strong>
            <span>Total Signups vs. Marketing Opt-Ins</span>
          </div>
          <div class="gogo-trend-bars">${barsHtml}</div>
        </div>
        <div class="gogo-admin-trend-card">
          <div class="gogo-admin-trend-head">
            <strong>Acquisition &amp; Consent by Source</strong>
            <span>Where subscribers registered</span>
          </div>
          <div class="gogo-source-list">${sourcesHtml}</div>
        </div>
      </div>
    `;
  }

  private renderAdminPageHtml(): string {
    const user = this.currentUser;
    if (!user) {
      return `
        <div class="gogo-account-card gogo-account-card-page">
          <h2 class="gogo-account-title">GoGo Admin Authorization Required</h2>
          <p class="gogo-account-subtitle">
            This dashboard is restricted to the authorized GoGo Company administrator (<strong>aaryapratik@gmail.com</strong>). Please sign in to verify your identity.
          </p>
          <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:16px;">
            <button type="button" class="gogo-btn gogo-btn-primary" data-gogo-action="google-login">
              Sign In with Admin Google Account
            </button>
            <button type="button" class="gogo-btn gogo-btn-ghost" data-gogo-open-account="login" data-gogo-custom-label="true">
              Sign In with Email
            </button>
          </div>
        </div>
      `;
    }

    if (!this.isAdmin()) {
      return `
        <div class="gogo-account-card gogo-account-card-page">
          <h2 class="gogo-account-title">403 — Administrator Access Denied</h2>
          <p class="gogo-account-subtitle">
            Signed in as <strong>${this.escapeHtml(
              user.email
            )}</strong>. Customer email lists and subscriber exports are strictly restricted to the authorized GoGo Administrator and protected by Cloud Firestore Security Rules.
          </p>
          <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:16px;">
            <a href="/account/" class="gogo-btn gogo-btn-secondary">Return to Player Account</a>
            <button type="button" class="gogo-btn gogo-btn-ghost" data-gogo-action="logout">Sign Out</button>
          </div>
        </div>
      `;
    }

    const totalUsers = this.adminEntries.length;
    const totalSubscribed = this.adminEntries.filter((e) => e.subscribed).length;
    const totalUnsubscribed = this.adminEntries.filter((e) => !e.subscribed && e.unsubscribedAtMs).length;
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const newLast7Days = this.adminEntries.filter((e) => e.registeredAtMs >= sevenDaysAgo).length;
    const optInRate = totalUsers > 0 ? Math.round((totalSubscribed / totalUsers) * 100) : 0;

    return `
      <div class="gogo-admin-shell">
        <div class="gogo-admin-topbar">
          <div>
            <h2>GoGo Customer &amp; Marketing Subscriber Directory</h2>
            <p>Verified Admin: <strong>${this.escapeHtml(user.email)}</strong> · Firestore Rules Enforced</p>
          </div>
          <div class="gogo-admin-export-bar">
            <button type="button" class="gogo-btn gogo-btn-ghost gogo-btn-sm" data-gogo-action="admin-refresh">
              ${this.adminLoading ? 'Refreshing...' : 'Refresh Data'}
            </button>
            <button type="button" class="gogo-btn gogo-btn-primary gogo-btn-sm" data-gogo-action="admin-export-marketing-csv">
              Download Marketing Subscribers CSV (${totalSubscribed})
            </button>
            <button type="button" class="gogo-btn gogo-btn-secondary gogo-btn-sm" data-gogo-action="admin-export-accounts-csv">
              Download All Registered Accounts CSV (${totalUsers})
            </button>
          </div>
        </div>

        ${
          this.adminError
            ? `<div class="gogo-alert gogo-alert-error">${this.escapeHtml(this.adminError)}</div>`
            : ''
        }

        <div class="gogo-admin-kpi-grid">
          <div class="gogo-admin-kpi">
            <span>Total Registered Users</span>
            <strong>${totalUsers}</strong>
            <small>All GoGo accounts across games</small>
          </div>
          <div class="gogo-admin-kpi">
            <span>Promotional Subscribers</span>
            <strong>${totalSubscribed}</strong>
            <small>${optInRate}% explicit marketing opt-in rate</small>
          </div>
          <div class="gogo-admin-kpi">
            <span>Unsubscribed Users</span>
            <strong>${totalUnsubscribed}</strong>
            <small>Excluded from promotional CSV</small>
          </div>
          <div class="gogo-admin-kpi">
            <span>New Registrations (7d)</span>
            <strong>${newLast7Days}</strong>
            <small>Joined in the last 7 days</small>
          </div>
        </div>

        ${this.renderRegistrationTrendsHtml()}

        <div class="gogo-admin-controls">
          <div class="gogo-admin-view-tabs" role="tablist">
            <button type="button" class="gogo-tab-btn ${
              this.adminActiveView === 'subscribers' ? 'active' : ''
            }" data-gogo-action="admin-switch-view" data-view="subscribers">
              1. Promotional Marketing Subscribers (${totalSubscribed})
            </button>
            <button type="button" class="gogo-tab-btn ${
              this.adminActiveView === 'accounts' ? 'active' : ''
            }" data-gogo-action="admin-switch-view" data-view="accounts">
              2. All Registered Accounts (${totalUsers})
            </button>
          </div>

          <div class="gogo-admin-filter-row">
            <input
              type="search"
              id="gogo-admin-search-input"
              class="gogo-admin-search"
              value="${this.escapeHtml(this.adminSearchQuery)}"
              placeholder="Search by email, display name, or source..."
              aria-label="Search subscribers by email"
            />
            <div class="gogo-admin-segmented">
              <button type="button" class="gogo-seg-btn ${
                this.adminFilterStatus === 'subscribed' ? 'active' : ''
              }" data-gogo-action="admin-filter-status" data-status="subscribed">
                Subscribed Only
              </button>
              <button type="button" class="gogo-seg-btn ${
                this.adminFilterStatus === 'unsubscribed' ? 'active' : ''
              }" data-gogo-action="admin-filter-status" data-status="unsubscribed">
                Unsubscribed
              </button>
              <button type="button" class="gogo-seg-btn ${
                this.adminFilterStatus === 'no_consent' ? 'active' : ''
              }" data-gogo-action="admin-filter-status" data-status="no_consent">
                No Consent
              </button>
              <button type="button" class="gogo-seg-btn ${
                this.adminFilterStatus === 'all' ? 'active' : ''
              }" data-gogo-action="admin-filter-status" data-status="all">
                All Records
              </button>
            </div>
            <span id="gogo-admin-filtered-count" class="gogo-admin-count">
              ${this.getFilteredAdminEntries().length} records shown
            </span>
          </div>
        </div>

        <div class="gogo-admin-table-wrap">
          <table class="gogo-admin-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Display Name</th>
                <th>Registration Date</th>
                <th>Marketing Consent</th>
                <th>Consent Date</th>
                <th>Source</th>
              </tr>
            </thead>
            <tbody id="gogo-admin-table-body">
              ${this.renderAdminTableRowsHtml()}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  public renderAllUI() {
    if (typeof document === 'undefined') return;

    const user = this.currentUser;
    const displayName =
      user?.displayName || this.userProfile?.displayName || user?.email?.split('@')[0] || 'Account';
    const hasConflict = this.conflictQueue.length > 0;

    // 1. Update all trigger buttons ([data-gogo-open-account])
    const triggers = document.querySelectorAll<HTMLElement>('[data-gogo-open-account]');
    triggers.forEach((btn) => {
      if (btn.hasAttribute('data-gogo-custom-label')) return;
      if (user) {
        btn.innerHTML = `
          <span class="gogo-trigger-dot ${hasConflict ? 'warn' : 'online'}"></span>
          <span class="gogo-trigger-text">${this.escapeHtml(displayName)}</span>
        `;
        btn.classList.add('is-logged-in');
      } else {
        btn.innerHTML = `
          <span class="gogo-trigger-dot"></span>
          <span class="gogo-trigger-text">GoGo Account</span>
        `;
        btn.classList.remove('is-logged-in');
      }
    });

    // 2. Update modal backdrop if open
    const backdrop = document.getElementById('gogo-account-modal-backdrop');
    if (backdrop) {
      if (this.isModalOpen) {
        backdrop.classList.add('open');
        backdrop.setAttribute('aria-hidden', 'false');
        backdrop.innerHTML = this.renderDashboardHtml(false);
      } else {
        backdrop.classList.remove('open');
        backdrop.setAttribute('aria-hidden', 'true');
        backdrop.innerHTML = '';
      }
    }

    // 3. Update dedicated full-page mount (#gogo-account-page-root) if on /account/
    const pageRoot = document.getElementById('gogo-account-page-root');
    if (pageRoot) {
      pageRoot.innerHTML = this.renderDashboardHtml(true);
    }

    // 4. Update dedicated Unsubscribe Center mount (#gogo-unsubscribe-page-root) if on /unsubscribe/
    const unsubRoot = document.getElementById('gogo-unsubscribe-page-root');
    if (unsubRoot) {
      unsubRoot.innerHTML = this.renderUnsubscribePageHtml();
    }

    // 5. Update dedicated Admin Dashboard mount (#gogo-admin-page-root) if on /admin/
    const adminRoot = document.getElementById('gogo-admin-page-root');
    if (adminRoot) {
      adminRoot.innerHTML = this.renderAdminPageHtml();
    }

    // 6. Update in-game settings panels ([data-gogo-game-panel="arrowout" | "crystalquest"])
    const panels = document.querySelectorAll<HTMLElement>('[data-gogo-game-panel]');
    panels.forEach((panel) => {
      const gameId = panel.getAttribute('data-gogo-game-panel') as SupportedGameId;
      if (!gameId || !this.adapters[gameId]) return;
      const adapter = this.adapters[gameId];
      const conflict = this.conflictQueue.find((c) => c.gameId === gameId);
      const status = this.syncStatus[gameId];

      if (!user) {
        panel.innerHTML = `
          <div class="gogo-ingame-box">
            <div class="gogo-ingame-info">
              <strong>GoGo Cloud Save</strong>
              <span>Sign in to back up ${this.escapeHtml(adapter.gameName)} progress across devices.</span>
            </div>
            <button type="button" class="gogo-btn gogo-btn-primary gogo-btn-sm" data-gogo-open-account="login" data-gogo-custom-label="true">
              Sign In / Register
            </button>
          </div>
        `;
      } else {
        const statusText = conflict
          ? 'Save conflict requires your choice'
          : status === 'syncing'
          ? 'Syncing with GoGo Cloud...'
          : this.isCloudBackupEnabled()
          ? 'Cloud backup enabled'
          : 'Cloud backup paused';

        panel.innerHTML = `
          <div class="gogo-ingame-box">
            <div class="gogo-ingame-info">
              <strong>${this.escapeHtml(displayName)} • GoGo Cloud</strong>
              <span>${this.escapeHtml(statusText)}</span>
            </div>
            <div class="gogo-ingame-btns">
              ${
                conflict
                  ? `<button type="button" class="gogo-btn gogo-btn-warn gogo-btn-sm" data-gogo-open-account="conflict" data-gogo-custom-label="true">Resolve Conflict</button>`
                  : `<button type="button" class="gogo-btn gogo-btn-secondary gogo-btn-sm" data-gogo-action="sync-game" data-game-id="${gameId}">Sync</button>`
              }
              <button type="button" class="gogo-btn gogo-btn-ghost gogo-btn-sm" data-gogo-open-account="profile" data-gogo-custom-label="true">
                Account
              </button>
            </div>
          </div>
        `;
      }
    });
  }
}

// =========================================================
// 12. Singleton Instance & Global Browser Export
// =========================================================

export const gogoAccount = new GoGoAccountManager();

if (typeof window !== 'undefined') {
  (window as any).GoGoAccount = {
    instance: gogoAccount,
    init: () => gogoAccount.init(),
    openModal: (tab?: any) => gogoAccount.openModal(tab),
    closeModal: () => gogoAccount.closeModal(),
    registerGameAdapter: (adapter: any) => gogoAccount.registerGameAdapter(adapter),
    notifyLocalSaveModified: (gameId: SupportedGameId, ts?: number) =>
      gogoAccount.notifyLocalSaveModified(gameId, ts),
    syncGame: (gameId: SupportedGameId) => gogoAccount.syncGame(gameId),
    uploadLocalToCloud: (gameId: SupportedGameId) => gogoAccount.uploadLocalToCloud(gameId),
    updateMarketingPreference: (subscribe: boolean, source?: string) =>
      gogoAccount.updateMarketingPreference(subscribe, source),
    loadAdminDirectory: () => gogoAccount.loadAdminDirectory(),
    downloadAdminCsv: (mode: 'marketing_only' | 'all_accounts') => gogoAccount.downloadAdminCsv(mode),
    validateGameSave,
    summarizeProgress,
    mergeGameProgress,
    detectSaveConflict,
    buildInitialMarketingRecord,
    applyUnsubscribeToRecord,
    applyOptInToRecord,
    generateMarketingSubscribersCsv,
    generateAllRegisteredAccountsCsv,
    isAuthorizedAdminUser,
  };
  gogoAccount.init();
}
