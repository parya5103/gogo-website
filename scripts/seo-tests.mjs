/* GoGo Company - SEO regression suite (dependency-free, offline).
   Verifies on-page SEO invariants directly against repository files:
   titles, meta descriptions, canonicals, robots directives, H1 usage,
   JSON-LD validity, Open Graph metadata, sitemap integrity, robots.txt,
   legacy redirect stubs, internal link resolution and image alt text.
   Exits 1 on any failure so CI blocks SEO regressions. */

import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { runInNewContext } from 'node:vm';

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
        const nodes = Array.isArray(json['@graph']) ? json['@graph'] : [json];
        assert(nodes.length > 0 && nodes.every((node) => typeof node['@type'] === 'string' && node['@type'].length > 0), 'missing @type on one or more JSON-LD graph nodes');
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

check('homepage Organization and WebSite schema share one publisher entity', () => {
  const html = getHtml('index.html');
  const scripts = html.split('<script type="application/ld+json">').slice(1).map((part) => part.split('</script>')[0]);
  const schemas = scripts.map((json) => JSON.parse(json));
  const graph = schemas.flatMap((schema) => Array.isArray(schema['@graph']) ? schema['@graph'] : [schema]);
  const org = graph.find((schema) => schema['@type'] === 'Organization');
  const website = graph.find((schema) => schema['@type'] === 'WebSite');
  assert(org && org['@id'] === 'https://gogocompany.in/#organization', 'Organization needs a stable @id');
  assert(website && website['@id'] === 'https://gogocompany.in/#website', 'WebSite needs a stable @id');
  assert(website.publisher && website.publisher['@id'] === org['@id'], 'WebSite publisher must reference the Organization');
  assert(org.description.includes('PikaNews'), 'Organization description must include the current product portfolio');
  assert(org.logo && org.logo.url === 'https://gogocompany.in/favicon.svg', 'Organization must reference the GoGo brand mark');
  const logo = read('favicon.svg');
  assert(/<svg[^>]*width="512"[^>]*height="512"/.test(logo), 'brand logo must expose square 512px dimensions');
});

// Sitemap integrity

check('About page accurately represents the full GoGo portfolio and Sarkari Sarthi source labels', () => {
  const about = read('about/index.html');
  assert(about.includes('GoGo AI Intelligence'), 'About page must include the current AI product');
  assert(about.includes('../ai/'), 'About page must link to the AI hub');
  assert(about.includes('secondary public sources'), 'About page must disclose the Sarkari Sarthi source mix');
  assert(about.includes('verification status'), 'About page must explain source/verification labels');
  assert(!about.includes('Sarkari listings always link official government sources'), 'About page must not overstate verification');
  const title = titleOf(about) || '';
  const description = descOf(about) || '';
  assert(title.length >= 10 && title.length <= 75, 'About title length out of range');
  assert(description.length >= 50 && description.length <= 165, 'About description length out of range');
});

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
    // Product guides are published from their source repositories by the
    // sync-products workflow, so they are intentionally absent from the
    // central repository checkout used by this offline regression suite.
    const syncPublished = new Set([
      'arrowout/guide/index.html',
      'crystalquest/guide/index.html',
    ]);
    if (syncPublished.has(path)) continue;
    assert(existsSync(resolve(root, path)), 'sitemap target missing in repo: ' + path);
    const page = read(path);
    assert(canonicalOf(page) === loc, 'sitemap URL must match the page canonical: ' + loc);
    assert(!/\\bnoindex\\b/i.test(robotsOf(page) || ''), 'noindex URL must not be in root sitemap: ' + loc);
  }
  const forbidden = ['/account/', '/admin/', '/unsubscribe/', '/404.html', '/arrow-out/', '/crystal-quest/', '/sarkari/'];
  for (const f of forbidden) {
    assert(!locs.some((l) => l.endsWith(f)), 'noindex/redirect URL must not be in sitemap: ' + f);
  }
  assert(!locs.includes('https://gogocompany.in/about.html'), 'legacy company profile URL must not be in sitemap');
});

check('sitemap.xml: all indexable gogo pages, product roots and arrowout sub-pages listed', () => {
  const sm = read('sitemap.xml');
  const must = [
    'https://gogocompany.in/',
    'https://gogocompany.in/about/',
    'https://gogocompany.in/contact/',
    'https://gogocompany.in/disclaimer/',
    'https://gogocompany.in/privacy-policy/',
    'https://gogocompany.in/terms-and-conditions/',
    'https://gogocompany.in/arrowout/',
    'https://gogocompany.in/arrowout/guide/',
    'https://gogocompany.in/crystalquest/guide/',
    'https://gogocompany.in/arrowout/contact.html',
    'https://gogocompany.in/arrowout/privacy.html',
    'https://gogocompany.in/crystalquest/',
    'https://gogocompany.in/sarkari-sarthi/',
  ];
  for (const u of must) assert(sm.includes(u), 'sitemap missing ' + u);
});

// robots.txt
check('robots.txt: nothing blocked, exactly three active sitemaps declared and resolvable', () => {
  const rb = read('robots.txt');
  assert(rb.includes('User-agent: *'), 'missing User-agent: *');
  assert(!/^\s*Disallow:/m.test(rb), 'unexpected Disallow directive');
  const sitemapLines = rb.split('\n').filter((l) => l.trim().startsWith('Sitemap:'));
  const expected = [
    'Sitemap: https://gogocompany.in/sitemap.xml',
    'Sitemap: https://gogocompany.in/sarkari-sarthi/sitemap.xml',
    'Sitemap: https://gogocompany.in/pikanews/sitemap.xml',
  ];
  assert(sitemapLines.length === expected.length, 'expected ' + expected.length + ' Sitemap directives, found ' + sitemapLines.length);
  for (const line of expected) assert(sitemapLines.includes(line), 'robots.txt missing active sitemap: ' + line);
  assert(!rb.includes('news-sitemap.xml'), 'robots.txt must not advertise the empty PikaNews news sitemap');
  for (const line of sitemapLines) {
    const url = line.replace('Sitemap:', '').trim();
    assert(url.startsWith('https://'), 'sitemap URL not https: ' + url);
    let path = url.replace('https://gogocompany.in/', '');
    if (path === '') path = 'sitemap.xml';
    else if (path.endsWith('/')) path += 'sitemap.xml';
    assert(existsSync(resolve(root, path)), 'declared sitemap missing in repo: ' + path);
  }
});

// PikaNews homepage is a useful discovery landing page; syndicated listings and story excerpts remain noindex.
check('PikaNews homepage is indexable and listed; syndicated listings and story pages stay noindex', () => {
  const indexableHubs = [
    'latest.html', 'hollywood.html', 'entertainment.html',
    'technology.html', 'gaming.html', 'world.html', 'science.html',
  ];
  const noindexHubs = [
    'trending.html', 'bollywood.html', 'business.html', 'sports.html',
  ];
  const pages = [...indexableHubs, ...noindexHubs];
  const sm = read('pikanews/sitemap.xml');
  const pikaHome = read('pikanews/index.html');
  assert((pikaHome.match(/name="description"/g) || []).length === 1, 'PikaNews homepage must have exactly one meta description');
  assert((pikaHome.match(/rel="canonical"/g) || []).length === 1, 'PikaNews homepage must have exactly one canonical');
  assert((pikaHome.match(/property="og:title"/g) || []).length === 1, 'PikaNews homepage must have exactly one Open Graph title');
  assert((pikaHome.match(/property="og:description"/g) || []).length === 1, 'PikaNews homepage must have exactly one Open Graph description');
  assert(!(robotsOf(pikaHome) || '').includes('noindex'), 'PikaNews discovery homepage must be indexable');
  assert(canonicalOf(pikaHome) === 'https://gogocompany.in/pikanews/', 'PikaNews homepage canonical mismatch');
  assert(sm.includes('<loc>https://gogocompany.in/pikanews/</loc>'), 'PikaNews homepage must be in its sitemap');
  for (const page of pages) {
    const html = read('pikanews/' + page);
    const indexable = indexableHubs.includes(page);
    const robots = robotsOf(html) || '';
    assert(indexable ? !robots.includes('noindex') : robots.includes('noindex'), page + ' robots directive does not match its editorial eligibility');
    assert((html.match(/name=["']robots["']/gi) || []).length === 1, page + ' must have exactly one robots directive');
    assert(canonicalOf(html) === 'https://gogocompany.in/pikanews/' + page, page + ' canonical mismatch');
    const listed = sm.includes('<loc>https://gogocompany.in/pikanews/' + page + '</loc>');
    assert(indexable ? listed : !listed, page + ' sitemap membership does not match its robots directive');
  }
  const articleRoot = resolve(root, 'pikanews/news');
  const articleDir = readdirSync(articleRoot, { withFileTypes: true }).find(entry =>
    entry.isDirectory() && existsSync(join(articleRoot, entry.name, 'index.html'))
  );
  assert(articleDir, 'at least one generated PikaNews story page should exist');
  const article = read('pikanews/news/' + articleDir.name + '/index.html');
  assert((robotsOf(article) || '').includes('noindex'), 'syndicated excerpt pages should remain noindex');
  assert((article.match(/name=[\"']robots[\"']/gi) || []).length === 1, 'syndicated article must have exactly one robots directive');
  assert(!sm.includes('/pikanews/news/'), 'thin syndicated story pages must not be added to the standard sitemap');
});

// PikaNews sub-sitemaps (synced folder, verified on every test run)
check('pikanews sub-sitemaps present, news sitemap uses the Google news namespace', () => {
  const pikaSm = read('pikanews/sitemap.xml');
  assert(pikaSm.startsWith('<?xml'), 'pikanews/sitemap.xml unreadable');
  const newsSm = read('pikanews/news-sitemap.xml');
  assert(newsSm.startsWith('<?xml'), 'pikanews/news-sitemap.xml unreadable');
  assert(newsSm.includes('http://www.google.com/schemas/sitemap-news/0.9'), 'news-sitemap.xml missing Google news namespace');
});

// Legacy redirect stubs
const stubs = [
  ['arrow-out/index.html', 'https://gogocompany.in/arrowout/', '/arrowout/'],
  ['crystal-quest/index.html', 'https://gogocompany.in/crystalquest/', '/crystalquest/'],
  ['sarkari/index.html', 'https://gogocompany.in/sarkari-sarthi/', '/sarkari-sarthi/'],
  ['about.html', 'https://gogocompany.in/about/', '/about/'],
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



// Phase 1: prevent the old mixed-language Google Trends keyword dump from
// returning through either the React source or the scheduled static prerender.
check('homepage: no mixed-language search-trend dump in source or prerender output', () => {
  const homepage = getHtml('index.html');
  const app = read('frontend/src/App.jsx');
  const prerender = read('scripts/prerender-home.mjs');
  assert(!/TRENDING SEARCHES IN INDIA|trends-strip|gogo-trending|Today on GoGo Company/i.test(homepage), 'rendered homepage still contains feed or search-trend content');
  assert(!/TodayOnGoGo|id=[\"']today[\"']/.test(app), 'React homepage still renders the mixed feed section');
  assert(!/TRENDING SEARCHES IN INDIA|trends-strip|trends\.length/i.test(app), 'React homepage still renders the search-trend component');
  assert(!/trends\.google\.com\/trending\/rss|fetchTrends|trends:\s*\[\]/i.test(prerender), 'scheduled prerender still fetches or serializes Google Trends');
});

check('canonical routes: legacy about URL is noindex and excluded; folder URLs are unique', () => {
  const sitemap = read('sitemap.xml');
  const about = read('about.html');
  const aboutCanonical = canonicalOf(getHtml('about/index.html'));
  const contactCanonical = canonicalOf(getHtml('contact/index.html'));
  assert((robotsOf(about) || '').includes('noindex'), 'legacy /about.html must remain noindex');
  assert(canonicalOf(about) === 'https://gogocompany.in/about/', 'legacy /about.html must canonicalize to /about/');
  assert(!sitemap.includes('<loc>https://gogocompany.in/about.html</loc>'), 'legacy /about.html must not appear in sitemap');
  assert(aboutCanonical === 'https://gogocompany.in/about/', 'folder About canonical mismatch');
  assert(contactCanonical === 'https://gogocompany.in/contact/', 'folder Contact canonical mismatch');
  const locs = [...sitemap.matchAll(/<loc>\s*([^<]+)\s*<\/loc>/gi)].map(match => match[1].trim());
  assert(new Set(locs).size === locs.length, 'root sitemap contains duplicate URL entries');
  assert(locs.filter(url => url === 'https://gogocompany.in/about/').length === 1, 'About canonical must appear exactly once');
  assert(locs.filter(url => url === 'https://gogocompany.in/contact/').length === 1, 'Contact canonical must appear exactly once');
  assert(!locs.some(url => /\/index\.html(?:$|[?#])/i.test(url)), 'root sitemap must use folder URLs instead of index.html aliases');
});



check('Arrow Out guide: privacy and contact links resolve to product-level pages', () => {
  const guide = read('arrowout/guide/index.html');
  assert(guide.includes('href="../privacy.html"'), 'guide must link to /arrowout/privacy.html');
  assert(guide.includes('href="../contact.html"'), 'guide must link to /arrowout/contact.html');
  assert(!guide.includes('href="privacy.html"'), 'guide must not link to missing guide/privacy.html');
  assert(!guide.includes('href="contact.html"'), 'guide must not link to missing guide/contact.html');
});

check('AI hub: title and meta description stay within search snippet limits', () => {
  const ai = read('ai/index.html');
  const title = titleOf(ai) || '';
  const description = descOf(ai) || '';
  assert(title.length >= 10 && title.length <= 60, 'AI title length ' + title.length + ' outside 10-60');
  assert(description.length >= 70 && description.length <= 160, 'AI description length ' + description.length + ' outside 70-160');
});

check('PikaNews homepage: accurate discovery-feed schema and search metadata', () => {
  const pika = read('pikanews/index.html');
  const title = titleOf(pika) || '';
  const description = descOf(pika) || '';
  assert(title.length >= 10 && title.length <= 60, 'PikaNews title length ' + title.length + ' outside 10-60');
  assert(description.length >= 70 && description.length <= 160, 'PikaNews description length ' + description.length + ' outside 70-160');
  assert(pika.includes('"@type": "WebSite"'), 'PikaNews should use WebSite schema for a discovery feed');
  assert(!pika.includes('"@type": "NewsMediaOrganization"'), 'aggregator must not claim NewsMediaOrganization');
  assert(pika.includes('original publisher'), 'PikaNews must make original-source links clear');
});

check('PikaNews: topic hubs follow the source quality gate and article templates stay noindex', () => {
  const sitemap = read('pikanews/sitemap.xml');
  for (const page of ['pikanews/latest.html', 'pikanews/bollywood.html', 'pikanews/technology.html']) {
    const html = read(page);
    const noindex = (robotsOf(html) || '').includes('noindex');
    const listed = sitemap.includes('https://gogocompany.in/' + page);
    assert(noindex ? !listed : listed, page + ' indexation must agree with the quality-gated sitemap');
  }
  for (const page of ['pikanews/trending.html', 'pikanews/article.html']) {
    const html = read(page);
    assert((robotsOf(html) || '').includes('noindex'), page + ' must remain noindex');
    assert(!sitemap.includes('https://gogocompany.in/' + page), page + ' must remain out of the sitemap');
  }
});

check('PikaNews: latest and terms descriptions meet length limits', () => {
  const latest = read('pikanews/latest.html');
  const terms = read('pikanews/terms.html');
  assert((descOf(latest) || '').length <= 160, 'latest description exceeds 160 characters');
  assert((descOf(terms) || '').length >= 70, 'terms description is too short');
});

check('Sarkari Sarthi: heading hierarchy does not skip levels', () => {
  const html = read('sarkari-sarthi/index.html');
  const levels = [...html.matchAll(/<h([1-6])\b[^>]*>/gi)].map(match => Number(match[1]));
  for (let i = 1; i < levels.length; i += 1) {
    assert(levels[i] <= levels[i - 1] + 1, 'heading hierarchy skips from H' + levels[i - 1] + ' to H' + levels[i]);
  }
});

console.log('SEO regression suite: ' + passed + ' checks passed, ' + failures.length + ' failed.');
if (failures.length > 0) {
  console.error('\nSEO failures:');
  for (const f of failures) console.error(' - ' + f);
  process.exitCode = 1;
}
