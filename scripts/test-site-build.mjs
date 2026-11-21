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
assert.match(html, /href="\/gta6\//, 'GTA 6 guide link is crawlable from the prerendered homepage');
assert.match(html, /href="\/ai\//, 'GoGo AI Intelligence is crawlable from the prerendered homepage');
assert.ok(html.includes('https://whatsapp.com/channel/0029VbE1ulAAjPXQZiUbbu1Z'), 'Sarkari Sarthi WhatsApp channel is shown on its product card');
assert.ok(html.includes('https://t.me/SarkariSarthi'), 'Sarkari Sarthi Telegram join link is shown on its product card');
assert.ok(html.includes('https://whatsapp.com/channel/0029Vb5zVwjICVfnQ95zT10F'), 'PikaNews WhatsApp channel is shown on its product card');
assert.match(html, /GTA 6 Guide/, 'GTA 6 has a visible homepage product card');
assert.match(html, /application\/ld\+json/, 'JSON-LD is in initial HTML');
assert.match(html, /Brand disambiguation/i, 'brand disambiguation is in initial HTML');
assert.match(html, /Frequently asked[\s\S]*?questions/i, 'FAQ is in initial HTML');
assert.doesNotMatch(html, /window\.__GOGO_FEEDS__=|Today on GoGo Company|TRENDING SEARCHES IN INDIA|trends-strip|gogo-trending/i, 'homepage must not embed feeds or volatile search-trend keywords');
for (const path of ['arrowout/index.html','crystalquest/index.html','sarkari-sarthi/index.html','pikanews/index.html','CNAME','robots.txt','sitemap.xml','firebase-messaging-sw.js','assets/js/gogo-account.js','assets/js/gogo-notifications.min.js']) {
  await stat(root + '/' + path);
}
console.log('PASS: prerendered homepage and protected deployment assets verified.');
