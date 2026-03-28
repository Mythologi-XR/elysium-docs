---
title: Publishing & Feature Flags
draft: true
---

# Publishing & Feature Flags — Guide

**Feature flag system for publishing and unpublishing documentation pillars and sections at your discretion.**

> **KEY RELATED DOCUMENTS**
> - **[docFlags.js](docFlags.js)** — Master flag configuration for pillars and individual pages
> - **[sidebars.js](../../sidebars.js)** — Sidebar generation with flag-driven filtering
> - **[docusaurus.config.js](../../docusaurus.config.js)** — Navbar and customFields flag injection
> - **[FeatureFlag Component](../../src/components/FeatureFlag/index.tsx)** — React component for inline section toggling

<br>

---
> **Latest Change:** Initial guide — documents the three-layer feature flag system for ELYSIUM docs

  **v1.0.0** | *Created: 2026-03-28 — [see changelog](#changelog)*

---

## Table of Contents

- [Overview](#overview)
- [Target Repos](#target-repos)
- [Design Decisions](#design-decisions)
- [Architecture](#architecture)
  - [Flag Config Layer](#flag-config-layer)
  - [Sidebar Filter Layer](#sidebar-filter-layer)
  - [Inline Component Layer](#inline-component-layer)
- [Component Layout](#component-layout)
- [Implementation Plan](#implementation-plan)
  - [Publishing or Unpublishing a Pillar](#publishing-or-unpublishing-a-pillar)
  - [Publishing or Unpublishing Individual Pages](#publishing-or-unpublishing-individual-pages)
  - [Conditionally Showing Sections Within a Page](#conditionally-showing-sections-within-a-page)
  - [Adding a New Pillar](#adding-a-new-pillar)
- [Critical Files Reference](#critical-files-reference)
- [Implementation Sequence](#implementation-sequence)
- [Testing Strategy](#testing-strategy)
- [Success Metrics](#success-metrics)
- [Documentation Pillars](#documentation-pillars)
- [Changelog](#changelog)

---

## Overview

The ELYSIUM documentation site uses a feature flag system to control which content is visible to the public. This allows pillars (entire documentation sections) and individual pages to be toggled on or off without removing content from the repository.

The system operates across three layers:

| Layer | File | Purpose |
|-------|------|---------|
| **Flag config** | `docs/publishing/docFlags.js` | Master toggle for pillars and individual pages |
| **Sidebar filter** | `sidebars.js` | Reads flags, hides unpublished pillars from navigation |
| **Inline component** | `src/components/FeatureFlag/index.tsx` | Conditionally renders sections within any MDX page |

### What happens when a pillar is unpublished

- Its sidebar category is **removed** from navigation
- Its navbar dropdown entry is **removed**
- The pillar's index page has `draft: true` in frontmatter, so it is **excluded from production builds**
- In local development (`npm start`), **all content is still accessible** regardless of flags — this lets you work on unpublished content

---

## Target Repos

| Repo | Role | Scope |
|------|------|-------|
| `elysium-docs` | Documentation site | All feature flag files, sidebar config, Docusaurus config |

---

## Design Decisions

| # | Decision | Rationale |
|---|----------|-----------|
| 1 | Single `docFlags.js` config file | One place to toggle all visibility — no scattered frontmatter edits |
| 2 | Sidebar filtering via `sidebars.js` | Docusaurus natively supports conditional sidebar items; no custom plugin needed |
| 3 | `draft: true` on unpublished pillar index pages | Docusaurus excludes draft pages from production builds, preventing direct URL access |
| 4 | `FeatureFlag` React component for inline sections | Allows granular control within published pages without splitting content into separate files |
| 5 | Flags injected into `customFields` | Makes flags available client-side via `useDocusaurusContext()` for the React component |
| 6 | Dev mode shows all content | Lets authors work on unpublished content locally without toggling flags |

---

## Architecture

### Flag Config Layer

The `docs/publishing/docFlags.js` file exports two objects:

- **`pillars`** — Boolean flags keyed by pillar directory name. Controls entire sidebar sections.
- **`pages`** — Optional page-level overrides keyed by relative doc path (without `.md`). Overrides the pillar-level flag for individual documents.

Both are consumed at build time by `sidebars.js` and `docusaurus.config.js`.

### Sidebar Filter Layer

`sidebars.js` uses a `pillarCategory()` helper function that:

1. Checks the pillar's flag in `docFlags.pillars`
2. Returns `null` if the flag is `false` (unpublished)
3. Returns the full sidebar category config if `true` (published)
4. The final sidebar array calls `.filter(Boolean)` to strip nulls

### Inline Component Layer

The `<FeatureFlag>` React component reads flags from `siteConfig.customFields.featureFlags` (injected by `docusaurus.config.js`) and conditionally renders its children.

**Props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `name` | `string` | Yes | Flag key — matches a key in `docFlags.js` pillars |
| `children` | `ReactNode` | Yes | Content shown when flag is enabled |
| `fallback` | `ReactNode` | No | Content shown when flag is disabled (default: nothing) |

---

## Component Layout

```
elysium-docs/
├── docs/
│   ├── publishing/
│   │   ├── docFlags.js          # Master flag configuration
│   │   └── PUBLISHING.md        # This file
│   ├── elysium-play/            # Pillar 1
│   ├── creation-app/            # Pillar 2
│   ├── portal/                  # Pillar 3
│   ├── geist-engine/            # Pillar 4
│   ├── elysium-x/               # Pillar 5
│   ├── wallet/                  # Pillar 6
│   ├── analytics/               # Pillar 7
│   ├── depin-network/           # Pillar 8
│   ├── reality-bridge/          # Pillar 9
│   ├── alpha-lab/               # Pillar 10
│   └── reference/               # Reference docs
├── src/
│   └── components/
│       └── FeatureFlag/
│           └── index.tsx         # Inline flag component
├── sidebars.js                   # Reads docFlags, filters sidebar
└── docusaurus.config.js          # Reads docFlags, injects into navbar + customFields
```

---

## Implementation Plan

### Publishing or Unpublishing a Pillar

Edit `docs/publishing/docFlags.js` and set the pillar flag to `true` (published) or `false` (hidden):

```js
const pillars = {
  'elysium-play':     false,   // hidden from sidebar
  'creation-app':     false,
  'portal':           false,
  'geist-engine':     false,
  'elysium-x':        false,
  'wallet':           false,
  'analytics':        false,
  'depin-network':    false,
  'reality-bridge':   false,
  'alpha-lab':        true,    // visible in sidebar
  'reference':        true,
};
```

After changing a flag:

1. **Local dev** (`npm start`) — restart the dev server to pick up changes
2. **Production** (`npm run build`) — rebuild and deploy; unpublished pillars are excluded from navigation

### Publishing or Unpublishing Individual Pages

Use the `pages` object in `docs/publishing/docFlags.js` for page-level overrides:

```js
const pages = {
  // Publish a specific page even if its pillar is unpublished
  'portal/dashboard': true,

  // Hide a specific page even if its pillar is published
  'alpha-lab/card-designer/tips-and-troubleshooting': false,
};
```

Page keys are paths relative to `docs/` without the `.md` extension.

### Conditionally Showing Sections Within a Page

Use the `<FeatureFlag>` component in any `.mdx` file:

```mdx
import FeatureFlag from '@site/src/components/FeatureFlag';

<FeatureFlag name="elysium-x">
  This content only appears when the `elysium-x` flag is enabled.
</FeatureFlag>

<FeatureFlag name="wallet" fallback={<p>Coming soon.</p>}>
  Detailed wallet documentation here.
</FeatureFlag>
```

### Adding a New Pillar

1. Create a directory under `docs/` (e.g., `docs/new-pillar/`)
2. Add an `index.md` with frontmatter (include `draft: true` if starting unpublished)
3. Add a `_category_.json` with label, position, and slug
4. Add a flag entry in `docs/publishing/docFlags.js` under `pillars`
5. Add a `pillarCategory()` call in `sidebars.js`
6. Optionally add a navbar entry in `docusaurus.config.js` using `navItemIf()`

---

## Critical Files Reference

| File | Action | Purpose |
|------|--------|---------|
| `docs/publishing/docFlags.js` | Edit | Toggle pillar and page visibility |
| `sidebars.js` | Edit (when adding pillars) | Add `pillarCategory()` calls for new pillars |
| `docusaurus.config.js` | Edit (when adding pillars) | Add `navItemIf()` calls for navbar entries |
| `src/components/FeatureFlag/index.tsx` | Use in MDX | Import and wrap conditional content |
| `docs/[pillar]/index.md` | Create | Pillar landing page with `draft: true` if unpublished |
| `docs/[pillar]/_category_.json` | Create | Sidebar label, position, and slug for the pillar |

---

## Implementation Sequence

| Step | Deliverable | Dependencies | Scope |
|------|-------------|--------------|-------|
| 1 | Create pillar directory and `index.md` | None | New directory + file |
| 2 | Create `_category_.json` | Step 1 | New file |
| 3 | Add flag to `docFlags.js` | Step 1 | One-line edit |
| 4 | Add `pillarCategory()` to `sidebars.js` | Step 3 | One-line edit |
| 5 | Add `navItemIf()` to `docusaurus.config.js` (optional) | Step 3 | One-line edit |
| 6 | Rebuild and verify | Steps 1-5 | `npm run build` |

---

## Testing Strategy

1. **Toggle a flag off** — verify the pillar disappears from the sidebar and navbar in a production build (`npm run build && npm run serve`)
2. **Toggle a flag on** — verify the pillar appears in the sidebar and navbar, and all pages are accessible
3. **Dev mode visibility** — run `npm start` and confirm all content (including unpublished) is accessible for authoring
4. **Page-level override** — add a page override in `docFlags.js`, rebuild, and verify only that page is affected
5. **Inline `<FeatureFlag>`** — add the component to an MDX page, toggle the flag, and verify content appears/disappears
6. **Broken link check** — after toggling, run `npm run build` and confirm no broken link errors

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Pillar toggle latency | Flag change + rebuild in < 30 seconds |
| Zero broken links | `npm run build` exits with no broken link errors |
| Dev mode completeness | All 10 pillars visible in `npm start` regardless of flags |
| Production exclusion | Unpublished pillars have zero pages in `build/` output |

---

## Documentation Pillars

| # | Pillar | Directory | Description |
|---|--------|-----------|-------------|
| 1 | ELYSIUM PLAY | `docs/elysium-play/` | Cross-platform play and discovery |
| 2 | ELYSIUM Creation App | `docs/creation-app/` | In situ AR creation and account management |
| 3 | ELYSIUM Portal | `docs/portal/` | Web app, dashboard, and player hub |
| 4 | GEIST Engine | `docs/geist-engine/` | Interaction engine for AR and beyond |
| 5 | ELYSIUM X | `docs/elysium-x/` | Self-serve reserve-linked loyalty system |
| 6 | ELYSIUM Wallet | `docs/wallet/` | Ecosystem identity layer (EIS-Wallet) |
| 7 | ELYSIUM Analytics | `docs/analytics/` | Real-time behavioural analytics for AI |
| 8 | ELYSIUM DePIN Network | `docs/depin-network/` | Federated system as platform |
| 9 | REALITY BRIDGE | `docs/reality-bridge/` | Hardware infrastructure modules |
| 10 | ALPHA Lab | `docs/alpha-lab/` | Experimental features and creative tools |

---

## Changelog

| Version | Date | Author | Description |
|---------|------|--------|-------------|
| 1.0.0 | 2026-03-28 | Claude | Initial guide — documents three-layer feature flag system for ELYSIUM docs publishing |

---

*Document Version: 1.0.0*
*Last Updated: 2026-03-28*
*Status: Implemented*
