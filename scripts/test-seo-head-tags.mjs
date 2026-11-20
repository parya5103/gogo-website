import assert from "node:assert/strict";
import { upsertMeta, upsertLink } from "./seo-head-tags.mjs";

const initial = '<html><head><meta name="description" content="old"><meta name="description" content="duplicate"><meta property="og:title" content="old"><link rel="canonical" href="/old"><link rel="canonical" href="/duplicate"></head><body></body></html>';
const withDescription = upsertMeta(initial, "name", "description", "A & B");
assert.equal(withDescription.split('<meta name="description"').length - 1, 1);
assert.ok(withDescription.includes('content="A &amp; B"'));
const withSocial = upsertMeta(withDescription, "property", "og:title", "GoGo Company");
assert.equal(withSocial.split('<meta property="og:title"').length - 1, 1);
const withCanonical = upsertLink(withSocial, "canonical", "https://gogocompany.in/");
assert.equal(withCanonical.split('<link rel="canonical"').length - 1, 1);
assert.ok(withCanonical.includes('href="https://gogocompany.in/"'));
assert.equal(upsertMeta(withCanonical, "name", "description", "A & B"), withCanonical, "meta upsert must be idempotent");
assert.equal(upsertLink(withCanonical, "canonical", "https://gogocompany.in/"), withCanonical, "canonical upsert must be idempotent");

const inserted = upsertMeta("<html><head></head><body></body></html>", "name", "robots", "noindex,follow");
assert.ok(inserted.includes('<meta name="robots" content="noindex,follow">'));
console.log("SEO head-tag tests passed: deduplication, escaping, insertion and idempotence.");
