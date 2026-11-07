/* GoGo Company - SEO regression suite (dependency-free, offline).
   Verifies on-page SEO invariants directly against repository files:
   titles, meta descriptions, canonicals, robots directives, H1 usage,
   JSON-LD validity, Open Graph metadata, sitemap integrity, robots.txt,
   legacy redirect stubs, internal link resolution and image alt text.
   Exits 1 on any failure so CI blocks SEO regressions. */

import { readFileSync, existsSync } from 'node:fs';
import { resolve, join } from 'node:path';

const root = process.cwd();
let passed = 0;
const failures = [];

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

function check(title, fn) {
  try {
    fn();
    passed += 1;
    console.log('PASS: ' + title);
  } catch (err) {
    failures.push(title + ' :: ' + (err && err.message ? err.message : String(err)));
    console.error('FAIL: ' + title);
  }
}

const read = (p) => readFileSync(resolve(root, p), 'utf8');

// [file, expectedCanonical, indexable]
const ownedPages = [
  ['index.html', 'https://gogocompany.in/', true],
  ['about/index.html', 'https://gogocompany.in/about/', true],
  ['contact/index.html', 'https://gogocompany.in/contact/', true],
  ['disclaimer/index.html', 'https://gogocompany.in/disclaimer/', true],
  ['privacy-policy/index.html', 'https://gogocompany.in/privacy-policy/', true],
  ['terms-and-conditions/index.html', 'https://gogocompany.in/terms-and-conditions/', true],
  ['account/index.html', 'https://gogocompany.in/account/', false],
  ['unsubscribe/index.html', 'https://gogocompany.in/unsubscribe/', false],
  ['admin/index.html', 'https://gogocompany.in/admin/', false],
  ['404.html', 'https://gogocompany.in/404.html', false],
];

const titles = new Map();
const descs = new Map();
const htmlCache = new Map();
const getHtml = (p) => {
  if (!htmlCache.has(p)) htmlCache.set(p, read(p));
  return htmlCache.get(p);
};

const pick = (html, re) => {
  const m = html.match(re);
  return m ? m[1] : null;
};

const titleOf = (html) => pick(html, /<title>([^<]*)<\/title>/);
const descOf = (html) => pick(html, /<meta name="description" content="([^"]*)"/);
const canonicalOf = (html) => pick(html, /<link rel="canonical" href="([^"]*)"/);
const robotsOf = (html) => pick(html, /<meta name="robots" content="([^"]*)"/);

for (const [page, expectedCanonical, isIndexable] of ownedPages) {
  const html = getHtml(page);
  const title = titleOf(html);
  const desc = descOf(html);

  check(page + ': title present, unique, 10-75 chars', () => {
    assert(title, 'missing <title>');
    assert(title.length >= 10 && title.length <= 75, 'title length ' + title.length + ' outside 10-75');
    assert(!titles.has(title), 'duplicate title, also used by ' + titles.get(title));
    titles.set(title, page);
  });

  check(page + ': meta description present, unique, sensible length', () => {
    assert(desc, 'missing meta description');
    const limit = isIndexable ? 165 : 200;
    assert(desc.length >= 50 && desc.length <= limit, 'description length ' + desc.length + ' outside 50-' + limit);
    assert(!descs.has(desc), 'duplicate description, also used by ' + descs.get(desc));
    descs.set(desc, page);
  });

  check(page + ': canonical is absolute https and matches expected URL', () => {
    const canon = canonicalOf(html);
    assert(canon === expectedCanonical, 'canonical ' + canon + ' != expected ' + expectedCanonical);
  });

  check(page + ': robots meta directive correct', () => {
    const robots = robotsOf(html) || '';
    if (isIndexable) {
      assert(!robots.includes('noindex'), 'indexable page must not carry noindex (got: ' + robots + ')');
    } else {
      assert(robots.includes('noindex'), 'page must carry noindex (got: ' + robots + ')');
    }
  });

  check(page + ': exactly one H1 containing text', () => {
    const h1s = html.match(/<h1[\s>][\s\S]*?<\/h1>/g) || [];
    assert(h1s.length === 1, 'found ' + h1s.length + ' H1 tags');
    const text = h1s[0].replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    assert(text.length > 0, 'H1 contains no text');
  });

  if (isIndexable) {
    check(page + ': JSON-LD parses with valid schema.org context and type', () => {
      const blocks = html.match(/<script type="application\/ld\+json">[\s\S]*?<\/script>/g) || [];
      assert(blocks.length > 0, 'no JSON-LD found');
      for (const b of blocks) {
        const json = JSON.parse(b.replace(/^<script type="application\/ld\+json">/, '').replace(/<\/script>$/, ''));
        assert(json['@context'] === 'https://schema.org', 'unexpected @context: ' + json['@context']);
        assert(typeof json['@type'] === 'string' && json['@type'].length > 0, 'missing @type');
      }
    });

    check(page + ': BreadcrumbList structured data present', () => {
      assert(/"@type":\s*"BreadcrumbList"/.test(html), 'missing BreadcrumbList');
    });

    check(page + ': Open Graph and Twitter card metadata present', () => {
      for (const tag of ['og:type', 'og:title', 'og:description', 'og:url', 'og:image']) {
        assert(html.includes('property="' + tag + '"'), 'missing ' + tag);
      }
      assert(html.includes('name="twitter:card"'), 'missing twitter:card');
    });
  }
}

// Sitemap integrity
check('sitemap.xml: locs absolute, unique, targets exist, no noindex URLs', () => {
  const sm = read('sitemap.xml');
  const locs = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  assert(locs.length >= 9, 'expected at least 9 URLs, found ' + locs.length);
  const seen = new Set();
  for (const loc of locs) {
    assert(loc.startsWith('https://gogocompany.in/'), 'non-absolute loc: ' + loc);
    assert(!seen.has(loc), 'duplicate sitemap loc: ' + loc);
    seen.add(loc);
    let path = loc.replace('https://gogocompany.in/', '');
    if (path === '') path = 'index.html';
    else if (path.endsWith('/')) path += 'index.html';
    assert(existsSync(resolve(root, path)), 'sitemap target missing in repo: ' + path);
  }
  const forbidden = ['/account/', '/admin/', '/unsubscribe/', '/404.html', '/arrow-out/', '/crystal-quest/', '/sarkari/'];
  for (const f of forbidden) {
    assert(!locs.some((l) => l.endsWith(f)), 'noindex/redirect URL must not be in sitemap: ' + f);
  }
});

check('sitemap.xml: all indexable gogo pages and all four products listed', () => {
  const sm = read('sitemap.xml');
  const must = [
    'https://gogocompany.in/',
    'https://gogocompany.in/about/',
    'https://gogocompany.in/contact/',
    'https://gogocompany.in/disclaimer/',
    'https://gogocompany.in/privacy-policy/',
    'https://gogocompany.in/terms-and-conditions/',
    'https://gogocompany.in/arrowout/',
    'https://gogocompany.in/crystalquest/',
    'https://gogocompany.in/sarkari-sarthi/',
    'https://gogocompany.in/pikanews/',
  ];
  for (const u of must) assert(sm.includes(u), 'sitemap missing ' + u);
});

// robots.txt
check('robots.txt: nothing blocked, declared sitemaps resolvable', () => {
  const rb = read('robots.txt');
  assert(rb.includes('User-agent: *'), 'missing User-agent: *');
  assert(!/^\s*Disallow:/m.test(rb), 'unexpected Disallow directive');
  const sitemapLines = rb.split('\n').filter((l) => l.trim().startsWith('Sitemap:'));
  assert(sitemapLines.length >= 1, 'no Sitemap directive');
  for (const line of sitemapLines) {
    const url = line.replace('Sitemap:', '').trim();
    assert(url.startsWith('https://'), 'sitemap URL not https: ' + url);
    let path = url.replace('https://gogocompany.in/', '');
    if (path === '') path = 'sitemap.xml';
    else if (path.endsWith('/')) path += 'sitemap.xml';
    assert(existsSync(resolve(root, path)), 'declared sitemap missing in repo: ' + path);
  }
});

// Legacy redirect stubs
const stubs = [
  ['arrow-out/index.html', 'https://gogocompany.in/arrowout/', '/arrowout/'],
  ['crystal-quest/index.html', 'https://gogocompany.in/crystalquest/', '/crystalquest/'],
  ['sarkari/index.html', 'https://gogocompany.in/sarkari-sarthi/', '/sarkari-sarthi/'],
];
for (const [file, canon, target] of stubs) {
  check(file + ': redirect stub correct (noindex, canonical, refresh, target exists)', () => {
    const html = read(file);
    assert((robotsOf(html) || '').includes('noindex'), 'stub missing noindex');
    assert(canonicalOf(html) === canon, 'stub canonical wrong');
    assert(html.includes('http-equiv="refresh"'), 'stub missing meta refresh');
    assert(html.includes(target), 'stub does not point to ' + target);
    const targetPath = target.replace(/^\//, '').replace(/\/$/, '') + '/index.html';
    assert(existsSync(resolve(root, targetPath)), 'redirect target missing: ' + targetPath);
  });
}

// Internal link resolution
function linkTargetExists(href, baseDir) {
  let p = href.split('#')[0].split('?')[0];
  if (!p) return true;
  if (/^(https?:|mailto:|tel:)/i.test(p)) return true;
  if (p.startsWith('/')) p = p.slice(1);
  const abs = resolve(root, baseDir || '.', p);
  return existsSync(abs) || existsSync(join(abs, 'index.html'));
}

for (const [page, , isIndexable] of ownedPages) {
  check(page + ': internal links in source HTML resolve to real files', () => {
    const html = getHtml(page);
    const baseDir = page.includes('/') ? page.slice(0, page.lastIndexOf('/')) : '.';
    const hrefs = [...html.matchAll(/<a\s[^>]*href="([^"]*)"/g)].map((m) => m[1]);
    if (isIndexable && page === 'index.html') {
      assert(hrefs.length >= 3, 'homepage expected several internal links, found ' + hrefs.length);
    }
    for (const href of hrefs) {
      assert(linkTargetExists(href, baseDir), 'broken internal link ' + href + ' on ' + page);
    }
  });
}

// Nav/footer injected by main.js (single source of truth for sitewide links)
check('assets/js/main.js: nav and footer link targets resolve from site root', () => {
  const js = read('assets/js/main.js');
  const hrefs = [...js.matchAll(/\{\s*href:\s*"([^"]*)"/g)].map((m) => m[1]);
  assert(hrefs.length >= 10, 'expected nav/footer link targets in main.js, found ' + hrefs.length);
  for (const href of hrefs) {
    assert(linkTargetExists(href, '.') || linkTargetExists(href, 'about'), 'main.js link target does not resolve: ' + href);
  }
});

// Images must carry alt text
check('owned pages and main.js: every <img> has alt text', () => {
  for (const [page] of ownedPages) {
    const imgs = getHtml(page).match(/<img\b[^>]*>/g) || [];
    for (const img of imgs) assert(/\balt=/.test(img), 'img without alt on ' + page + ': ' + img.slice(0, 80));
  }
  const jsImgs = read('assets/js/main.js').match(/<img\b[^>]*>/g) || [];
  for (const img of jsImgs) assert(/\balt=/.test(img), 'img without alt in main.js: ' + img.slice(0, 80));
});

console.log('SEO regression suite: ' + passed + ' checks passed, ' + failures.length + ' failed.');
if (failures.length > 0) {
  console.error('\nSEO failures:');
  for (const f of failures) console.error(' - ' + f);
  process.exitCode = 1;
}
