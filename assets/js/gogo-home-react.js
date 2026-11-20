import React, { useState } from "https://esm.sh/react@19.1.0";
import { createRoot } from "https://esm.sh/react-dom@19.1.0/client?external=react";

const h = React.createElement;

const products = [
  { id:"arrow", number:"01", type:"ORIGINAL BROWSER GAME", title:"Arrow Out!", description:"Untangle the board, read every path and clear the arrows in the right order. A satisfying logic puzzle built for quick sessions.", href:"./arrowout/", action:"Play the puzzle", symbol:"↗", theme:"arrow", tags:["1,000 levels","Daily challenge"] },
  { id:"crystal", number:"02", type:"FANTASY MATCH-3", title:"Crystal Quest", description:"Match glowing gems, discover powerful combinations and journey through a handcrafted fantasy campaign.", href:"./crystalquest/", action:"Enter the quest", symbol:"✦", theme:"crystal", tags:["27 story levels","Offline-ready"] },
  { id:"sarkari", number:"03", type:"CAREER INFORMATION", title:"Sarkari Sarthi", description:"Explore recruitment notices, admit cards and results with source links and verification details. Always confirm with the original authority.", href:"./sarkari-sarthi/", action:"Explore opportunities", symbol:"⌁", theme:"sarkari", tags:["Source-linked","India focused"] },
  { id:"pika", number:"04", type:"PUBLISHER-LINKED NEWS", title:"PikaNews", description:"Browse headlines across technology, gaming, business and more, then continue to the original publisher for full reporting.", href:"./pikanews/", action:"Read the latest", symbol:"▤", theme:"pika", tags:["Publisher attribution","Topic discovery"] },
  { id:"gta", number:"05", type:"INDEPENDENT GAME GUIDE", title:"GTA 6 Guide", description:"A structured reference for release information, official resources and clearly separated confirmed and unconfirmed details.", href:"./gta6/", action:"Open the guide", symbol:"⌖", theme:"gta", tags:["Official references","Fact-aware"] }
];

function ArrowMark(){return h("span",{className:"gh-mark","aria-hidden":true},h("span",null,"G"),h("i",null));}
function Header(){
 const [open,setOpen]=useState(false);
 const links=[["Products","#products"],["Games","#games"],["Information","#information"],["About","#about-gogo-company"]];
 return h("header",{className:"gh-nav"},h("div",{className:"gh-nav-inner"},
   h("a",{className:"gh-brand",href:"./","aria-label":"GoGo Company home"},h(ArrowMark),h("span",null,"GoGo",h("b",null,"Company"))),
   h("button",{className:"gh-menu-toggle",type:"button","aria-expanded":open,"aria-label":open?"Close navigation":"Open navigation",onClick:()=>setOpen(v=>!v)},h("span"),h("span"),h("span")),
   h("nav",{className:"gh-links"+(open?" is-open":""),"aria-label":"Main navigation"},links.map(([label,href])=>h("a",{key:label,href,onClick:()=>setOpen(false)},label))),
   h("a",{className:"gh-nav-cta",href:"#products"}, "Explore GoGo",h("span",{"aria-hidden":"true"},"↗"))
 ));
}
function ProductCard({p}){
 return h("article",{className:"gh-product gh-"+p.theme},
  h("div",{className:"gh-product-top"},h("span",{className:"gh-product-symbol","aria-hidden":"true"},p.symbol),h("span",{className:"gh-product-number"},p.number)),
  h("p",{className:"gh-eyebrow"},p.type),
  h("h3",null,p.title),
  h("p",{className:"gh-product-copy"},p.description),
  h("div",{className:"gh-tags"},p.tags.map(tag=>h("span",{key:tag},tag))),
  h("a",{className:"gh-product-link",href:p.href},p.action,h("span",{"aria-hidden":"true"},"↗"))
 );
}
function Hero(){
 return h("section",{className:"gh-hero","aria-labelledby":"gh-title"},
  h("div",{className:"gh-hero-glow gh-glow-one","aria-hidden":"true"}),
  h("div",{className:"gh-hero-glow gh-glow-two","aria-hidden":"true"}),
  h("div",{className:"gh-shell gh-hero-grid"},
   h("div",{className:"gh-hero-copy"},
    h("p",{className:"gh-overline"},h("span",null), "INDEPENDENT DIGITAL STUDIO · INDIA"),
    h("h1",{id:"gh-title"},"A little more ",h("em",null,"wonder."),h("br"),"A lot more ",h("strong",null,"possibility.")),
    h("p",{className:"gh-lead"},"Games to get lost in. Tools to move forward. Stories and guides to keep you curious. Discover the growing world of GoGo Company."),
    h("div",{className:"gh-hero-actions"},h("a",{className:"gh-button gh-button-primary",href:"#products"},"Explore our products",h("span",null,"↗")),h("a",{className:"gh-button gh-button-quiet",href:"./about.html"},"Meet GoGo",h("span",null,"→"))),
    h("div",{className:"gh-proofline"},h("span",null,"✳ Built for curious minds"),h("span",null,"·"),h("span",null,"Made for every screen"))
   ),
   h("div",{className:"gh-orbit-scene","aria-label":"Five GoGo products in one connected ecosystem",role:"img"},
    h("div",{className:"gh-orbit-ring gh-ring-a"}),h("div",{className:"gh-orbit-ring gh-ring-b"}),
    h("div",{className:"gh-orbit-core"},h(ArrowMark),h("span",null,"ONE GoGo WORLD")),
    h("div",{className:"gh-orbit-node gh-node-arrow"},h("b",null,"↗"),h("span",null,"PLAY")),
    h("div",{className:"gh-orbit-node gh-node-crystal"},h("b",null,"✦"),h("span",null,"QUEST")),
    h("div",{className:"gh-orbit-node gh-node-sarkari"},h("b",null,"⌁"),h("span",null,"CAREER")),
    h("div",{className:"gh-orbit-node gh-node-pika"},h("b",null,"▤"),h("span",null,"NEWS")),
    h("div",{className:"gh-orbit-node gh-node-gta"},h("b",null,"⌖"),h("span",null,"GUIDE")),
    h("div",{className:"gh-orbit-caption"},h("span",null,"FIVE EXPERIENCES"),h("i",null),h("span",null,"ONE HOME"))
   )
  ),
  h("div",{className:"gh-shell gh-stats"},h("div",null,h("b",null,"05"),h("span",null,"Distinct experiences")),h("div",null,h("b",null,"01"),h("span",null,"Connected ecosystem")),h("div",null,h("b",null,"∞"),h("span",null,"Ways to explore")))
 );
}
function Products(){
 return h("section",{className:"gh-products",id:"products","aria-labelledby":"gh-products-title"},
  h("div",{className:"gh-shell"},
   h("div",{className:"gh-section-head"},h("div",null,h("p",{className:"gh-overline"},"THE GoGo COLLECTION"),h("h2",{id:"gh-products-title"},"Find your next ",h("em",null,"favourite."))),h("p",null,"Five different destinations. One simple place to begin. Pick what feels right today.")),
   h("div",{className:"gh-product-grid",id:"games"},products.map(p=>h(ProductCard,{key:p.id,p})))
  )
 );
}
function Principles(){
 const data=[["01","Thoughtful by design","Clear journeys, useful details and interfaces that stay out of your way."],["02","Made for real screens","Responsive layouts and touch-friendly experiences from phone to desktop."],["03","Honest information","Publisher attribution, source links and clear boundaries between fact and guide."]];
 return h("section",{className:"gh-principles",id:"information"},h("div",{className:"gh-shell"},
  h("div",{className:"gh-principles-head"},h("p",{className:"gh-overline"},"THE GoGo APPROACH"),h("h2",null,"Useful first. ",h("em",null,"Memorable always."))),
  h("div",{className:"gh-principle-grid"},data.map(([n,title,copy])=>h("article",{key:n},h("span",null,n),h("h3",null,title),h("p",null,copy))))
 ));
}
function Closing(){
 return h("section",{className:"gh-closing"},h("div",{className:"gh-shell gh-closing-inner"},h("div",null,h("p",{className:"gh-overline"},"YOUR NEXT CLICK STARTS SOMETHING"),h("h2",null,"Curiosity looks good ",h("em",null,"on you.")),h("p",null,"Choose a game, explore a guide or discover something useful.")),h("a",{className:"gh-button gh-button-light",href:"#products"},"Explore the collection",h("span",null,"↗"))));
}
function App(){
 return h(React.Fragment,null,h(Header),h("main",{id:"main",className:"gh-main"},h(Hero),h(Products),h(Principles),h(Closing)));
}
const root=document.getElementById("gogo-react-root");
if(root){createRoot(root).render(h(App));}
