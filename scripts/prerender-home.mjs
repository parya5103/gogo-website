#!/usr/bin/env node
import { readFile, writeFile } from 'node:fs/promises';
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { createServer } from 'vite';

const ROOT = process.cwd();
const server = await createServer({ configFile: ROOT + '/vite.config.js', server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' });
try {
  const { default: App } = await server.ssrLoadModule('/src/App.jsx');
  const markup = renderToString(createElement(App));
  const path = ROOT + '/.site-build/index.html';
  let html = await readFile(path, 'utf8');
  if (!html.includes('<div id="root" data-prerender-placeholder></div>')) throw new Error('Vite output is missing the deterministic #root prerender placeholder');
  html = html.replace('<div id="root" data-prerender-placeholder></div>', '<div id="root">' + markup + '</div>');
  if (!html.includes('GoGo Company: Browser Games, AI &amp; Digital Media') || !(/Brand disambiguation/i.test(html)) || !html.includes('Frequently asked')) throw new Error('Prerendered HTML is missing required indexable content');
  await writeFile(path, html);
  console.log('[prerender] Built the clean product-first homepage without third-party feed excerpts or search-trend snapshots.');
} finally { await server.close(); }