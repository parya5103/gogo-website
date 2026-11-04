# GoGo Shared Account, Cloud Save & Marketing Subscriber — Security Specification

## 1. Authentication & Authorization Model
- **Authentication Providers**: Firebase Authentication with Email/Password and Google Sign-In (`google.com`).
- **Administrator Authorization (`isAdmin()`)**:
  - Verified server-side in Firestore Security Rules via the user's cryptographically signed Firebase Auth token (`request.auth.token.email_verified == true` and `request.auth.token.email in ['aaryapratik@gmail.com', 'officialgogocompany@gmail.com']`) or existence of `/databases/$(database)/documents/admins/$(request.auth.uid)`.
  - Normal users can NEVER read, list, or export other users' profiles or email addresses.

## 2. Firestore Collections & Ownership

### `/users/{uid}` (`UserProfile`)
- **Access Control**:
  - `get`: Owner (`isOwner(uid)`) OR Administrator (`isAdmin()`).
  - `list`: Administrator (`isAdmin()`) ONLY. Normal users are strictly prohibited from listing `/users`.
  - `create`: Owner (`isOwner(uid)`) with valid schema (`isValidUserCreate`).
  - `update`: Owner (`isOwner(uid)`) with valid schema (`isValidUserUpdate`).
  - `delete`: Owner (`isOwner(uid)`).
- **Schema & Field Validation**:
  - Required fields: `['displayName', 'email', 'photoURL', 'createdAt', 'lastLoginAt']`.
  - Allowed fields: `['displayName', 'email', 'photoURL', 'authProvider', 'marketingSubscribed', 'createdAt', 'lastLoginAt']`.
  - `authProvider` (optional): `'password'` or `'google.com'`.
  - `marketingSubscribed` (optional): `bool`.

### `/marketingSubscribers/{uid}` (`MarketingSubscriber`)
- **Access Control**:
  - `get`: Owner (`isOwner(uid)`) OR Administrator (`isAdmin()`).
  - `list`: Administrator (`isAdmin()`) ONLY. Normal users can never list or export subscriber emails.
  - `create`: Owner (`isOwner(uid)`) with valid schema (`isValidSubscriberCreate`).
  - `update`: Owner (`isOwner(uid)`) with valid schema (`isValidSubscriberUpdate`).
  - `delete`: Owner (`isOwner(uid)`).
- **Schema & Field Validation**:
  - Required & allowed fields (`hasAll` and `hasOnly`):
    `['email', 'displayName', 'subscribed', 'consentTimestamp', 'consentVersion', 'consentText', 'source', 'authProvider', 'registeredAt', 'updatedAt', 'unsubscribedAt']`.
  - `email`: valid email string (`3..254` chars).
  - `displayName`: string (`1..100` chars).
  - `subscribed`: `bool`.
  - `consentTimestamp`: `timestamp` or `null` (when `subscribed == true` on create, `consentTimestamp == request.time`).
  - `consentVersion`: string (`0..32` chars).
  - `consentText`: string (`0..500` chars).
  - `source`: string (`1..64` chars).
  - `authProvider`: `'password'` or `'google.com'`.
  - `registeredAt`: `timestamp` (`== request.time` on create, immutable on update).
  - `updatedAt`: `timestamp` (`== request.time` on create and update).
  - `unsubscribedAt`: `timestamp` or `null`.

### `/admins/{uid}` (`AdminRecord`)
- **Access Control**:
  - `get`: Owner (`isOwner(uid)`) or `isAdmin()`.
  - `list`: `isAdmin()`.
  - `create`, `update`, `delete`: `false` (managed only via Firebase Console or primary owner rules).

### `/gameProfiles/{uid}/games/{gameId}` (`GameSaveProfile`)
- **Access Control**:
  - `get`, `list`, `create`, `update`, `delete`: Strictly Owner (`isOwner(uid)`) for `gameId in ['arrowout', 'crystalquest']`.
