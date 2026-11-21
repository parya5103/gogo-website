#!/usr/bin/env python3
import datetime as dt, email.utils, html, json, re, urllib.request, xml.etree.ElementTree as ET
from pathlib import Path
from urllib.parse import urlparse
ROOT=Path(__file__).resolve().parents[1]; AI=ROOT/"ai"; DATA=AI/"data"; DATA.mkdir(parents=True,exist_ok=True)
FEEDS=[
("OpenAI","https://openai.com/news/rss.xml","Company releases"),("Anthropic","https://www.anthropic.com/news/rss.xml","Company releases"),
("Google AI","https://blog.google/technology/ai/rss/","Company releases"),("Google DeepMind","https://deepmind.google/blog/rss.xml","Research"),
("Microsoft AI","https://blogs.microsoft.com/ai/feed/","Company releases"),("NVIDIA","https://blogs.nvidia.com/blog/category/deep-learning/feed/","Industry"),
("Hugging Face","https://huggingface.co/blog/feed.xml","Open source"),("arXiv AI","https://export.arxiv.org/rss/cs.AI","Research papers"),
("arXiv ML","https://export.arxiv.org/rss/cs.LG","Research papers"),("arXiv NLP","https://export.arxiv.org/rss/cs.CL","Research papers"),
("The Batch","https://www.deeplearning.ai/the-batch/feed/","Industry analysis")]
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
 articles=sorted(items.values(),key=lambda x:x.get("publishedAt",""),reverse=True)[:180]
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
for a in news.get("articles",[])[:36]:
 cards.append('<article class="story"><div class="meta">'+esc(a.get("category"))+' · '+esc(date_label(a.get("publishedAt","")))+'</div><h3><a target="_blank" rel="noopener noreferrer" href="'+esc(a["url"])+'">'+esc(a["title"])+'</a></h3><p>'+esc(a.get("description") or "Open the original source for full details.")+'</p><small>Source: '+esc(a.get("source"))+' · <a target="_blank" rel="noopener noreferrer" href="'+esc(a["url"])+'">Original coverage ↗</a></small></article>')
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
*{box-sizing:border-box}body{margin:0;background:#f4f7fc;color:#14213a;font:16px/1.65 Inter,system-ui,sans-serif}a{color:inherit}.top{background:#10182d;color:#fff;padding:16px max(20px,calc((100% - 1160px)/2));display:flex;justify-content:space-between;gap:15px}.top a{text-decoration:none;color:#e4eaff}.brand{font-size:20px;font-weight:850}.top nav{display:flex;gap:17px;flex-wrap:wrap;font-size:13px}.hero{background:linear-gradient(120deg,#10182d,#243b72);color:white;padding:65px 22px}.wrap,main{max-width:1160px;margin:auto}.hero .wrap{padding:0}.eyebrow{color:#8de2d2;font-size:11px;font-weight:800;letter-spacing:1.6px}h1{font-size:clamp(36px,6vw,64px);line-height:1.05;max-width:850px;letter-spacing:-2px;margin:14px 0}.hero p{max-width:760px;color:#d5def1;font-size:17px}.chips{display:flex;gap:9px;flex-wrap:wrap;margin-top:20px}.chips a{border:1px solid #7383a9;border-radius:30px;padding:7px 12px;text-decoration:none;font-size:12px}main{padding:32px 22px 65px}.head{margin:35px 0 18px;display:flex;justify-content:space-between;gap:15px;align-items:end}h2{font-size:clamp(25px,4vw,36px);margin:0;letter-spacing:-1px}.muted,.head p{color:#65728a;font-size:13px}.layout{display:grid;grid-template-columns:minmax(0,1.7fr) minmax(240px,.8fr);gap:20px}.stories,.side{display:grid;gap:13px;align-content:start}.story,.panel{background:white;border:1px solid #dfe6f1;border-radius:16px;padding:19px}.story h3{font-size:19px;line-height:1.35;margin:8px 0}.story h3 a{text-decoration:none}.story h3 a:hover{color:#3856d8}.story p,.panel p,.panel li{color:#63718a;font-size:13px}.meta,.story small{color:#087e70;font-size:11px;font-weight:750}.table-wrap{overflow:auto;background:white;border:1px solid #dfe6f1;border-radius:15px}table{width:100%;border-collapse:collapse;min-width:620px;font-size:13px}th,td{text-align:left;padding:13px;border-bottom:1px solid #e3e8f1}th{background:#edf2fb;font-size:11px}td small{display:block;color:#63718a;font-size:10px;overflow-wrap:anywhere}.notice{padding:13px;background:#eaf5f4;color:#225c55;border-radius:12px;font-size:12px}.resources{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}.resource{padding:16px;border:1px solid #dfe6f1;border-radius:14px;background:white;text-decoration:none}.resource span{display:block;color:#63718a;font-size:12px;margin-top:5px}footer{border-top:1px solid #dfe6f1;padding:25px 22px;color:#63718a;font-size:12px}@media(max-width:760px){.layout{grid-template-columns:1fr}.resources{grid-template-columns:1fr 1fr}.head{display:block}.top{display:block}.top nav{margin-top:9px}}@media(max-width:480px){.resources{grid-template-columns:1fr}.hero{padding:45px 20px}main{padding-inline:14px}.story,.panel{padding:15px}}
</style></head><body><header class="top"><a class="brand" href="/">GoGo Company</a><nav><a href="/">Home</a><a href="#latest">AI News</a><a href="#models">Models</a><a href="#research">Research & Tools</a><a href="/pikanews/">PikaNews</a></nav></header>
<section class="hero"><div class="wrap"><span class="eyebrow">GLOBAL AI INTELLIGENCE · UPDATED DAILY</span><h1>Understand what’s next in Artificial Intelligence.</h1><p>Global AI news, model releases and pricing, research papers, open-source projects and industry developments — with dates and links to original sources.</p><div class="chips"><a href="#latest">Latest AI News</a><a href="#models">AI Models & Pricing</a><a href="#research">Research Papers</a><a href="#tools">Open-source AI Tools</a></div></div></section>
<main><div class="head" id="latest"><h2>Latest AI News</h2><p>Feed snapshot: DATE_HERE · Original-source links</p></div><div class="layout"><section class="stories">NEWS_HERE</section><aside class="side"><section class="panel"><h3>What’s covered</h3><ul><li>AI model launches and releases</li><li>AI company and startup news</li><li>Research papers and discoveries</li><li>Open-source AI and developer tools</li><li>AI policy, safety and regulation</li><li>Robotics, chips and infrastructure</li></ul></section><section class="panel"><h3>Editorial promise</h3><p>Headlines and feed excerpts are collected from public publisher feeds. We show source names and dates and link to original reporting. We do not invent benchmark scores or claim independent testing.</p><p><a href="feed.xml">Subscribe to AI RSS ↗</a></p></section></aside></div>
<div class="head" id="models"><h2>AI Models & API Pricing</h2><p>Provider-declared catalogue metadata · USD per 1M tokens</p></div><p class="notice">This is not a quality ranking. Context windows and prices are provider-declared catalogue metadata; they can change. Verify current terms with the provider before choosing a model.</p><div class="table-wrap"><table><thead><tr><th>Model</th><th>Context</th><th>Input / 1M</th><th>Output / 1M</th></tr></thead><tbody>MODELS_HERE</tbody></table></div>
<div class="head" id="research"><h2>Research, Benchmarks & Leaderboards</h2></div><div class="resources"><a class="resource" href="https://huggingface.co/papers"><b>Hugging Face Papers</b><span>New machine learning papers.</span></a><a class="resource" href="https://arxiv.org/list/cs.AI/recent"><b>arXiv AI</b><span>Research preprints and technical papers.</span></a><a class="resource" href="https://lmarena.ai/leaderboard"><b>LMArena</b><span>Human-preference comparisons.</span></a><a class="resource" href="https://artificialanalysis.ai/leaderboards/models"><b>Artificial Analysis</b><span>Model intelligence and evaluations.</span></a><a class="resource" href="https://www.swebench.com/"><b>SWE-bench</b><span>Software engineering evaluations.</span></a><a class="resource" href="https://huggingface.co/spaces/open-llm-leaderboard/open_llm_leaderboard"><b>Open LLM Leaderboard</b><span>Open model benchmarks.</span></a></div>
<div class="head" id="tools"><h2>Open-source AI Tools & Discovery</h2></div><div class="resources"><a class="resource" href="https://github.com/topics/llm"><b>LLM Projects</b><span>Open-source language model projects.</span></a><a class="resource" href="https://github.com/topics/ai-agents"><b>AI Agents</b><span>Agent frameworks and workflows.</span></a><a class="resource" href="https://huggingface.co/models"><b>Hugging Face Models</b><span>Model cards and downloadable models.</span></a><a class="resource" href="https://ollama.com/library"><b>Ollama Library</b><span>Run supported open models locally.</span></a><a class="resource" href="https://github.com/topics/rag"><b>RAG Projects</b><span>Retrieval-augmented generation tools.</span></a><a class="resource" href="https://openrouter.ai/models"><b>OpenRouter Models</b><span>Providers and published API rates.</span></a></div>
<p class="muted">GoGo AI Intelligence is an independent AI information page and is not affiliated with model providers. News remains the property of its publishers. Summaries and feed excerpts are for discovery; follow the source for full context. Benchmark methodologies differ and scores are not universally comparable.</p></main><footer><div class="wrap">© YEAR_HERE GoGo Company · <a href="/">Home</a> · <a href="/privacy-policy/">Privacy</a> · <a href="/disclaimer/">Disclaimer</a> · <a href="feed.xml">RSS</a><br>Last generated: DATE_HERE</div></footer></body></html>'''
page=page.replace("SCHEMA_HERE",json.dumps(schema,ensure_ascii=False).replace("</","<\\/")).replace("NEWS_HERE","".join(cards)).replace("MODELS_HERE","".join(rows)).replace("DATE_HERE",esc(date_label(modified))).replace("YEAR_HERE",str(dt.datetime.now().year))
AI.mkdir(exist_ok=True);(AI/"index.html").write_text(page,encoding="utf-8")
rss_items=[]
for a in news.get("articles",[])[:50]:
 rss_items.append("<item><title>"+esc(a["title"])+"</title><link>"+esc(a["url"])+"</link><guid>"+esc(a["url"])+"</guid><description>"+esc(a.get("description"))+"</description><source>"+esc(a.get("source"))+"</source></item>")
rss='<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>GoGo AI Intelligence</title><link>https://gogocompany.in/ai/</link><description>Global AI news with original source links</description>'+''.join(rss_items)+'</channel></rss>'
(AI/"feed.xml").write_text(rss,encoding="utf-8")
# Keep the main XML sitemap aware of the dedicated AI hub.
sitemap_path=ROOT/"sitemap.xml"
if sitemap_path.exists():
 sitemap=sitemap_path.read_text(encoding="utf-8")
 entry='<url><loc>https://gogocompany.in/ai/</loc><lastmod>'+dt.datetime.now(dt.timezone.utc).date().isoformat()+'</lastmod><changefreq>daily</changefreq><priority>0.9</priority></url>'
 if "https://gogocompany.in/ai/" in sitemap:
  sitemap=re.sub(r'<url>\\s*<loc>https://gogocompany\\.in/ai/</loc>[\\s\\S]*?</url>',entry,sitemap)
 else:sitemap=sitemap.replace("</urlset>", "  "+entry+"\\n</urlset>")
 sitemap_path.write_text(sitemap,encoding="utf-8")
print("AI hub generated; source feeds successful:",good,"articles:",len(news.get("articles",[])),"models:",len(catalogue.get("models",[])))
