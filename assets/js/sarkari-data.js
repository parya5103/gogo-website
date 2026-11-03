/* GoGo Company - Sarkari Sarthi data layer.
   Two data sources:
   1. SARKARI_LISTINGS: hand-curated entries from official government sites
      (ssc.gov.in, rrbapply.gov.in, bpsc.bihar.gov.in, ibps.in, upsc.gov.in ...).
   2. SARKARI_SNAPSHOT: machine-scraped listings from the Sarkari-Sarthi
      project (github.com/parya5103/Sarkari-Sarthi). At runtime, sarkari.js
      also tries to fetch a fresh copy of the manifest (MANIFEST_URL) so the
      page always shows the newest scraped data; SARKARI_SNAPSHOT is the
      offline fallback baked in at build time.

   HOW TO ADD A CURATED LISTING (copy one block, edit fields):
     {
       id: "unique-slug",
       cat: "jobs" | "admit" | "result" | "answer-key" | "syllabus" | "notification",
       title: "Post / exam name",
       dept: "Organisation",
       vac: "123" | null,          // vacancies, null if not applicable
       last: "DD-MM-YYYY" | null,   // last date to apply / event date
       elig: "..." | "See official notification",
       fee: "..." | "See official notification",
       apply: "https://official.apply.url",   // official application portal
       notice: "https://official.notice.url", // official notification / notice board
       updated: "YYYY-MM-DD",
       source: "Source label"
     }
   RULES: never invent vacancies, dates, eligibility or fees. If unsure,
   write "See official notification" and link the official government site.
   Listings go stale - re-verify dates before relying on them. */

var MANIFEST_URL =
  "https://raw.githubusercontent.com/parya5103/Sarkari-Sarthi/main/jobs/job_manifest.json";

var SARKARI_LISTINGS = [
  {
    id: "rrb-ntpc-graduate-2026",
    cat: "jobs",
    title: "RRB NTPC Graduate Level (CEN 05/2026)",
    dept: "Railway Recruitment Board",
    vac: "3,548",
    last: "06-11-2026",
    elig: "Bachelor degree in any discipline. See official notification for post-wise eligibility.",
    fee: "See official notification",
    apply: "https://rrbapply.gov.in/",
    notice: "https://www.rrbcdg.gov.in/",
    updated: "2026-11-03",
    source: "RRB official"
  },
  {
    id: "rrb-ntpc-ug-2026",
    cat: "jobs",
    title: "RRB NTPC Under Graduate (CEN 06/2026)",
    dept: "Railway Recruitment Board",
    vac: "1,688",
    last: "13-11-2026",
    elig: "12th pass or equivalent. See official notification for post-wise eligibility.",
    fee: "See official notification",
    apply: "https://rrbapply.gov.in/",
    notice: "https://www.rrbcdg.gov.in/",
    updated: "2026-11-03",
    source: "RRB official"
  },
  {
    id: "rrb-station-master-2026",
    cat: "jobs",
    title: "RRB Station Master (CEN 08/2026)",
    dept: "Railway Recruitment Board",
    vac: "About 1,215-1,265 (reported figures vary, confirm in notification)",
    last: "25-11-2026",
    elig: "See official notification",
    fee: "See official notification",
    apply: "https://rrbapply.gov.in/",
    notice: "https://www.rrbcdg.gov.in/",
    updated: "2026-11-03",
    source: "RRB official"
  },
  {
    id: "bpsc-tre-4-2026",
    cat: "jobs",
    title: "BPSC TRE 4.0 - Teacher Recruitment Examination",
    dept: "Bihar Public Service Commission",
    vac: "33,320",
    last: "03-11-2026",
    elig: "See official notification for subject-wise eligibility",
    fee: "See official notification",
    apply: "https://onlinebpsc.bihar.gov.in/",
    notice: "https://bpsc.bihar.gov.in/",
    updated: "2026-11-03",
    source: "BPSC official"
  },
  {
    id: "ap-dsc-2026",
    cat: "jobs",
    title: "AP DSC - Teacher Recruitment",
    dept: "School Education Department, Andhra Pradesh",
    vac: "2,721",
    last: null,
    elig: "See official notification",
    fee: "See official notification",
    apply: "https://dse.ap.gov.in/",
    notice: "https://dse.ap.gov.in/",
    updated: "2026-11-03",
    source: "AP School Education"
  },
  {
    id: "ibps-recruitment-2026",
    cat: "jobs",
    title: "IBPS Recruitment - Programming Assistant & Other Posts",
    dept: "Institute of Banking Personnel Selection",
    vac: "3",
    last: "12-11-2026",
    elig: "See official notification",
    fee: "See official notification",
    apply: "https://www.ibps.in/",
    notice: "https://www.ibps.in/",
    updated: "2026-11-03",
    source: "IBPS official"
  },
  {
    id: "india-post-driver-tn-2026",
    cat: "jobs",
    title: "India Post Staff Car Driver - Tamil Nadu",
    dept: "Department of Posts",
    vac: "24",
    last: "30-11-2026",
    elig: "See official notification",
    fee: "See official notification",
    apply: "https://www.indiapost.gov.in/",
    notice: "https://www.indiapost.gov.in/",
    updated: "2026-11-03",
    source: "India Post"
  },
  {
    id: "gsssb-surveyor-2026",
    cat: "jobs",
    title: "GSSSB Surveyor Recruitment",
    dept: "Gujarat Subordinate Service Selection Board",
    vac: "78",
    last: "20-11-2026",
    elig: "See official notification",
    fee: "See official notification",
    apply: "https://gsssb.gujarat.gov.in/",
    notice: "https://gsssb.gujarat.gov.in/",
    updated: "2026-11-03",
    source: "GSSSB official"
  },
  {
    id: "becil-deo-2026",
    cat: "jobs",
    title: "BECIL Data Entry Operator Recruitment",
    dept: "Broadcast Engineering Consultants India Limited",
    vac: "23",
    last: "17-11-2026",
    elig: "See official notification",
    fee: "See official notification",
    apply: "https://www.becil.com/",
    notice: "https://www.becil.com/",
    updated: "2026-11-03",
    source: "BECIL official"
  },
  {
    id: "iisc-security-asst-2026",
    cat: "jobs",
    title: "IISc Junior Security Assistant Recruitment",
    dept: "Indian Institute of Science, Bengaluru",
    vac: "30",
    last: "15-11-2026",
    elig: "See official notification",
    fee: "See official notification",
    apply: "https://iisc.ac.in/",
    notice: "https://iisc.ac.in/",
    updated: "2026-11-03",
    source: "IISc official"
  },
  {
    id: "rites-am-mech-2026",
    cat: "jobs",
    title: "RITES Assistant Manager (Mechanical) Recruitment",
    dept: "RITES Ltd",
    vac: "27",
    last: "20-11-2026",
    elig: "See official notification",
    fee: "See official notification",
    apply: "https://www.rites.com/",
    notice: "https://www.rites.com/",
    updated: "2026-11-03",
    source: "RITES official"
  },
  {
    id: "mhi-consultant-2026",
    cat: "jobs",
    title: "MHI Consultant-II Recruitment",
    dept: "Ministry of Heavy Industries",
    vac: "1",
    last: "17-11-2026",
    elig: "See official notification",
    fee: "See official notification",
    apply: "https://heavyindustries.gov.in/",
    notice: "https://heavyindustries.gov.in/",
    updated: "2026-11-03",
    source: "MHI official"
  },
  {
    id: "npc-training-officer-2026",
    cat: "jobs",
    title: "NPC Training Officer Recruitment",
    dept: "National Productivity Council",
    vac: "1",
    last: "16-11-2026",
    elig: "See official notification",
    fee: "See official notification",
    apply: "https://npcindia.gov.in/",
    notice: "https://npcindia.gov.in/",
    updated: "2026-11-03",
    source: "NPC official"
  },
  {
    id: "ssc-je-admit-2026",
    cat: "admit",
    title: "SSC JE 2026 - Exam City Intimation & Admission Certificate",
    dept: "Staff Selection Commission",
    vac: null,
    last: null,
    elig: "For candidates appearing in Paper-I (CBT)",
    fee: null,
    apply: "https://ssc.gov.in/",
    notice: "https://ssc.gov.in/",
    updated: "2026-10-23",
    source: "SSC notice board"
  },
  {
    id: "ssc-gd-pet-pst-2026",
    cat: "admit",
    title: "SSC GD Constable 2026 - PET/PST Shortlisting",
    dept: "Staff Selection Commission",
    vac: null,
    last: null,
    elig: "Candidates shortlisted from CBE for PET/PST",
    fee: null,
    apply: "https://ssc.gov.in/",
    notice: "https://ssc.gov.in/",
    updated: "2026-10-23",
    source: "SSC notice board"
  },
  {
    id: "ssc-si-paper2-result-2025",
    cat: "result",
    title: "SSC SI Delhi Police & CAPF 2025 - Paper-II Shortlist Result",
    dept: "Staff Selection Commission",
    vac: null,
    last: null,
    elig: "Candidates shortlisted from PET/PST for Paper-II",
    fee: null,
    apply: "https://ssc.gov.in/",
    notice: "https://ssc.gov.in/",
    updated: "2026-10-29",
    source: "SSC notice board"
  },
  {
    id: "ssc-phase14-answer-key-2026",
    cat: "answer-key",
    title: "SSC Selection Posts Phase-XIV/2026 - Tentative Answer Key",
    dept: "Staff Selection Commission",
    vac: null,
    last: null,
    elig: "Response sheets and challenge window for candidates",
    fee: null,
    apply: "https://ssc.gov.in/",
    notice: "https://ssc.gov.in/",
    updated: "2026-10-09",
    source: "SSC notice board"
  },
  {
    id: "rrb-ntpc-syllabus-2026",
    cat: "syllabus",
    title: "RRB NTPC CEN 05/2026 & 06/2026 - Official Syllabus",
    dept: "Railway Recruitment Board",
    vac: null,
    last: null,
    elig: "Applicants of NTPC Graduate and UG level exams",
    fee: null,
    apply: "https://www.rrbcdg.gov.in/",
    notice: "https://www.rrbcdg.gov.in/",
    updated: "2026-11-03",
    source: "RRB official"
  },
  {
    id: "ssc-je-syllabus-2026",
    cat: "syllabus",
    title: "SSC JE 2026 - Paper-I & Paper-II Syllabus",
    dept: "Staff Selection Commission",
    vac: null,
    last: null,
    elig: "Junior Engineer examination candidates",
    fee: null,
    apply: "https://ssc.gov.in/",
    notice: "https://ssc.gov.in/",
    updated: "2026-11-03",
    source: "SSC official"
  },
  {
    id: "ssc-revised-dates-2026",
    cat: "notification",
    title: "SSC Revised Exam Dates - JE 2026 & SI Delhi Police/CAPF 2026",
    dept: "Staff Selection Commission",
    vac: null,
    last: null,
    elig: "All affected candidates",
    fee: null,
    apply: "https://ssc.gov.in/",
    notice: "https://ssc.gov.in/",
    updated: "2026-10-26",
    source: "SSC notice board"
  },
  {
    id: "upsc-ese-2026",
    cat: "notification",
    title: "UPSC ESE 2026 - Engineering Services Examination (480 Posts)",
    dept: "Union Public Service Commission",
    vac: "480",
    last: null,
    elig: "See official notification",
    fee: "Rs 25 (women, SC, ST and PwBD candidates exempt)",
    apply: "https://upsconline.nic.in/",
    notice: "https://upsc.gov.in/",
    updated: "2026-10-06",
    source: "UPSC official (applications closed)"
  }
];

/* Machine-scraped fallback snapshot (Sarkari-Sarthi scraper, 2026-11-03).
   Fields: t = title, u = url, l = last date (or null), f = date found. */
var SARKARI_SNAPSHOT =[{"t":"Mulugu District Recruitment 2026 - Apply Offline for 07 Pharmacist, Yoga Professional and Other Posts","u":"https://allgovernmentjobs.in/mulugu-district-recruitment-2026-apply-offline-for-07-pharmacist-yoga-professional-and-other-posts/44950","l":null,"f":"31-10-2026"},{"t":"IIT Kharagpur Notification 2026 - Apply Online for Project Assistant Posts","u":"https://allgovernmentjobs.in/iit-kharagpur-notification-2026-apply-online-for-project-assistant-posts/45014","l":null,"f":"31-10-2026"},{"t":"IGDTUW Notification 2026 - Apply Online for Project Research Scientist I Posts","u":"https://allgovernmentjobs.in/igdtuw-notification-2026-apply-online-for-project-research-scientist-i-posts/44930","l":null,"f":"31-10-2026"},{"t":"BMRCL Recruitment 2026 - Apply Online for General Manager Posts","u":"https://allgovernmentjobs.in/bmrcl-recruitment-2026-apply-online-for-general-manager-posts/45057","l":"15-11-2026","f":"31-10-2026"},{"t":"NIT Delhi Notification 2026 - Walk-in-Interview for 02 Project Associate and Research Associate Posts","u":"https://allgovernmentjobs.in/nit-delhi-notification-2026-walk-in-interview-for-02-project-associate-and-research-associate-posts/44862","l":null,"f":"30-10-2026"},{"t":"NHM Chandigarh Notification 2026 - Walk-in-Interview for Various Consultant Posts","u":"https://allgovernmentjobs.in/nhm-chandigarh-notification-2026-walk-in-interview-for-various-consultant-posts/44865","l":null,"f":"30-10-2026"},{"t":"ESIC Notification 2026 - Walk-in-Interview 04 Senior Resident Posts","u":"https://allgovernmentjobs.in/esic-notification-2026-walk-in-interview-04-senior-resident-posts/44886","l":null,"f":"30-10-2026"},{"t":"DIAT Recruitment 2026 - Walk-in-Interview for Various Research Associate Posts","u":"https://allgovernmentjobs.in/diat-recruitment-2026-walk-in-interview-for-various-research-associate-posts/44904","l":null,"f":"30-10-2026"},{"t":"CSIR NCL Recruitment 2026 - Apply Online for Various Project Associate I Posts","u":"https://allgovernmentjobs.in/csir-ncl-recruitment-2026-apply-online-for-various-project-associate-i-posts/44846","l":null,"f":"30-10-2026"},{"t":"ACTREC Recruitment 2026 - Walk-in-Interview for Various Scientific Officer Posts","u":"https://allgovernmentjobs.in/actrec-recruitment-2026-walk-in-interview-for-various-scientific-officer-posts/44931","l":null,"f":"30-10-2026"},{"t":"UCO Bank Recruitment 2026 - Apply Online for 530 Apprentice Posts","u":"https://allgovernmentjobs.in/uco-bank-recruitment-2026-apply-online-for-530-apprentice-posts/44943","l":null,"f":"29-10-2026"},{"t":"PGIMER Notification 2026 - Walk-in-Interview for Various Project Research Scientist I Posts","u":"https://allgovernmentjobs.in/pgimer-notification-2026-walk-in-interview-for-various-project-research-scientist-i-posts/44944","l":null,"f":"29-10-2026"},{"t":"NFSU Notification 2026 - Apply Online for Junior Research Fellow Posts","u":"https://allgovernmentjobs.in/nfsu-notification-2026-apply-online-for-junior-research-fellow-posts/44952","l":null,"f":"29-10-2026"},{"t":"AIIMS Mangalagiri Notification 2026 - Apply Online for 02 Tutor/ Demonstrator Posts","u":"https://allgovernmentjobs.in/aiims-mangalagiri-notification-2026-apply-online-for-02-tutor-demonstrator-posts/45036","l":"21-11-2026","f":"29-10-2026"},{"t":"ACTREC Recruitment 2026 - Walk-in-Interview for Various Staff Nurse Posts","u":"https://allgovernmentjobs.in/actrec-recruitment-2026-walk-in-interview-for-various-staff-nurse-posts/44860","l":null,"f":"29-10-2026"},{"t":"PGIMER Notification 2026 - Apply Online for 02 Project Research Scientist I and Project Technical Support II Posts","u":"https://allgovernmentjobs.in/pgimer-notification-2026-apply-online-for-02-project-research-scientist-i-and-project-technical-support-ii-posts/44869","l":null,"f":"28-10-2026"},{"t":"PAU Notification 2026 - Apply Offline for Tractor Operator Posts","u":"https://allgovernmentjobs.in/pau-notification-2026-apply-offline-for-tractor-operator-posts/44867","l":null,"f":"28-10-2026"},{"t":"NHSRC Notification 2026 - Apply Online for Consultant posts","u":"https://allgovernmentjobs.in/nhsrc-notification-2026-apply-online-for-consultant-posts/45031","l":"11-11-2026","f":"28-10-2026"},{"t":"NHSRC Notification 2026 - Apply Online for Consultant Posts","u":"https://allgovernmentjobs.in/nhsrc-notification-2026-apply-online-for-consultant-posts/44969","l":"11-11-2026","f":"28-10-2026"},{"t":"AIIMS Recruitment 2026 - Apply Online for Senior Consultant Posts","u":"https://allgovernmentjobs.in/aiims-recruitment-2026-apply-online-for-senior-consultant-posts/44949","l":null,"f":"28-10-2026"},{"t":"ECHS Notification 2026 - Apply Offline for 36 Medical Officer, Dental Officer, Nursing Assistant and Other Posts","u":"https://allgovernmentjobs.in/echs-notification-2026-apply-offline-for-36-medical-officer-dental-officer-nursing-assistant-and-other-posts/45055","l":"27-11-2026","f":"27-11-2026"},{"t":"Deendayal Port Trust Notification 2026 - Apply Online for Deputy Chief Engineer Posts","u":"https://allgovernmentjobs.in/deendayal-port-trust-notification-2026-apply-online-for-deputy-chief-engineer-posts/44995","l":null,"f":"27-11-2026"},{"t":"RRB Recruitment 2026 - Apply Online for 1215 Station Master Posts","u":"https://allgovernmentjobs.in/rrb-recruitment-2026-apply-online-for-1215-station-master-posts/44986","l":"25-11-2026","f":"27-10-2026"},{"t":"IIT Kharagpur Notification 2026 - Apply Online for Various Project Assistant Posts","u":"https://allgovernmentjobs.in/iit-kharagpur-notification-2026-apply-online-for-various-project-assistant-posts/44863","l":null,"f":"26-10-2026"},{"t":"IIT Indore Recruitment 2026 - Apply Offline for Various Junior Research Fellow Posts","u":"https://allgovernmentjobs.in/iit-indore-recruitment-2026-apply-offline-for-various-junior-research-fellow-posts/44885","l":null,"f":"26-10-2026"},{"t":"RGNAU Notification 2026 - Apply Online for 10 Professional Trainee Posts","u":"https://allgovernmentjobs.in/rgnau-notification-2026-apply-online-for-10-professional-trainee-posts/44903","l":"06-12-2026","f":"24-10-2026"},{"t":"CMD Kerala Notification 2026 - Apply Online for 02 Public Relations Officer and Executive Engineer Posts","u":"https://allgovernmentjobs.in/cmd-kerala-notification-2026-apply-online-for-02-public-relations-officer-and-executive-engineer-posts/44947","l":"06-11-2026","f":"24-10-2026"},{"t":"ICAR NBPGR Notification 2026 - Apply for Various Young Professional II Posts","u":"https://allgovernmentjobs.in/icar-nbpgr-notification-2026-apply-for-various-young-professional-ii-posts/45056","l":null,"f":"23-11-2026"},{"t":"IARI Recruitment 2026 - Apply Online for Various Junior Research Fellow Posts","u":"https://allgovernmentjobs.in/iari-recruitment-2026-apply-online-for-various-junior-research-fellow-posts/44991","l":null,"f":"23-11-2026"},{"t":"DLL Notification 2026 - Apply Offline for Various Technician Posts","u":"https://allgovernmentjobs.in/dll-notification-2026-apply-offline-for-various-technician-posts/44972","l":"23-11-2026","f":"23-11-2026"},{"t":"IIT Kanpur Notification 2026 - Apply for Various Project Associate I Posts","u":"https://allgovernmentjobs.in/iit-kanpur-notification-2026-apply-for-various-project-associate-i-posts/44845","l":null,"f":"23-10-2026"},{"t":"IIT Jodhpur Notification 2026 - Apply Online for 02 Field Engineer Posts","u":"https://allgovernmentjobs.in/iit-jodhpur-notification-2026-apply-online-for-02-field-engineer-posts/44851","l":null,"f":"23-10-2026"},{"t":"THSTI Notification 2026 - Walk-in-Interview for 02 Research Associate I and Project Associate I, II Posts","u":"https://allgovernmentjobs.in/thsti-notification-2026-walk-in-interview-for-02-research-associate-i-and-project-associate-i-ii-posts/44852","l":null,"f":"22-10-2026"},{"t":"IIT Kharagpur Notification 2026 - Apply Online for Various Research Associate Posts","u":"https://allgovernmentjobs.in/iit-kharagpur-notification-2026-apply-online-for-various-research-associate-posts/44847","l":null,"f":"22-10-2026"},{"t":"SAIL Notification 2026 - Walk-in-Interview for General Duty Medical Officer Posts","u":"https://allgovernmentjobs.in/sail-notification-2026-walk-in-interview-for-general-duty-medical-officer-posts/45016","l":null,"f":"20-11-2026"},{"t":"RITES Notification 2026 - Apply Online for 27 Assistant Manager Posts","u":"https://allgovernmentjobs.in/rites-notification-2026-apply-online-for-27-assistant-manager-posts/45015","l":null,"f":"20-11-2026"},{"t":"ONGC Recruitment 2026 - Apply Online for 3047 Apprentice Posts","u":"https://allgovernmentjobs.in/ongc-recruitment-2026-apply-online-for-3047-apprentice-posts/45034","l":null,"f":"20-11-2026"},{"t":"NMPA Notification 2026 - Apply Offline for Various Assistant Manager Posts","u":"https://allgovernmentjobs.in/nmpa-notification-2026-apply-offline-for-various-assistant-manager-posts/44971","l":null,"f":"20-11-2026"},{"t":"DLSA Palamau Notification 2026 - Apply Offline for Various Driver Posts","u":"https://allgovernmentjobs.in/dlsa-palamau-notification-2026-apply-offline-for-various-driver-posts/44881","l":null,"f":"20-11-2026"},{"t":"AIIMS Bhopal Recruitment 2026 - Walk-in-Interview for 07 Office Helper, Project Technical Support and Other Posts","u":"https://allgovernmentjobs.in/aiims-bhopal-recruitment-2026-walk-in-interview-for-07-office-helper-project-technical-support-and-other-posts/45009","l":null,"f":"19-11-2026"},{"t":"BOB Recruitment 2026 - Apply Online for 11 Senior Manager Manager and Chief Manager Posts","u":"https://allgovernmentjobs.in/bob-recruitment-2026-apply-online-for-11-senior-manager-and-manager-posts/44987","l":"17-11-2026","f":"17-11-2026"},{"t":"NIT Raipur Notification 2026 - Apply Online for Junior Research Fellow/ Staff Nurse Posts","u":"https://allgovernmentjobs.in/nit-raipur-notification-2026-apply-online-for-junior-research-fellow-staff-nurse-posts/44988","l":null,"f":"16-11-2026"},{"t":"JIPMER Notification 2026 - Apply Online for 09 Senior Resident Posts","u":"https://allgovernmentjobs.in/jipmer-notification-2026-apply-online-for-09-senior-resident-posts/45063","l":null,"f":"16-11-2026"},{"t":"CURAJ Recruitment 2026 - Apply Online for 03 Project Coordinator and Project Assistant and Office Assistant Posts","u":"https://allgovernmentjobs.in/curaj-recruitment-2026-apply-online-for-03-project-coordinator-and-project-assistant-and-office-assistant-posts/45012","l":null,"f":"15-11-2026"},{"t":"RailTel Notification 2026 - Apply Offline for 03 Consultant Engineer Posts","u":"https://allgovernmentjobs.in/railtel-notification-2026-apply-offline-for-03-consultant-engineer-posts/44926","l":null,"f":"13-11-2026"},{"t":"NIMHANS Notification 2026 - Walk-in-Interview for Various Junior Research Fellow Posts","u":"https://allgovernmentjobs.in/nimhans-notification-2026-walk-in-interview-for-various-junior-research-fellow-posts/44994","l":null,"f":"13-11-2026"},{"t":"NIBMG Notification 2026 - Apply for Various Research Associate I Posts","u":"https://allgovernmentjobs.in/nibmg-notification-2026-apply-for-various-research-associate-i-posts/44967","l":null,"f":"12-11-2026"},{"t":"AIIMS Mangalagiri Notification 2026 - Walk-in-Interview for Various Physiotherapist Posts","u":"https://allgovernmentjobs.in/aiims-mangalagiri-notification-2026-walk-in-interview-for-various-physiotherapist-posts/44929","l":null,"f":"12-11-2026"},{"t":"ACTREC Notification 2026 - Walk-in-Interview for 04 Health Worker Posts","u":"https://allgovernmentjobs.in/actrec-notification-2026-walk-in-interview-for-04-health-worker-posts/44966","l":null,"f":"12-11-2026"},{"t":"PGIMER Notification 2026 - Apply Online for Various Project Nurse III Posts","u":"https://allgovernmentjobs.in/pgimer-notification-2026-apply-online-for-various-project-nurse-iii-posts/45060","l":null,"f":"11-11-2026"},{"t":"PGIMER Notification 2026 - Apply Online for Various Project Nurse II Posts","u":"https://allgovernmentjobs.in/pgimer-notification-2026-apply-online-for-various-project-nurse-ii-posts/45013","l":"11-11-2026","f":"11-11-2026"},{"t":"IIIT Delhi Notification 2026 - Apply Online for Various Project Engineer and Estate Officer Posts","u":"https://allgovernmentjobs.in/iiit-delhi-notification-2026-apply-online-for-various-project-engineer-and-estate-officer-posts/44861","l":null,"f":"11-11-2026"},{"t":"AIIMS Delhi Notification 2026 - Apply Online for Various Project Research Scientist III Posts","u":"https://allgovernmentjobs.in/aiims-delhi-notification-2026-apply-online-for-various-project-research-scientist-iii-posts/44993","l":null,"f":"11-11-2026"},{"t":"TISS Notification 2026 - Apply for 03 Cleaner Cum Hostel Attendant MTS Posts","u":"https://allgovernmentjobs.in/tiss-notification-2026-apply-for-03-cleaner-cum-hostel-attendant-mts-posts/44905","l":null,"f":"10-11-2026"},{"t":"SCTIMST Recruitment 2026 - Walk-in-Interview for Senior Project Engineer Posts","u":"https://allgovernmentjobs.in/sctimst-recruitment-2026-walk-in-interview-for-senior-project-engineer-posts/44992","l":null,"f":"10-11-2026"},{"t":"IIT Kharagpur Notification 2026 - Apply Online for Various Project Assistant Posts","u":"https://allgovernmentjobs.in/iit-kharagpur-notification-2026-apply-online-for-various-project-assistant-posts/44945","l":null,"f":"10-11-2026"},{"t":"ECHS Notification 2026 - Apply Offline for 03 Dental Officer, Dental Technical/ Assistant/ Hygienist and Lab Technician Posts","u":"https://allgovernmentjobs.in/echs-notification-2026-apply-offline-for-03-dental-officer-dental-technical-assistant-hygienist-and-lab-technician-posts/45010","l":null,"f":"10-11-2026"},{"t":"CSIR NCL Notification 2026 - Apply Online for Various Project Associate I Posts","u":"https://allgovernmentjobs.in/csir-ncl-notification-2026-apply-online-for-various-project-associate-i-posts/45054","l":null,"f":"10-11-2026"},{"t":"AIIMS Jodhpur Notification 2026 - Walk-in-Interview for Various Project Staff Nurse Posts","u":"https://allgovernmentjobs.in/aiims-jodhpur-notification-2026-walk-in-interview-for-various-project-staff-nurse-posts/45059","l":null,"f":"10-11-2026"},{"t":"AIIMS Delhi Notification 2026 - Apply Online for Project Technical Support III Posts","u":"https://allgovernmentjobs.in/aiims-delhi-notification-2026-apply-online-for-project-technical-support-iii-posts/44973","l":null,"f":"10-11-2026"}]
;
