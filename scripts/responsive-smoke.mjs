import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const base = process.env.BASE_URL || "http://127.0.0.1:4173";
const widths = [360, 390, 430, 768, 1024, 1440];
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
} finally {
  await browser.close();
}

console.log("RESPONSIVE_REGRESSION_REPORT_START");
console.log(JSON.stringify(report, null, 2));
console.log("RESPONSIVE_REGRESSION_REPORT_END");
if (failures.length) {
  console.error("RESPONSIVE_REGRESSION_FAILURES");
  for (const failure of failures) console.error(" - " + failure);
  process.exitCode = 1;
} else {
  console.log("Responsive regression audit passed.");
}
