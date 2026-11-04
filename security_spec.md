# GoGo Shared Account & Cloud Save — Security Specification

## 1. Authentication & Identity Model
- **Authentication Providers**: Firebase Authentication with Email/Password (`createUserWithEmailAndPassword`, `signInWithEmailAndPassword`, `sendPasswordResetEmail`) and Google Sign-In (`GoogleAuthProvider` with `signInWithPopup`).
- **Persistence**: `indexedDBLocalPersistence` with fallback to `browserLocalPersistence` across the same origin (`https://gogocompany.in/`, `/arrowout/`, `/crystalquest/`).
- **Zero Public Access**: No unauthenticated reads or writes are permitted on any collection. Guest gameplay operates exclusively in local `localStorage`.

## 2. Firestore Collections & Ownership

### `/users/{uid}` (`UserProfile`)
- **Access Control**:
  - `get`, `list`: Authenticated user where `request.auth.uid == uid` and `isValidId(uid)`.
  - `create`: Authenticated user where `request.auth.uid == uid`, `isValidId(uid)`, and `isValidUserCreate(request.resource.data)`.
  - `update`: Authenticated user where `request.auth.uid == uid`, `isValidId(uid)`, and `isValidUserUpdate(request.resource.data, resource.data)`.
  - `delete`: Authenticated user where `request.auth.uid == uid` and `isValidId(uid)` (supports full account deletion workflow).
- **Schema & Field Validation**:
  - Allowed & required fields (`hasAll` and `hasOnly`): `['displayName', 'email', 'photoURL', 'createdAt', 'lastLoginAt']`.
  - `displayName`: `string`, length `1..100`.
  - `email`: `string`, length `3..254`, valid email regex, and matches `request.auth.token.email` when present.
  - `photoURL`: `string`, length `0..2048`, must be `""` or match `^https?://.*`.
  - `createdAt`: `timestamp`, must equal `request.time` on `create`, and must equal `resource.data.createdAt` (immutable) on `update`.
  - `lastLoginAt`: `timestamp`, must equal `request.time` on both `create` and `update`.

### `/gameProfiles/{uid}/games/{gameId}` (`GameSaveProfile`)
- **Access Control**:
  - `get`, `list`: Authenticated user where `request.auth.uid == uid`, `isValidId(uid)`, and `isSupportedGameId(gameId)`.
  - `create`: Authenticated user where `request.auth.uid == uid`, `isValidId(uid)`, `isSupportedGameId(gameId)`, and `isValidGameSaveCreate(request.resource.data, gameId)`.
  - `update`: Authenticated user where `request.auth.uid == uid`, `isValidId(uid)`, `isSupportedGameId(gameId)`, and `isValidGameSaveUpdate(request.resource.data, resource.data, gameId)`.
  - `delete`: Authenticated user where `request.auth.uid == uid`, `isValidId(uid)`, and `isSupportedGameId(gameId)` (supports cloud save reset and account deletion).
- **Schema & Field Validation**:
  - Supported `gameId` values: `'arrowout'` or `'crystalquest'`.
  - Allowed & required fields (`hasAll` and `hasOnly`): `['gameId', 'progress', 'updatedAt', 'schemaVersion']`.
  - `gameId`: `string`, length `1..32`, must equal the `{gameId}` path parameter, immutable on `update`.
  - `schemaVersion`: `int`, `1 <= schemaVersion <= 100`.
  - `updatedAt`: `timestamp`, must equal `request.time` on `create` and `update`.
  - `progress`: `map`, `1 <= progress.keys().size() <= 50`, plus game-specific structural validation (`currentStage`/`unlockedStage` for `arrowout`, `unlocked`/`lastLevel` for `crystalquest`).

## 3. Deny-By-Default
- All other paths (`/{document=**}`) are explicitly denied by default.
