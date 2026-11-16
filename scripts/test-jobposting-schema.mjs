import assert from "node:assert/strict";
import { injectJobPosting, iso } from "../sarkari-sarthi/assets/js/sarkari-schema-injector.js";

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
