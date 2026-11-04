import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest';
import { collection, doc, getDoc, getDocs, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';

let testEnv: RulesTestEnvironment;

describe('GoGo Account, Marketing Subscribers & Cloud Save Firestore Security Rules', () => {
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

    it('allows authenticated user to create and read their own profile with authProvider & marketingSubscribed', async () => {
      const aliceDb = testEnv.authenticatedContext('alice_uid').firestore();
      const ref = doc(aliceDb, 'users', 'alice_uid');

      await assertSucceeds(
        setDoc(ref, {
          displayName: 'Alice Player',
          email: 'alice@gogocompany.in',
          photoURL: 'https://gogocompany.in/avatar.png',
          authProvider: 'password',
          marketingSubscribed: false,
          createdAt: serverTimestamp(),
          lastLoginAt: serverTimestamp(),
        })
      );

      await assertSucceeds(getDoc(ref));
    });

    it('denies normal user from listing /users or reading another user profile', async () => {
      const bobDb = testEnv.authenticatedContext('bob_uid', { email: 'bob@example.com', email_verified: true }).firestore();
      const aliceRef = doc(bobDb, 'users', 'alice_uid');

      await assertFails(getDoc(aliceRef));
      await assertFails(getDocs(collection(bobDb, 'users')));
    });

    it('allows verified admin to list /users and /marketingSubscribers', async () => {
      const adminDb = testEnv
        .authenticatedContext('admin_uid', {
          email: 'aaryapratik@gmail.com',
          email_verified: true,
        })
        .firestore();

      await assertSucceeds(getDocs(collection(adminDb, 'users')));
      await assertSucceeds(getDocs(collection(adminDb, 'marketingSubscribers')));
    });
  });

  describe('/marketingSubscribers/{uid}', () => {
    it('allows user to create their own subscriber record with explicit consent', async () => {
      const aliceDb = testEnv.authenticatedContext('alice_uid').firestore();
      const subRef = doc(aliceDb, 'marketingSubscribers', 'alice_uid');

      await assertSucceeds(
        setDoc(subRef, {
          email: 'alice@gogocompany.in',
          displayName: 'Alice Player',
          subscribed: true,
          consentTimestamp: serverTimestamp(),
          consentVersion: 'v1.0-2026-11',
          consentText:
            'Yes! I would like to receive GoGo Games news, new game announcements, updates, special offers and promotional emails.',
          source: 'registration_form',
          authProvider: 'password',
          registeredAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          unsubscribedAt: null,
        })
      );
    });

    it('denies normal user from listing /marketingSubscribers or reading another subscriber', async () => {
      const bobDb = testEnv.authenticatedContext('bob_uid', { email: 'bob@example.com', email_verified: true }).firestore();
      await assertFails(getDoc(doc(bobDb, 'marketingSubscribers', 'alice_uid')));
      await assertFails(getDocs(collection(bobDb, 'marketingSubscribers')));
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
            v: 2,
            unlocked: 5,
            coins: 100,
            clientUpdatedAtMs: 1730000000000,
          },
        })
      );

      await assertSucceeds(getDoc(saveRef));
    });
  });
});
