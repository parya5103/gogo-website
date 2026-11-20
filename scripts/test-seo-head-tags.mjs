import assert from "node:assert/strict";
import { upsertMeta, upsertLink } from "./seo-head-tags.mjs";

const initial = '<html><head><meta name="description" content="old"><meta name="description" content="duplicate"><meta property="og:title" content="old"><link rel="canonical" href="/old"><link rel="canonical" href="/duplicate"></head><body></body></html>';
const withDescription = upsertMeta(initial, "name", "description", "A & B");
assert.equal([...withDescription.matchAll(/<meta\\b(?=[^>]*\\bname=["']description["'])/gi)].length, 1);
assert.match(withDescription, /content="A &amp; B"/);
const withSocial = upsertMeta(withDescription, "property", "og:title", "GoGo Company");
assert.equal([...withSocial.matchAll(/<meta\\b(?=[^>]*\\bproperty=["']og:title["'])/gi)].length, 1);
const withCanonical = upsertLink(withSocial, "canonical", "https://gogocompany.in/");
assert.equal([...withCanonical.matchAll(/<link\\b(?=[^>]*\\brel=["']canonical["'])/gi)].length, 1);
assert.match(withCanonical, /href="https:\\/\\/gogocompany\\.in\\/"/);
assert.equal(upsertMeta(withCanonical, "name", "description", "A & B"), withCanonical, "meta upsert must be idempotent");
assert.equal(upsertLink(withCanonical, "canonical", "https://gogocompany.in/"), withCanonical, "canonical upsert must be idempotent");

const inserted = upsertMeta("<html><head></head><body></body></html>", "name", "robots", "noindex,follow");
assert.match(inserted, /<meta name="robots" content="noindex,follow">/);
console.log("SEO head-tag tests passed: deduplication, escaping, insertion and idempotence.");
