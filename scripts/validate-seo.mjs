#!/usr/bin/env node
/**
 * Dependency-free structural validation for GoGo Company SEO deliverables.
 * This checks implementation consistency, not rankings or rich-result eligibility.
 */
import {readFile,readdir} from "node:fs/promises";
import assert from "node:assert/strict";

const read=p=>readFile(p,"utf8");
const htmlPages=["index.html","arrowout/index.html","crystalquest/index.html","sarkari-sarthi/index.html","pikanews/index.html"];
const types=new Set();
for(const path of htmlPages){
 const html=await read(path);
 const blocks=[...html.matchAll(/<script\s+type=["']application\/ld\+json["']\s*>([\s\S]*?)<\/script>/gi)];
 assert.ok(blocks.length,path+" must contain JSON-LD");
 for(const block of blocks){
  const data=JSON.parse(block[1]);
  for(const node of (data["@graph"]||[data])) if(node["@type"]) for(const type of (Array.isArray(node["@type"])?node["@type"]:[node["@type"]])) types.add(type);
 }
}
const home=await read("index.html");
const title=home.match(/<title>([\s\S]*?)<\/title>/i)?.[1]||"";
const description=home.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i)?.[1]||"";
const canonical=home.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i)?.[1]||"";
assert.ok(title.length>=25&&title.length<=65,"Homepage title length "+title.length);
assert.ok(description.length>=70&&description.length<=170,"Homepage description length "+description.length);
assert.equal(canonical,"https://gogocompany.in/");
for(const required of ["Organization","WebSite","ItemList","FAQPage","SiteNavigationElement"])assert.ok(types.has(required),"Missing homepage JSON-LD type "+required);
assert.match(home,/og:locale["']?\s+content=["']en_IN/i);
assert.match(home,/og:image:width["']?\s+content=["']1200/i);
assert.match(home,/og:image:height["']?\s+content=["']630/i);

const sitemap=await read("sitemap.xml");
const locs=[...sitemap.matchAll(/<loc>\s*([^<]+)\s*<\/loc>/gi)].map(m=>m[1].trim());
assert.equal(locs.length,14,"root sitemap must contain 14 URLs");
assert.equal(new Set(locs).size,locs.length,"root sitemap URLs must be unique");
assert.equal((sitemap.match(/<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/g)||[]).length,14,"all root URLs require ISO lastmod");
for(const url of locs){const u=new URL(url);assert.equal(u.protocol,"https:");assert.equal(u.hostname,"gogocompany.in")}
const robots=await read("robots.txt");
assert.ok(robots.includes("Sitemap: https://gogocompany.in/sitemap.xml"));
const index=await read("sitemap-index.xml");
for(const p of ["sitemap.xml","sarkari-sarthi/sitemap.xml","pikanews/sitemap.xml","pikanews/news-sitemap.xml"])assert.ok(index.includes(p),"Sitemap index missing "+p);

for(const [path,target] of [["arrow-out/index.html","https://gogocompany.in/arrowout/"],["crystal-quest/index.html","https://gogocompany.in/crystalquest/"],["sarkari/index.html","https://gogocompany.in/sarkari-sarthi/"]]){
 const html=await read(path);assert.match(html,/noindex, follow/);assert.ok(html.includes('<link rel="canonical" href="'+target+'">'));assert.ok(html.includes('content="0; url='+target+'"'));assert.match(html,/window\.location\.replace/);assert.match(html,/window\.location\.search/);assert.match(html,/window\.location\.hash/);
}
const css=await read("assets/css/ads.css");assert.match(css,/min-height/);assert.match(css,/aspect-ratio/);assert.match(css,/contain:\s*layout style/);
const sarkari=await read("sarkari-sarthi/index.html");assert.match(sarkari,/CollectionPage/);assert.match(sarkari,/Dataset/);assert.match(sarkari,/sarkari-schema-injector\.js/);
const module=await read("sarkari-sarthi/assets/js/sarkari-schema-injector.js");assert.match(module,/official_verified/);assert.match(module,/data-job-detail-page/);
const pika=await read("pikanews/index.html");assert.match(pika,/application\/rss\+xml/);
let dirs=[];try{dirs=await readdir("pikanews/news",{withFileTypes:true})}catch{}
let articleCount=0;
for(const dir of dirs.filter(x=>x.isDirectory())){
 let article;try{article=await read("pikanews/news/"+dir.name+"/index.html")}catch{continue}
 for(const block of article.matchAll(/<script\s+type=["']application\/ld\+json["']\s*>([\s\S]*?)<\/script>/gi)){
  const data=JSON.parse(block[1]);
  if(data["@type"]==="NewsArticle"){assert.equal(data.publisher?.name,"GoGo Company");assert.match(article,/max-image-preview:large/);articleCount++}
 }
}
console.log("SEO validation passed: "+title.length+"-character title, "+description.length+"-character description, "+locs.length+" root URLs, "+articleCount+" NewsArticle pages checked.");
