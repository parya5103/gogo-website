#!/usr/bin/env python3
import datetime as dt, email.utils, html, json, re, urllib.request, xml.etree.ElementTree as ET
from pathlib import Path
from urllib.parse import urlparse
ROOT=Path(__file__).resolve().parents[1]; AI=ROOT/"ai"; DATA=AI/"data"; DATA.mkdir(parents=True,exist_ok=True)
FEEDS=[
("OpenAI","https://openai.com/news/rss.xml","Company releases"),
("Google AI","https://blog.google/technology/ai/rss/","Company releases"),
("NVIDIA","https://blogs.nvidia.com/blog/category/deep-learning/feed/","Industry"),
("Hugging Face","https://huggingface.co/blog/feed.xml","Open source"),
("arXiv AI","https://rss.arxiv.org/rss/cs.AI","Research papers"),
("arXiv ML","https://rss.arxiv.org/rss/cs.LG","Research papers"),
("arXiv NLP","https://rss.arxiv.org/rss/cs.CL","Research papers"),
("MIT Technology Review","https://technologyreview.com/topic/artificial-intelligence/feed/","Independent reporting"),
("MarkTechPost","https://www.marktechpost.com/feed/","AI industry reporting"),
("Ahead of AI","https://magazine.sebastianraschka.com/feed","Technical analysis"),
("Last Week in AI","https://lastweekin.ai/feed","Industry analysis"),
("The Verge AI","https://www.theverge.com/rss/ai-artificial-intelligence/index.xml","Technology reporting"),
("Microsoft Research","https://www.microsoft.com/en-us/research/feed/","Research"),
("AWS Machine Learning","https://aws.amazon.com/blogs/machine-learning/feed/","Industry and engineering"),
("MIT News AI","https://news.mit.edu/rss/topic/artificial-intelligence2","Research and academia")]
KEY=re.compile(r"\b(ai|artificial intelligence|machine learning|deep learning|llm|language model|generative|agentic|robotics|neural|transformer|diffusion|gpu|inference)\b",re.I)
def get(url):
 req=urllib.request.Request(url,headers={"User-Agent":"GoGoAIIntelligence/1.0 (+https://gogocompany.in/ai/)"})
 with urllib.request.urlopen(req,timeout=18) as r:return r.read()
def clean(s):return html.unescape(re.sub(r"\s+"," ",re.sub(r"<[^>]+>"," ",s or ""))).strip()[:420]
def safe(s):
 try:return s if urlparse(s).scheme=="https" and urlparse(s).netloc else ""
 except:return ""
def tag(e):return e.tag.rsplit("}",1)[-1].lower()
def text(node,names):
 for e in node.iter():
  if tag(e) in names and e.text and e.text.strip():return e.text.strip()
 return ""
def date(s):
 try:
  d=email.utils.parsedate_to_datetime(s)
  if d.tzinfo is None:d=d.replace(tzinfo=dt.timezone.utc)
  return d.astimezone(dt.timezone.utc).isoformat()
 except:
  try:return dt.datetime.fromisoformat(s.replace("Z","+00:00")).isoformat()
  except:return ""
def load(p,d):
 try:return json.loads(p.read_text(encoding="utf-8"))
 except:return d
def save(p,x):p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
def fair_articles(values,limit,per_source_cap):
 ordered=sorted(values,key=lambda x:x.get("publishedAt",""),reverse=True)
 selected=[]; counts={}
 for item in ordered:
  source=item.get("source") or "Unknown"
  if counts.get(source,0)>=per_source_cap:continue
  selected.append(item);counts[source]=counts.get(source,0)+1
  if len(selected)>=limit:break
 return selected
old=load(DATA/"ai-news.json",{"articles":[]}); items={x["url"]:x for x in old.get("articles",[]) if safe(x.get("url"))}; good=0; status=[]
for source,url,category in FEEDS:
 try:
  root=ET.fromstring(get(url)); count=0
  for n in root.iter():
   if tag(n) not in ("item","entry"):continue
   title=clean(text(n,{"title"})); link=""
   for e in n.iter():
    if tag(e)=="link":
     link=e.attrib.get("href") or (e.text or "").strip()
     if link:break
   link=safe(link or text(n,{"guid","id"})); desc=clean(text(n,{"description","summary","content","encoded"}))
   if title and link and KEY.search(title+" "+desc):
    items[link]={"title":title[:220],"url":link,"source":source,"category":category,"publishedAt":date(text(n,{"pubdate","published","updated","date"})),"description":desc}
    count+=1
  good+=1;status.append({"source":source,"ok":True,"items":count})
 except Exception as e:status.append({"source":source,"ok":False,"error":str(e)[:100]})
if good:
 articles=fair_articles(items.values(),180,24)
 news={"generatedAt":dt.datetime.now(dt.timezone.utc).isoformat(),"successfulFeeds":good,"articles":articles,"sourceStatus":status}
 save(DATA/"ai-news.json",news)
else:news=old
try:
 raw=json.loads(get("https://openrouter.ai/api/v1/models").decode())
 models=[]
 for m in raw.get("data",[]):
  p=m.get("pricing") or {}
  def price(v):
   try:return round(float(v)*1000000,5)
   except:return None
  models.append({"id":m.get("id"),"name":m.get("name") or m.get("id"),"context":m.get("context_length"),"input":price(p.get("prompt")),"output":price(p.get("completion"))})
 models=[m for m in models if m["id"]]
 models.sort(key=lambda m:m.get("context") or 0,reverse=True)
 catalogue={"generatedAt":dt.datetime.now(dt.timezone.utc).isoformat(),"note":"Provider-declared catalogue metadata, not quality benchmarks. Verify current rates with providers.","models":models[:100]}
 save(DATA/"model-catalogue.json",catalogue)
except Exception:catalogue=load(DATA/"model-catalogue.json",{"models":[]})
def esc(s):return html.escape(str(s or ""),quote=True)
def date_label(s):
 try:return dt.datetime.fromisoformat(s.replace("Z","+00:00")).strftime("%d %b %Y")
 except:return "Date not supplied"
cards=[]
for a in fair_articles(news.get("articles",[]),36,4):
 cards.append('<article class="story" data-category="'+esc(a.get("category"))+'"><div class="meta">'+esc(a.get("category"))+' · '+esc(date_label(a.get("publishedAt","")))+'</div><h3><a target="_blank" rel="noopener noreferrer" href="'+esc(a["url"])+'">'+esc(a["title"])+'</a></h3><p>'+esc(a.get("description") or "Open the original source for full details.")+'</p><small>Source: '+esc(a.get("source"))+' · <a target="_blank" rel="noopener noreferrer" href="'+esc(a["url"])+'">Original coverage ↗</a></small></article>')
if not cards:cards=['<p>Daily collection is starting. Please check again soon.</p>']
rows=[]
for m in catalogue.get("models",[])[:30]:
 ctx=format(m["context"],",") if m.get("context") else "Not listed"
 inp=("$"+format(m["input"],"g")) if m.get("input") is not None else "Not listed"
 out=("$"+format(m["output"],"g")) if m.get("output") is not None else "Not listed"
 rows.append("<tr><td><b>"+esc(m["name"])+"</b><small>"+esc(m["id"])+"</small></td><td>"+ctx+"</td><td>"+inp+"</td><td>"+out+"</td></tr>")
if not rows:rows=['<tr><td colspan="4">Model catalogue will appear after refresh.</td></tr>']
modified=news.get("generatedAt",dt.datetime.now(dt.timezone.utc).isoformat())
schema={"@context":"https://schema.org","@type":"CollectionPage","name":"GoGo AI Intelligence — Global AI News, Models & Research","url":"https://gogocompany.in/ai/","description":"Daily global AI news, model catalogue and comparison resources, open-source tools and research updates.","isPartOf":{"@id":"https://gogocompany.in/#website"},"publisher":{"@id":"https://gogocompany.in/#organization"},"dateModified":modified}
page='''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>AI News Today, Latest AI Models &amp; Comparisons | GoGo AI Intelligence</title>
<meta name="description" content="Global AI news updated daily: GPT, Gemini, Claude and open-source model releases, AI tools, model API pricing, research papers, robotics and industry updates with original sources.">
<meta name="keywords" content="AI news today, latest AI news, global artificial intelligence news, AI models comparison, GPT vs Gemini vs Claude, open source AI models, AI tools, machine learning research, LLM API pricing, AI model leaderboard, AI research papers, AI agents, robotics news, generative AI updates 2026">
<meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1"><link rel="canonical" href="https://gogocompany.in/ai/"><meta name="theme-color" content="#10182d">
<meta property="og:type" content="website"><meta property="og:site_name" content="GoGo Company"><meta property="og:title" content="GoGo AI Intelligence — Global AI News & Model Comparisons"><meta property="og:description" content="Daily global AI news, model catalogue, pricing metadata, research and open-source tools with source links."><meta property="og:url" content="https://gogocompany.in/ai/"><meta property="og:image" content="https://gogocompany.in/assets/seo/gogo-company-social.svg"><meta name="twitter:card" content="summary_large_image"><link rel="alternate" type="application/rss+xml" href="https://gogocompany.in/ai/feed.xml" title="GoGo AI Intelligence RSS">
<script type="application/ld+json">SCHEMA_HERE</script><style>
*{box-sizing:border-box}html{scroll-behavior:smooth;scroll-padding-top:90px}body{margin:0;background:radial-gradient(ellipse at 80% -10%,#263b6a 0,transparent 42%),#080e1b;color:#edf3ff;font:15px/1.65 Inter,system-ui,sans-serif}a{color:inherit}.top{position:sticky;top:0;z-index:20;background:rgba(8,14,27,.88);backdrop-filter:blur(16px);border-bottom:1px solid #27334b;padding:17px max(20px,calc((100% - 1200px)/2))}.top a{text-decoration:none;color:#dce7ff}.brand{font-size:20px;font-weight:900;letter-spacing:-.5px}.top nav{display:flex;gap:20px;flex-wrap:wrap;font-size:12px}.hero{background:radial-gradient(ellipse at 80% 0%,rgba(115,133,255,.34),transparent 45%),linear-gradient(120deg,#0b1426,#172b4c 60%,#13223d);color:white;padding:76px 22px 58px;border-bottom:1px solid #293a5b}.wrap,main{max-width:1200px;margin:auto}.eyebrow{color:#7ff2d5;font-size:11px;font-weight:850;letter-spacing:2px}.hero h1{font-size:clamp(42px,7vw,76px);line-height:1;max-width:920px;letter-spacing:-3px;margin:18px 0}.hero p{max-width:760px;color:#c1cee5;font-size:17px}.chips{display:flex;gap:9px;flex-wrap:wrap;margin-top:25px}.chips a{border:1px solid #63779e;border-radius:30px;padding:9px 14px;text-decoration:none;font-size:12px;background:#ffffff0b}.chips a:hover{background:#7ff2d51c;border-color:#7ff2d5}main{padding:30px 22px 70px}.head{margin:48px 0 18px;display:flex;justify-content:space-between;gap:15px;align-items:end}h2{font-size:clamp(26px,4vw,38px);margin:0;letter-spacing:-1.2px}.muted,.head p{color:#91a2bf;font-size:12px}.layout{display:grid;grid-template-columns:minmax(0,1.8fr) minmax(240px,.7fr);gap:18px}.stories,.side{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:13px;align-content:start}.side{display:flex;flex-direction:column}.story,.panel{background:linear-gradient(150deg,#15243c,#101a2c);border:1px solid #293953;border-radius:18px;padding:20px;box-shadow:0 12px 30px #0002;transition:transform .2s,border-color .2s}.story:hover,.resource:hover{transform:translateY(-3px);border-color:#69d9c7}.story:first-child{grid-column:1/-1;background:radial-gradient(ellipse at 95% 0%,#344a784f,transparent 55%),linear-gradient(145deg,#1b3150,#111d32)}.story h3{font-size:18px;line-height:1.35;margin:10px 0}.story:first-child h3{font-size:25px}.story h3 a{text-decoration:none}.story h3 a:hover{color:#a7baff}.story p,.panel p,.panel li{color:#a8b6ce;font-size:12px}.meta,.story small{color:#79e6d0;font-size:10px;font-weight:800;letter-spacing:.5px}.story small{display:block;border-top:1px solid #293953;padding-top:12px}.table-wrap{overflow:auto;background:#111d30;border:1px solid #293953;border-radius:17px}table{width:100%;border-collapse:collapse;min-width:620px;font-size:12px}th,td{text-align:left;padding:14px;border-bottom:1px solid #293953}th{background:#1a2a44;color:#b8c8e2;font-size:10px;text-transform:uppercase;letter-spacing:.8px}td small{display:block;color:#91a2bf;font-size:10px;overflow-wrap:anywhere}.notice{padding:14px 17px;background:#122e32;color:#9ce8d9;border:1px solid #24514e;border-radius:13px;font-size:11px}.resources{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}.resource{padding:18px;border:1px solid #293953;border-radius:16px;background:linear-gradient(145deg,#15243c,#101a2c);text-decoration:none;transition:transform .2s,border-color .2s}.resource b{color:#edf3ff}.resource span{display:block;color:#9cacc5;font-size:11px;margin-top:5px}.panel h3{margin-top:0}.footer{border-top:1px solid #293953;background:#0a1220;padding:28px 22px;color:#91a2bf;font-size:11px}.toolbar{display:flex;gap:10px;flex-wrap:wrap;margin:16px 0}.toolbar input{flex:1;min-width:220px;padding:12px 14px;border:1px solid #30415e;border-radius:12px;background:#111d30;color:#fff}.toolbar button{border:1px solid #30415e;border-radius:30px;background:#111d30;color:#b9c8df;padding:9px 13px;font-size:11px;cursor:pointer}.toolbar button[aria-pressed=true]{background:#17423f;border-color:#54cdb6;color:#9af3df}.statbar{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin:26px auto 8px;max-width:1200px;padding:0 22px}.stat{border:1px solid #2b3e5d;border-radius:15px;background:#ffffff0a;padding:15px 17px}.stat b{display:block;color:#86f0d7;font-size:25px}.stat span{font-size:10px;color:#a5b4ce}@media(max-width:850px){.layout{grid-template-columns:1fr}.resources{grid-template-columns:repeat(2,1fr)}}@media(max-width:650px){.top{display:block}.top nav{margin-top:12px;gap:14px}.hero{padding:52px 20px}.hero h1{letter-spacing:-2px}.stories{grid-template-columns:1fr}.story:first-child{grid-column:auto}.story:first-child h3{font-size:21px}.resources{grid-template-columns:1fr}.head{display:block}.statbar{grid-template-columns:repeat(2,1fr);padding:0 14px}.stat b{font-size:21px}main{padding-inline:14px}}@media(prefers-reduced-motion:reduce){*{scroll-behavior:auto!important;transition:none!important}}
</style></head><body><header class="top"><a class="brand" href="/">GoGo Company</a><nav><a href="/">Home</a><a href="#latest">AI News</a><a href="#models">Models</a><a href="#research">Research & Tools</a><a href="/pikanews/">PikaNews</a></nav></header>
<section class="hero"><div class="wrap"><span class="eyebrow">GLOBAL AI INTELLIGENCE · UPDATED DAILY</span><h1>Understand what’s next in Artificial Intelligence.</h1><p>Global AI news, model releases and pricing, research papers, open-source projects and industry developments — with dates and links to original sources.</p><div class="chips"><a href="#latest">Latest AI News</a><a href="#models">AI Models & Pricing</a><a href="#research">Research Papers</a><a href="#tools">Open-source AI Tools</a></div></div></section>
<main><div class="statbar"><div class="stat"><b>ARTICLE_COUNT</b><span>Curated stories in latest snapshot</span></div><div class="stat"><b>FEED_COUNT</b><span>Successful source feeds</span></div><div class="stat"><b>MODEL_COUNT</b><span>Models in catalogue</span></div><div class="stat"><b>Daily</b><span>Automatic refresh · 08:50 IST</span></div></div><div class="head" id="latest"><div><span class="eyebrow">THE SIGNAL</span><h2>Latest AI News</h2></div><p>Feed snapshot: DATE_HERE · Original-source links</p></div><div class="toolbar"><input id="newsSearch" type="search" placeholder="Search AI news, labs, research…" aria-label="Search AI news"><button data-filter="all" aria-pressed="true">All</button><button data-filter="research" aria-pressed="false">Research</button><button data-filter="open source" aria-pressed="false">Open source</button><button data-filter="industry" aria-pressed="false">Industry</button></div><div class="layout"><section class="stories" id="stories">NEWS_HERE</section><aside class="side"><section class="panel"><h3>What’s covered</h3><ul><li>AI model launches and releases</li><li>AI company and startup news</li><li>Research papers and discoveries</li><li>Open-source AI and developer tools</li><li>AI policy, safety and regulation</li><li>Robotics, chips and infrastructure</li></ul></section><section class="panel"><h3>Editorial promise</h3><p>Headlines and feed excerpts are collected from public publisher feeds. We show source names and dates and link to original reporting. We do not invent benchmark scores or claim independent testing.</p><p><a href="feed.xml">Subscribe to AI RSS ↗</a></p></section></aside></div>
<div class="head" id="models"><h2>AI Models & API Pricing</h2><p>Provider-declared catalogue metadata · USD per 1M tokens</p></div><p class="notice">This is not a quality ranking. Context windows and prices are provider-declared catalogue metadata; they can change. Verify current terms with the provider before choosing a model.</p><div class="table-wrap"><table><thead><tr><th>Model</th><th>Context</th><th>Input / 1M</th><th>Output / 1M</th></tr></thead><tbody id="modelRows">MODELS_HERE</tbody></table></div>
<div class="head" id="research"><h2>Research, Benchmarks & Leaderboards</h2></div><div class="resources"><a class="resource" href="https://huggingface.co/papers"><b>Hugging Face Papers</b><span>New machine learning papers.</span></a><a class="resource" href="https://arxiv.org/list/cs.AI/recent"><b>arXiv AI</b><span>Research preprints and technical papers.</span></a><a class="resource" href="https://lmarena.ai/leaderboard"><b>LMArena</b><span>Human-preference comparisons.</span></a><a class="resource" href="https://artificialanalysis.ai/leaderboards/models"><b>Artificial Analysis</b><span>Model intelligence and evaluations.</span></a><a class="resource" href="https://www.swebench.com/"><b>SWE-bench</b><span>Software engineering evaluations.</span></a><a class="resource" href="https://huggingface.co/spaces/open-llm-leaderboard/open_llm_leaderboard"><b>Open LLM Leaderboard</b><span>Open model benchmarks.</span></a></div>
<div class="head" id="tools"><h2>Open-source AI Tools & Discovery</h2></div><div class="resources"><a class="resource" href="https://github.com/topics/llm"><b>LLM Projects</b><span>Open-source language model projects.</span></a><a class="resource" href="https://github.com/topics/ai-agents"><b>AI Agents</b><span>Agent frameworks and workflows.</span></a><a class="resource" href="https://huggingface.co/models"><b>Hugging Face Models</b><span>Model cards and downloadable models.</span></a><a class="resource" href="https://ollama.com/library"><b>Ollama Library</b><span>Run supported open models locally.</span></a><a class="resource" href="https://github.com/topics/rag"><b>RAG Projects</b><span>Retrieval-augmented generation tools.</span></a><a class="resource" href="https://openrouter.ai/models"><b>OpenRouter Models</b><span>Providers and published API rates.</span></a></div>
<p class="muted">GoGo AI Intelligence is an independent AI information page and is not affiliated with model providers. News remains the property of its publishers. Summaries and feed excerpts are for discovery; follow the source for full context. Benchmark methodologies differ and scores are not universally comparable.</p></main><footer><div class="wrap">© YEAR_HERE GoGo Company · <a href="/">Home</a> · <a href="/privacy-policy/">Privacy</a> · <a href="/disclaimer/">Disclaimer</a> · <a href="feed.xml">RSS</a><br>Last generated: DATE_HERE</div></footer><script>(()=>{const input=document.getElementById("newsSearch"),cards=[...document.querySelectorAll("#stories .story")],buttons=[...document.querySelectorAll("[data-filter]")];let active="all";function filter(){const q=(input?.value||"").toLowerCase().trim();let count=0;cards.forEach(card=>{const cat=(card.dataset.category||"").toLowerCase(),ok=(active==="all"||cat.includes(active))&&(!q||card.textContent.toLowerCase().includes(q));card.hidden=!ok;if(ok)count++;});let empty=document.getElementById("noStories");if(!count&&!empty){empty=document.createElement("p");empty.id="noStories";empty.className="notice";empty.textContent="No matching stories. Try another keyword or category.";document.getElementById("stories").append(empty);}if(empty)empty.hidden=count>0;}input?.addEventListener("input",filter);buttons.forEach(btn=>btn.addEventListener("click",()=>{active=btn.dataset.filter;buttons.forEach(b=>b.setAttribute("aria-pressed",String(b===btn)));filter();}));filter();const rows=[...document.querySelectorAll("#models tbody tr")];const modelInput=document.createElement("input");modelInput.type="search";modelInput.placeholder="Search models…";modelInput.setAttribute("aria-label","Search AI models");modelInput.style.cssText="margin:0 0 12px;padding:11px 13px;width:min(100%,360px);border:1px solid #30415e;border-radius:12px;background:#111d30;color:white";const table=document.querySelector("#models .table-wrap");if(table)table.before(modelInput);modelInput.addEventListener("input",()=>{const q=modelInput.value.toLowerCase();rows.forEach(r=>r.hidden=!r.textContent.toLowerCase().includes(q));});})();</script></body></html>'''
page=page.replace("SCHEMA_HERE",json.dumps(schema,ensure_ascii=False).replace("</","<\\/")).replace("NEWS_HERE","".join(cards)).replace("MODELS_HERE","".join(rows)).replace("DATE_HERE",esc(date_label(modified))).replace("YEAR_HERE",str(dt.datetime.now().year)).replace("ARTICLE_COUNT",str(len(news.get("articles",[])))).replace("FEED_COUNT",str(good or news.get("successfulFeeds",0))).replace("MODEL_COUNT",str(len(catalogue.get("models",[]))))
AI.mkdir(exist_ok=True);(AI/"index.html").write_text(page,encoding="utf-8")
rss_items=[]
for a in fair_articles(news.get("articles",[]),50,7):
 rss_items.append("<item><title>"+esc(a["title"])+"</title><link>"+esc(a["url"])+"</link><guid>"+esc(a["url"])+"</guid><description>"+esc(a.get("description"))+"</description><source>"+esc(a.get("source"))+"</source></item>")
rss='<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>GoGo AI Intelligence</title><link>https://gogocompany.in/ai/</link><description>Global AI news with original source links</description>'+''.join(rss_items)+'</channel></rss>'
(AI/"feed.xml").write_text(rss,encoding="utf-8")
# Keep the main XML sitemap aware of the dedicated AI hub.
sitemap_path=ROOT/"sitemap.xml"
if sitemap_path.exists():
 sitemap=sitemap_path.read_text(encoding="utf-8")
 entry='<url><loc>https://gogocompany.in/ai/</loc><lastmod>'+dt.datetime.now(dt.timezone.utc).date().isoformat()+'</lastmod><changefreq>daily</changefreq><priority>0.9</priority></url>'
 if "https://gogocompany.in/ai/" in sitemap:
  marker="<loc>https://gogocompany.in/ai/</loc>"
  start=sitemap.find(marker); end=sitemap.find("</url>",start)
  block=sitemap[start:end]
  block=re.sub(r"<lastmod>[^<]*</lastmod>", "<lastmod>"+dt.datetime.now(dt.timezone.utc).date().isoformat()+"</lastmod>", block)
  sitemap=sitemap[:start]+block+sitemap[end:]
 else:sitemap=sitemap.replace("</urlset>", "  "+entry+"\\n</urlset>")
 sitemap_path.write_text(sitemap,encoding="utf-8")
print("AI hub generated; source feeds successful:",good,"articles:",len(news.get("articles",[])),"models:",len(catalogue.get("models",[])))
