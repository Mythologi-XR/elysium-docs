# Elysium Docs

Documentation site for Elysium, a no-code AR world-building platform by MYTHOLOGI Inc.

## Stack

- **Framework:** Docusaurus v3.9.2 with React 18
- **Styling:** Tailwind CSS v3 + Infima (Docusaurus's built-in CSS framework) + custom CSS
- **Language:** TypeScript
- **Package manager:** npm (do not use yarn)

## Commands

- `npm start` — Dev server with hot reload (default port 3000)
- `npm run build` — Production build
- `npm run serve` — Serve production build locally
- `npm run typecheck` — Run TypeScript type checking (`tsc`)
- `npx docusaurus clear` — Clear Docusaurus cache (useful when styles or config changes aren't reflected)

## Project Structure

```
docs/                    # Markdown/MDX content
  guide/                 # Main documentation (getting-started, reference/)
  pricing/               # Pricing page (uses PricingCard component)
  support/               # Support & FAQ
  policies/              # Privacy policy, etc.
  press/                 # Press kit
src/
  components/            # React components (HomepageFeatures, Pricing/)
  css/custom.css         # Global styles, design tokens, glassmorphism
  customFields.js        # Shared config values (iOS app URL)
  fonts/                 # MonumentExtended custom font
  pages/                 # Standalone pages (index.tsx = homepage)
  theme/                 # Swizzled Docusaurus components (Navbar, Footer)
static/img/              # Images, logos, SVGs
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

## Key Conventions

- Sidebar is auto-generated from the `docs/` folder structure using `_category_.json` files
- The homepage (`src/pages/index.tsx`) is a standalone page, not part of the docs
- Swizzled theme components (Navbar, Footer) live in `src/theme/` — edit these to customize layout
- Environment variables are loaded via `dotenv` in `docusaurus.config.js` (`DOCUSAURUS_URL`)
- `/docs` redirects to `/docs/guide/` via the client-redirects plugin

---

## Cross-Repo Dependencies

- **Standalone**: No runtime dependencies on other repos
- **Documents**: The ELYSIUM platform (covers features from `elysium-web-app`, `elysium-app`, and the broader ecosystem)

> For cross-repo workspace context, see `~/Documents/GitHub/CLAUDE.md`
