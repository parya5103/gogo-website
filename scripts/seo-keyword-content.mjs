const escapeHtml = value => String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");

export function renderKeywordSection({ id = "gogo-search-intent", heading, intro, faqs = [] }) {
  if (!heading || !intro) throw new TypeError("A heading and introductory paragraph are required");
  const faqHtml = faqs.map(([question, answer]) =>
    `<details><summary>${escapeHtml(question)}</summary><p>${escapeHtml(answer)}</p></details>`
  ).join("\n");
  return [
    `<section id="${escapeHtml(id)}" class="seo-keyword-content" style="max-width:900px;margin:32px auto;padding:24px;line-height:1.65" aria-labelledby="${escapeHtml(id)}-heading">`,
    '  <div>',
    `    <h2 id="${escapeHtml(id)}-heading">${escapeHtml(heading)}</h2>`,
    `    <p>${escapeHtml(intro)}</p>`,
    faqHtml,
    '  </div>',
    '</section>'
  ].filter(Boolean).join("\n");
}

export function addKeywordSection(html, config) {
  const id = config?.id || "gogo-search-intent";
  if (html.includes(`id="${id}"`)) return html;
  const section = renderKeywordSection(config);
  // Only inject into a real content container. Never treat a game's in-app
  // action bar or a footer inside a fixed-height game shell as page content.
  const mainClose = html.search(/<\/main\s*>/i);
  if (mainClose < 0) return html;
  return html.slice(0, mainClose) + section + "\n" + html.slice(mainClose);
}
