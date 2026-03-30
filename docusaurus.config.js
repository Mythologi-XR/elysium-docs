// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

require('dotenv').config();

const customFields = require('./src/customFields');
const { pillars } = require('./docs/publishing/docFlags');

const { themes } = require('prism-react-renderer');
const lightCodeTheme = themes.github;
const darkCodeTheme = themes.dracula;

/**
 * Helper: only include a navbar item if its pillar flag is enabled.
 */
function navItemIf(flag, item) {
  return pillars[flag] ? item : null;
}

/** @type {import('@docusaurus/types').Config} */
module.exports = {
  title: 'Elysium - Build for AR. In AR.',
  tagline: 'Elysium is a new app for situated, no-code AR worldbuilding, publishing and discovery. Create interactive AR experiences. Upload, import & collect 3D assets. Localize your work on the map. Discover nearby content from other creators.',
  url: 'https://docs.elysium.ar',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  onBrokenAnchors: 'warn',

  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'warn',
      onBrokenMarkdownImages: 'warn',
    },
  },
  favicon: 'img/favicon.ico',
  customFields: {
    ...customFields,
    featureFlags: pillars,
  },

  // GitHub pages deployment config.
  organizationName: 'Mythologi-XR',
  projectName: 'elysium-docs',

  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'ar', 'de', 'es', 'fa', 'fr', 'ja', 'ko', 'pt', 'pt-BR', 'ru', 'zh'],
    localeConfigs: {
      en: { label: 'English', htmlLang: 'en' },
      ar: { label: 'العربية', direction: 'rtl', htmlLang: 'ar' },
      de: { label: 'Deutsch', htmlLang: 'de' },
      es: { label: 'Español', htmlLang: 'es' },
      fa: { label: 'فارسی', direction: 'rtl', htmlLang: 'fa' },
      fr: { label: 'Français', htmlLang: 'fr' },
      ja: { label: '日本語', htmlLang: 'ja' },
      ko: { label: '한국어', htmlLang: 'ko' },
      pt: { label: 'Português', htmlLang: 'pt' },
      'pt-BR': { label: 'Português (BR)', htmlLang: 'pt-BR' },
      ru: { label: 'Русский', htmlLang: 'ru' },
      zh: { label: '中文', direction: 'ltr', htmlLang: 'zh-Hans' },
    },
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          routeBasePath: '/',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      colorMode: {
        defaultMode: 'dark',
        disableSwitch: true,
      },
      navbar: {
        title: '',
        logo: {
          alt: 'Elysium Logo',
          src: 'img/elysium-logo-light.png',
        },
        items: [
          {
            position: 'right',
            to: '/',
            label: 'Docs',
            items: [
              {
                to: '/introduction',
                label: 'Introduction',
              },
              {
                to: '/getting-started',
                label: 'Getting Started',
              },
              navItemIf('alpha-lab', {
                to: '/alpha-lab/card-designer',
                label: 'Card Designer',
              }),
              navItemIf('reference', {
                to: '/reference',
                label: 'Reference',
              }),
            ].filter(Boolean),
          },
          {
            position: 'right',
            to: '/pricing',
            label: 'Pricing',
          },
          {
            position: 'right',
            label: 'Support',
            to: '/support',
            items: [
              {
                to: '/support',
                label: 'Contact us',
                activeBaseRegex: '/support$'
              },
              {
                to: '/support/faq',
                label: 'FAQ'
              },
            ]
          },
          {
            type: 'localeDropdown',
            position: 'right',
          },
          {
            label: 'Discord',
            href: 'https://discord.gg/gYMKNYHJRJ',
            position: 'right',
          },
          {
            href: customFields.iosAppUrl,
            label: 'Download Elysium on the App Store',
            position: 'right',
            className: 'nav-link_download-app-store'
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Product',
            items: [
              {
                label: 'Pricing',
                to: '/pricing',
              },
              {
                label: 'Docs',
                to: '/introduction',
              },
              {
                label: 'Support',
                to: '/support',
              },
            ],
          },
          {
            title: 'Community',
            items: [
              {
                label: 'Discord',
                href: 'https://discord.gg/gYMKNYHJRJ',
              },
              {
                label: 'Twitter',
                href: 'https://twitter.com/elysiumXR',
              },
              {
                label: 'Instagram',
                href: 'https://www.instagram.com/mythologi.es/',
              },
              {
                label: 'YouTube',
                href: 'https://www.youtube.com/channel/UCDC0xji3cOyUDBVSryyHh3Q',
              },
            ],
          },
          {
            title: 'More',
            items: [
              {
                label: 'Privacy Policy',
                href: '/policies/privacy',
              },
              {
                label: 'Press kit',
                href: '/press',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} MYTHOLOGI Inc.`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
    }),
    plugins: [
      async function docusaurusTailwindCss() {
        return {
          name: 'docusaurus-tailwindcss',
          configurePostCss(postcssOptions) {
            postcssOptions.plugins.push(require("tailwindcss"));
            postcssOptions.plugins.push(require("autoprefixer"));
            return postcssOptions;
          },
        }
      }
    ]
};
