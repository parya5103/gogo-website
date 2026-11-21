#!/usr/bin/env python3
from pathlib import Path
import json,re,xml.etree.ElementTree as ET
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
models=json.loads((root/"ai/data/model-catalogue.json").read_text(encoding="utf-8"))
for item in models.get("models",[]):
 assert item.get("id") and item.get("name")
ET.parse(root/"ai/feed.xml")
sitemap=(root/"sitemap.xml").read_text(encoding="utf-8")
assert "https://gogocompany.in/ai/" in sitemap
robots=(root/"robots.txt").read_text(encoding="utf-8")
assert "Sitemap: https://gogocompany.in/sitemap.xml" in robots
print("PASS: AI Hub SEO, source links, model metadata, RSS and sitemap.")
