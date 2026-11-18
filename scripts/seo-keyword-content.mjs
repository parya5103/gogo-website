const escapeHtml = value => String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");

export function renderKeywordSection({ id = "gogo-search-intent", heading, intro, faqs = [] }) {
  if (!heading || !intro) throw new TypeError("A heading and introductory paragraph are required");
  const faqHtml = faqs.map(([question, answer]) =>
    `<details><summary>${escapeHtml(question)}</summary><p>${escapeHtml(answer)}</p></details>`
  ).join("\n");
  return [
    `<section id="${escapeHtml(id)}" class="seo-keyword-content" aria-labelledby="${escapeHtml(id)}-heading">`,
    '  <div class="container">',
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
  const footer = html.search(/<footer\b/i);
  if (footer >= 0) return html.slice(0, footer) + section + "\n\n" + html.slice(footer);
  const bodyEnd = html.search(/<\/body>/i);
  if (bodyEnd >= 0) return html.slice(0, bodyEnd) + section + "\n" + html.slice(bodyEnd);
  return html + "\n" + section + "\n";
}
