# Elysium Docs

Documentation site for Elysium, a no-code AR world-building platform by MYTHOLOGI Inc. Deployed at [docs.elysium.ar](https://docs.elysium.ar).

## Stack

- **Framework:** Docusaurus v3.9.2 with React 18
- **Styling:** Tailwind CSS v3 + Infima (Docusaurus's built-in CSS framework) + custom CSS
- **Language:** TypeScript
- **Package manager:** npm (do not use yarn)
- **i18n:** Docusaurus i18n (French, Japanese, Chinese)
- **Tooling:** Docu Dino — local drag-and-drop docs manager

## Commands

- `npm start` — Dev server with hot reload (default port 3000)
- `npm run build` — Production build
- `npm run serve` — Serve production build locally
- `npm run typecheck` — Run TypeScript type checking (`tsc`)
- `npm run dino` — Launch Docu Dino docs manager at http://localhost:3333
- `npx docusaurus clear` — Clear Docusaurus cache (useful when styles or config changes aren't reflected)

## Project Structure

```
docs/                    # Markdown/MDX content — organized into 10+ platform pillars
  introduction/          # Platform introduction
  getting-started/       # Onboarding guides
  creation-app/          # AR creation app docs
  portal/                # Web portal docs
  alpha-lab/             # Alpha Lab (Card Designer, Doc Dino, etc.)
  elysium-play/          # Player experience
  geist-engine/          # GEIST interactive behavior system
  analytics/             # Analytics & insights
  reality-bridge/        # IoT/hardware bridge
  wallet/                # Wallet & identity
  depin-network/         # DePIN network
  elysium-x/             # Extended platform features
  publishing/            # Feature flag system (docFlags.js)
  pricing/               # Pricing page
  support/               # Support & FAQ
  policies/              # Privacy policy, terms
  press/                 # Press kit
i18n/                    # Translations (fr, ja, zh)
src/
  components/            # React components (HomepageFeatures, Pricing/)
  css/custom.css         # Global styles, design tokens, glassmorphism
  customFields.js        # Shared config values (iOS app URL)
  fonts/                 # MonumentExtended custom font
  pages/                 # Standalone pages (index.tsx = homepage)
  theme/                 # Swizzled Docusaurus components (Navbar, Footer)
static/img/              # Images, logos, SVGs
tools/docu-dino/         # Docu Dino — browser-based docs manager tool
docusaurus.config.js     # Site config (navbar, footer, plugins, redirects)
sidebars.js              # Sidebar structure (auto-generated from docs/)
tailwind.config.js       # Tailwind config with custom theme tokens
```

## Design System

### CSS Custom Properties (defined in `src/css/custom.css`)

- `--global-radius: 12px` — Single source of truth for all border radii. Feeds into `--ifm-global-radius` (Infima) and `--glass-radius` (glassmorphism). Tailwind `rounded-*` classes also derive from this via `tailwind.config.js`.
- `--glass-bg`, `--glass-border`, `--glass-blur`, `--glass-radius` — Glassmorphism tokens with dark mode overrides in `[data-theme='dark']`.
- Apply `.glass` class for the reusable glassmorphism effect (background blur + transparent border).

### Tailwind + Infima

Tailwind is integrated via an inline PostCSS plugin in `docusaurus.config.js`. Preflight is disabled (`corePlugins: { preflight: false }`) to avoid conflicts with Infima. Tailwind's color palette maps to Infima CSS variables for dark mode compatibility (see `tailwind.config.js` `colors.gray`).

### Dark Mode

Dark mode is the default and the only mode (switch is disabled in `docusaurus.config.js`). The `[data-theme='dark']` selector controls Infima variables and glassmorphism token overrides.

### Fonts

- **Manrope** — Primary font (`--ifm-font-family-base`), loaded from Google Fonts
- **MonumentExtended** — Display font for homepage headings, loaded locally from `src/fonts/`
- **Noto Sans Mono** — Monospace font for homepage copy

## Docu Dino

A local, browser-based drag-and-drop tool for reorganizing the docs site. See `tools/docu-dino/DOCU-DINO.md` for full documentation.

**Launch:** `npm run dino` → http://localhost:3333

**Capabilities:**
- Drag-and-drop page reordering within and across categories
- Category creation, reordering, and renaming
- Inline page title editing and content editing
- Toggle draft/published status (updates frontmatter `draft` field)
- Toggle category published status (updates `docs/publishing/docFlags.js` pillar flags)
- Page preview with markdown rendering
- Real-time sync via Server-Sent Events (file watcher)
- 12-locale i18n support

**Architecture:** Express server + vanilla JS frontend, no build step. Reads/writes `docs/` directory frontmatter and `_category_.json` files directly.

## Feature Flag System

Content visibility is controlled by `docs/publishing/docFlags.js`:

- Each platform pillar has a boolean flag (e.g., `creationApp: true`)
- Docu Dino can toggle these via the PUBLISHED/UNPUBLISHED badge
- `sidebars.js` reads these flags to conditionally include/exclude categories
- Draft pages (`draft: true` in frontmatter) are excluded from production builds but visible in `npm start`

## Key Conventions

- Sidebar is auto-generated from the `docs/` folder structure using `_category_.json` files
- Content is organized into **platform pillars** (10+ categories matching product areas)
- The homepage (`src/pages/index.tsx`) is a standalone page, not part of the docs
- Swizzled theme components (Navbar, Footer) live in `src/theme/` — edit these to customize layout
- Environment variables are loaded via `dotenv` in `docusaurus.config.js` (`DOCUSAURUS_URL`)
- `/docs` redirects to `/docs/guide/` via the client-redirects plugin

---

## Cross-Repo Dependencies

- **Standalone**: No runtime dependencies on other repos
- **Documents**: The ELYSIUM platform (covers features from `elysium-web-app`, `elysium-app`, and the broader ecosystem)
- **Design system**: Site styling follows the ELYSIUM dark glassmorphism aesthetic; see [ELYSIUM Design System Guide](../elysium-workspace/docs/UI-UX/ELYSIUM-DESIGN-SYSTEM.md) for the cross-platform design hierarchy

> For cross-repo workspace context, see `~/Documents/GitHub/CLAUDE.md`
