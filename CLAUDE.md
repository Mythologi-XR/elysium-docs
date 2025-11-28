# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with this repository.

## Project Overview

Elysium Docs is the documentation website for **Elysium** - an AR (Augmented Reality) worldbuilding app and platform by MYTHOLOGI Inc. The site is built with Docusaurus 2 and serves as the primary documentation, support, and marketing resource for the Elysium iOS app.

Elysium enables no-code, geolocated, real-time AR worldbuilding where users can create interactive AR experiences, upload 3D assets, and share content with others.

## Tech Stack

- **Framework**: Docusaurus 2 (v2.0.0-rc.1)
- **UI**: React 17, TypeScript
- **Styling**: TailwindCSS 3, custom CSS variables (Infima theme)
- **Content**: MDX/Markdown documentation
- **Build**: Yarn

## Common Commands

```bash
# Install dependencies
yarn

# Start development server (hot reload)
yarn start

# Build static site to /build directory
yarn build

# Type checking
yarn typecheck

# Serve production build locally
yarn serve

# Clear build cache
yarn clear
```

## Project Structure

```
elysium-docs/
├── docs/                    # Documentation content (Markdown/MDX)
│   ├── guide/               # User guides and reference docs
│   │   └── reference/       # Detailed reference documentation
│   ├── pricing/             # Pricing page
│   ├── support/             # Support and FAQ
│   ├── policies/            # Privacy policy
│   └── press/               # Press kit
├── src/
│   ├── components/          # React components
│   │   ├── HomepageFeatures/# Homepage sections and partner logos
│   │   └── Pricing/         # Pricing cards and grid
│   ├── theme/               # Docusaurus theme overrides
│   │   ├── Footer/          # Custom footer layout
│   │   └── Navbar/          # Custom navbar
│   ├── css/                 # Global styles (custom.css)
│   ├── customFields.js      # Custom config fields (iOS app URL)
│   └── pages/               # Additional pages
├── static/                  # Static assets (images, favicon)
├── docusaurus.config.js     # Main Docusaurus configuration
├── sidebars.js              # Sidebar navigation structure
└── tailwind.config.js       # Tailwind configuration
```

## Key Configuration Files

- **docusaurus.config.js**: Main config including navbar, footer, theme settings, and plugins
- **sidebars.js**: Defines sidebar navigation structure (auto-generated from folder structure)
- **tailwind.config.js**: Custom color palette mapping to Infima CSS variables
- **src/customFields.js**: Custom fields like iOS App Store URL

## Development Notes

- The site uses **dark mode only** (light mode switch is disabled)
- Docs are served at the root URL (`/`) via `routeBasePath: '/'`
- TailwindCSS is integrated via a custom Docusaurus plugin in the config
- Tailwind colors are mapped to Infima CSS variables for theme consistency
- Environment variables are loaded via dotenv (see `.env.example`)
- The `DOCUSAURUS_URL` env var sets the site URL for builds

## Adding Documentation

1. Add Markdown/MDX files to the appropriate `docs/` subdirectory
2. Use frontmatter for metadata: `sidebar_position`, `title`, `slug`
3. Sidebars auto-generate from folder structure (see `sidebars.js`)

## Component Patterns

- React components use TypeScript (`.tsx`)
- Styling combines TailwindCSS utilities with CSS modules (`*.module.css`)
- Theme overrides are in `src/theme/` following Docusaurus swizzle patterns
