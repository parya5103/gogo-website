/**
 * Inject JobPosting only on a genuine, canonical individual job-detail page.
 * The portal collection page is intentionally excluded. The current manifest
 * contains incomplete records, so only complete, active, official-verified
 * records with an explicit application route are eligible.
 */
const clean = value => typeof value === "string" ? value.trim() : "";
const escapeHtml = value => String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/\x27/g, "&#39;");
const iso = value => { const d = new Date(value); return Number.isFinite(d.getTime()) ? d.toISOString() : null; };
const EMPLOYMENT_TYPES = new Set(["FULL_TIME","PART_TIME","CONTRACTOR","TEMPORARY","INTERN","VOLUNTEER","PER_DIEM","OTHER"]);

function injectJobPosting(job, pageUrl = location.href) {
  if (!job || typeof job !== "object" || !document.querySelector('[data-job-detail-page="true"]')) return false;
  const canonical = document.querySelector('link[rel="canonical"]')?.href;
  const current = new URL(pageUrl, location.href).href.split("#")[0];
  if (!canonical || new URL(canonical).href.split("#")[0] !== current) return false;

  const title = clean(job.title);
  const description = clean(job.description);
  const datePosted = iso(job.published_date || job.datePosted);
  const validThrough = iso(job.valid_through || job.validThrough);
  const employer = clean(job.organization || job.department || job.recruitment_board);
  const place = clean(job.location || job.district || job.state);
  const applicationUrl = clean(job.official_application_url || job.application_url);
  const employmentType = clean(job.employment_type).toUpperCase();

  if (!title || description.length < 200 || /(?:\.\.\.|…)$/.test(description) || !datePosted || !employer || !place ||
      !/^https:\/\//i.test(applicationUrl) || !EMPLOYMENT_TYPES.has(employmentType) ||
      clean(job.status).toLowerCase() !== "active" ||
      clean(job.verification_status).toLowerCase() !== "official_verified" ||
      (validThrough && new Date(validThrough) <= new Date())) return false;

  const schema = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    "title": title,
    "description": description.split(/\\n+/).map(part => "<p>" + escapeHtml(part) + "</p>").join(""),
    "datePosted": datePosted,
    ...(validThrough ? { "validThrough": validThrough } : {}),
    "employmentType": employmentType,
    "hiringOrganization": { "@type": "Organization", "name": employer },
    "jobLocation": {
      "@type": "Place",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": place,
        "addressCountry": "IN"
      }
    },
    "url": current,
    "directApply": false
  };

  const script = document.createElement("script");
  script.type = "application/ld+json";
  script.dataset.generatedJobPosting = "true";
  script.textContent = JSON.stringify(schema).replace(/</g, "\\u003c").replace(/>/g, "\\u003e").replace(/&/g, "\\u0026");
  document.head.querySelectorAll('script[data-generated-job-posting="true"]').forEach(node => node.remove());
  document.head.appendChild(script);
  return true;
}

async function loadCurrentJob() {
  const detailPage = document.querySelector('[data-job-detail-page="true"]');
  const jobId = clean(detailPage?.dataset.jobId || window.SARKARI_JOB_ID);
  if (!jobId) return;
  try {
    const response = await fetch(new URL("../../jobs/job_manifest.json", import.meta.url), { cache: "no-store" });
    if (!response.ok) return;
    const manifest = await response.json();
    const job = Array.isArray(manifest.jobs) ? manifest.jobs.find(item => String(item.id) === jobId) : null;
    if (job) injectJobPosting(job);
  } catch (error) {
    console.warn("Sarkari Sarthi job structured data unavailable:", error);
  }
}

if (window.SARKARI_JOB_DETAIL) injectJobPosting(window.SARKARI_JOB_DETAIL);
else loadCurrentJob();

export { injectJobPosting };
