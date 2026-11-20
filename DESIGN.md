---
version: alpha
name: "GoGo Company"
description: "An India-based digital product portfolio with browser games, practical information and publisher-linked media."
colors:
  primary: "#5b4bdb"
  accent: "#1e40af"
  background: "#f7f8fc"
  surface: "#ffffff"
  text: "#172033"
  muted: "#596579"
  border: "#dce2ec"
  hero-surface: "#101827"
  hero-accent: "#8ce4df"
typography:
  sans:
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif"
  mono:
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace"
rounded:
  DEFAULT: "14px"
  sm: "9px"
  md: "12px"
  lg: "20px"
spacing:
  section-gap: "4rem"
  page-max: "70rem"
components:
  button:
    minHeight: "46px"
    radius: "12px"
  card:
    radius: "20px"
    padding: "24px"
  hero-showcase:
    radius: "26px"
---

# GoGo Company Design System

## Overview

### Creative North Star

GoGo is a **digital launchpad**: part pocket arcade, part practical directory. The homepage should feel like opening a well-made device with several distinct destinations—not a generic SaaS dashboard and not a noisy game portal. Its signature is a dark, finely gridded launch panel that puts five product destinations in one calm, tactile rail.

### Product context and register

- **Audience and primary job:** Mobile-first visitors in India and international visitors who want to launch a browser game, find career/recruitment information, read publisher-linked headlines or consult the independent GTA 6 guide.
- **Target market(s) and evidence:** The repository README describes an India-based digital products organization headquartered in Indore, Madhya Pradesh, and lists the five published product destinations.
- **Locale(s) and language policy:** The public company homepage is English (en-IN); keep copy plain and short, preserve product names, and allow long labels to wrap on narrow screens.
- **Usage scene:** Primarily phone browsers, often in short sessions; desktop visitors should get a wider two-column introduction and a compact product shelf.
- **Register:** Hybrid. The company homepage and About pages are brand/editorial; game portals, account and product tools retain their own task-oriented visual systems.
- **Memorable signature:** The dark launchpad panel with a subtle coordinate grid and five product links.
- **Restraint:** Product descriptions, legal/trust information and the footer stay light, legible and conventional. The launchpad is the one expressive surface.
- **Anti-references:** Avoid generic gradient-only SaaS dashboards, excessive glassmorphism, oversized floating statistics, and game-portal clutter.
- **Token ownership/runtime mapping:** Existing runtime CSS remains canonical. This file mirrors shared `body.theme-gogo` values in `assets/css/style.css`; homepage-only launchpad values are scoped under `body.theme-gogo.page-body[data-page="home"]`. Keep CSS and this document aligned when the approved palette changes.

## Colors

The shared portfolio uses a restrained indigo-blue palette on a cool, near-white canvas. `primary` is the main action color; `accent` is the link/focus role; `text` and `muted` establish reading hierarchy; `border` separates surfaces without heavy shadows. The homepage hero is the expressive exception: `hero-surface` anchors the launchpad and `hero-accent` provides a high-contrast mint signal. Do not carry hero colors into the Sarkari, PikaNews or game product applications. Preserve the global focus outline and verify contrast for every new semantic color.

## Typography

Use the existing system sans stack for predictable loading and broad script coverage. Headings use tight tracking and strong scale contrast; body copy remains regular-weight with generous line-height. Utility labels inside the launchpad use the existing monospace system stack, uppercase only for short metadata—not for paragraphs. Do not load remote fonts solely for decoration.

## Layout

The homepage uses a centered 70rem content width. The hero is a two-column layout on wide screens and becomes one column below 900px; the launchpad follows the headline on mobile. Product cards use a six-column internal grid: two wide game cards first, then three compact information destinations. Below 680px the product shelf becomes one column. Keep the site header sticky, preserve document scrolling, and never constrain the whole page to viewport height. Reserve stable geometry for the hero launchpad and keep touch targets at least 44px high.

## Elevation & Depth

Use a quiet surface hierarchy: pale canvas, white product cards, thin cool borders and restrained shadows. The hero panel uses a deep tonal gradient, a fine coordinate grid and one inset highlight. Avoid blur-heavy glass surfaces and decorative shadows on long-form content. Hover lift is optional and must not be the only cue.

## Shapes

The shared runtime defaults are 14px container radius and 9px small-control radius. Homepage product cards use 20px corners; the hero launchpad uses 26px. Buttons remain 12px rounded rectangles, not pills. Use compact 11–15px icon containers and thin 1px separators.

## Components

### Foundational visual states

Links and buttons retain visible `:focus-visible` outlines. Hover only enhances the state; keyboard and touch access remain equivalent. Reduced-motion preferences disable non-essential transitions. Avoid layout movement on focus or hover.

### Buttons and actions

Primary actions use the indigo shared button treatment on light surfaces. Inside the dark hero, the primary action changes to the mint hero accent with dark text; secondary actions use a transparent outline. Labels name the destination or action directly. Keep controls at least 44px high and allow full-width buttons on small screens.

### Navigation and data display

The shared header remains a compact sticky bar with an accessible menu toggle. The homepage launchpad is a semantic `nav` with five direct links; product cards repeat those destinations with short descriptions. The footer carries company, product and legal links. Same-site links stay in the same tab.

### Forms and overlays

Homepage visual work does not change account, admin, contact or authentication workflows. Those routes retain their existing controls and validation behavior; this design document does not redefine their interaction contracts.

### Iconography

Use simple Unicode/typographic marks only as supplementary decoration. Product names and labels remain visible; icons never carry meaning alone. Avoid adding an icon-font or external icon package for this homepage.

### Motion

Motion is restrained to short hover feedback on pointer-capable devices. No autoplay, scroll-jacking or parallax. Respect `prefers-reduced-motion`.

### Content and data visualization

Write from the visitor's task: play, explore, read, check. Describe Sarkari Sarthi as recruitment information and PikaNews as publisher-linked headlines; do not imply official government affiliation or original news reporting. Keep descriptions factual and avoid fixed update promises.

## Do's and Don'ts

- **Do:** Make all five products discoverable from the hero and product shelf.
- **Do:** Keep the homepage visually distinct while preserving each product's own design system.
- **Don't:** Expose repository links, admin-only destinations or implementation details in public marketing navigation.
- **Don't:** Use unsupported claims, fake live-status indicators or decorative motion that competes with product choices.


## Product family design boundaries

The homepage remains the portfolio's digital launchpad. Each product keeps its own visual voice and existing runtime architecture; the shared polish layer is intentionally additive and route-scoped.

- **Sarkari Sarthi:** high-trust recruitment workspace. Preserve navy/blue/teal trust cues, source-verification labels, clear deadlines, readable job cards and explicit official-source checks.
- **PikaNews:** restrained newsroom/editorial hierarchy. Preserve publisher attribution, category navigation, clear source links and the existing editorial typography.
- **Arrow Out!:** focused puzzle arcade. Polish controls and supporting surfaces only; never obscure, resize or restyle the puzzle board or change game logic.
- **Crystal Quest:** fantasy adventure menu. Polish the home/menu surfaces only; preserve the canvas, board, HUD, save format, levels and gameplay renderer.
- **GTA 6 Guide:** dark Leonida editorial palette. Keep official-source vs third-party reporting distinctions visible and preserve the guide's current information architecture.

### Shared implementation rule

The assets/css/product-polish.css file is a progressive enhancement layer. It must not become a second owner of product tokens, override game-engine geometry, change route behavior, or hide loading/error/empty states. Each product page opts in with a data-gogo-premium body attribute. Existing product styles remain the source of truth.

### Open-source reference use

Use shadcn/ui for composable and accessible interaction patterns, HyperUI for responsive layout ideas, Magic UI for restrained motion inspiration, and Headless UI for accessible interaction behavior. Adapt patterns to the repository's existing vanilla HTML/CSS/JavaScript architecture; do not import a framework solely to copy a visual component.
