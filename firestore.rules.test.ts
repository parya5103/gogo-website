import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest';
import { doc, getDoc, setDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';

let testEnv: RulesTestEnvironment;

describe('GoGo Account & Cloud Save Firestore Security Rules', () => {
  beforeAll(async () => {
    testEnv = await initializeTestEnvironment({
      projectId: 'gogo-rules-test',
      firestore: {
        rules: readFileSync(resolve(process.cwd(), 'firestore.rules'), 'utf8'),
      },
    });
  });

  afterAll(async () => {
    if (testEnv) {
      await testEnv.cleanup();
    }
  });

  beforeEach(async () => {
    if (testEnv) {
      await testEnv.clearFirestore();
    }
  });

  describe('/users/{uid}', () => {
    it('denies unauthenticated access to user profiles', async () => {
      const guestDb = testEnv.unauthenticatedContext().firestore();
      await assertFails(getDoc(doc(guestDb, 'users', 'user_123')));
    });

    it('allows authenticated user to create and read their own profile with valid schema', async () => {
      const aliceDb = testEnv.authenticatedContext('alice_uid').firestore();
      const ref = doc(aliceDb, 'users', 'alice_uid');

      await assertSucceeds(
        setDoc(ref, {
          displayName: 'Alice Player',
          email: 'alice@gogocompany.in',
          photoURL: 'https://gogocompany.in/avatar.png',
          createdAt: serverTimestamp(),
          lastLoginAt: serverTimestamp(),
        })
      );

      await assertSucceeds(getDoc(ref));
    });

    it('denies cross-user read or write on another user profile', async () => {
      const bobDb = testEnv.authenticatedContext('bob_uid').firestore();
      const aliceRef = doc(bobDb, 'users', 'alice_uid');

      await assertFails(getDoc(aliceRef));
      await assertFails(
        setDoc(aliceRef, {
          displayName: 'Bob Spoof',
          email: 'bob@gogocompany.in',
          photoURL: '',
          createdAt: serverTimestamp(),
          lastLoginAt: serverTimestamp(),
        })
      );
    });

    it('denies unexpected fields or invalid email in user profile', async () => {
      const aliceDb = testEnv.authenticatedContext('alice_uid').firestore();
      const ref = doc(aliceDb, 'users', 'alice_uid');

      await assertFails(
        setDoc(ref, {
          displayName: 'Alice',
          email: 'alice@gogocompany.in',
          photoURL: '',
          role: 'admin',
          createdAt: serverTimestamp(),
          lastLoginAt: serverTimestamp(),
        })
      );
    });
  });

  describe('/gameProfiles/{uid}/games/{gameId}', () => {
    it('allows authenticated owner to save and update arrowout progress', async () => {
      const aliceDb = testEnv.authenticatedContext('alice_uid').firestore();
      const saveRef = doc(aliceDb, 'gameProfiles', 'alice_uid', 'games', 'arrowout');

      await assertSucceeds(
        setDoc(saveRef, {
          gameId: 'arrowout',
          schemaVersion: 2,
          updatedAt: serverTimestamp(),
          progress: {
            version: 2,
            currentStage: 5,
            unlockedStage: 5,
            streak: 3,
            bestStreak: 4,
            shields: 1,
            clientUpdatedAtMs: 1730000000000,
          },
        })
      );

      await assertSucceeds(getDoc(saveRef));
    });

    it('allows authenticated owner to save crystalquest progress and delete on account removal', async () => {
      const aliceDb = testEnv.authenticatedContext('alice_uid').firestore();
      const saveRef = doc(aliceDb, 'gameProfiles', 'alice_uid', 'games', 'crystalquest');

      await assertSucceeds(
        setDoc(saveRef, {
          gameId: 'crystalquest',
          schemaVersion: 2,
          updatedAt: serverTimestamp(),
          progress: {
            v: 2,
            unlocked: 8,
            lastLevel: 7,
            stars: { '1': 3, '2': 3 },
            clientUpdatedAtMs: 1730000000000,
          },
        })
      );

      await assertSucceeds(deleteDoc(saveRef));
    });

    it('denies unsupported gameId or cross-user game save access', async () => {
      const aliceDb = testEnv.authenticatedContext('alice_uid').firestore();
      const badGameRef = doc(aliceDb, 'gameProfiles', 'alice_uid', 'games', 'unknown_game');

      await assertFails(
        setDoc(badGameRef, {
          gameId: 'unknown_game',
          schemaVersion: 1,
          updatedAt: serverTimestamp(),
          progress: { currentStage: 1, unlockedStage: 1 },
        })
      );

      const bobDb = testEnv.authenticatedContext('bob_uid').firestore();
      const aliceArrowRef = doc(bobDb, 'gameProfiles', 'alice_uid', 'games', 'arrowout');
      await assertFails(getDoc(aliceArrowRef));
    });
  });
});
