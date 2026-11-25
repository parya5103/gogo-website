#!/usr/bin/env node
import { copyFile, mkdir, readFile, readdir, rm, stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { join, resolve } from 'node:path';

const root = process.cwd();
const output = resolve(root, '.site-build');
const protectedFiles = ['CNAME','robots.txt','sitemap.xml','firebase-messaging-sw.js','assets/js/gogo-account.js','assets/js/gogo-notifications.min.js'];
const protectedDirs = ['arrowout','crystalquest','sarkari-sarthi','pikanews'];
async function digest(path) {
  try { return createHash('sha256').update(await readFile(join(root,path))).digest('hex'); }
  catch { return null; }
}
for (const path of protectedDirs) {
  const info = await stat(join(root,path)).catch(()=>null);
  if (!info?.isDirectory()) throw new Error('Protected product directory missing before publish: '+path);
  await stat(join(root,path,'index.html')).catch(()=>{ throw new Error('Protected product entry missing: '+path+'/index.html'); });
}
const before = new Map(await Promise.all(protectedFiles.map(async path=>[path,await digest(path)])));
const builtIndex = await readFile(join(output,'index.html'),'utf8');
if (!builtIndex.includes('id="root"') || !builtIndex.includes('GoGo Company: Browser Games, AI & Digital Media') || !builtIndex.includes('application/ld+json')) {
  throw new Error('Refusing to publish: built homepage is not fully prerendered/SEO complete');
}
const builtAssets = join(output,'assets','gogo-home');
const assetEntries = await readdir(builtAssets);
if (!assetEntries.length) throw new Error('Refusing to publish: Vite asset directory is empty');
await copyFile(join(output,'index.html'),join(root,'index.html'));
await rm(join(root,'assets','gogo-home'),{recursive:true,force:true});
await mkdir(join(root,'assets','gogo-home'),{recursive:true});
for (const entry of assetEntries) {
  const source=join(builtAssets,entry), target=join(root,'assets','gogo-home',entry);
  const info=await stat(source);
  if (info.isFile()) await copyFile(source,target);
}
for (const path of protectedDirs) {
  await stat(join(root,path,'index.html')).catch(()=>{ throw new Error('Publish unexpectedly removed '+path+'/index.html'); });
}
for (const path of protectedFiles) {
  const after=await digest(path);
  if (before.get(path)!==after) throw new Error('Publish unexpectedly changed protected file: '+path);
}
console.log('[publish] Updated only index.html and assets/gogo-home. Product portals and protected integrations are unchanged.');
