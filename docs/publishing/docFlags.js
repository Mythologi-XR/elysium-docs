/**
 * ELYSIUM Documentation Feature Flags
 *
 * Toggle pillars and individual pages on/off.
 * Set to `true` to publish, `false` to hide from sidebar and exclude from production builds.
 *
 * Usage:
 *   - Pillars control entire sidebar sections and all pages within them
 *   - Pages override pillar-level flags for individual documents
 *   - In development (`npm start`), ALL content is visible regardless of flags
 *   - In production (`npm run build`), only published content is included
 */

// @ts-check

/** @type {Record<string, boolean>} */
const pillars = {
  'elysium-play':     false,
  'creation-app':     false,
  'portal':           false,
  'geist-engine':     false,
  'elysium-x':        false,
  'wallet':           false,
  'analytics':        false,
  'depin-network':    false,
  'reality-bridge':   false,
  'alpha-lab':        true,
  'reference':        true,
};

/**
 * Page-level overrides (optional).
 * Keys are doc paths relative to the docs/ directory (without .md extension).
 * These override the pillar-level flag for specific pages.
 *
 * Example:
 *   'portal/dashboard': true    // publish this page even if 'portal' pillar is off
 *   'alpha-lab/card-designer/tips-and-troubleshooting': false  // hide this specific page
 */
/** @type {Record<string, boolean>} */
const pages = {
  // Add page-level overrides here
};

module.exports = { pillars, pages };
