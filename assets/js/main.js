/* GoGo Company - shared site chrome.
   Header and footer are injected here so nav links live in ONE place.
   Pages set: <html data-root="./"> (root pages) or "../" (nested pages),
   and <body data-page="home|about|contact|...">.
   Product apps live under /arrowout/, /crystalquest/ and /sarkari-sarthi/
   (published from their own source repositories by the sync workflow -
   see .github/workflows/sync-products.yml).
   Edit NAV_LINKS / FOOTER_COLS below to change the whole site. */

(function () {
  "use strict";

  var ROOT = (document.documentElement.getAttribute("data-root") || "./");

  var LOGO_SVG =
    '<svg class="logo" viewBox="0 0 64 64" width="40" height="40" aria-hidden="true" focusable="false">' +
    '<defs><linearGradient id="gogo-g" x1="0" y1="0" x2="1" y2="1">' +
    '<stop offset="0" stop-color="#3b82f6"/><stop offset=".5" stop-color="#6366f1"/><stop offset="1" stop-color="#8b5cf6"/>' +
    '</linearGradient></defs>' +
    '<path d="M32 4 56 18v28L32 60 8 46V18z" fill="#0f172a" stroke="url(#gogo-g)" stroke-width="3"/>' +
    '<path d="M39.7 24.8 A12 12 0 1 0 44 34 L36 34" fill="none" stroke="url(#gogo-g)" stroke-width="4" stroke-linecap="round"/>' +
    '</svg>';

  var NAV_LINKS = [
    { href: "index.html", label: "Home", page: "home" },
    { href: "sarkari-sarthi/", label: "Sarkari Sarthi", page: "sarkari" },
    { href: "arrowout/", label: "Arrow Out!", page: "arrow-out" },
    { href: "crystalquest/", label: "Crystal Quest", page: "crystal-quest" },
    { href: "account/index.html", label: "Account", page: "account" },
    { href: "about/index.html", label: "About", page: "about" },
    { href: "contact/index.html", label: "Contact", page: "contact" }
  ];

  var FOOTER_COLS = [
    {
      heading: "Company",
      links: [
        { href: "about/index.html", label: "About Us" },
        { href: "contact/index.html", label: "Contact" },
        { href: "account/index.html", label: "GoGo Account" },
        { href: "admin/index.html", la
bel: "Admin Dashboard" }
      ]
    },
    {
      heading: "Products",
      links: [
        { href: "arrowout/", label: "Arrow Out!" },
        { href: "crystalquest/", label: "Crystal Quest" },
        { href: "sarkari-sarthi/", label: "Sarkari Sarthi" }
      ]
    },
    {
      heading: "Legal",
      links: [
        { href: "privacy-policy/index.html", label: "Privacy Policy" },
        { href: "terms-and-conditions/index.html", label: "Terms & Conditions" },
        { href: "disclaimer/index.html", label: "Disclaimer" },
        { href: "unsubscribe/index.html", label: "Email Unsubscribe" }
      ]
    }
  ];

  var EMAIL = "officialgogocompany@gmail.com";

  function attr(s) {
    return String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;");
  }

  function esc(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function currentPage() {
    return document.body.getAttribute("data-page") || "";
  }

  function buildHeader() {
    var page = currentPage();
    var nav = "";
    for (var i = 0; i < NAV_LINKS.length; i++) {
      var l = NAV_LINKS[i];
      var current = l.page === page;
      nav +=
        '<li role="none"><a href="' + attr(ROOT + l.href) + '"' +
        (current ? ' aria-current="page"' : "") +
        ">" + esc(l.label) + "</a></li>";
    }
    nav +=
      '<li id="gogo-nav-account-item" role="none">' +
      '<button type="button" class="gogo-account-trigger" data-gogo-open-account="true" aria-label="Open GoGo Account menu" aria-haspopup="true">' +
      '<span class="gogo-trigger-dot" aria-hidden="true"></span>' +
      '<span class="gogo-trigger-text">GoGo Account</span>' +
      "</button></li>";
    return (
      '<header class="site-header">' +
      '<div class="container header-inner">' +
      '<a class="brand" href="' + attr(ROOT + "index.html") + '">' +
      LOGO_SVG +
      '<span class="brand-name"><span class="accent">GoGo</span> Company</span>' +
 
     "</a>" +
      '<button class="nav-toggle" type="button" aria-expanded="false" aria-controls="site-nav" aria-label="Toggle main navigation menu">' +
      '<span class="nav-toggle-bar" aria-hidden="true"></span><span class="nav-toggle-bar" aria-hidden="true"></span><span class="nav-toggle-bar" aria-hidden="true"></span>' +
      "</button>" +
      '<nav id="site-nav" class="site-nav" aria-label="Main navigation" role="navigation">' +
      '<ul class="nav-list" role="menubar">' + nav + "</ul>" +
      "</nav>" +
      "</div>" +
      "</header>"
    );
  }

  function buildFooter() {
    var cols = "";
    for (var i = 0; i < FOOTER_COLS.length; i++) {
      var c = FOOTER_COLS[i];
      var links = "";
      for (var j = 0; j < c.links.length; j++) {
        links +=
          '<li role="none"><a href="' + attr(ROOT + c.links[j].href) + '">' +
          esc(c.links[j].label) + "</a></li>";
      }
      cols += '<div class="footer-col"><h3>' + esc(c.heading) + '</h3><ul role="list">' + links + "</ul></div>";
    }
    return (
      '<footer class="site-footer" role="contentinfo">' +
      '<div class="container footer-inner">' +
      '<div class="footer-brand">' +
      LOGO_SVG +
      '<span><span class="accent">GoGo</span> Company</span></div>' +
      '<p class="footer-tag">Games and Sarkari exam updates from GoGo Company.</p>' +
      '<p class="footer-mail">Email: <a href="mailto:' + EMAIL + '">' + EMAIL + "</a></p>" +
      '<div class="footer-cols" role="navigation" aria-label="Footer navigation">' + cols + "</div>" +
      '<p class="footer-copy">&copy; <span id="footer-year">2026</span> GoGo Company. All rights reserved.</p>' +
      "</div>" +
      "</footer>"
    );
  }

  function ensureAccountAssets() {
    var cssHref = ROOT + "assets/css/gogo-account.css";
    if (!document.querySelector('link[href*="gogo-account.css"]')) {
      var link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = cssHref;
      d
ocument.head.appendChild(link);
    }
    var jsSrc = ROOT + "assets/js/gogo-account.js";
    if (!document.querySelector('script[src*="gogo-account.js"]')) {
      var s = document.createElement("script");
      s.src = jsSrc;
      s.defer = true;
      document.head.appendChild(s);
    } else if (window.GoGoAccount && typeof window.GoGoAccount.instance?.renderAllUI === "function") {
      window.GoGoAccount.instance.renderAllUI();
    }
  }

  function buildSkipLink() {
    return '<a href="#main" class="skip-link">Skip to main content</a>';
  }

  function buildBackToTop() {
    return '<button type="button" class="back-to-top" aria-label="Back to top" aria-hidden="true"><span>&#8593;</span></button>';
  }

  function initBackToTop() {
    var backToTop = document.querySelector(".back-to-top");
    if (!backToTop) {
      document.body.insertAdjacentHTML("beforeend", buildBackToTop());
      backToTop = document.querySelector(".back-to-top");
    }
    
    if (backToTop) {
      backToTop.setAttribute("aria-hidden", "true");
      var toggleVisibility = function() {
        if (window.pageYOffset > 300) {
          backToTop.classList.add("visible");
          backToTop.setAttribute("aria-hidden", "false");
        } else {
          backToTop.classList.remove("visible");
          backToTop.setAttribute("aria-hidden", "true");
        }
      };
      
      backToTop.addEventListener("click", function() {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
      
      window.addEventListener("scroll", toggleVisibility);
      toggleVisibility();
    }
  }

  function init() {
    document.body.insertAdjacentHTML("afterbegin", buildSkipLink());
    document.body.insertAdjacentHTML("afterbegin", buildHeader());
    document.body.insertAdjacentHTML("beforeend", buildFooter());
    ensureAccountAssets();
    initBackToTop();

    var year = document.getElementById("footer-year");
    if (year) year.textContent = String(new Date().getFullYear());


    var toggle = document.querySelector(".nav-toggle");
    var nav = document.getElementById("site-nav");
    if (toggle && nav) {
      toggle.addEventListener("click", function () {
        var open = nav.classList.toggle("open");
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
        toggle.classList.toggle("open", open);
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
