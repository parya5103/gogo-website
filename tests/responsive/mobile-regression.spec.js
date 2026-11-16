import { test, expect } from '@playwright/test';

const BASE = process.env.BASE_URL || 'https://gogocompany.in';
const widths = [320, 360, 390, 430, 768, 1024, 1280];
const routes = [
  { name: 'GoGo home', path: '/', kind: 'gogo' },
  { name: 'Arrow Out', path: '/arrowout/', kind: 'arrow' },
  { name: 'Crystal Quest', path: '/crystalquest/', kind: 'crystal' },
  { name: 'Sarkari Sarthi', path: '/sarkari-sarthi/', kind: 'sarkari' },
  { name: 'PikaNews', path: '/pikanews/', kind: 'pika' },
];

async function openPage(page, path) {
  const response = await page.goto(new URL(path, BASE).toString(), { waitUntil: 'domcontentloaded' });
  expect(response && response.status(), `HTTP response for ${path}`).toBeLessThan(400);
  await page.locator('body').waitFor();
  await page.waitForLoadState('load').catch(() => {});
}

async function noHorizontalOverflow(page) {
  const metrics = await page.evaluate(() => {
    const width = document.documentElement.clientWidth;
    const offenders = [...document.querySelectorAll("body *")].map(el => {
      const r = el.getBoundingClientRect();
      const s = getComputedStyle(el);
      return { tag: el.tagName.toLowerCase(), id: el.id, className: typeof el.className === "string" ? el.className.slice(0, 100) : "", left: Math.round(r.left), right: Math.round(r.right), width: Math.round(r.width), position: s.position, overflowX: s.overflowX };
    }).filter(x => x.width > 0 && (x.left < -1 || x.right > width + 1)).slice(0, 12);
    const ticker = [".ticker", ".ticker-inner", ".ticker-label", ".ticker-viewport", ".ticker-track"].map(selector => {
      const el = document.querySelector(selector);
      if (!el) return { selector, missing: true };
      const r = el.getBoundingClientRect(), s = getComputedStyle(el);
      return { selector, left: Math.round(r.left), right: Math.round(r.right), width: Math.round(r.width), clientWidth: el.clientWidth, scrollWidth: el.scrollWidth, overflowX: s.overflowX, overflowY: s.overflowY, contain: s.contain, transform: s.transform };
    });
    return { width, scroll: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth), offenders, ticker };
  });
  expect(metrics.scroll, `horizontal overflow: ${JSON.stringify(metrics)}`).toBeLessThanOrEqual(metrics.width + 1);
}

test.describe('responsive viewport matrix', () => {
  for (const route of routes) {
    for (const width of widths) {
      test(`${route.name} has no horizontal overflow at ${width}px`, async ({ page }) => {
        await page.setViewportSize({ width, height: width <= 430 ? 844 : 900 });
        await openPage(page, route.path);
        await noHorizontalOverflow(page);
      });
    }
  }
});

test.describe('GoGo shared navigation accessibility', () => {
  test('mobile menu opens with keyboard, exposes state, closes with Escape and returns focus', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await openPage(page, '/');
    const toggle = page.locator('.nav-toggle');
    const nav = page.locator('#site-nav');
    await expect(toggle).toBeVisible();
    await toggle.focus();
    await page.keyboard.press('Enter');
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(nav).toHaveClass(/open/);
    await expect(page.locator('body')).toHaveCSS('overflow', 'hidden');
    await page.keyboard.press('Escape');
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(nav).not.toHaveClass(/open/);
    await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden');
    await expect(toggle).toBeFocused();
  });

  test('mobile navigation links remain reachable by keyboard', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await openPage(page, '/');
    const toggle = page.locator('.nav-toggle');
    await toggle.focus();
    await page.keyboard.press('Space');
    const firstLink = page.locator('#site-nav a').first();
    await expect(firstLink).toBeVisible();
    await firstLink.focus();
    await expect(firstLink).toBeFocused();
  });
});

test.describe('Arrow Out touch, board and orientation', () => {
  test('touch controls have usable hit areas and board stays inside viewport', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 740 });
    await openPage(page, '/arrowout/');
    const result = await page.evaluate(() => {
      const controls = [...document.querySelectorAll('button, [role="button"]')]
        .filter(el => el.getClientRects().length && getComputedStyle(el).visibility !== 'hidden');
      const small = controls.map(el => {
        const r = el.getBoundingClientRect();
        return { label: (el.getAttribute('aria-label') || el.textContent || el.id).trim().slice(0, 40), w: r.width, h: r.height };
      }).filter(x => x.w < 40 || x.h < 40);
      const board = document.querySelector('#board');
      const r = board?.getBoundingClientRect();
      return { small, board: r && { left:r.left, right:r.right, top:r.top, bottom:r.bottom }, vw:innerWidth, vh:innerHeight };
    });
    expect(result.small, 'visible controls below 40px').toEqual([]);
    if (result.board) {
      expect(result.board.left).toBeGreaterThanOrEqual(-1);
      expect(result.board.right).toBeLessThanOrEqual(result.vw + 1);
      expect(result.board.top).toBeGreaterThanOrEqual(-1);
      expect(result.board.bottom).toBeLessThanOrEqual(result.vh + 1);
    }
    await expect(page.locator('meta[name="viewport"]')).toHaveAttribute('content', /viewport-fit=cover/);
  });

  test('landscape layout does not clip the game board', async ({ page }) => {
    await page.setViewportSize({ width: 844, height: 390 });
    await openPage(page, '/arrowout/');
    const r = await page.locator('#board-wrap').boundingBox();
    if (r) {
      expect(r.x).toBeGreaterThanOrEqual(-1);
      expect(r.x + r.width).toBeLessThanOrEqual(845);
      expect(r.y + r.height).toBeLessThanOrEqual(391);
    }
  });
});

test.describe('Crystal Quest touch, board and orientation', () => {
  test('home controls have usable hit areas and app fits narrow viewport', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 740 });
    await openPage(page, '/crystalquest/');
    const result = await page.evaluate(() => {
      const app = document.querySelector('#app')?.getBoundingClientRect();
      const controls = [...document.querySelectorAll('#app button')]
        .filter(el => el.getClientRects().length && !el.hidden);
      const small = controls.map(el => {
        const r = el.getBoundingClientRect();
        return { label:(el.textContent || el.id).trim().slice(0,35), w:r.width, h:r.height };
      }).filter(x => x.w < 40 || x.h < 40);
      return { app:app && {left:app.left,right:app.right,top:app.top,bottom:app.bottom}, small, vw:innerWidth, vh:innerHeight };
    });
    expect(result.small, 'visible home controls below 40px').toEqual([]);
    if (result.app) {
      expect(result.app.left).toBeGreaterThanOrEqual(-1);
      expect(result.app.right).toBeLessThanOrEqual(result.vw + 1);
      expect(result.app.top).toBeGreaterThanOrEqual(-1);
      expect(result.app.bottom).toBeLessThanOrEqual(result.vh + 1);
    }
    await expect(page.locator('meta[name="viewport"]')).toHaveAttribute('content', /viewport-fit=cover/);
  });

  test('landscape app remains within the viewport', async ({ page }) => {
    await page.setViewportSize({ width: 844, height: 390 });
    await openPage(page, '/crystalquest/');
    const r = await page.locator('#app').boundingBox();
    expect(r).not.toBeNull();
    expect(r.x).toBeGreaterThanOrEqual(-1);
    expect(r.x + r.width).toBeLessThanOrEqual(845);
    expect(r.y + r.height).toBeLessThanOrEqual(391);
  });
});

test.describe('Sarkari Sarthi narrow-screen job flows', () => {
  test('search, category and sort filters are usable at 320px', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await openPage(page, '/sarkari-sarthi/');
    const search = page.locator('#jobSearch');
    await expect(search).toBeVisible();
    await search.fill('bank');
    await page.locator('#searchBtn').click();
    await page.locator('#categoryFilter').selectOption('Banking');
    await page.locator('#sortFilter').selectOption('deadline');
    await noHorizontalOverflow(page);
    await expect(page.locator('#jobsGrid')).toBeVisible();
  });

  test('job cards or honest empty state fit narrow screen; detail link opens', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await openPage(page, '/sarkari-sarthi/');
    const cards = page.locator('#jobsGrid .job-card');
    const count = await cards.count();
    if (count > 0) {
      const first = cards.first();
      const box = await first.boundingBox();
      expect(box).not.toBeNull();
      expect(box.x).toBeGreaterThanOrEqual(-1);
      expect(box.x + box.width).toBeLessThanOrEqual(361);
      const link = first.locator('a[href]').first();
      if (await link.count()) {
        const href = await link.getAttribute('href');
        expect(href).toBeTruthy();
        const detail = await page.context().newPage();
        await openPage(detail, href.startsWith('http') ? href : new URL(href, page.url()).toString());
        expect(detail.url()).toMatch(/job\//);
        await noHorizontalOverflow(detail);
        await detail.close();
      }
    } else {
      await expect(page.locator('#jobsGrid')).toBeVisible();
    }
    await noHorizontalOverflow(page);
  });

  test('mobile drawer supports keyboard, backdrop close and scroll lock state', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await openPage(page, '/sarkari-sarthi/');
    const toggle = page.locator('#mobileMenuToggle');
    const nav = page.locator('#navMenu');
    await expect(toggle).toBeVisible();
    await toggle.focus();
    await page.keyboard.press('Enter');
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(nav).toHaveClass(/active/);
    await expect(page.locator('#menuBackdrop')).toBeVisible();
    await expect(page.locator('body')).toHaveCSS('overflow', 'hidden');
    await page.keyboard.press('Escape');
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(nav).not.toHaveClass(/active/);
    await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden');
    await toggle.click();
    await page.locator('#menuBackdrop').click({ force: true });
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });
});

test.describe('PikaNews categories, articles, drawer and search modal', () => {
  test('category navigation and article cards fit 320px', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await openPage(page, '/pikanews/');
    await expect(page.getByRole('navigation', { name: 'News categories' })).toBeVisible();
    await expect(page.locator('.category-card').first()).toBeVisible();
    const article = page.locator('a[href*="/news/"]').first();
    if (await article.count()) {
      const box = await article.boundingBox();
      expect(box).not.toBeNull();
      expect(box.x).toBeGreaterThanOrEqual(-1);
      expect(box.x + box.width).toBeLessThanOrEqual(321);
    }
    await noHorizontalOverflow(page);
  });

  test('drawer opens, closes by backdrop and Escape, with keyboard state', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await openPage(page, '/pikanews/');
    const toggle = page.locator('#mobile-menu-toggle');
    const drawer = page.locator('#mobile-menu');
    await expect(toggle).toBeVisible();
    await toggle.focus();
    await page.keyboard.press('Enter');
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(drawer).toHaveClass(/open/);
    await expect(page.locator('body')).toHaveCSS('overflow', 'hidden');
    await expect(page.locator('.mobile-menu-backdrop')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(drawer).not.toHaveClass(/open/);
    await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden');
    await expect(toggle).toBeFocused();
    await toggle.click();
    await page.locator('.mobile-menu-backdrop').click({ force: true });
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });

  test('search modal opens, focuses input and closes with Escape', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await openPage(page, '/pikanews/');
    await page.locator('#search-toggle').click();
    await expect(page.locator('#search-modal')).toHaveClass(/open/);
    await expect(page.locator('#search-input')).toBeFocused();
    await page.locator('#search-input').fill('technology');
    await page.keyboard.press('Escape');
    await expect(page.locator('#search-modal')).not.toHaveClass(/open/);
    await noHorizontalOverflow(page);
  });
});
