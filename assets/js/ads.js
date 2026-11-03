/* GoGo Company - central AdSense integration.
   Shared across gogocompany.in informational pages. Loaded by pages that
   contain .ad-slot containers. Games (/arrowout/, /crystalquest/) never
   load this file - ads must not interfere with gameplay or controls.

   STATUS (2026-11-03):
   1. DONE: publisherId set to the owner-verified ID
      ca-pub-2895136878543415.
   2. DONE: the exact AdSense loader tag is included directly in the
      <head> of the informational pages. This script detects that tag
      and never injects a second copy.
   3. DONE: /ads.txt exists at the site root with the real publisher ID.
   4. REMAINING: fill the slot IDs in CONFIG.slots with real AdSense
      slot IDs. Until then every ad unit stays hidden and zero ad
      units are served.
   5. REMAINING (EEA / UK / Switzerland): ad units stay OFF for those
      regions until a Google-certified CMP (e.g. Funding Choices)
      handles consent. Set cmpReady to true only after that
      integration is verified. */
(function () {
  "use strict";

  var CONFIG = {
    publisherId: "ca-pub-2895136878543415",   /* owner-verified AdSense publisher ID (2026-11-03) */
    cmpReady: false,    /* true only after a Google-certified CMP handles consent */
    slots: {
      "home-mid": "",       /* AdSense slot ID for the homepage mid-content unit */
      "about-bottom": ""    /* AdSense slot ID for the about-page bottom unit */
    }
  };

  /* ISO 3166-1 alpha-2 codes for EEA, UK and Switzerland. */
  var CONSENT_REGIONS = ["GB", "IM", "JE", "GG", "AT", "BE", "BG", "HR", "CY", "CZ", "DK",
    "EE", "FI", "FR", "DE", "GR", "HU", "IS", "IE", "IT", "LV", "LI", "LT", "LU", "MT",
    "NL", "NO", "PL", "PT", "RO", "SK", "SI", "ES", "SE", "CH"];

  function regionFromLanguage() {
    var m = (navigator.language || "").match(/[-_]([A-Za-z]{2})$/);
    return m ? m[1].toUpperCase() : "";
  }

  function inConsentRequiredRegion() {
    var r = regionFromLanguage();
    if (r) return CONSENT_REGIONS.indexOf(r) !== -1;
    try {
      return /Europe\/|Atlantic\/(Madeira|Canary)/.test(
        Intl.DateTimeFormat().resolvedOptions().timeZone || ""
      );
    } catch (e) {
      return true; /* cannot tell -> safest default: treat as consent region */
    }
  }

  function adsAllowed() {
    if (!CONFIG.publisherId) return false; /* not configured -> nothing serves */
    if (!CONFIG.cmpReady && inConsentRequiredRegion()) return false;
    return true;
  }

  function activateSlots() {
    var slots = document.querySelectorAll(".ad-slot[hidden]");
    for (var i = 0; i < slots.length; i++) {
      var box = slots[i];
      var slotId = CONFIG.slots[box.getAttribute("data-ad-slot")];
      var ins = box.querySelector("ins.adsbygoogle");
      if (!slotId || !ins) continue;
      ins.setAttribute("data-ad-client", CONFIG.publisherId);
      ins.setAttribute("data-ad-slot", slotId);
      box.removeAttribute("hidden");
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    }
  }

  function load() {
    if (!adsAllowed()) return;
    if (document.getElementById("gogo-adsense-lib")) return; /* no duplicate scripts */
    if (document.querySelector('script[src*="adsbygoogle.js?client="]')) {
      /* Static AdSense loader already present in the page head - never inject twice. */
      activateSlots();
      return;
    }

    var s = document.createElement("script");
    s.id = "gogo-adsense-lib";
    s.async = true;
    s.crossOrigin = "anonymous";
    s.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=" + CONFIG.publisherId;
    document.head.appendChild(s);
    activateSlots();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", load);
  } else {
    load();
  }
})();
