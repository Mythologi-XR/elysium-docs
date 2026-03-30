---
title: Doc Organizer
draft: true
---

# Doc Organizer — Guide

**A local, browser-based drag-and-drop tool for reorganizing the ELYSIUM Docusaurus site.**

> **KEY RELATED DOCUMENTS**
> - **[docFlags.js](../../docs/publishing/docFlags.js)** — Feature flag configuration read by the organizer
> - **[PUBLISHING.md](../../docs/publishing/PUBLISHING.md)** — Feature flag system documentation
> - **[sidebars.js](../../sidebars.js)** — Sidebar config that consumes the files this tool modifies
> - **[docusaurus.config.js](../../docusaurus.config.js)** — Docusaurus site configuration

<br>

---
> **Latest Change:** Initial guide — documents setup, usage, and architecture of the Doc Organizer tool

  **v1.0.0** | *Created: 2026-03-30 — [see changelog](#changelog)*

---

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Setup](#setup)
- [Usage](#usage)
  - [Launching the Tool](#launching-the-tool)
  - [Navigating the Tree](#navigating-the-tree)
  - [Reordering Pages](#reordering-pages)
  - [Moving Pages Between Categories](#moving-pages-between-categories)
  - [Reordering Categories](#reordering-categories)
  - [Renaming Pages and Categories](#renaming-pages-and-categories)
  - [Toggling Draft Status](#toggling-draft-status)
  - [Previewing Pages](#previewing-pages)
  - [Creating New Pages](#creating-new-pages)
  - [Real-Time Sync](#real-time-sync)
- [Architecture](#architecture)
  - [Server](#server)
  - [Frontend](#frontend)
  - [API Reference](#api-reference)
- [Configuration](#configuration)
- [Troubleshooting](#troubleshooting)
- [Changelog](#changelog)

---

## Overview

The Doc Organizer is a self-contained, offline, browser-based tool for visually managing the page hierarchy of the ELYSIUM Docusaurus documentation site. Instead of manually editing frontmatter `sidebar_position` values, `_category_.json` files, and moving files between directories, you can drag and drop pages in a visual tree.

**What it does:**
- Reads the `docs/` directory, parsing all markdown frontmatter and category metadata
- Renders an interactive tree in the browser at `http://localhost:3333`
- Writes changes directly to the filesystem (frontmatter updates, file moves, new files)
- Watches for external file changes and updates the UI in real time via Server-Sent Events

**What it modifies:**
- `sidebar_position` in `.md` / `.mdx` frontmatter
- `title` in `.md` / `.mdx` frontmatter
- `draft` in `.md` / `.mdx` frontmatter
- `label` and `position` in `_category_.json` files
- Creates new `.md` files when using the "Create Page" feature
- Moves `.md` files between directories when dragging pages between categories

**What it does NOT modify:**
- `sidebars.js` — this file reads the same frontmatter/category data, so changes are reflected automatically
- `docusaurus.config.js` — no changes needed
- `docFlags.js` — read-only; the tool displays published/unpublished status but does not toggle flags

---

## Prerequisites

- **Node.js** >= 20.0.0 (same as the Docusaurus site)
- **npm** (comes with Node.js)
- The `elysium-docs` repository cloned locally

---

## Setup

### First-time installation

From the repository root:

```bash
cd tools/doc-organizer
npm install
```

This installs the tool's dependencies (`express`, `chokidar`, `gray-matter`, `glob`, `marked`) into `tools/doc-organizer/node_modules/`. These are isolated from the Docusaurus project's dependencies.

### Verify installation

```bash
npm run organize
```

You should see:

```
  📄 Doc Organizer running at http://localhost:3333

  Watching: /path/to/elysium-docs/docs
```

Open `http://localhost:3333` in your browser.

---

## Usage

### Launching the Tool

From the `elysium-docs` repository root:

```bash
npm run organize
```

Or directly:

```bash
node tools/doc-organizer/server.js
```

The tool runs on **port 3333** by default. The connection status indicator in the top-right corner shows "Connected" (green) when the SSE stream is active.

### Navigating the Tree

The tree displays all documentation categories and their pages, matching the sidebar structure of the Docusaurus site.

- **Categories** are collapsible sections with a colored header bar
- **Click** the category header to expand/collapse
- **Pages** are listed under their category with position number, title, and filename
- **Badges** indicate status:
  - **PUBLISHED** (green) — category flag is `true` in `docFlags.js`
  - **UNPUBLISHED** (gray) — category flag is `false`
  - **HIDDEN** (dark) — category has `className: "hidden"` in `_category_.json`
  - **DRAFT** (orange, on pages) — page has `draft: true` in frontmatter

### Reordering Pages

**Drag and drop** a page within its category to change its position.

1. Grab the **drag handle** (`⠿`) on the left side of a page row
2. Drag it above or below another page in the same category
3. Drop it — all `sidebar_position` values in that category are rewritten sequentially

The change is written to disk immediately. No save button needed.

### Moving Pages Between Categories

**Drag a page** from one category and **drop it onto a page** in a different category.

1. Grab the drag handle on the source page
2. Drag it over a page in the destination category (the target row highlights)
3. Drop it — the `.md` file is physically moved to the new directory and its `sidebar_position` is updated

### Reordering Categories

**Drag a category** header and **drop it onto another category** header to swap their positions.

1. Grab the drag handle (`⠿`) on the left side of the category header
2. Drop it on another category — their `position` values in `_category_.json` are swapped

### Renaming Pages and Categories

**Double-click** any page title or category label to edit it inline.

- Type the new name and press **Enter** to save
- Press **Escape** to cancel
- For pages: updates the `title` field in frontmatter
- For categories: updates the `label` field in `_category_.json`

### Toggling Draft Status

Each page row has a **toggle switch** on the right side.

- **Purple/active** = published (no `draft` field or `draft: false`)
- **Gray/inactive** = draft (`draft: true` in frontmatter)

Click the toggle to flip the status. Draft pages are excluded from production builds but visible in `npm start` dev mode.

### Previewing Pages

**Click** any page row (not the drag handle or toggle) to open the **preview modal**.

The modal renders the page's markdown content as HTML with:
- Page title as the modal header
- File path shown below the title
- Rendered markdown body in a scrollable area
- **Previous/Next** buttons to navigate between pages in the same category
- **Step dots** at the bottom showing your position in the category
- **Keyboard shortcuts**: Left/Right arrows to navigate, Escape to close

### Creating New Pages

Click the **+** button on any category header to open the **create page wizard**.

The wizard has 3 steps:

1. **Page Details** — Enter a title and filename (auto-slugified from title, editable)
2. **Options** — Choose insertion position (before any existing page or at end) and draft status
3. **Initial Content** — Optionally write an opening paragraph

On completion, the tool:
- Creates the `.md` file with frontmatter (`sidebar_position`, `title`, optionally `draft: true`)
- Bumps the `sidebar_position` of all sibling pages at or after the insertion point
- The file watcher detects the new file and refreshes the tree automatically

### Real-Time Sync

The tool watches the `docs/` directory for changes using `chokidar`. If you edit a file externally (in your IDE, via git, etc.), the tree updates automatically within ~300ms.

The SSE connection status is shown in the top-right corner:
- **Connected** (green) — live updates active
- **Disconnected** (gray) — SSE connection lost; refresh the page to reconnect

---

## Architecture

### Server

**File:** `tools/doc-organizer/server.js`

- **Express** serves the static frontend and REST API on port 3333
- **gray-matter** parses and writes YAML frontmatter without corrupting markdown content
- **marked** renders markdown to HTML for the preview modal
- **chokidar** watches `docs/**/*.{md,mdx,json}` and broadcasts SSE events on changes
- **Debouncing** (300ms) batches rapid file changes (e.g., a reorder touching 10 files)
- **Atomic writes** — writes to a `.tmp` file then renames, preventing partial reads

### Frontend

**Files:** `tools/doc-organizer/public/` (`index.html`, `styles.css`, `app.js`)

- **Vanilla JS** — no React, no build step, no bundler
- **HTML5 Drag and Drop API** for reordering
- **Server-Sent Events** for real-time updates
- **Dark glassmorphism theme** matching the Docusaurus site styling

### API Reference

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/api/tree` | Full docs tree (categories, pages, metadata) |
| `GET` | `/api/events` | SSE stream — pushes `tree-updated` on file changes |
| `GET` | `/api/page/:path/content` | Rendered HTML + frontmatter for preview |
| `PUT` | `/api/page/:path/position` | Update `sidebar_position` in frontmatter |
| `PUT` | `/api/page/:path/title` | Update `title` in frontmatter |
| `PUT` | `/api/page/:path/draft` | Toggle `draft` in frontmatter |
| `PUT` | `/api/page/:path/move` | Move file to a different category directory |
| `PUT` | `/api/category/:path/label` | Update `label` in `_category_.json` |
| `PUT` | `/api/category/:path/position` | Update `position` in `_category_.json` |
| `POST` | `/api/reorder` | Batch rewrite `sidebar_position` for an ordered list of pages |
| `POST` | `/api/page/create` | Create a new `.md` file with frontmatter |

All `:path` parameters are URL-encoded paths relative to the `docs/` directory (e.g., `introduction%2Findex.md`).

---

## Configuration

The tool has no configuration file. It derives everything from the existing Docusaurus structure:

| Source | What It Reads |
|--------|--------------|
| `docs/**/*.md` / `*.mdx` | Frontmatter: `sidebar_position`, `title`, `slug`, `id`, `draft` |
| `docs/**/_category_.json` | Category: `label`, `position`, `collapsed`, `className` |
| `docs/publishing/docFlags.js` | Feature flags: `pillars` object for published/unpublished badges |

### Changing the port

Edit `const PORT = 3333;` in `server.js` to use a different port.

### Changing the docs directory

The docs path is auto-resolved relative to the tool's location (`../../docs`). No manual configuration needed if the tool remains at `tools/doc-organizer/`.

---

## Troubleshooting

**Port 3333 is in use**
Kill the existing process or change the port in `server.js`.

**Tree is empty**
Ensure you're running the tool from the `elysium-docs` repository root, not from inside `tools/doc-organizer/`.

**Changes not appearing in Docusaurus**
The tool writes to the same files Docusaurus reads. If the dev server is running (`npm start`), it will hot-reload automatically. For production, run `npm run build` after making changes.

**SSE disconnected**
Refresh the browser page. The SSE connection auto-reconnects on page load.

**"File already exists" error when creating a page**
Choose a different filename — a file with that name already exists in the target category.

---

## Changelog

| Version | Date | Author | Description |
|---------|------|--------|-------------|
| 1.0.0 | 2026-03-30 | Claude | Initial release — tree view, drag-and-drop, preview modal, create page |

---

*Document Version: 1.0.0*
*Last Updated: 2026-03-30*
*Status: Implemented*
