// Sarkari Sarthi - read-only job data viewer.
//
// Security note (2026-11 audit): the previous version of this page
// implemented a fake client-side "admin": a SHA-256 password check in
// the browser plus a GitHub credential typed into the page and kept
// in browser session storage. Static GitHub Pages hosting
// cannot provide real authentication, so this page is now a
// read-only viewer of the published jobs manifest. All edits happen
// through the GitHub web UI or Actions, which enforce real
// server-side authentication.
//
// This file intentionally contains no credentials and no write paths
// of any kind.

let currentJobs = [];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    fetchJobsFromSite();
});

async function fetchJobsFromSite() {
    const tbody = document.getElementById('jobsTableBody');
    renderMessage(tbody, 'Loading job data...');

    try {
        // Same-origin relative fetch of the published manifest.
        // No credentials, no third-party API, no cookies.
        const response = await fetch('jobs/job_manifest.json', {
            headers: { 'Accept': 'application/json' }
        });

        if (!response.ok) {
            throw new Error('HTTP ' + response.status);
        }

        const manifest = await response.json();
        currentJobs = Array.isArray(manifest.jobs) ? manifest.jobs : [];
        document.getElementById('jobCount').textContent =
            String(manifest.total_jobs != null ? manifest.total_jobs : currentJobs.length);
        renderJobsTable();
    } catch (error) {
        currentJobs = [];
        renderError(tbody, 'Could not load job data: ' + error.message);
    }
}

function renderMessage(tbody, text) {
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    td.colSpan = 4;
    td.style.textAlign = 'center';
    td.textContent = text;
    tr.appendChild(td);
    tbody.innerHTML = '';
    tbody.appendChild(tr);
}

function renderError(tbody, text) {
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    td.colSpan = 4;
    td.style.textAlign = 'center';
    td.style.color = '#ef4444';
    td.textContent = text;
    tr.appendChild(td);
    tbody.innerHTML = '';
    tbody.appendChild(tr);
}

function renderJobsTable() {
    const tbody = document.getElementById('jobsTableBody');
    tbody.innerHTML = '';

    if (currentJobs.length === 0) {
        renderMessage(tbody, 'No jobs found.');
        return;
    }

    // Batch DOM insertions using DocumentFragment to prevent layout
    // thrashing. Every cell is rendered with textContent only, so a
    // hostile job title (e.g. HTML or a script tag injected through
    // the manifest) can never execute in this page.
    const fragment = document.createDocumentFragment();
    currentJobs.forEach(job => {
        const tr = document.createElement('tr');

        const tdTitle = document.createElement('td');
        const strongTitle = document.createElement('strong');
        strongTitle.textContent = job.title;
        tdTitle.appendChild(strongTitle);
        tr.appendChild(tdTitle);

        const tdDept = document.createElement('td');
        tdDept.textContent = job.department || 'N/A';
        tr.appendChild(tdDept);

        const tdCategory = document.createElement('td');
        const spanCategory = document.createElement('span');
        spanCategory.className = 'category-tag';
        spanCategory.textContent = job.category || 'Other';
        tdCategory.appendChild(spanCategory);
        tr.appendChild(tdCategory);

        const tdDate = document.createElement('td');
        tdDate.textContent = job.last_date || (job.important_dates && job.important_dates.last_date) || 'Not specified';
        tr.appendChild(tdDate);

        fragment.appendChild(tr);
    });
    tbody.appendChild(fragment);
}
