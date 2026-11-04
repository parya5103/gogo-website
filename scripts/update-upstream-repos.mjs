import { readFileSync, writeFileSync, copyFileSync, mkdirSync, existsSync, cpSync, rmSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { resolve, basename } from 'node:path';

const root = process.cwd();
const fletchDir = '/tmp/Fletch_Game';
const crystalDir = '/tmp/crystal-quest-web';

if (!existsSync(fletchDir)) {
  try {
    execSync('git clone --depth 1 https://github.com/parya5103/Fletch_Game.git /tmp/Fletch_Game', { stdio: 'pipe' });
  } catch (e) {
    console.warn('[update-upstream-repos] Could not clone Fletch_Game:', e.message);
  }
}

if (!existsSync(crystalDir)) {
  try {
    execSync('git clone --depth 1 https://github.com/parya5103/crystal-quest-web.git /tmp/crystal-quest-web', { stdio: 'pipe' });
  } catch (e) {
    console.warn('[update-upstream-repos] Could not clone crystal-quest-web:', e.message);
  }
}

// =========================================================
// 1. Update Arrow Out (/tmp/Fletch_Game)
// =========================================================
if (existsSync(fletchDir)) {
  // Reset any prior edits in /tmp/Fletch_Game before applying clean patch
  execSync('git checkout -- .', { cwd: fletchDir });
  copyFileSync(resolve(root, 'assets/js/gogo-account.js'), resolve(fletchDir, 'js/gogo-account.js'));
  copyFileSync(resolve(root, 'assets/css/gogo-account.css'), resolve(fletchDir, 'css/gogo-account.css'));

  // 1a. Patch js/storage.js to add cloud save hooks & timestamp tracking without altering arrowOut.v2 schema
  const storagePath = resolve(fletchDir, 'js/storage.js');
  let storageCode = readFileSync(storagePath, 'utf8');

  const writeNowTarget = `      localStorage.setItem(SAVE_KEY, out);
      lastSyncedRaw = out;
      lastSyncedRev = save.rev || 0;
      storageOk = true;
      return true;`;

  const writeNowReplacement = `      localStorage.setItem(SAVE_KEY, out);
      lastSyncedRaw = out;
      lastSyncedRev = save.rev || 0;
      storageOk = true;
      try {
        var nowTs = Date.now();
        localStorage.setItem('arrowOut.cloudMeta.v1', JSON.stringify({ updatedAtMs: nowTs }));
        if (typeof window !== 'undefined' && window.GoGoAccount && typeof window.GoGoAccount.notifyLocalSaveModified === 'function') {
          window.GoGoAccount.notifyLocalSaveModified('arrowout', nowTs);
        }
      } catch (eMeta) {}
      return true;`;

  if (!storageCode.includes(writeNowTarget)) {
    throw new Error('Could not locate writeNow target in Arrow Out js/storage.js');
  }
  storageCode = storageCode.replace(writeNowTarget, writeNowReplacement);

  const returnTarget = `  return {
    init: init,
    getSave: getSave,`;

  const returnReplacement = `  function getCloudSave() {
    try {
      return JSON.parse(JSON.stringify(save));
    } catch (e) {
      return save;
    }
  }

  function getLocalUpdatedAt() {
    try {
      var raw = localStorage.getItem('arrowOut.cloudMeta.v1');
      if (raw) {
        var parsed = JSON.parse(raw);
        if (parsed && typeof parsed.updatedAtMs === 'number') return parsed.updatedAtMs;
      }
    } catch (e) {}
    return 0;
  }

  function applyCloudSave(cloudData, updatedAtMs) {
    if (!cloudData || typeof cloudData !== 'object') return false;
    try {
      save = normalizeSave(JSON.parse(JSON.stringify(cloudData)));
      capturePrefBaseline();
      var out = JSON.stringify(save);
      localStorage.setItem(SAVE_KEY, out);
      lastSyncedRaw = out;
      lastSyncedRev = save.rev || 0;
      var ts = typeof updatedAtMs === 'number' && updatedAtMs > 0 ? updatedAtMs : Date.now();
      localStorage.setItem('arrowOut.cloudMeta.v1', JSON.stringify({ updatedAtMs: ts }));
      if (typeof window !== 'undefined' && window.UI && typeof window.UI.refreshAll === 'function') {
        window.UI.refreshAll();
      }
      return true;
    } catch (e) {
      return false;
    }
  }

  var api = {
    init: init,
    getSave: getSave,
    getCloudSave: getCloudSave,
    getLocalUpdatedAt: getLocalUpdatedAt,
    applyCloudSave: applyCloudSave,`;

  storageCode = storageCode.replace(returnTarget, returnReplacement);
  storageCode = storageCode.replace(
    `    DESIGN_LEVELS: DESIGN_LEVELS\n  };\n})();`,
    `    DESIGN_LEVELS: DESIGN_LEVELS\n  };\n  if (typeof window !== 'undefined') { window.ArrowStorage = api; }\n  return api;\n})();`
  );
  writeFileSync(storagePath, storageCode, 'utf8');

  // 1b. Patch index.html: CSP, CSS, Home Screen GoGo Account button, Settings Cloud Save panel, and script tag
  const indexHtmlPath = resolve(fletchDir, 'index.html');
  let indexHtml = readFileSync(indexHtmlPath, 'utf8');

  // Update CSP to allow Firebase Auth & Firestore
  indexHtml = indexHtml.replace(
    `script-src 'self' https://pagead2.googlesyndication.com`,
    `script-src 'self' https://apis.google.com https://pagead2.googlesyndication.com`
  );
  indexHtml = indexHtml.replace(
    `connect-src 'self' https://usszcnaaylbsgqaehsgp.supabase.co`,
    `connect-src 'self' https://*.googleapis.com https://*.firebaseio.com https://*.firebaseapp.com https://usszcnaaylbsgqaehsgp.supabase.co`
  );
  indexHtml = indexHtml.replace(
    `frame-src https://googleads.g.doubleclick.net`,
    `frame-src https://*.firebaseapp.com https://accounts.google.com https://apis.google.com https://googleads.g.doubleclick.net`
  );

  // Add gogo-account.css after styles.css
  indexHtml = indexHtml.replace(
    `<link rel="stylesheet" href="css/styles.css" />`,
    `<link rel="stylesheet" href="css/styles.css" />\n  <link rel="stylesheet" href="css/gogo-account.css" />`
  );

  // Add GoGo Account trigger button in home-chips
  indexHtml = indexHtml.replace(
    `<div class="home-chips">\n        <div class="chip" id="home-progress" aria-live="polite">Loading progress...</div>\n      </div>`,
    `<div class="home-chips">\n        <div class="chip" id="home-progress" aria-live="polite">Loading progress...</div>\n        <button type="button" class="gogo-account-trigger" id="btn-gogo-account-home" data-gogo-open-account="true"><span class="gogo-trigger-dot"></span><span class="gogo-trigger-text">GoGo Account</span></button>\n      </div>`
  );

  // Add GoGo Cloud Save panel inside #dlg-settings
  indexHtml = indexHtml.replace(
    `<h2 id="set-title">Settings</h2>`,
    `<h2 id="set-title">Settings</h2>\n      <div id="ao-gogo-cloud-panel" data-gogo-game-panel="arrowout"></div>`
  );

  // Add js/gogo-account.js after js/main.js
  indexHtml = indexHtml.replace(
    `<script src="js/main.js"></script>`,
    `<script src="js/main.js"></script>\n  <script src="js/gogo-account.js"></script>`
  );

  writeFileSync(indexHtmlPath, indexHtml, 'utf8');

  // 1c. Patch sw.js EXTRA_ASSETS so gogo-account.css and gogo-account.js are cached for offline play
  const swPath = resolve(fletchDir, 'sw.js');
  if (existsSync(swPath)) {
    let swCode = readFileSync(swPath, 'utf8');
    swCode = swCode.replace(
      `const EXTRA_ASSETS = [\n  './icons/icon-192.png',\n  './icons/icon-512.png',\n  './icons/icon-maskable-512.png'\n];`,
      `const EXTRA_ASSETS = [\n  './icons/icon-192.png',\n  './icons/icon-512.png',\n  './icons/icon-maskable-512.png',\n  './css/gogo-account.css',\n  './js/gogo-account.js'\n];`
    );
    writeFileSync(swPath, swCode, 'utf8');
  }

  console.log('[update-upstream-repos] Updated /tmp/Fletch_Game successfully.');
}

// =========================================================
// 2. Update Crystal Quest (/tmp/crystal-quest-web)
// =========================================================
if (existsSync(crystalDir)) {
  execSync('git checkout -- .', { cwd: crystalDir });
  copyFileSync(resolve(root, 'assets/js/gogo-account.js'), resolve(crystalDir, 'js/gogo-account.js'));
  copyFileSync(resolve(root, 'assets/css/gogo-account.css'), resolve(crystalDir, 'gogo-account.css'));

  // 2a. Patch js/ui.js to add cloud save hooks
  const uiPath = resolve(crystalDir, 'js/ui.js');
  let uiCode = readFileSync(uiPath, 'utf8');

  // Add cloud save methods to Save object in js/ui.js
  const persistTarget = `persist:function(){try{return global.localStorage.setItem(SAVE_KEY,JSON.stringify(this.data)),!0}catch(err){return!1}},`;
  const persistReplacement = `persist:function(){try{var ok=(global.localStorage.setItem(SAVE_KEY,JSON.stringify(this.data)),!0);var ts=Date.now();global.localStorage.setItem("crystal-quest-cloud-meta-v1",JSON.stringify({updatedAtMs:ts}));global.GoGoAccount&&typeof global.GoGoAccount.notifyLocalSaveModified=="function"&&global.GoGoAccount.notifyLocalSaveModified("crystalquest",ts);return ok}catch(err){return!1}},getCloudSave:function(){try{return JSON.parse(JSON.stringify(this.data))}catch(e){return this.data}},getLocalUpdatedAt:function(){try{var r=global.localStorage.getItem("crystal-quest-cloud-meta-v1");if(r){var p=JSON.parse(r);if(p&&typeof p.updatedAtMs=="number")return p.updatedAtMs}}catch(e){}return 0},applyCloudSave:function(cloudData,updatedAtMs){if(!cloudData||typeof cloudData!="object")return!1;try{var d=this.defaults();this.absorb(d,cloudData);d.world=this.absorbWorld(cloudData.world);this.data=d;global.localStorage.setItem(SAVE_KEY,JSON.stringify(this.data));var ts=typeof updatedAtMs=="number"&&updatedAtMs>0?updatedAtMs:Date.now();global.localStorage.setItem("crystal-quest-cloud-meta-v1",JSON.stringify({updatedAtMs:ts}));UI&&UI.applySettings&&(UI.applySettings(),UI.buildMap(),UI.updateHome());return!0}catch(e){return!1}},`;

  if (!uiCode.includes(persistTarget)) {
    throw new Error('Could not locate persist target in Crystal Quest js/ui.js');
  }
  uiCode = uiCode.replace(persistTarget, persistReplacement);
  writeFileSync(uiPath, uiCode, 'utf8');

  // 2b. Patch index.html to add gogo-account.css, Home GoGo Account button, Settings Cloud Save panel, and js/gogo-account.js
  const cqHtmlPath = resolve(crystalDir, 'index.html');
  let cqHtml = readFileSync(cqHtmlPath, 'utf8');

  cqHtml = cqHtml.replace(
    `<link rel="stylesheet" href="styles.css" />`,
    `<link rel="stylesheet" href="styles.css" />\n  <link rel="stylesheet" href="gogo-account.css" />`
  );

  cqHtml = cqHtml.replace(
    `<div class="home-progress" id="home-progress" aria-label="Adventure progress">`,
    `<div style="display:flex;justify-content:center;margin-bottom:10px;"><button type="button" class="gogo-account-trigger" id="btn-cq-gogo-account" data-gogo-open-account="true"><span class="gogo-trigger-dot"></span><span class="gogo-trigger-text">GoGo Account</span></button></div>\n        <div class="home-progress" id="home-progress" aria-label="Adventure progress">`
  );

  cqHtml = cqHtml.replace(
    `<h3 id="settings-title" class="modal-title">Settings</h3>`,
    `<h3 id="settings-title" class="modal-title">Settings</h3>\n        <div id="cq-gogo-cloud-panel" data-gogo-game-panel="crystalquest"></div>`
  );

  cqHtml = cqHtml.replace(
    `<script src="js/main.js"></script>`,
    `<script src="js/main.js"></script>\n  <script src="js/gogo-account.js"></script>`
  );

  writeFileSync(cqHtmlPath, cqHtml, 'utf8');

  // 2c. Patch sw.js PRECACHE so gogo-account.css and js/gogo-account.js are cached for offline play
  const cqSwPath = resolve(crystalDir, 'sw.js');
  if (existsSync(cqSwPath)) {
    let cqSwCode = readFileSync(cqSwPath, 'utf8');
    cqSwCode = cqSwCode.replace(
      `  'js/main.js',\n  'images/bg_cavern.jpg',`,
      `  'js/main.js',\n  'gogo-account.css',\n  'js/gogo-account.js',\n  'images/bg_cavern.jpg',`
    );
    writeFileSync(cqSwPath, cqSwCode, 'utf8');
  }

  // 2d. Use cross-realm compatible node:assert in tests/game.test.js for Node 22 vm.createContext
  const cqTestPath = resolve(crystalDir, 'tests/game.test.js');
  if (existsSync(cqTestPath)) {
    let cqTestCode = readFileSync(cqTestPath, 'utf8');
    cqTestCode = cqTestCode.replace(
      `const assert = require('node:assert/strict');`,
      `const assert = require('node:assert');`
    );
    writeFileSync(cqTestPath, cqTestCode, 'utf8');
  }

  console.log('[update-upstream-repos] Updated /tmp/crystal-quest-web successfully.');
}

// =========================================================
// 3. Sync from Upstream Clones to /arrowout/ and /crystalquest/
//    (Using the exact rsync rules from .github/workflows/sync-products.yml)
// =========================================================
function syncDir(srcDir, destDir, excludes) {
  rmSync(destDir, { recursive: true, force: true });
  mkdirSync(destDir, { recursive: true });
  cpSync(srcDir, destDir, {
    recursive: true,
    filter: (sourcePath) => {
      if (sourcePath === srcDir) return true;
      const name = basename(sourcePath);
      return !excludes.includes(name);
    },
  });
}

syncDir(fletchDir, resolve(root, 'arrowout'), [
  '.git',
  '.github',
  'android',
  'audit',
  'scripts',
  'tests',
  'README.md',
  'LICENSE',
  'SECURITY.md',
  '.gitignore',
  'node_modules',
]);
syncDir(crystalDir, resolve(root, 'crystalquest'), [
  '.git',
  '.github',
  'android',
  'dev',
  'tests',
  'README.md',
  'KNOWLEDGE.md',
  '.gitignore',
  'node_modules',
]);
console.log('[update-upstream-repos] Synced /tmp/Fletch_Game -> /arrowout/ and /tmp/crystal-quest-web -> /crystalquest/.');

// =========================================================
// 4. Export git patches into /upstream-patches/ for pushing to individual repos
// =========================================================
const patchDir = resolve(root, 'upstream-patches');
mkdirSync(patchDir, { recursive: true });
const fletchDiff = execSync('git diff index.html js/storage.js sw.js', { cwd: fletchDir }).toString();
const crystalDiff = execSync('git diff index.html js/ui.js sw.js', { cwd: crystalDir }).toString();
writeFileSync(resolve(patchDir, 'Fletch_Game.patch'), fletchDiff, 'utf8');
writeFileSync(resolve(patchDir, 'crystal-quest-web.patch'), crystalDiff, 'utf8');
console.log('[update-upstream-repos] Wrote upstream patches to /upstream-patches/.');

