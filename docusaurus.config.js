// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const customFields = require('./src/customFields');

const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Elysium',
  tagline: 'Elysium is a no-code creator studio and player application for interactive augmented reality experiences.',
  url: 'https://elysium.ar/',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.ico',
  customFields,

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'Mythologi-XR', // Usually your GitHub org/user name.
  projectName: 'elysium-docs', // Usually your repo name.

  // Even if you don't use internalization, you can use this field to set useful
  // metadata like html lang. For example, if your site is Chinese, you may want
  // to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          // editUrl:
          //   'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
        },
        // blog: {
        //   showReadingTime: true,
        //   // Please change this to your repo.
        //   // Remove this to remove the "edit this page" links.
        //   editUrl:
        //     'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
        // },
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
          // {
          //   type: 'doc',
          //   docId: 'intro',
          //   position: 'left',
          //   label: 'Tutorial',
          // },
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
          // {
          //   title: 'Docs',
          //   items: [
          //     {
          //       label: 'Tutorial',
          //       to: '/docs/intro',
          //     },
          //   ],
          // },
          {
            title: 'Community',
            items: [
              {
                label: 'Discord',
                href: 'https://discord.gg/Dvdmu3saNp',
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
                href: '/docs/policies/privacy',
              },
            ],
          },
        ],
        copyright: `Copyright ?? ${new Date().getFullYear()} MYTHOLOGI Inc.`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
    }),
};

module.exports = config;
