import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

const products = [
  { id:'arrow', name:'Arrow Out!', eyebrow:'LOGIC PUZZLE · BROWSER GAME', desc:'Read the paths, plan each move and clear the board. A minimalist puzzle built for satisfying, focused play.', href:'/arrowout/', tags:['1,000 levels','Offline PWA'], featured:true, tone:'violet', art:'arrows' },
  { id:'sarkari', name:'Sarkari Sarthi', eyebrow:'CAREER INFORMATION · INDIA', desc:'Explore recruitment notices, admit cards and results with source references and verification context.', href:'/sarkari-sarthi/', tags:['Source-linked','India focused'], socialLinks:[{label:'WhatsApp Channel',href:'https://whatsapp.com/channel/0029VbE1ulAAjPXQZiUbbu1Z'},{label:'Telegram',href:'https://t.me/SarkariSarthi'}], featured:true, tone:'blue', art:'career' },
  { id:'crystal', name:'Crystal Quest', eyebrow:'FANTASY MATCH-3 ADVENTURE', desc:'Match glowing gems, discover combinations and travel through a handcrafted fantasy campaign.', href:'/crystalquest/', tags:['27 story levels','3 regions'], tone:'purple', art:'gems' },
  { id:'pika', name:'PikaNews', eyebrow:'PUBLISHER-ATTRIBUTED NEWS', desc:'Discover stories across technology, gaming, business, sports and entertainment, then visit the original publisher.', href:'/pikanews/', tags:['Topic discovery','Publisher links'], socialLinks:[{label:'WhatsApp Channel',href:'https://whatsapp.com/channel/0029Vb5zVwjICVfnQ95zT10F'}], tone:'orange', art:'news' },
  { id:'gta6', name:'GTA 6 Guide', eyebrow:'OPEN-WORLD ACTION · GAME GUIDE', desc:'Explore Vice City and Leonida with an independent guide to launch details, map resources and gameplay updates.', href:'/gta6/', tags:['PS5 & Xbox Series X|S','Guide & updates'], tone:'gta', art:'none' }
];

function Icon({name,size=20}) {
  const paths = {
    arrow:<><path d="M7 17 17 7M7 7h10v10"/></>,
    sun:<><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42"/></>,
    moon:<path d="M20.9 13A9 9 0 0 1 11 3.1 9 9 0 1 0 20.9 13Z"/>,
    user:<><path d="M20 21a8 8 0 0 0-16 0"/><circle cx="12" cy="8" r="4"/></>,
    check:<><path d="m5 12 4 4L19 6"/></>,
    spark:<><path d="m12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-2-5.8L4 11l6-2.2L12 3Z"/></>
  };
  return <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{paths[name] || paths.spark}</svg>;
}
const ThemeContext = createContext(null);
function ThemeProvider({children}) {
  const [theme,setTheme] = useState(() => typeof document !== 'undefined' && document.documentElement.classList.contains('dark') ? 'dark' : 'light');
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.dataset.theme = theme;
    try { localStorage.setItem('gogo-theme', theme); } catch (_) {}
  },[theme]);
  return <ThemeContext.Provider value={{theme,setTheme}}>{children}</ThemeContext.Provider>;
}
function useTheme() { return useContext(ThemeContext); }
function Navbar() {
  const {theme,setTheme} = useTheme();
  const [open,setOpen] = useState(false);
  const menuButtonRef = useRef(null);
  const close = () => setOpen(false);
  useEffect(() => { if (!open) return; const onKey = event => { if (event.key === 'Escape') { setOpen(false); menuButtonRef.current?.focus(); } }; document.addEventListener('keydown', onKey); return () => document.removeEventListener('keydown', onKey); }, [open]);
  return <header className="site-nav">
    <div className="nav-inner">
      <a className="brand" href="/" aria-label="GoGo Company home"><span className="brand-mark">G<span>.</span></span><span>GoGo <b>Company</b></span></a>
      <button ref={menuButtonRef} className="mobile-menu" type="button" aria-expanded={open} aria-controls="primary-nav" onClick={()=>setOpen(!open)} aria-label={open?'Close navigation':'Open navigation'}><span/><span/><span/></button>
      <nav id="primary-nav" className={open?'nav-links is-open':'nav-links'} aria-label="Primary navigation">
        <a href="#products" onClick={close}>Products</a><a href="#today" onClick={close}>Live updates</a><a href="/about/" onClick={close}>About</a><a href="/contact/" onClick={close}>Contact</a>
      </nav>
      <div className="nav-actions">
        <button className="icon-button" type="button" onClick={()=>setTheme(theme==='dark'?'light':'dark')} aria-label={'Switch to '+(theme==='dark'?'light':'dark')+' theme'}><Icon name={theme==='dark'?'sun':'moon'}/></button>
        <button className="account-pill" type="button" data-gogo-open-account="true"><Icon name="user" size={17}/> <span>GoGo Account</span></button>
      </div>
    </div>
  </header>;
}
function ArrowArt(){return <div className="art-board arrows-art" aria-hidden="true"><span>↗</span><span>↘</span><span>↖</span><span>↗</span><span>↙</span><span>↘</span><i/><i/></div>}
function CareerArt(){return <div className="art-board career-art" aria-hidden="true"><div className="paper"><b>CAREER UPDATE</b><i/><i/><i/><span>✓ VERIFIED SOURCE</span></div><div className="orbit-dot"/></div>}
function GemArt(){return <div className="art-board gem-art" aria-hidden="true"><i>✦</i><i>◆</i><i>✧</i><i>◆</i><i>✦</i></div>}
function NewsArt(){return <div className="art-board news-art" aria-hidden="true"><i/><i/><i/><i/><b>LIVE</b></div>}
function ProductTile({item}) {
 const Art = item.art==='arrows'?ArrowArt:item.art==='career'?CareerArt:item.art==='gems'?GemArt:item.art==='none'?null:NewsArt;
 return <article className={'product-tile '+(item.featured?'featured ':'')+'tone-'+item.tone}>
  <div className="tile-copy"><span className="eyebrow">{item.eyebrow}</span><h3>{item.name}</h3><p>{item.desc}</p><div className="tag-row">{item.tags.map(tag=><span key={tag}>{tag}</span>)}</div><a className="text-link" href={item.href}>{item.featured?'Explore':'Discover'} {item.name}<Icon name="arrow" size={16}/></a>{item.socialLinks?.length ? <nav className="tile-social-links" aria-label={item.name+' social channels'}>{item.socialLinks.map(link=><a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer">{link.label}<Icon name="arrow" size={12}/></a>)}</nav> : null}</div>
  {Art ? <Art/> : null}
 </article>;
}
function BentoProductGrid() {
 return <section className="section-shell products-section" id="products" aria-labelledby="products-title">
  <div className="section-heading"><div><span className="eyebrow">THE GoGo ECOSYSTEM</span><h2 id="products-title">Five destinations to <em>explore.</em></h2></div><p>Pick a destination. Each product has its own purpose, experience and support.</p></div>
  <div className="bento-grid">{products.map(item=><ProductTile key={item.id} item={item}/>)}<article className="account-tile"><span className="account-icon"><Icon name="user" size={24}/></span><div><span className="eyebrow">ONE ACCOUNT · YOUR CHOICE</span><h3>GoGo Account &amp; Cloud Save</h3><p>Optional sign-in to sync supported game progress across your devices. Guest play remains available.</p><button type="button" data-gogo-open-account="true" className="text-link">Explore account <Icon name="arrow" size={16}/></button></div></article></div>
 </section>;
}
function HeroSection() {
 return <section className="hero-section"><div className="hero-grid-bg"/><div className="hero-inner section-shell"><div className="hero-copy"><span className="hero-kicker"><i/> INDEPENDENT DIGITAL STUDIO · INDIA</span><h1>Play. Prepare.<br/><em>Grow with GoGo.</em></h1><p>Original games, practical career information and publisher-attributed stories — thoughtfully brought together in one place.</p><div className="hero-ctas"><a className="button button-primary" href="#products">Explore products <Icon name="arrow"/></a><a className="button button-secondary" href="/about/">Meet GoGo Company</a></div><div className="hero-points"><span><Icon name="check" size={16}/> Made for real screens</span><span><Icon name="check" size={16}/> Clear source attribution</span></div><nav className="hero-product-pills" aria-label="Quick product links"><a href="/arrowout/">Arrow Out!</a><a href="/crystalquest/">Crystal Quest</a><a href="/sarkari-sarthi/">Sarkari Sarthi</a><a href="/pikanews/">PikaNews</a><a href="/gta6/">GTA 6</a></nav></div><div className="hero-visual" aria-hidden="true"><div className="visual-orbit orbit-one"/><div className="visual-orbit orbit-two"/><div className="visual-core"><span className="brand-mark">G<span>.</span></span><b>ONE HOME</b><small>FIVE DESTINATIONS</small></div><span className="orbit-chip chip-a">01 · PLAY</span><span className="orbit-chip chip-b">02 · PREPARE</span><span className="orbit-chip chip-c">03 · DISCOVER</span><span className="orbit-chip chip-d">04 · EXPLORE</span></div></div></section>;
}
function safeDate(value) { if(!value) return ''; const date=new Date(value); return Number.isNaN(date.getTime())?'':date.toLocaleDateString('en-IN',{day:'numeric',month:'short',timeZone:'UTC'}); }
function TodayOnGoGo({feeds={}}) {
 const jobs=(feeds.jobs||[]).slice(0,3), news=(feeds.news||[]).slice(0,3), trends=(feeds.trends||[]).slice(0,8);
 return <section className="section-shell live-section" id="today" aria-labelledby="today-title"><div className="section-heading"><div><span className="eyebrow">FRESH FROM THE NETWORK</span><h2 id="today-title">Today on <em>GoGo Company.</em></h2></div><p>Feed snapshots are sourced from their respective portals. {feeds.generatedAt?'Snapshot built '+safeDate(feeds.generatedAt)+'. ':''}Check the original source for full details.</p></div>
  <div className="live-grid"><article className="live-card jobs-card"><div className="live-card-head"><span className="live-icon">S</span><div><b>Sarkari Sarthi</b><small>Recruitment updates</small></div><a href="/sarkari-sarthi/">View all ↗</a></div>{jobs.length?jobs.map(job=><a className="feed-row" key={job.id||job.title} href={job.url} target="_blank" rel="noopener noreferrer"><span><b>{job.title}</b><small><span className="source-badge">{job.source||'Recruitment source'}</span> {job.organization?('· '+job.organization+' '):''} · {job.lastDate?'Last date '+job.lastDate:'Check notice'}</small></span><Icon name="arrow" size={16}/></a>):<p className="empty-feed">Visit Sarkari Sarthi for current recruitment notices.</p>}<p className="feed-disclaimer">Independent information. Verify dates and eligibility in the recruiting authority notice.</p></article>
   <article className="live-card news-card"><div className="live-card-head"><span className="live-icon">P</span><div><b>PikaNews Live</b><small>Publisher-attributed headlines</small></div><a href="/pikanews/">View all ↗</a></div>{news.length?news.map(story=><a className="feed-row" key={story.id||story.title} href={story.url} target="_blank" rel="noopener noreferrer"><span><b>{story.title}</b><small>{story.source||'Original publisher'} · {safeDate(story.published_at)}</small></span><Icon name="arrow" size={16}/></a>):<p className="empty-feed">Visit PikaNews for the latest publisher-linked stories.</p>}<p className="feed-disclaimer">Headlines link to original publishers. PikaNews is an aggregator, not the original newsroom.</p></article></div>
  <div className="trends-strip"><div><span className="eyebrow">TRENDING SEARCHES IN INDIA</span><p>Explore current search topics</p></div><div className="trend-chips">{trends.length?trends.map((trend,i)=><a key={trend.title} href={trend.url||'https://trends.google.com/trending?geo=IN'} target="_blank" rel="noopener noreferrer">{trend.title}</a>):<span className="muted">Live search trends are temporarily unavailable.</span>}</div></div>
 </section>;
}
function WhyGoGo(){const values=[['01','Useful by design','Clear journeys and practical details without unnecessary friction.'],['02','Built for every screen','Responsive, touch-friendly experiences with lightweight interfaces.'],['03','Honest by default','Source references, publisher attribution and transparent product boundaries.']];return <section className="section-shell why-section"><span className="eyebrow">THE GoGo STANDARD</span><h2>Thoughtful experiences.<br/><em>Clear intentions.</em></h2><div className="why-grid">{values.map(([n,t,d])=><article key={n}><b>{n}</b><h3>{t}</h3><p>{d}</p></article>)}</div></section>}
function AboutDisambiguation(){return <section className="section-shell about-section" id="about-gogo-company"><div className="about-card"><span className="eyebrow">ABOUT THE ORGANIZATION</span><h2>Meet <em>GoGo Company.</em></h2><p><strong>GoGo Company</strong> (gogocompany.in) is an independent Indian technology, digital media and web gaming organization founded by Pratik Arya and headquartered in Indore, Madhya Pradesh, India.</p><dl><div><dt>Official identity</dt><dd>Independent digital products organization</dd></div><div><dt>Founder</dt><dd>Pratik Arya</dd></div><div><dt>Headquarters</dt><dd>Indore, Madhya Pradesh, India</dd></div><div><dt>Contact</dt><dd><a href="mailto:officialgogocompany@gmail.com">officialgogocompany@gmail.com</a></dd></div></dl></div><aside className="disambiguation-card"><span className="eyebrow">BRAND DISAMBIGUATION</span><h3>One name. A distinct identity.</h3><p>GoGo Company at gogocompany.in is independent and is not affiliated with Gogo Business Aviation or any other third-party business or trademark using a similar name.</p><a href="/about/">Read the full company profile <Icon name="arrow" size={16}/></a></aside></section>}
function FaqAccordion(){const faq=[['What is gogocompany.in?','It is the official website of GoGo Company, an independent India-based digital products organization headquartered in Indore, Madhya Pradesh.'],['Is GoGo Company an official company in India?','GoGo Company is the independent digital brand and organization represented by this website. This description does not claim statutory incorporation or government affiliation.'],['What products does GoGo Company operate?','GoGo Company operates Sarkari Sarthi, PikaNews, Arrow Out! and Crystal Quest, and publishes an independent GTA 6 reference guide. Their pages are linked on this website.'],['Who founded GoGo Company?','GoGo Company was founded by Pratik Arya.'],['Is Sarkari Sarthi a government website?','No. Sarkari Sarthi is an independent information portal. Always verify recruitment details with the original recruiting authority.'],['Does PikaNews publish original reporting?','PikaNews is a publisher-attributed news aggregator. It links readers to original publishers for full reporting.'],['Can I use the games without an account?','Yes. Guest play is available. GoGo Account and Cloud Save are optional for supported game progress.']];return <section className="section-shell faq-section"><span className="eyebrow">GOOD TO KNOW</span><h2>Frequently asked <em>questions.</em></h2><div className="faq-list">{faq.map(([q,a])=><details key={q}><summary>{q}<span>+</span></summary><p>{a}</p></details>)}</div></section>}
function AdSlot(){return <div className="section-shell ad-reservation"><aside className="ad-slot min-h-[250px]" data-ad-slot="home-mid" aria-label="Advertisement"><span className="ad-label">ADVERTISEMENT</span><ins className="adsbygoogle" style={{display:"block"}} data-ad-format="auto" data-full-width-responsive="true"></ins><div className="ad-placeholder-note">Advertising appears only when publisher approval and consent requirements are satisfied.</div></aside></div>}
function NotificationBanner(){return <aside className="notification-banner section-shell"><div><Icon name="spark"/><span><b>Stay in the loop.</b> Optional GoGo updates are available through your account settings.</span></div><button type="button" data-gogo-open-account="true">Manage preferences <Icon name="arrow" size={16}/></button></aside>}
function Footer(){return <footer className="site-footer"><div className="section-shell footer-main"><div><a className="brand footer-brand" href="/"><span className="brand-mark">G<span>.</span></span><span>GoGo <b>Company</b></span></a><p>Independent digital products, browser games and information experiences from India.</p><small>© {new Date().getFullYear()} GoGo Company. All rights reserved.</small></div><div><b>Explore</b><a href="/arrowout/">Arrow Out!</a><a href="/crystalquest/">Crystal Quest</a><a href="/sarkari-sarthi/">Sarkari Sarthi</a><a href="/pikanews/">PikaNews</a><a href="/gta6/">GTA 6 Guide</a></div><div><b>Company</b><a href="/about/">About</a><a href="/contact/">Contact</a><a href="/account/">GoGo Account</a></div><div><b>Policies</b><a href="/privacy-policy/">Privacy Policy</a><a href="/terms-and-conditions/">Terms &amp; Conditions</a><a href="/disclaimer/">Disclaimer</a></div></div></footer>}
export default function App({initialFeeds={}}) {
 return <ThemeProvider><Navbar/><main id="main"><HeroSection/><BentoProductGrid/><TodayOnGoGo feeds={initialFeeds||{}}/><WhyGoGo/><AdSlot/><AboutDisambiguation/><FaqAccordion/><NotificationBanner/></main><Footer/></ThemeProvider>;
}
