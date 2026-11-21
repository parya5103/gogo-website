/**
 * Indexation policy for Sarkari Sarthi detail pages.
 * Pages remain accessible to visitors, but search indexing requires complete,
 * current and explicitly official-verified data. Missing values are never
 * inferred from source excerpts.
 */
const PLACEHOLDERS = /^(?:not specified(?: in official notification)?|not available|n\/a|na|unknown|to be announced|\-|—)$/i;
const EMPLOYMENT_TYPES = new Set(["FULL_TIME","PART_TIME","CONTRACTOR","TEMPORARY","INTERN","VOLUNTEER","PER_DIEM","OTHER"]);

function meaningful(value) {
  const text = typeof value === "string" ? value.trim() : String(value ?? "").trim();
  return Boolean(text && !PLACEHOLDERS.test(text));
}

function parseDeadline(value) {
  if (typeof value !== "string") return null;
  const text = value.trim();
  const dmy = text.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  const iso = text.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!dmy && !iso) return null;
  const parts = dmy
    ? [Number(dmy[3]), Number(dmy[2]) - 1, Number(dmy[1])]
    : [Number(iso[1]), Number(iso[2]) - 1, Number(iso[3])];
  const date = new Date(Date.UTC(parts[0], parts[1], parts[2], 23, 59, 59));
  if (!Number.isFinite(date.getTime()) || date.getUTCFullYear() !== parts[0] ||
      date.getUTCMonth() !== parts[1] || date.getUTCDate() !== parts[2]) return null;
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
  if (!meaningful(job.qualification) || !meaningful(job.location || job.district)) return false;
  if (!EMPLOYMENT_TYPES.has(String(job.employment_type || "").toUpperCase())) return false;
  if (!secureHttpUrl(job.official_notification_url) || !secureHttpUrl(job.official_application_url)) return false;
  if (job.description_complete !== true || !meaningful(job.description) || String(job.description).trim().length < 200) return false;
  const published = parseDeadline(job.published_date || job.datePosted);
  const deadline = parseDeadline(job.important_dates?.last_date);
  const validThrough = parseDeadline(job.valid_through || job.validThrough);
  if (!published || published > now || !deadline || deadline <= now || !validThrough || validThrough <= now) return false;
  if (validThrough.getTime() !== deadline.getTime()) return false;
  return true;
}
