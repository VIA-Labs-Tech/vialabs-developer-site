import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'VIA Labs Developer Docs',
  tagline: 'Cross-chain infrastructure documentation for builders',
  favicon: 'img/favicon.ico',

  future: {
    v4: true,
  },

  url: 'https://developer.vialabs.tech',
  baseUrl: '/',

  organizationName: 'VIA-Labs-Tech',
  projectName: 'vialabs-developer-site',

  onBrokenLinks: 'throw',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          editUrl:
            'https://github.com/VIA-Labs-Tech/vialabs-developer-site/tree/main/',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/via-labs-social-card.png',
    colorMode: {
      defaultMode: 'light',
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'VIA Labs',
      logo: {
        alt: 'VIA Labs',
        src: 'img/logo-dark.png',
        srcDark: 'img/logo-light.png',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'docsSidebar',
          position: 'left',
          label: 'Documentation',
        },
        {
          href: 'https://vialabs.tech',
          label: 'Main Site',
          position: 'right',
        },
        {
          href: 'https://github.com/VIA-Labs-Tech',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Documentation',
          items: [
            {
              label: 'Getting Started',
              to: '/docs/general/technology-overview',
            },
            {
              label: 'SDK Reference',
              to: '/docs/general/package',
            },
            {
              label: 'Supported Networks',
              to: '/docs/general/supported-networks',
            },
          ],
        },
        {
          title: 'Quickstarts',
          items: [
            {
              label: 'Cross-Chain Token',
              to: '/docs/examples/crosschain-token',
            },
            {
              label: 'Cross-Chain NFT',
              to: '/docs/examples/crosschain-nft',
            },
            {
              label: 'Private Oracle',
              to: '/docs/examples/private-oracle',
            },
          ],
        },
        {
          title: 'Links',
          items: [
            {
              label: 'VIA Labs',
              href: 'https://vialabs.tech',
            },
            {
              label: 'GitHub',
              href: 'https://github.com/VIA-Labs-Tech',
            },
            {
              label: 'X / Twitter',
              href: 'https://x.com/VIALabs_io',
            },
          ],
        },
      ],
      copyright: `Copyright \u00A9 ${new Date().getFullYear()} VIA Labs, Inc.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['solidity', 'bash', 'json'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
