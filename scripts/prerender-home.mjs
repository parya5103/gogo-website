#!/usr/bin/env node
import { readFile, writeFile } from 'node:fs/promises';
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { createServer } from 'vite';

const ROOT = process.cwd();
const safeUrl = value => {
  try { const url = new URL(value); return url.protocol === 'https:' ? url.href : null; }
  catch { return null; }
};
const parseDate = value => {
  if (!value) return null;
  const match = String(value).match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (match) return new Date(Number(match[3]), Number(match[2])-1, Number(match[1]), 23, 59, 59);
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};
async function json(path, fallback) {
  try { return JSON.parse(await readFile(path, 'utf8')); } catch { return fallback; }
}
async function getFeeds() {
  const manifest = await json(ROOT + '/sarkari-sarthi/jobs/job_manifest.json', {});
  const jobs = (Array.isArray(manifest.jobs) ? manifest.jobs : [])
    .filter(job => job && job.status === 'active' && safeUrl(job.url))
    .filter(job => { const last = parseDate(job.important_dates?.last_date); return !last || last >= new Date(); })
    .slice(0, 3)
    .map(job => ({ id: String(job.id || job.title), title: String(job.title || 'Recruitment notice').slice(0, 180), organization: String(job.organization || '').slice(0, 100), source: String(job.source || 'Recruitment source').slice(0, 80), url: safeUrl(job.url), lastDate: job.important_dates?.last_date || '' }));
  const news = await json(ROOT + '/pikanews/data/latest.json', []);
  const stories = (Array.isArray(news) ? news : []).filter(item => item && item.title && safeUrl(item.url))
    .slice(0, 3).map(item => ({ id: String(item.id || item.url), title: String(item.title).slice(0, 180), source: String(item.source || 'Original publisher').slice(0, 80), url: safeUrl(item.url), published_at: item.published_at || '' }));
  let trends = [];
  try {
    const response = await fetch('https://trends.google.com/trending/rss?geo=IN', { signal: AbortSignal.timeout(9000), headers: { 'user-agent': 'GoGoCompany/1.0 (+https://gogocompany.in/)' } });
    if (response.ok) {
      const xml = await response.text();
      trends = [...xml.matchAll(/<item\b[^>]*>([\s\S]*?)<\/item>/gi)].map(match => {
        const title = match[1].match(/<title>([\s\S]*?)<\/title>/i)?.[1]?.replace(/<!\[CDATA\[|\]\]>/g,'').trim();
        const link = match[1].match(/<link>([\s\S]*?)<\/link>/i)?.[1]?.trim();
        return title ? { title: title.replace(/&amp;/g,'&').slice(0,90), url: safeUrl(link) || 'https://trends.google.com/trending?geo=IN' } : null;
      }).filter(Boolean).slice(0,8);
    }
  } catch (error) { console.warn('[prerender] Google Trends unavailable:', error.message); }
  return { jobs, news: stories, trends, generatedAt: new Date().toISOString(), jobSnapshotAt: manifest.last_updated || null };
}
const server = await createServer({ configFile: ROOT + '/vite.config.js', server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' });
try {
  const { default: App } = await server.ssrLoadModule('/src/App.jsx');
  const feeds = await getFeeds();
  const markup = renderToString(createElement(App, { initialFeeds: feeds }));
  const path = ROOT + '/.site-build/index.html';
  let html = await readFile(path, 'utf8');
  if (!html.includes('<div id="root" data-prerender-placeholder></div>')) throw new Error('Vite output is missing the deterministic #root prerender placeholder');
  html = html.replace('<div id="root" data-prerender-placeholder></div>', '<div id="root">' + markup + '</div>');
  const payload = JSON.stringify(feeds).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026');
  html = html.replace('</body>', '<script>window.__GOGO_FEEDS__=' + payload + ';</script>\n</body>');
  if (!html.includes('Play. Prepare.') || !(/Brand disambiguation/i.test(html)) || !html.includes('Frequently asked')) throw new Error('Prerendered HTML is missing required indexable content');
  await writeFile(path, html);
  console.log('[prerender] Built full homepage HTML with ' + jobsCount(feeds) + ' jobs, ' + feeds.news.length + ' news stories and ' + feeds.trends.length + ' search trends.');
} finally { await server.close(); }
function jobsCount(feeds) { return feeds.jobs.length; }
