import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { injectJobPosting, iso } from "../sarkari-sarthi/assets/js/sarkari-schema-injector.js";
import { isIndexableJob } from "./job-indexing-policy.mjs";

assert.equal(iso("02-11-2026"), "2026-11-02T00:00:00.000Z", "DD-MM-YYYY must be interpreted as day-month-year");
assert.equal(iso("2026-11-02"), "2026-11-02T00:00:00.000Z", "ISO date must remain unchanged");
assert.equal(iso("31-02-2026"), null, "Impossible DMY calendar dates must be rejected");
assert.equal(iso("2026-02-31"), null, "Impossible ISO calendar dates must be rejected");
assert.equal(iso("02/11/2026"), null, "Ambiguous slash dates must be rejected");

const scripts = [];
globalThis.location = { href: "https://gogocompany.in/sarkari-sarthi/jobs/example/" };
globalThis.document = {
  querySelector(selector) {
    if (selector === '[data-job-detail-page="true"]') return { dataset: { jobId: "example" } };
    if (selector === 'link[rel="canonical"]') return { href: globalThis.location.href };
    return null;
  },
  createElement() { return { dataset: {} }; },
  head: {
    querySelectorAll() { return []; },
    appendChild(script) { scripts.push(script); }
  }
};
const validJob = {
  title: "TGT Computer Science Recruitment — Sainik School Nagrota",
  job_title: "Computer Science Teacher",
  description: "This is a sufficiently complete recruitment description with responsibilities, qualifications, experience, working hours, required skills and selection information. It is published by the verified recruiting authority and provides meaningful details for applicants.",
  published_date: "02-11-2026",
  valid_through: "21-11-2099",
  organization: "Sainik School Example",
  location: "Nagrota, Jammu and Kashmir",
  official_application_url: "https://recruit.example/apply",
  employment_type: "FULL_TIME",
  status: "active",
  verification_status: "official_verified"
};
assert.equal(injectJobPosting(validJob), true, "A complete official-verified detail record should be eligible");
const schema = JSON.parse(scripts[0].textContent);
assert.equal(schema["@type"], "JobPosting");
assert.equal(schema.title, "Computer Science Teacher", "Structured title must use the actual job title, not the notice heading");
assert.equal(schema.datePosted, "2026-11-02T00:00:00.000Z");
assert.equal(schema.validThrough, "2099-11-21T00:00:00.000Z");
assert.equal(schema.directApply, false);
assert.equal(schema.jobLocation.address.addressLocality, "Nagrota, Jammu and Kashmir");

scripts.length = 0;
const noExpiry = { ...validJob };
delete noExpiry.valid_through;
assert.equal(injectJobPosting(noExpiry), true, "Unknown expiry is optional");
assert.equal("validThrough" in JSON.parse(scripts[0].textContent), false);

scripts.length = 0;
assert.equal(injectJobPosting({ ...validJob, valid_through: "not-a-date" }), false, "Malformed supplied expiry must be rejected");
assert.equal(scripts.length, 0);
assert.equal(injectJobPosting({ ...validJob, official_application_url: "http://recruit.example/apply" }), false, "Non-HTTPS application routes must be rejected");
assert.equal(scripts.length, 0);
assert.equal(injectJobPosting({ ...validJob, location: "", district: "", state: "Jammu and Kashmir" }), false, "A state-only location must not be mislabeled as a locality");
assert.equal(scripts.length, 0);
assert.equal(injectJobPosting(({ ...validJob, job_title: undefined })), false, "Notice heading alone must not be used as the job title");
assert.equal(scripts.length, 0);
console.log("JobPosting generator tests passed: strict dates, optional expiry, canonical detail guard and secure application URL.");

const completeIndexableJob = {
  status: "active",
  verification_status: "official_verified",
  job_title: "Computer Science Teacher",
  organization: "Sainik School Nagrota",
  vacancies: 12,
  qualification: "B.Ed. and relevant postgraduate degree",
  important_dates: { last_date: "30-12-2099" },
  official_notification_url: "https://recruit.example/notification.pdf",
  official_application_url: "https://recruit.example/apply",
  description_complete: true,
  description: "Complete verified details for the recruitment, eligibility, selection and application. ".repeat(5)
};
assert.equal(isIndexableJob(completeIndexableJob), true, "complete active official jobs may be indexed");
assert.equal(isIndexableJob({ ...completeIndexableJob, verification_status: "needs_review" }), false);
assert.equal(isIndexableJob({ ...completeIndexableJob, official_notification_url: null }), false);
assert.equal(isIndexableJob({ ...completeIndexableJob, vacancies: null }), false);
assert.equal(isIndexableJob({ ...completeIndexableJob, qualification: "Not specified in official notification" }), false);
assert.equal(isIndexableJob({ ...completeIndexableJob, important_dates: { last_date: "01-01-2020" } }), false);
assert.equal(isIndexableJob({ ...completeIndexableJob, status: "expired" }), false);

for (const id of ["en_e720d528a5699f9ac7d3cf27f799ce9c", "en_214e74070f15cf22b137f10a8019fbe1"]) {
  const page = await readFile(new URL("../sarkari-sarthi/job/" + id + "/index.html", import.meta.url), "utf8");
  assert.match(page, /<meta name="robots" content="noindex,follow">/, "incomplete detail page " + id + " must remain directly accessible but noindex");
  const sitemap = await readFile(new URL("../sarkari-sarthi/sitemap.xml", import.meta.url), "utf8");
  assert.doesNotMatch(sitemap, new RegExp("sarkari-sarthi/job/" + id + "/"), "incomplete detail page " + id + " must be excluded from the product sitemap");
}
