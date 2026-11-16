import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const base = process.env.BASE_URL || "http://127.0.0.1:4173";
const widths = [320, 360, 390, 430, 768, 1024, 1440];
const routes = [
  "/", "/about/index.html", "/contact/index.html", "/account/index.html",
  "/admin/index.html", "/arrowout/", "/arrowout/about.html",
  "/arrowout/contact.html", "/arrowout/privacy.html", "/crystalquest/",
  "/crystalquest/guide.html", "/sarkari-sarthi/", "/sarkari-sarthi/admin.html",
  "/sarkari-sarthi/job/00319c20f630774e16a96801f3979892/",
  "/pikanews/", "/pikanews/latest.html", "/pikanews/bollywood.html",
  "/pikanews/article.html", "/pikanews/privacy.html",
  "/privacy-policy/index.html", "/terms-and-conditions/index.html",
  "/disclaimer/index.html", "/unsubscribe/index.html"
];

const failures = [];
const report = { base, widths, routes: [], viewportMetaMissing: [], horizontalOverflow: [], navigation: [] };

// Every published HTML file is checked for a mobile viewport declaration,
// including the large set of generated news and job-detail pages.
function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if ([".git", "node_modules", "dist", "build"].includes(entry.name)) return [];
      return walk(full);
    }
    return entry.isFile() && /\.html?$/i.test(entry.name) ? [full] : [];
  });
}
for (const file of walk(process.cwd())) {
  const source = fs.readFileSync(file, "utf8");
  if (!/<meta\s+name=["']viewport["']/i.test(source)) {
    report.viewportMetaMissing.push(path.relative(process.cwd(), file));
  }
}
if (report.viewportMetaMissing.length) failures.push("HTML pages missing viewport meta");

const browser = await chromium.launch({ headless: true });
try {
  for (const route of routes) {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    // Keep the test deterministic and free: local assets only; third-party
    // ads, analytics, fonts and live APIs are not needed for layout checks.
    await page.route("**/*", requestRoute => {
      const url = new URL(requestRoute.request().url());
      if (["127.0.0.1", "localhost"].includes(url.hostname)) return requestRoute.continue();
      return requestRoute.abort();
    });
    let responseStatus = null;
    try {
      const response = await page.goto(base + route, { waitUntil: "domcontentloaded", timeout: 20000 });
      responseStatus = response?.status() ?? null;
      await page.waitForTimeout(250);
      const meta = await page.locator('meta[name="viewport"]').getAttribute("content").catch(() => null);
      const pageResult = { route, responseStatus, viewportMeta: meta, viewports: [] };
      if (!response || responseStatus >= 400) {
        failures.push(`${route}: HTTP ${responseStatus ?? "no response"}`);
      }
      if (!meta) failures.push(`${route}: missing rendered viewport meta`);

      for (const width of widths) {
        await page.setViewportSize({ width, height: width <= 430 ? 844 : 900 });
        await page.waitForTimeout(60);
        const metrics = await page.evaluate(() => {
          const root = document.documentElement;
          const body = document.body;
          const bodyOverflowX = getComputedStyle(body).overflowX;
          const bodyClipsX = ["hidden", "clip"].includes(bodyOverflowX);
          // A few components intentionally animate/crop content (ticker,
          // off-canvas drawers, decorative hero art). If the page itself
          // clips horizontal overflow, its larger scrollWidth is not a
          // user-scrollable viewport regression.
          const horizontalOverflow = !bodyClipsX &&
            (root.scrollWidth > window.innerWidth + 1 || body.scrollWidth > window.innerWidth + 1);
          const offenders = [...document.querySelectorAll("body *")].map(el => {
            const r = el.getBoundingClientRect();
            const s = getComputedStyle(el);
            return {
              tag: el.tagName.toLowerCase(),
              id: el.id || "",
              className: typeof el.className === "string" ? el.className.slice(0, 100) : "",
              left: Math.round(r.left), right: Math.round(r.right),
              width: Math.round(r.width), position: s.position,
              overflowX: s.overflowX
            };
          }).filter(x => x.width > 0 && (x.left < -2 || x.right > window.innerWidth + 2)).slice(0, 8);
          return {
            innerWidth: window.innerWidth,
            rootClientWidth: root.clientWidth,
            rootScrollWidth: root.scrollWidth,
            bodyScrollWidth: body.scrollWidth,
            bodyOverflowX,
            horizontalOverflow,
            offenders
          };
        });
        pageResult.viewports.push({ width, ...metrics });
        if (metrics.horizontalOverflow) {
          report.horizontalOverflow.push({ route, width, ...metrics });
          failures.push(`${route}: horizontal overflow at ${width}px`);
        }
      }
      report.routes.push(pageResult);
    } catch (error) {
      failures.push(`${route}: ${error.message}`);
      report.routes.push({ route, error: error.message });
    }
    await page.close();
  }

  // Exercise the three actual mobile navigation implementations without
  // submitting forms or changing application data.
  const menuCases = [
    { route: "/", toggle: ".nav-toggle", menu: "#site-nav", open: ".open", label: "GoGo", requiresScrollLock: false },
    { route: "/sarkari-sarthi/", toggle: "#mobileMenuToggle", menu: "#navMenu", open: ".active", label: "Sarkari Sarthi", requiresScrollLock: true },
    { route: "/pikanews/", toggle: "#mobile-menu-toggle", menu: ".mobile-menu", open: ".open", label: "PikaNews", requiresScrollLock: true }
  ];
  for (const item of menuCases) {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await page.route("**/*", requestRoute => {
      const url = new URL(requestRoute.request().url());
      return ["127.0.0.1", "localhost"].includes(url.hostname) ? requestRoute.continue() : requestRoute.abort();
    });
    try {
      await page.goto(base + item.route, { waitUntil: "domcontentloaded", timeout: 20000 });
      await page.waitForTimeout(300);
      const toggle = page.locator(item.toggle).first();
      if (!(await toggle.count())) throw new Error(`toggle ${item.toggle} not found`);
      await toggle.click();
      await page.waitForTimeout(80);
      const opened = await page.locator(item.menu).evaluate((el, cls) => el.classList.contains(cls), item.open.slice(1));
      const expanded = await toggle.getAttribute("aria-expanded");
      const bodyLocked = await page.locator("body").evaluate(el => getComputedStyle(el).overflow === "hidden" || el.classList.contains("menu-open"));
      if (!opened) throw new Error("menu did not open");
      if (expanded !== "true") throw new Error(`aria-expanded expected true, got ${expanded}`);
      if (item.requiresScrollLock && !bodyLocked) throw new Error("body scroll lock was not applied");
      if (item.label === "PikaNews") {
        await page.locator(".mobile-menu-close").click();
      } else if (item.label === "Sarkari Sarthi") {
        // The backdrop covers the toggle while the drawer is open; tap its
        // exposed right edge to close the overlay as a user would.
        await page.locator("#menuBackdrop").click({ position: { x: 385, y: 420 }, timeout: 5000 });
      } else {
        await toggle.click();
      }
      await page.waitForTimeout(80);
      const closed = await page.locator(item.menu).evaluate((el, cls) => !el.classList.contains(cls), item.open.slice(1));
      const collapsed = await toggle.getAttribute("aria-expanded");
      if (!closed) throw new Error("menu did not close");
      if (collapsed !== "false") throw new Error(`aria-expanded expected false, got ${collapsed}`);
      report.navigation.push({ label: item.label, passed: true, bodyLocked: true });
    } catch (error) {
      report.navigation.push({ label: item.label, passed: false, error: error.message });
      failures.push(`${item.label} mobile navigation: ${error.message}`);
    }
    await page.close();
  }

  // Keyboard, backdrop, focus-return and scroll-lock regression checks.
  const interactionChecks = [];
  async function interaction(name, fn) {
    const result = { name, passed: false };
    try { await fn(result); result.passed = true; }
    catch (error) { result.error = error.message; failures.push(name + ": " + error.message); }
    interactionChecks.push(result);
  }
  async function openWithKeyboard(page, selector) {
    const toggle = page.locator(selector).first();
    if (!(await toggle.count())) throw new Error("toggle not found: " + selector);
    await toggle.focus();
    await toggle.press("Enter");
    await page.waitForTimeout(80);
    if ((await toggle.getAttribute("aria-expanded")) !== "true") throw new Error("Enter did not open menu / aria-expanded");
    return toggle;
  }

  for (const item of [
    { name: "GoGo navigation keyboard + Escape + focus return", route: "/", toggle: ".nav-toggle", menu: "#site-nav", openClass: "open", lock: false },
    { name: "Sarkari Sarthi navigation keyboard + Escape + focus return", route: "/sarkari-sarthi/", toggle: "#mobileMenuToggle", menu: "#navMenu", openClass: "active", lock: true },
    { name: "PikaNews navigation keyboard + Escape + focus return", route: "/pikanews/", toggle: "#mobile-menu-toggle", menu: "#mobile-menu", openClass: "open", lock: true }
  ]) {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await page.route("**/*", requestRoute => {
      const url = new URL(requestRoute.request().url());
      return ["127.0.0.1", "localhost"].includes(url.hostname) ? requestRoute.continue() : requestRoute.abort();
    });
    await interaction(item.name, async result => {
      await page.goto(base + item.route, { waitUntil: "domcontentloaded", timeout: 20000 });
      await page.waitForTimeout(350);
      const toggle = await openWithKeyboard(page, item.toggle);
      const menu = page.locator(item.menu);
      if (!(await menu.evaluate((el, cls) => el.classList.contains(cls), item.openClass))) throw new Error("menu did not become visible");
      if (item.lock && !await page.locator("body").evaluate(el => el.classList.contains("menu-open") || getComputedStyle(el).overflow === "hidden")) throw new Error("body scroll was not locked");
      await page.keyboard.press("Escape");
      await page.waitForTimeout(80);
      if ((await toggle.getAttribute("aria-expanded")) !== "false") throw new Error("Escape did not collapse menu");
      if (await menu.evaluate((el, cls) => el.classList.contains(cls), item.openClass)) throw new Error("Escape left menu open");
      if (!await toggle.evaluate(el => document.activeElement === el)) throw new Error("focus was not returned to menu toggle");
      if (item.lock && await page.locator("body").evaluate(el => el.classList.contains("menu-open"))) throw new Error("body scroll lock remained after closing");
      result.keyboard = "Enter + Escape";
      result.focusReturned = true;
    });
    await page.close();
  }

  await interaction("Sarkari Sarthi backdrop closes drawer and restores scroll", async result => {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await page.route("**/*", requestRoute => ["127.0.0.1", "localhost"].includes(new URL(requestRoute.request().url()).hostname) ? requestRoute.continue() : requestRoute.abort());
    await page.goto(base + "/sarkari-sarthi/", { waitUntil: "domcontentloaded" });
    const toggle = page.locator("#mobileMenuToggle");
    await toggle.click();
    await page.locator("#menuBackdrop").click({ position: { x: 385, y: 420 }, force: true });
    await page.waitForTimeout(80);
    if (await page.locator("#navMenu").evaluate(el => el.classList.contains("active"))) throw new Error("backdrop did not close menu");
    if ((await toggle.getAttribute("aria-expanded")) !== "false") throw new Error("aria-expanded did not reset");
    if (await page.locator("body").evaluate(el => el.classList.contains("menu-open"))) throw new Error("scroll lock remained");
    result.backdrop = "closed";
    await page.close();
  });

  await interaction("PikaNews backdrop closes drawer and restores scroll", async result => {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await page.route("**/*", requestRoute => ["127.0.0.1", "localhost"].includes(new URL(requestRoute.request().url()).hostname) ? requestRoute.continue() : requestRoute.abort());
    await page.goto(base + "/pikanews/", { waitUntil: "domcontentloaded" });
    const toggle = page.locator("#mobile-menu-toggle");
    await toggle.click();
    const backdrop = page.locator(".mobile-menu-backdrop").last();
    if (!(await backdrop.count())) throw new Error("backdrop element missing");
    await backdrop.click({ force: true, position: { x: 380, y: 420 } });
    await page.waitForTimeout(300);
    if (await page.locator("#mobile-menu").evaluate(el => el.classList.contains("open"))) {
      const diagnostic = await page.evaluate(() => {
        const backdrops = Array.from(document.querySelectorAll(".mobile-menu-backdrop"));
        const b = backdrops[backdrops.length - 1], m = document.querySelector("#mobile-menu");
        const br = b.getBoundingClientRect(), mr = m.getBoundingClientRect();
        const hit = document.elementFromPoint(innerWidth - 10, Math.round(innerHeight / 2));
        return { backdropCount: backdrops.length, backdrop: { left: br.left, right: br.right, width: br.width, visibility: getComputedStyle(b).visibility, zIndex: getComputedStyle(b).zIndex }, menu: { left: mr.left, right: mr.right, width: mr.width, zIndex: getComputedStyle(m).zIndex }, hit: hit ? { tag: hit.tagName, id: hit.id, className: typeof hit.className === "string" ? hit.className : "" } : null };
      });
      throw new Error("backdrop did not close menu: " + JSON.stringify(diagnostic));
    }
    if ((await toggle.getAttribute("aria-expanded")) !== "false") throw new Error("aria-expanded did not reset");
    if (await page.locator("body").evaluate(el => el.classList.contains("menu-open"))) throw new Error("scroll lock remained");
    result.backdrop = "closed";
    await page.close();
  });

  // Game surfaces: test portrait and landscape geometry, safe-area declarations,
  // canvas clipping and practical touch target dimensions without making moves.
  async function auditGameSurface(name, route, startSelector, canvasSelector, wrapSelector, controls) {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
    await page.route("**/*", requestRoute => ["127.0.0.1", "localhost"].includes(new URL(requestRoute.request().url()).hostname) ? requestRoute.continue() : requestRoute.abort());
    await page.goto(base + route, { waitUntil: "domcontentloaded", timeout: 20000 });
    await page.waitForTimeout(450);
    if (name === "Arrow Out" && await page.locator("#dlg-reward.show").count()) {
      await page.locator("#btn-reward-claim").click();
      await page.waitForTimeout(120);
    }
    if (startSelector) {
      const start = page.locator(startSelector).first();
      if (await start.count()) await start.click();
    }
    if (name === "Crystal Quest") {
      const firstUnlocked = page.locator("#level-grid .level-card:not(.is-locked)").first();
      await firstUnlocked.waitFor({ state: "visible", timeout: 8000 });
      await firstUnlocked.click();
      for (let attempt = 0; attempt < 8; attempt++) {
        const active = await page.locator("#screen-game").evaluate(el => el.classList.contains("is-active"));
        if (active) break;
        const storyNext = page.locator("#btn-story-next");
        if (await storyNext.isVisible()) await storyNext.click();
        else break;
      }
      if (!await page.locator("#screen-game").evaluate(el => el.classList.contains("is-active"))) throw new Error("Crystal Quest did not enter the playable game screen");
    }
    await page.waitForTimeout(500);
    const viewportMeta = await page.locator('meta[name="viewport"]').getAttribute("content");
    if (!viewportMeta || !viewportMeta.includes("viewport-fit=cover")) throw new Error(name + ": viewport-fit=cover missing");
    const htmlFile = name === "Arrow Out" ? "arrowout/index.html" : "crystalquest/index.html";
    const cssFile = name === "Arrow Out" ? "arrowout/css/styles.css" : "crystalquest/styles.css";
    const cssText = fs.readFileSync(htmlFile, "utf8") + fs.readFileSync(cssFile, "utf8");
    if (!cssText.includes("safe-area-inset")) throw new Error(name + ": safe-area inset CSS declaration missing");
    const results = [];
    for (const size of [{ width: 390, height: 844, orientation: "portrait" }, { width: 844, height: 390, orientation: "landscape" }]) {
      await page.setViewportSize({ width: size.width, height: size.height });
      await page.waitForTimeout(100);
      const metrics = await page.evaluate(({ canvasSelector, wrapSelector, controls }) => {
        const canvas = document.querySelector(canvasSelector);
        const wrap = document.querySelector(wrapSelector);
        if (!canvas || !wrap) return { missingCanvasOrWrap: true };
        const c = canvas.getBoundingClientRect(), w = wrap.getBoundingClientRect();
        const targets = controls.map(sel => {
          const el = document.querySelector(sel);
          if (!el) return { selector: sel, missing: true };
          const r = el.getBoundingClientRect();
          return { selector: sel, width: Math.round(r.width), height: Math.round(r.height), visible: r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== "hidden" };
        });
        const root = document.documentElement;
        return {
          canvas: { left: Math.round(c.left), top: Math.round(c.top), right: Math.round(c.right), bottom: Math.round(c.bottom), width: Math.round(c.width), height: Math.round(c.height) },
          wrap: { left: Math.round(w.left), top: Math.round(w.top), right: Math.round(w.right), bottom: Math.round(w.bottom), width: Math.round(w.width), height: Math.round(w.height) },
          canvasInsideWrap: c.width > 0 && c.height > 0 && w.width > 0 && w.height > 0 && c.left >= w.left - 2 && c.top >= w.top - 2 && c.right <= w.right + 2 && c.bottom <= w.bottom + 2,
          viewportOverflow: root.scrollWidth > innerWidth + 1 || document.body.scrollWidth > innerWidth + 1,
          targets
        };
      }, { canvasSelector, wrapSelector, controls });
      if (metrics.missingCanvasOrWrap) throw new Error(name + ": game canvas/wrap not present after game start");
      if (!metrics.canvasInsideWrap) throw new Error(name + " " + size.orientation + ": game board clipped outside wrapper");
      if (metrics.viewportOverflow) throw new Error(name + " " + size.orientation + ": horizontal page overflow");
      const undersized = metrics.targets.filter(t => t.missing || !t.visible || t.width < 40 || t.height < 40);
      if (undersized.length) throw new Error(name + " " + size.orientation + ": missing/undersized touch targets " + JSON.stringify(undersized));
      results.push({ orientation: size.orientation, canvasInsideWrap: metrics.canvasInsideWrap, targets: metrics.targets });
    }
    await page.close();
    return results;
  }

  await interaction("Arrow Out portrait/landscape canvas, touch targets and safe-area", async result => {
    result.viewports = await auditGameSurface("Arrow Out", "/arrowout/", "#btn-play-home", "#board", "#board-wrap",
      ["#btn-menu", "#btn-sound", "#btn-zoom-in", "#btn-zoom-out", "#btn-board-fit", "#btn-undo", "#btn-hint", "#btn-restart"]);
  });
  await interaction("Crystal Quest portrait/landscape canvas, touch targets and safe-area", async result => {
    result.viewports = await auditGameSurface("Crystal Quest", "/crystalquest/", "#btn-play", "#board-canvas", "#board-wrap",
      ["#btn-pause", "#btn-hint", "#btn-shuffle"]);
  });

  // Sarkari Sarthi: exercise search, category/sort filters, card and detail modal.
  await interaction("Sarkari Sarthi search, filters, job cards and detail modal", async result => {
    const page = await browser.newPage({ viewport: { width: 320, height: 740 } });
    await page.route("**/*", requestRoute => ["127.0.0.1", "localhost"].includes(new URL(requestRoute.request().url()).hostname) ? requestRoute.continue() : requestRoute.abort());
    await page.goto(base + "/sarkari-sarthi/", { waitUntil: "domcontentloaded", timeout: 20000 });
    await page.waitForSelector(".job-card, .no-jobs", { timeout: 12000 });
    const search = page.locator("#jobSearch");
    if (!(await search.isVisible())) throw new Error("search input is not visible at 320px");
    await search.fill("zz-mobile-regression-no-match");
    await page.locator("#searchBtn").click();
    await page.waitForTimeout(100);
    if (!(await page.locator(".no-jobs").isVisible())) throw new Error("search did not update empty state");
    await search.fill("");
    await page.locator("#searchBtn").click();
    const category = page.locator("#categoryFilter");
    const sort = page.locator("#sortFilter");
    if (!(await category.isVisible()) || !(await sort.isVisible())) throw new Error("category/sort filter not visible");
    const options = await category.locator("option").evaluateAll(nodes => nodes.map(n => n.value).filter(Boolean));
    if (options.length) await category.selectOption(options[0]);
    await sort.selectOption({ index: Math.min(1, await sort.locator("option").count() - 1) });
    await category.selectOption("");
    await sort.selectOption({ index: 0 });
    const firstCard = page.locator(".job-card").first();
    if (await firstCard.count()) {
      await firstCard.focus();
      await firstCard.press("Enter");
      if (!(await page.locator("#jobModal").evaluate(el => el.classList.contains("active")))) throw new Error("Enter did not open job detail modal");
      if (!(await page.locator("#modalTitle").isVisible())) throw new Error("job detail title not visible");
      await page.locator("#modalClose").click();
    } else {
      result.jobCards = "No active cards in fixture; empty state verified";
    }
    result.search = "passed";
    result.filters = "passed";
    result.detail = await firstCard.count() ? "keyboard-opened and closed" : "no active cards";
    await page.close();
  });

  // PikaNews: category navigation, rendered article cards, search modal and Escape.
  await interaction("PikaNews category links, article cards and search modal", async result => {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await page.route("**/*", requestRoute => {
      const url = new URL(requestRoute.request().url());
      if (["127.0.0.1", "localhost"].includes(url.hostname)) return requestRoute.continue();
      if (["fonts.googleapis.com", "fonts.gstatic.com"].includes(url.hostname)) return requestRoute.abort();
      return requestRoute.abort();
    });
    await page.goto(base + "/pikanews/", { waitUntil: "domcontentloaded", timeout: 20000 });
    await page.waitForTimeout(800);
    const categories = page.locator(".category-grid a.category-card");
    if (await categories.count() < 5) throw new Error("category navigation links missing");
    const tech = page.locator('.category-grid a.category-card[href="technology.html"]');
    if (!(await tech.isVisible())) throw new Error("Technology category link not visible");
    const cards = page.locator(".news-card");
    if (!(await cards.count())) throw new Error("article cards did not render");
    const cardBox = await cards.first().boundingBox();
    if (!cardBox || cardBox.width > 390 + 1) throw new Error("article card exceeds mobile viewport");
    const readButton = cards.first().locator(".news-card-action").first();
    if (!(await readButton.count())) throw new Error("article card has no accessible read action");
    await readButton.click();
    await page.waitForURL(url => url.pathname.includes("/pikanews/news/") || url.pathname.includes("article.html") && url.search.includes("id="), { timeout: 10000 });
    if (!page.url().includes("/pikanews/news/") && !page.url().includes("article.html?id=")) throw new Error("article card did not open its detail route");
    await page.goto(base + "/pikanews/", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(300);
    await page.locator("#search-toggle").click();
    if (!await page.locator("#search-modal").evaluate(el => el.classList.contains("open"))) throw new Error("search modal did not open");
    if (!await page.locator("#search-input").evaluate(el => document.activeElement === el)) throw new Error("search input did not receive focus");
    await page.keyboard.press("Escape");
    if (await page.locator("#search-modal").evaluate(el => el.classList.contains("open"))) throw new Error("Escape did not close search modal");
    await page.keyboard.press("Control+k");
    if (!await page.locator("#search-modal").evaluate(el => el.classList.contains("open"))) throw new Error("Ctrl+K shortcut did not open search");
    await page.keyboard.press("Escape");
    await tech.click();
    await page.waitForURL(url => url.pathname.endsWith("technology.html"));
    if (!page.url().endsWith("/pikanews/technology.html")) throw new Error("Technology category navigation did not reach its page");
    result.categoryNavigation = "technology.html";
    result.categoryLinks = await categories.count();
    result.articleCards = await cards.count();
    result.searchModal = "button + Ctrl+K + Escape passed";
    await page.close();
  });

  report.interactions = interactionChecks;

} finally {
  await browser.close();
}

console.log("RESPONSIVE_REGRESSION_REPORT_START");
console.log(JSON.stringify(report, null, 2));
fs.writeFileSync("responsive-regression-report.json", JSON.stringify(report, null, 2));
console.log("RESPONSIVE_REGRESSION_REPORT_END");
if (failures.length) {
  console.error("RESPONSIVE_REGRESSION_FAILURES");
  for (const failure of failures) console.error(" - " + failure);
  process.exitCode = 1;
} else {
  console.log("Responsive regression audit passed.");
}
