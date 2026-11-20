function escapeAttribute(value) {
  return String(value).replaceAll("&", "&amp;").replaceAll('"', "&quot;");
}

export function upsertMeta(html, attr, key, value) {
  const matcher = new RegExp("<meta\\\\b(?=[^>]*\\\\b" + attr + "\\\\s*=\\\\s*[\\\"']" + key + "[\\\"'])[^>]*>", "gi");
  const tag = '<meta ' + attr + '="' + escapeAttribute(key) + '" content="' + escapeAttribute(value) + '">';
  let found = false;
  const updated = html.replace(matcher, () => {
    if (found) return "";
    found = true;
    return tag;
  });
  return found ? updated : updated.replace(/<\\/head>/i, "  " + tag + "\\n</head>");
}

export function upsertLink(html, rel, href, extra = "") {
  const matcher = new RegExp("<link\\\\b(?=[^>]*\\\\brel\\\\s*=\\\\s*[\\\"']" + rel + "[\\\"'])[^>]*>", "gi");
  const tag = '<link rel="' + escapeAttribute(rel) + '" href="' + escapeAttribute(href) + '"' + (extra ? " " + extra : "") + '>';
  let found = false;
  const updated = html.replace(matcher, () => {
    if (found) return "";
    found = true;
    return tag;
  });
  return found ? updated : updated.replace(/<\\/head>/i, "  " + tag + "\\n</head>");
}
