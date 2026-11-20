#!/usr/bin/env node
import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
const root = process.cwd();
const html = await readFile(root + '/index.html','utf8');
assert.match(html, /Play\. Prepare\./, 'homepage has an SSR hero heading');
assert.match(html, /href="\/arrowout\//, 'Arrow Out link is crawlable');
assert.match(html, /href="\/crystalquest\//, 'Crystal Quest link is crawlable');
assert.match(html, /href="\/sarkari-sarthi\//, 'Sarkari Sarthi link is crawlable');
assert.match(html, /href="\/pikanews\//, 'PikaNews link is crawlable');
assert.match(html, /application\/ld\+json/, 'JSON-LD is in initial HTML');
assert.match(html, /Brand disambiguation/i, 'brand disambiguation is in initial HTML');
assert.match(html, /Frequently asked questions/i, 'FAQ is in initial HTML');
assert.match(html, /window\.__GOGO_FEEDS__=/, 'feed snapshot is serialized for hydration');
for (const path of ['arrowout/index.html','crystalquest/index.html','sarkari-sarthi/index.html','pikanews/index.html','CNAME','robots.txt','sitemap.xml','firebase-messaging-sw.js','assets/js/gogo-account.js','assets/js/gogo-notifications.min.js']) {
  await stat(root + '/' + path);
}
console.log('PASS: prerendered homepage and protected deployment assets verified.');
