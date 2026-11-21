#!/usr/bin/env python3
from pathlib import Path
import json,re,math,xml.etree.ElementTree as ET
root=Path(__file__).resolve().parents[1]
page=(root/"ai/index.html").read_text(encoding="utf-8")
assert '<title>AI News Today, Latest AI Models &amp; Comparisons | GoGo AI Intelligence</title>' in page
assert 'name="description"' in page and 'name="keywords"' in page
assert 'rel="canonical" href="https://gogocompany.in/ai/"' in page
assert 'application/ld+json' in page and 'CollectionPage' in page
assert 'id="latest"' in page and 'id="models"' in page and 'id="research"' in page and 'id="tools"' in page
assert 'not a quality ranking' in page.lower() or 'not a quality ranking' in page
assert 'Original coverage' in page or 'Daily collection is starting' in page
news=json.loads((root/"ai/data/ai-news.json").read_text(encoding="utf-8"))
for item in news.get("articles",[]):
 assert item.get("title") and item.get("source") and item.get("url","").startswith("https://")
generator=(root/"scripts/update-ai-hub.py").read_text(encoding="utf-8")
assert 'id="newsSearch"' in generator and 'data-filter="research"' in generator
assert 'data-category=' in generator and 'prefers-reduced-motion' in generator
assert 'id="modelRows"' in generator and 'modelInput' in generator
assert 'fair_articles(news.get("articles",[]),36,4)' in generator
assert 'fair_articles(news.get("articles",[]),50,7)' in generator
assert "amount<0" in generator.replace(" ","") or "amount < 0" in generator
assert not re.search(r">\s*-\$[0-9]", page), "AI model table must not publish negative sentinel prices"
models=json.loads((root/"ai/data/model-catalogue.json").read_text(encoding="utf-8"))
for item in models.get("models",[]):
 assert item.get("id") and item.get("name")
 for key in ("input","output"):
  value=item.get(key)
  assert value is None or (isinstance(value,(int,float)) and math.isfinite(value) and value>=0), f"invalid {key} price for {item.get('id')}: {value}"
pika=(root/"pikanews/index.html").read_text(encoding="utf-8")
pika_sitemap=(root/"pikanews/sitemap.xml").read_text(encoding="utf-8")
assert re.search(r'<meta name="robots" content="noindex,follow">',pika,re.I)
assert len(re.findall(r'<meta name="description"',pika,re.I))==1
assert len(re.findall(r'<link rel="canonical"',pika,re.I))==1
assert "<loc>https://gogocompany.in/pikanews/</loc>" not in pika_sitemap
for name in ("latest","trending","bollywood","hollywood","entertainment","technology","gaming","business","sports"):
 hub=(root/"pikanews"/(name+".html")).read_text(encoding="utf-8")
 assert re.search(r'<meta name="robots" content="noindex, ?follow">',hub,re.I), f"PikaNews hub {name} must remain noindex"
 assert f"<loc>https://gogocompany.in/pikanews/{name}.html</loc>" not in pika_sitemap
ET.parse(root/"ai/feed.xml")
sitemap=(root/"sitemap.xml").read_text(encoding="utf-8")
assert "https://gogocompany.in/ai/" in sitemap
robots=(root/"robots.txt").read_text(encoding="utf-8")
assert "Sitemap: https://gogocompany.in/sitemap.xml" in robots
print("PASS: AI Hub SEO, source links, model metadata, RSS and sitemap.")
