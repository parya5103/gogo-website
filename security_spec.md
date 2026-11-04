# Security Specification — GoGo Shared Account, Cloud Save & Marketing Subscriber Database

## 1. Authentication & Session Model
- **Authentication Providers**: Email/Password (with verification email sent upon registration) and Google Sign-In via Firebase Authentication (`gen-lang-client-0566323659`).
- **Database**: Named Cloud Firestore instance `ai-studio-gogowebsite-4126d566-149d-4901-8c83-59ba041323ca`.
- **Guest Mode**: Unauthenticated users never read or write to Firestore; all guest gameplay uses browser `localStorage`.

## 2. Role-Based Access Control (RBAC) & Data Paths
- **Normal Player (`isOwner(uid)`)**:
  - `request.auth != null && request.auth.uid == uid`
  - Can `get`, `create`, `update`, and `delete` ONLY their own `/users/{uid}`, `/marketingSubscribers/{uid}`, and `/gameProfiles/{uid}/games/{gameId}` documents.
  - **Cannot `list`** `/users` or `/marketingSubscribers`. Normal users can never read or export another user's email address or profile.
- **Verified GoGo Administrator (`isAdmin()`)**:
  - Requires `request.auth != null && request.auth.token.email_verified == true` AND either:
    1. `request.auth.token.email in ['aaryapratik@gmail.com', 'officialgogocompany@gmail.com']`, OR
    2. `exists(/databases/$(database)/documents/admins/$(request.auth.uid))`
  - Unverified admin accounts are strictly rejected (`fail closed`).
  - Can `get` and `list` `/users/{uid}` and `/marketingSubscribers/{uid}` to power the protected GoGo Admin Dashboard (`/admin/`) and CSV exports.

## 3. Strict Schema, Email Consistency & Consent Validation
1. **Email & Verification Consistency**:
   - When `request.auth.token.email` is present, `request.resource.data.email` in `/users/{uid}` and `/marketingSubscribers/{uid}` MUST equal `request.auth.token.email`. A user can never write another person's email into their document.
   - When `emailVerified` is provided in `/users/{uid}` or `/marketingSubscribers/{uid}`, it MUST match `request.auth.token.email_verified == true`. A client cannot forge `emailVerified: true`.
2. **Marketing Subscriber Consent & Unsubscribe Integrity (`/marketingSubscribers/{uid}`)**:
   - **Create**:
     - `registeredAt == request.time && updatedAt == request.time`
     - If `subscribed == true`: requires `authProvider != 'google.com'` (Google Sign-In never auto-subscribes on initial creation), `consentTimestamp == request.time`, non-empty `consentVersion` and `consentText`, and `unsubscribedAt == null`.
     - If `subscribed == false`: requires `consentTimestamp == null && unsubscribedAt == null`.
   - **Update**:
     - `registeredAt == resource.data.registeredAt` (immutable) and `updatedAt == request.time`.
     - If `subscribed == true`: requires `unsubscribedAt == null`, valid `consentTimestamp`, and non-empty `consentVersion` & `consentText`.
     - If transitioning from `subscribed == true` to `subscribed == false` (Unsubscribe): requires `unsubscribedAt == request.time` and preserves `consentTimestamp`, `consentVersion`, and `consentText` from `resource.data`.
     - If updating metadata while `subscribed == false` and `resource.data.subscribed == false`: requires `unsubscribedAt == resource.data.unsubscribedAt` and `consentTimestamp == resource.data.consentTimestamp` so unsubscribed users are never silently altered.
3. **Game Cloud Saves (`/gameProfiles/{uid}/games/{gameId}`)**:
   - Only `gameId in ['arrowout', 'crystalquest']` is permitted.
   - Validates `unlocked >= 1` (Arrow Out) and `unlocked >= 1 && lastLevel >= 1` (Crystal Quest), bounded map sizes (`<= 50` keys), and `updatedAt == request.time`.
