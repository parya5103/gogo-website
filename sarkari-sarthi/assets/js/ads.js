/* GoGo Company - central AdSense integration (Sarkari Sarthi copy).
   Loaded by the Sarkari Sarthi portal page (https://gogocompany.in/sarkari-sarthi/).
   Listing page: one unit between the category grid and the job
   listings - never beside job cards, Apply buttons, or within the
   listings grid. Job detail pages: one unit after the article. Games (/arrowout/, /crystalquest/) never load ads.

   STATUS (2026-11-06):
   1. DONE: publisherId set to the owner-verified ID
      ca-pub-2895136878543415.
   2. DONE: the exact AdSense loader tag is included directly in the
      <head> of the portal page and every job detail page. This script
      detects that tag and never injects a second copy. Pages that carry
      the loader tag are also ready for Auto ads (Anchor / Vignette /
      In-page / Multiplex) once those formats are enabled by the owner
      in the AdSense dashboard - Auto ads need no extra page code.
   3. DONE: /ads.txt exists at the gogocompany.in site root with the
      real publisher ID (managed in the gogo-website repository).
   4. DONE (2026-11-03): CONFIG.slots filled with the owner-created
      AdSense units: responsive display 7200569170 on the listing
      page (sarkari-mid), in-article fluid 4574405834 on job detail
      pages (sarkari-detail-bottom).
   5. CONSENT (updated 2026-11-06): browser language and timezone are NOT
      reliable consent or geolocation signals, so this script no longer
      guesses the visitor's region from them. Ads stay OFF for ALL
      visitors while cmpReady is false (fail closed). The owner flips
      cmpReady to true only after a Google-certified CMP is enabled and
      verified in the AdSense account (recommended: the built-in consent
      messaging under AdSense -> Privacy & messaging, or Funding
      Choices). Once that is live, Google's certified CMP handles
      EEA / UK / Switzerland consent using its own reliable signals, and
      ad serving follows that consent state.
   6. A configured publisher id does NOT mean the site is approved for
      serving; approval status must be confirmed in the AdSense dashboard
      by the owner. Manual placements simply do not fill before approval. */
(function () {
  "use strict";

  var CONFIG = {
    publisherId: "ca-pub-2895136878543415",   /* owner-verified AdSense publisher ID (2026-11-03) */
    cmpReady: false,    /* true only after a Google-certified CMP handles consent */
    /* Placement-key -> AdSense unit id map. Set a placement's id to ""
       to disable that single placement without touching page HTML. */
    slots: {
      "sarkari-mid": "7200569170",           /* listing page: between the category grid and job listings */
      "sarkari-detail-bottom": "4574405834" /* job detail pages: in-article fluid unit, after the article */
    },
    /* Per-slot extra <ins> attributes. The in-article fluid unit
       needs data-ad-format and data-ad-layout-key besides the ID. */
    slotAttrs: {
      "sarkari-detail-bottom": {
        "data-ad-format": "fluid",
        "data-ad-layout-key": "-cs-h+4k-la+cg"
      }
    }
  };

  function adsAllowed() {
    if (!CONFIG.publisherId) return false; /* not configured -> nothing serves */
    /* Fail closed: no ad request is made anywhere until the owner has
       verified that a Google-certified CMP is live. Browser language and
       timezone must never be used as a substitute for consent or reliable
       geolocation. After cmpReady is true, EEA/UK/CH consent is enforced
       by Google's certified CMP, not by this script. */
    if (!CONFIG.cmpReady) return false;
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
      var extra = CONFIG.slotAttrs[box.getAttribute("data-ad-slot")];
      if (extra) {
        for (var k in extra) {
          if (Object.prototype.hasOwnProperty.call(extra, k)) ins.setAttribute(k, extra[k]);
        }
      }
      box.removeAttribute("hidden");
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    }
  }

  function load() {
    if (!adsAllowed()) return;
    if (document.getElementById("sarkari-adsense-lib")) return; /* no duplicate scripts */
    if (document.querySelector('script[src*="adsbygoogle.js?client="]')) {
      /* Static AdSense loader already present in the page head - never inject twice. */
      activateSlots();
      return;
    }

    var s = document.createElement("script");
    s.id = "sarkari-adsense-lib";
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
