#!/usr/bin/env node
/**
 * Refreshes root sitemap lastmod from changed tracked/untracked HTML and sends
 * changed sitemap URLs to IndexNow. Zero npm dependencies; Node.js 20+ ESM.
 */
import {readFile,writeFile,stat} from "node:fs/promises";
import {execFileSync} from "node:child_process";
import {resolve,extname} from "node:path";

const ROOT=process.cwd();
const DOMAIN="https://gogocompany.in";
const KEY="gogocompanyin2026indexnowkey";
const KEY_LOCATION=DOMAIN+"/indexnow-key.txt";
const ROOT_SITEMAP=resolve(ROOT,"sitemap.xml");
const SITEMAPS=["sitemap.xml","sarkari-sarthi/sitemap.xml","pikanews/sitemap.xml","pikanews/news-sitemap.xml"];

function git(args){try{return execFileSync("git",args,{cwd:ROOT,encoding:"utf8"}).trim()}catch{return ""}}
function changedPaths(){
 const rows=git(["status","--porcelain","--untracked-files=all"]).split("\n").filter(Boolean);
 return new Set(rows.map(x=>x.slice(3).replace(/^"|"$/g,"").replaceAll("\\","/")).filter(Boolean));
}
function urlForFile(file){
 let p=file.replaceAll("\\","/").replace(/^\.\//,"");
 if(!p.endsWith(".html"))return null;
 p=p.replace(/\/index\.html$/i,"/");
 if(p==="index.html")p="";
 return new URL("/"+p,DOMAIN).href;
}
function fileForUrl(url){
 try{
  const u=new URL(url);
  if(u.origin!==DOMAIN||u.search||u.hash)return null;
  let p=decodeURIComponent(u.pathname).replace(/^\/+/,"");
  if(!p||p.endsWith("/"))p+="index.html";
  if(!extname(p))p+="/index.html";
  const full=resolve(ROOT,p);
  return full.startsWith(ROOT+"/")?p:null;
 }catch{return null}
}
async function readSitemap(path){
 try{
  const xml=await readFile(resolve(ROOT,path),"utf8");
  return [...xml.matchAll(/<loc>\s*([^<]+)\s*<\/loc>/gi)].map(m=>m[1].trim()).filter(x=>/^https:\/\/gogocompany\.in\//i.test(x));
 }catch{return []}
}
async function refreshRootLastmod(changed){
 let xml;
 try{xml=await readFile(ROOT_SITEMAP,"utf8")}catch(e){console.warn("Root sitemap missing:",e.message);return}
 const blocks=[...xml.matchAll(/<url>\s*[\s\S]*?<\/url>/gi)];
 let updated=0;
 for(const match of blocks){
  const loc=match[0].match(/<loc>\s*([^<]+)\s*<\/loc>/i);
  if(!loc)continue;
  const relative=fileForUrl(loc[1].trim());
  if(!relative||!changed.has(relative))continue;
  const date=new Date().toISOString().slice(0,10);
  const block=match[0];
  const replacement=/<lastmod>[^<]*<\/lastmod>/i.test(block)
   ?block.replace(/<lastmod>[^<]*<\/lastmod>/i,"<lastmod>"+date+"</lastmod>")
   :block.replace(/<loc>\s*([^<]+)\s*<\/loc>/i,"<loc>$1</loc>\n    <lastmod>"+date+"</lastmod>");
  xml=xml.replace(block,replacement);updated++;
 }
 await writeFile(ROOT_SITEMAP,xml.endsWith("\n")?xml:xml+"\n","utf8");
 console.log("Updated lastmod for "+updated+" changed root sitemap URLs.");
}
async function main(){
 const changed=changedPaths();
 await refreshRootLastmod(changed);
 const sitemapUrls=(await Promise.all(SITEMAPS.map(readSitemap))).flat();
 const listedChanged=sitemapUrls.filter(url=>{const file=fileForUrl(url);return file&&changed.has(file)});
 const changedHtml=[...changed].map(urlForFile).filter(Boolean);
 const urls=[...new Set([...listedChanged,...changedHtml])].slice(0,10000);
 if(!urls.length){console.log("No changed public HTML URLs found; IndexNow skipped.");return}
 try{
  const response=await fetch("https://api.indexnow.org/indexnow",{
   method:"POST",
   headers:{"content-type":"application/json; charset=utf-8"},
   body:JSON.stringify({host:new URL(DOMAIN).hostname,key:KEY,keyLocation:KEY_LOCATION,urlList:urls}),
   signal:AbortSignal.timeout(15000)
  });
  if(response.ok||response.status===202)console.log("IndexNow accepted "+urls.length+" changed URLs (HTTP "+response.status+").");
  else console.warn("IndexNow returned HTTP "+response.status+"; sitemap publication continues.");
 }catch(error){console.warn("IndexNow notification failed; publication continues:",error.message)}
}
await main();
