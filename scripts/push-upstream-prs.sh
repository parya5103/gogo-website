#!/usr/bin/env bash
# ==============================================================================
# Push feature branches (feat/gogo-shared-account) and open separate PRs
# for parya5103/Fletch_Game and parya5103/crystal-quest-web (NO auto-merge)
# ==============================================================================
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BRANCH="feat/gogo-shared-account"

echo "1. Preparing parya5103/Fletch_Game on branch ${BRANCH}..."
WORK_AO="$(mktemp -d)"
git clone https://github.com/parya5103/Fletch_Game.git "${WORK_AO}"
cd "${WORK_AO}"
git checkout -b "${BRANCH}"
git apply "${ROOT_DIR}/upstream-patches/Fletch_Game.patch"
cp "${ROOT_DIR}/assets/js/gogo-account.js" js/gogo-account.js
cp "${ROOT_DIR}/assets/css/gogo-account.css" css/gogo-account.css
git add index.html js/storage.js sw.js js/gogo-account.js css/gogo-account.css
git commit -m "feat(account): integrate shared GoGo Account and Cloud Save"
git push -u origin "${BRANCH}"
if command -v gh >/dev/null 2>&1; then
  gh pr create --repo parya5103/Fletch_Game --base main --head "${BRANCH}" \
    --title "feat(account): integrate shared GoGo Account and Cloud Save" \
    --body "Integrates the shared GoGo Account and Cloud Save system across gogocompany.in without altering local arrowOut.v2 saves or guest play."
else
  echo "Open PR at: https://github.com/parya5103/Fletch_Game/compare/main...${BRANCH}?expand=1"
fi

echo "2. Preparing parya5103/crystal-quest-web on branch ${BRANCH}..."
WORK_CQ="$(mktemp -d)"
git clone https://github.com/parya5103/crystal-quest-web.git "${WORK_CQ}"
cd "${WORK_CQ}"
git checkout -b "${BRANCH}"
git apply "${ROOT_DIR}/upstream-patches/crystal-quest-web.patch"
cp "${ROOT_DIR}/assets/js/gogo-account.js" js/gogo-account.js
cp "${ROOT_DIR}/assets/css/gogo-account.css" gogo-account.css
git add index.html js/ui.js sw.js js/gogo-account.js gogo-account.css
git commit -m "feat(account): integrate shared GoGo Account and Cloud Save"
git push -u origin "${BRANCH}"
if command -v gh >/dev/null 2>&1; then
  gh pr create --repo parya5103/crystal-quest-web --base main --head "${BRANCH}" \
    --title "feat(account): integrate shared GoGo Account and Cloud Save" \
    --body "Integrates the shared GoGo Account and Cloud Save system across gogocompany.in without altering local crystal-quest-save-v2 saves or guest play."
else
  echo "Open PR at: https://github.com/parya5103/crystal-quest-web/compare/main...${BRANCH}?expand=1"
fi
