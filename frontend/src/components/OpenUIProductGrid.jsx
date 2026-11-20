import React from 'react';
import { createLibrary, defineComponent, Renderer } from '@openuidev/react-lang';
import { z } from 'zod/v4';

const ProductCard = defineComponent({
  name: 'ProductCard',
  description: 'A GoGo product tile with a title, short description, internal destination and optional featured styling.',
  props: z.object({
    name: z.string(),
    eyebrow: z.string(),
    description: z.string(),
    href: z.string().regex(/^\/[a-z0-9-]+\/$/),
    featured: z.boolean(),
    tone: z.enum(['violet', 'blue', 'purple', 'orange']),
    tags: z.array(z.string()),
  }),
  component: ({ props }) => (
    <article className={'product-tile ' + (props.featured ? 'featured ' : '') + 'tone-' + props.tone}>
      <div className="tile-copy">
        <span className="eyebrow">{props.eyebrow}</span>
        <h3>{props.name}</h3>
        <p>{props.description}</p>
        <div className="tag-row">{props.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
        <a className="text-link" href={props.href}>{props.featured ? 'Explore' : 'Discover'} {props.name}<span aria-hidden="true"> ↗</span></a>
      </div>
      <div className={'art-board ' + ({ violet: 'arrows-art', blue: 'career-art', purple: 'gem-art', orange: 'news-art' }[props.tone])} aria-hidden="true">
        {props.tone === 'violet' ? <><span>↗</span><span>↘</span><span>↖</span><span>↗</span><span>↙</span><span>↘</span></> : null}
        {props.tone === 'blue' ? <div className="paper"><b>CAREER UPDATE</b><i/><i/><i/><span>✓ VERIFIED SOURCE</span></div> : null}
        {props.tone === 'purple' ? <><i>✦</i><i>◆</i><i>✧</i><i>◆</i><i>✦</i></> : null}
        {props.tone === 'orange' ? <><i/><i/><i/><i/><b>LIVE</b></> : null}
      </div>
    </article>
  ),
});

const ProductGrid = defineComponent({
  name: 'ProductGrid',
  description: 'Responsive grid containing GoGo product tiles.',
  props: z.object({ items: z.array(ProductCard.ref) }),
  component: ({ props, renderNode }) => <div className="bento-grid">{renderNode(props.items)}<article className="account-tile"><span className="account-icon" aria-hidden="true">◎</span><div><span className="eyebrow">ONE ACCOUNT · YOUR CHOICE</span><h3>GoGo Account &amp; Cloud Save</h3><p>Optional sign-in to sync supported game progress across your devices. Guest play remains available.</p><button type="button" data-gogo-open-account="true" className="text-link">Explore account <span aria-hidden="true">↗</span></button></div></article></div>,
});

const library = createLibrary({ root: 'ProductGrid', components: [ProductGrid, ProductCard] });

// This is intentionally authored OpenUI Lang, not model-generated content.
// Renderer interactions and navigation run entirely in the browser; no LLM or API key is used.
const response = String.raw`root = ProductGrid([arrow, sarkari, crystal, pika])
arrow = ProductCard("Arrow Out!", "LOGIC PUZZLE · BROWSER GAME", "Read the paths, plan each move and clear the board. A minimalist puzzle built for satisfying, focused play.", "/arrowout/", true, "violet", ["1,000 levels", "Offline PWA"])
sarkari = ProductCard("Sarkari Sarthi", "CAREER INFORMATION · INDIA", "Explore recruitment notices, admit cards and results with source references and verification context.", "/sarkari-sarthi/", true, "blue", ["Source-linked", "India focused"])
crystal = ProductCard("Crystal Quest", "FANTASY MATCH-3 ADVENTURE", "Match glowing gems, discover combinations and travel through a handcrafted fantasy campaign.", "/crystalquest/", false, "purple", ["27 story levels", "3 regions"])
pika = ProductCard("PikaNews", "PUBLISHER-ATTRIBUTED NEWS", "Discover stories across technology, gaming, business, sports and entertainment, then visit the original publisher.", "/pikanews/", false, "orange", ["Topic discovery", "Publisher links"])`;

export default function OpenUIProductGrid() {
  return (
    <section className="section-shell products-section" id="products" aria-labelledby="products-title">
      <div className="section-heading">
        <div><span className="eyebrow">THE GoGo ECOSYSTEM</span><h2 id="products-title">Four ways to <em>move forward.</em></h2></div>
        <p>Pick a destination. Each product has its own purpose, experience and support.</p>
      </div>
      <Renderer library={library} response={response} isStreaming={false} onError={(errors) => { if (errors.length) console.error('OpenUI static product layout error:', errors); }} />
    </section>
  );
}
