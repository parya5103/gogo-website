/* GoGo Company - central AdSense integration.
   Shared across gogocompany.in informational pages. Loaded by pages that
   contain .ad-slot containers. Games (/arrowout/, /crystalquest/) never
   load this file - ads must not interfere with gameplay or controls.

   ACTIVATION (owner only, after AdSense approval):
   1. Set publisherId to the VERIFIED publisher ID (ca-pub-...).
   2. Fill the slot IDs in CONFIG.slots with real AdSense slot IDs.
   3. Create /ads.txt at the site root with the real publisher ID
      (format in ads.txt.example). Never publish a fake ID.
   4. EEA / UK / Switzerland: ads stay OFF for those regions until a
      Google-certified CMP (e.g. Funding Choices) handles consent.
      Set cmpReady to true only after that integration is verified.

   While publisherId is empty, nothing loads and every .ad-slot stays
   hidden - the site serves zero ad requests. */
(function () {
  "use strict";

  var CONFIG = {
    publisherId: "",   /* real AdSense publisher ID, e.g. "ca-pub-1234567890123456" */
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

  function load() {
    if (!adsAllowed()) return;
    if (document.getElementById("gogo-adsense-lib")) return; /* no duplicate scripts */

    var s = document.createElement("script");
    s.id = "gogo-adsense-lib";
    s.async = true;
    s.crossOrigin = "anonymous";
    s.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=" + CONFIG.publisherId;
    document.head.appendChild(s);

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

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", load);
  } else {
    load();
  }
})();
