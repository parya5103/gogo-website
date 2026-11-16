/**
 * Only injects JobPosting on a genuine, canonical individual detail page.
 * The Sarkari Sarthi homepage is a collection page and is intentionally excluded.
 * A detail page must set window.SARKARI_JOB_DETAIL and main[data-job-detail-page=true].
 */
const clean=v=>typeof v==="string"?v.trim():"";
const iso=v=>{const d=new Date(v);return Number.isFinite(d.getTime())?d.toISOString():null};
function injectJobPosting(job,pageUrl=location.href){
 if(!job||typeof job!=="object"||!document.querySelector('[data-job-detail-page="true"]'))return false;
 const canonical=document.querySelector('link[rel="canonical"]')?.href,current=new URL(pageUrl,location.href).href.split("#")[0];
 if(!canonical||new URL(canonical).href.split("#")[0]!==current)return false;
 const title=clean(job.title),description=clean(job.description),datePosted=iso(job.published_date||job.datePosted),validThrough=iso(job.valid_through||job.validThrough),employer=clean(job.organization||job.department||job.recruitment_board),place=clean(job.location||job.district||job.state),apply=clean(job.official_application_url||job.application_url);
 if(!title||!description||!datePosted||!validThrough||!employer||!place||!/^https:\/\//i.test(apply)||clean(job.status).toLowerCase()!=="active"||clean(job.verification_status).toLowerCase()!=="official_verified"||new Date(validThrough)<=new Date())return false;
 const schema={"@context":"https://schema.org","@type":"JobPosting","title":title,"description":description,"datePosted":datePosted,"validThrough":validThrough,"employmentType":clean(job.employment_type).toUpperCase()||"FULL_TIME","hiringOrganization":{"@type":"Organization","name":employer},"jobLocation":{"@type":"Place","address":{"@type":"PostalAddress","addressLocality":place,"addressCountry":"IN"}},"url":current,"directApply":false};
 const node=document.createElement("script");node.type="application/ld+json";node.dataset.generatedJobPosting="true";node.textContent=JSON.stringify(schema);document.head.querySelectorAll('script[data-generated-job-posting="true"]').forEach(x=>x.remove());document.head.appendChild(node);return true;
}
if(window.SARKARI_JOB_DETAIL)injectJobPosting(window.SARKARI_JOB_DETAIL);
export{injectJobPosting};
