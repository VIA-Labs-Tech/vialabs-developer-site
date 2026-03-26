import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  docsSidebar: [
    'intro',
    {
      type: 'category',
      label: 'General',
      collapsed: false,
      items: [
        'general/technology-overview',
        'general/package',
        'general/supported-networks',
        'general/fees-and-gas',
        'general/testnet-tokens',
        'general/faq',
        'general/troubleshooting',
      ],
    },
    {
      type: 'category',
      label: 'Quickstart Examples',
      collapsed: false,
      items: [
        {
          type: 'category',
          label: 'EVM',
          collapsed: false,
          items: [
            'examples/hello-world',
            'examples/burn-mint-token',
            'examples/lock-release-token',
            'examples/private-oracle',
          ],
        },
        {
          type: 'category',
          label: 'Cardano',
          collapsed: true,
          items: [
            'examples/cardano-coming-soon',
          ],
        },
        {
          type: 'category',
          label: 'Midnight',
          collapsed: true,
          items: [
            'examples/midnight-coming-soon',
          ],
        },
      ],
    },
    {
      type: 'category',
      label: 'Work With Us',
      items: [
        'work-with-us/developers',
      ],
    },
  ],
};

export default sidebars;
