/**
 * Indexation policy for Sarkari Sarthi detail pages.
 * Pages remain accessible to visitors, but search indexing requires complete,
 * current and explicitly official-verified data. Missing values are never
 * inferred from source excerpts.
 */
const PLACEHOLDERS = /^(?:not specified(?: in official notification)?|not available|n\/a|na|unknown|to be announced|\-|—)$/i;

function meaningful(value) {
  const text = typeof value === "string" ? value.trim() : String(value ?? "").trim();
  return Boolean(text && !PLACEHOLDERS.test(text));
}

function parseDeadline(value) {
  if (typeof value !== "string") return null;
  const text = value.trim();
  let date;
  const dmy = text.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  const iso = text.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (dmy) date = new Date(Date.UTC(Number(dmy[3]), Number(dmy[2]) - 1, Number(dmy[1]), 23, 59, 59));
  else if (iso) date = new Date(Date.UTC(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]), 23, 59, 59));
  else return null;
  if (!Number.isFinite(date.getTime())) return null;
  const parts = dmy
    ? [Number(dmy[3]), Number(dmy[2]) - 1, Number(dmy[1])]
    : [Number(iso[1]), Number(iso[2]) - 1, Number(iso[3])];
  if (date.getUTCFullYear() !== parts[0] || date.getUTCMonth() !== parts[1] || date.getUTCDate() !== parts[2]) return null;
  return date;
}

function secureHttpUrl(value) {
  if (!meaningful(value)) return false;
  try { return new URL(value).protocol === "https:"; } catch { return false; }
}

export function isIndexableJob(job, now = new Date()) {
  if (!job || typeof job !== "object") return false;
  if (String(job.status || "").toLowerCase() !== "active") return false;
  if (String(job.verification_status || "").toLowerCase() !== "official_verified") return false;
  if (!meaningful(job.job_title) || !meaningful(job.organization)) return false;
  const vacancies = Number(job.vacancies);
  if (!Number.isInteger(vacancies) || vacancies < 1) return false;
  if (!meaningful(job.qualification)) return false;
  if (!secureHttpUrl(job.official_notification_url) || !secureHttpUrl(job.official_application_url)) return false;
  if (job.description_complete !== true || !meaningful(job.description) || String(job.description).trim().length < 200) return false;
  const deadline = parseDeadline(job.important_dates?.last_date);
  if (!deadline || deadline <= now) return false;
  return true;
}
