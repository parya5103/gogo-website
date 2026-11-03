/* GoGo Company - Sarkari Sarthi renderer.
   Data comes from SARKARI_LISTINGS (curated, official sources) plus the
   Sarkari-Sarthi scraper manifest. The live manifest (MANIFEST_URL) is
   fetched on every page load; SARKARI_SNAPSHOT (in sarkari-data.js) is the
   offline fallback baked in at build time.

   States handled: loading, success (live), degraded (fallback snapshot),
   error (fetch failed -> retry button), empty (no search matches). */

(function () {
  "use strict";

  var CATS = [
    { id: "all", label: "All" },
    { id: "jobs", label: "Jobs" },
    { id: "admit", label: "Admit Card" },
    { id: "result", label: "Results" },
    { id: "answer-key", label: "Answer Key" },
    { id: "syllabus", label: "Syllabus" },
    { id: "notification", label: "Notifications" }
  ];

  var MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  var TODAY = new Date();
  var todayNum = TODAY.getFullYear() * 10000 + (TODAY.getMonth() + 1) * 100 + TODAY.getDate();

  var grid = document.getElementById("sarkari-grid");
  if (!grid) return;
  var tabsEl = document.getElementById("sarkari-tabs");
  var searchEl = document.getElementById("sarkari-search");
  var statusEl = document.getElementById("sarkari-status");
  var emptyEl = document.getElementById("sarkari-empty");
  var errorEl = document.getElementById("sarkari-error");
  var retryBtn = document.getElementById("sarkari-retry");

  var state = { tab: "all", query: "", source: "loading" };
  var curated = [];
  var scraped = [];

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function parseDmy(s) {
    if (!s) return null;
    var m = /^(\d{2})-(\d{2})-(\d{4})$/.exec(String(s));
    if (!m) return null;
    return { d: +m[1], m: +m[2], y: +m[3], num: (+m[3]) * 10000 + (+m[2]) * 100 + (+m[1]) };
  }

  function fmtDmy(s) {
    var p = parseDmy(s);
    if (!p) return esc(s || "See official notification");
    return p.d + " " + MON[p.m - 1] + " " + p.y;
  }

  function fmtIso(iso) {
    var m = /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/.exec(String(iso || ""));
    if (!m) return "";
    return m[3] + " " + MON[+m[2] - 1] + " " + m[1] + ", " + m[4] + ":" + m[5] + " UTC";
  }

  function isExpired(l) {
    var p = parseDmy(l.last);
    return !!p && p.num < todayNum;
  }

  function detectCat(title) {
    var t = String(title || "").toLowerCase();
    if (t.indexOf("admit") >= 0) return "admit";
    if (t.indexOf("result") >= 0) return "result";
    if (t.indexOf("answer key") >= 0) return "answer-key";
    if (t.indexOf("syllabus") >= 0) return "syllabus";
    return "jobs";
  }

  function vacFromTitle(title) {
    var m = /(\d[\d,]*)\s+Posts/i.exec(String(title || ""));
    return m ? m[1] : null;
  }

  function normCurated(l) {
    return {
      id: l.id,
      cat: l.cat,
      title: l.title,
      dept: l.dept,
      vac: l.vac,
      last: l.last || null,
      found: null,
      elig: l.elig,
      fee: l.fee,
      apply: l.apply,
      notice: l.notice,
      updated: l.updated,
      source: l.source,
      origin: "curated"
    };
  }

  function normScraped(e) {
    var u = String(e.u || e.url || "");
    var t = String(e.t || e.title || "");
    return {
      id: u.replace(/[^a-z0-9]+/gi, "-").slice(-80),
      cat: detectCat(t),
      title: t,
      dept: "Sarkari-Sarthi aggregated listing",
      vac: vacFromTitle(t),
      last: (e.important_dates && e.important_dates.last_date) || e.l || null,
      found: (e.important_dates && e.important_dates.found_date) || e.f || null,
      elig: "See official notification",
      fee: null,
      apply: u,
      notice: u,
      updated: null,
      source: "Sarkari-Sarthi scraper",
      origin: "scraped"
    };
  }

  function isDetailUrl(u) {
    return /\/\d+$/.test(String(u || ""));
  }

  function normManifest(manifest) {
    var seen = {};
    var out = [];
    var jobs = (manifest && manifest.jobs) || [];
    for (var i = 0; i < jobs.length; i++) {
      var j = jobs[i];
      if (!isDetailUrl(j.url)) continue;
      if (seen[j.url]) continue;
      seen[j.url] = 1;
      out.push(j);
    }
    return out;
  }

  function allListings() {
    return curated.concat(scraped);
  }

  function filtered() {
    var list = allListings();
    var q = state.query.trim().toLowerCase();
    var out = [];
    for (var i = 0; i < list.length; i++) {
      var l = list[i];
      if (state.tab !== "all" && l.cat !== state.tab) continue;
      if (q && (l.title + " " + l.dept).toLowerCase().indexOf(q) < 0) continue;
      out.push(l);
    }
    return out;
  }

  function counts() {
    var c = {};
    for (var i = 0; i < CATS.length; i++) c[CATS[i].id] = 0;
    var list = allListings();
    for (var j = 0; j < list.length; j++) {
      c[list[j].cat] = (c[list[j].cat] || 0) + 1;
      c.all++;
    }
    return c;
  }

  function card(l) {
    var urgent = "";
    var p = parseDmy(l.last);
    if (p && p.num >= todayNum && p.num - todayNum <= 7) urgent = '<span class="chip chip-urgent">Closing soon</span>';
    var vac = l.vac ? '<p class="s-vac"><span>Vacancies</span> ' + esc(l.vac) + "</p>" : "";
    var last = l.last
      ? '<p class="s-last"><span>Last date</span> ' + fmtDmy(l.last) + "</p>"
      : '<p class="s-last"><span>Date</span> See official notification</p>';
    var found = l.found ? '<p class="s-found"><span>Listed on</span> ' + fmtDmy(l.found) + "</p>" : "";
    var elig = l.elig ? '<p class="s-elig"><span>Eligibility</span> ' + esc(l.elig) + "</p>" : "";
    var fee = l.fee ? '<p class="s-fee"><span>Fee</span> ' + esc(l.fee) + "</p>" : "";
    var catLabel = "";
    for (var i = 0; i < CATS.length; i++) if (CATS[i].id === l.cat) catLabel = CATS[i].label;
    return (
      '<article class="s-card">' +
      '<div class="s-card-top">' +
      '<span class="chip">' + esc(catLabel) + "</span>" +
      urgent +
      '<span class="chip chip-src">' + esc(l.source) + "</span>" +
      "</div>" +
      '<h3 class="s-title">' + esc(l.title) + "</h3>" +
      '<p class="s-dept">' + esc(l.dept) + "</p>" +
      vac + last + found + elig + fee +
      '<div class="s-actions">' +
      '<a class="btn btn-primary" href="' + esc(l.apply) + '" target="_blank" rel="noopener noreferrer">Apply / View</a>' +
      (l.notice && l.notice !== l.apply
        ? '<a class="btn btn-ghost" href="' + esc(l.notice) + '" target="_blank" rel="noopener noreferrer">Official Notice</a>'
        : "") +
      "</div>" +
      "</article>"
    );
  }

  function setStatus(msg) {
    if (statusEl) statusEl.textContent = msg;
  }

  function showError(msg) {
    if (errorEl) {
      errorEl.hidden = false;
      var m = errorEl.querySelector(".sarkari-error-msg");
      if (m) m.textContent = msg;
    }
  }

  function hideError() {
    if (errorEl) errorEl.hidden = true;
  }

  function render() {
    var c = counts();
    if (tabsEl) {
      var html = "";
      for (var i = 0; i < CATS.length; i++) {
        var cat = CATS[i];
        html +=
          '<button type="button" class="tab-btn' + (state.tab === cat.id ? " active" : "") +
          '" data-tab="' + cat.id + '">' +
          esc(cat.label) + ' <span class="tab-count">' + (c[cat.id] || 0) + "</span></button>";
      }
      tabsEl.innerHTML = html;
    }
    var list = filtered();
    grid.innerHTML = list.map(card).join("");
    if (emptyEl) emptyEl.hidden = list.length !== 0;
  }

  function applyScraped(list, source, updatedLabel) {
    var keep = [];
    var expired = 0;
    for (var i = 0; i < list.length; i++) {
      var n = normScraped(list[i]);
      if (isExpired(n)) expired++;
      else keep.push(n);
    }
    scraped = keep;
    state.source = source;
    hideError();
    render();
    setStatus(
      (curated.length + scraped.length) + " listings" +
      (updatedLabel ? " - scraper data updated " + updatedLabel : "") +
      (source === "fallback" ? " - showing embedded snapshot (live fetch failed)" : "") +
      (expired ? " (" + expired + " expired hidden)" : "") + "."
    );
  }

  function loadSnapshot() {
    if (typeof SARKARI_SNAPSHOT !== "undefined" && SARKARI_SNAPSHOT.length) {
      applyScraped(SARKARI_SNAPSHOT, "fallback", null);
    } else {
      state.source = "curated-only";
      render();
      setStatus(curated.length + " curated listings shown.");
    }
  }

  function loadManifest() {
    if (typeof MANIFEST_URL === "undefined" || !window.fetch) {
      state.source = "fallback";
      loadSnapshot();
      if (errorEl) showError("This browser does not support live data fetch.");
      return;
    }
    window
      .fetch(MANIFEST_URL)
      .then(function (r) {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.json();
      })
      .then(function (manifest) {
        var updatedLabel = fmtIso(manifest.last_updated);
        applyScraped(normManifest(manifest), "live", updatedLabel);
      })
      .catch(function (err) {
        /* Keep whatever the snapshot already rendered; surface a retry. */
        if (state.source !== "fallback") loadSnapshot();
        showError("Live job data could not be fetched right now (" + (err && err.message ? err.message : "network error") + "). Showing fallback data.");
      });
  }

  if (typeof SARKARI_LISTINGS !== "undefined") {
    curated = SARKARI_LISTINGS.filter(function (l) { return !isExpired(l); }).map(normCurated);
  }

  state.source = "loading";
  setStatus("Loading listings...");
  render();
  loadSnapshot();
  loadManifest();

  tabsEl.addEventListener("click", function (ev) {
    var btn = ev.target.closest(".tab-btn");
    if (!btn) return;
    state.tab = btn.getAttribute("data-tab");
    render();
  });

  searchEl.addEventListener("input", function () {
    state.query = searchEl.value;
    render();
  });

  if (retryBtn) {
    retryBtn.addEventListener("click", function () {
      loadManifest();
    });
  }
})();
