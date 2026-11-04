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

    it('allows authenticated user to create and read their own profile with consistent email & emailVerified', async () => {
      const aliceDb = testEnv
        .authenticatedContext('alice_uid', { email: 'alice@gogocompany.in', email_verified: false })
        .firestore();
      const ref = doc(aliceDb, 'users', 'alice_uid');

      await assertSucceeds(
        setDoc(ref, {
          displayName: 'Alice Player',
          email: 'alice@gogocompany.in',
          emailVerified: false,
          photoURL: 'https://gogocompany.in/avatar.png',
          authProvider: 'password',
          marketingSubscribed: false,
          createdAt: serverTimestamp(),
          lastLoginAt: serverTimestamp(),
        })
      );

      await assertSucceeds(getDoc(ref));
    });

    it('denies user from spoofing another email address or fake emailVerified status in /users/{uid}', async () => {
      const aliceDb = testEnv
        .authenticatedContext('alice_uid', { email: 'alice@gogocompany.in', email_verified: false })
        .firestore();
      const ref = doc(aliceDb, 'users', 'alice_uid');

      // Spoofed email
      await assertFails(
        setDoc(ref, {
          displayName: 'Alice Player',
          email: 'spoofed@gogocompany.in',
          emailVerified: false,
          photoURL: '',
          authProvider: 'password',
          marketingSubscribed: false,
          createdAt: serverTimestamp(),
          lastLoginAt: serverTimestamp(),
        })
      );

      // Spoofed emailVerified = true when token has email_verified = false
      await assertFails(
        setDoc(ref, {
          displayName: 'Alice Player',
          email: 'alice@gogocompany.in',
          emailVerified: true,
          photoURL: '',
          authProvider: 'password',
          marketingSubscribed: false,
          createdAt: serverTimestamp(),
          lastLoginAt: serverTimestamp(),
        })
      );
    });

    it('denies normal user from listing /users or reading another user profile', async () => {
      const bobDb = testEnv
        .authenticatedContext('bob_uid', { email: 'bob@example.com', email_verified: true })
        .firestore();
      const aliceRef = doc(bobDb, 'users', 'alice_uid');

      await assertFails(getDoc(aliceRef));
      await assertFails(getDocs(collection(bobDb, 'users')));
    });

    it('denies unverified admin from listing /users or /marketingSubscribers', async () => {
      const unverifiedAdminDb = testEnv
        .authenticatedContext('admin_uid', {
          email: 'aaryapratik@gmail.com',
          email_verified: false,
        })
        .firestore();

      await assertFails(getDocs(collection(unverifiedAdminDb, 'users')));
      await assertFails(getDocs(collection(unverifiedAdminDb, 'marketingSubscribers')));
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
      const aliceDb = testEnv
        .authenticatedContext('alice_uid', { email: 'alice@gogocompany.in', email_verified: true })
        .firestore();
      const subRef = doc(aliceDb, 'marketingSubscribers', 'alice_uid');

      await assertSucceeds(
        setDoc(subRef, {
          email: 'alice@gogocompany.in',
          displayName: 'Alice Player',
          emailVerified: true,
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

    it('denies initial auto-subscription when authProvider is google.com', async () => {
      const googleUserDb = testEnv
        .authenticatedContext('google_uid', { email: 'guser@gmail.com', email_verified: true })
        .firestore();
      const subRef = doc(googleUserDb, 'marketingSubscribers', 'google_uid');

      await assertFails(
        setDoc(subRef, {
          email: 'guser@gmail.com',
          displayName: 'Google User',
          emailVerified: true,
          subscribed: true,
          consentTimestamp: serverTimestamp(),
          consentVersion: 'v1.0-2026-11',
          consentText:
            'Yes! I would like to receive GoGo Games news, new game announcements, updates, special offers and promotional emails.',
          source: 'google_signin_website',
          authProvider: 'google.com',
          registeredAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          unsubscribedAt: null,
        })
      );
    });

    it('denies normal user from listing /marketingSubscribers or reading another subscriber', async () => {
      const bobDb = testEnv
        .authenticatedContext('bob_uid', { email: 'bob@example.com', email_verified: true })
        .firestore();
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
