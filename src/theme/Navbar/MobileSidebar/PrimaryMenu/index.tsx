import React, {useState} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import {useLocation} from '@docusaurus/router';
import {useNavbarMobileSidebar} from '@docusaurus/theme-common/internal';
import IconExternalLink from '@theme/Icon/ExternalLink';

// The mobile drawer shows the full docs tree as the ONE main menu —
// no primary/secondary split, no "Back to main menu".
// KEEP IN SYNC with sidebars.ts (structure) and doc titles (labels).

type Leaf = {label: string; to: string};
type Category = {label: string; collapsed: boolean; items: Item[]};
type Item = Leaf | Category;

const TREE: Item[] = [
  {label: 'Get Started', to: '/docs/'},
  {
    label: 'Learn',
    collapsed: true,
    items: [
      {label: 'Technology Overview', to: '/docs/general/technology-overview'},
      {label: 'Fees & Gas', to: '/docs/general/fees-and-gas'},
      {label: 'FAQ', to: '/docs/general/faq'},
      {label: 'Troubleshooting', to: '/docs/general/troubleshooting'},
      {label: 'Testnet Tokens', to: '/docs/general/testnet-tokens'},
    ],
  },
  {
    label: 'Build',
    collapsed: false,
    items: [
      {
        label: 'EVM (Solidity)',
        collapsed: false,
        items: [
          {label: 'Hello World', to: '/docs/examples/hello-world'},
          {label: 'Burn & Mint Token', to: '/docs/examples/burn-mint-token'},
          {label: 'Lock & Mint Token', to: '/docs/examples/lock-mint-token'},
          {label: 'Lock & Release Token', to: '/docs/examples/lock-release-token'},
          {label: 'Private Oracle', to: '/docs/examples/private-oracle'},
        ],
      },
      {
        label: 'Cardano (Aiken)',
        collapsed: true,
        items: [
          {label: 'Overview & Concepts', to: '/docs/examples/cardano/overview'},
          {label: 'Integration Paths', to: '/docs/examples/cardano/integration-paths'},
          {label: 'Mint & Burn Client', to: '/docs/examples/cardano/mint-burn-client'},
        ],
      },
      {
        label: 'Midnight (Compact)',
        collapsed: true,
        items: [
          {label: 'Overview & USDM Bridge', to: '/docs/examples/midnight/overview'},
        ],
      },
      {label: 'Stellar (Coming Soon)', to: '/docs/examples/stellar-coming-soon'},
      {
        label: 'Guides',
        collapsed: false,
        items: [
          {label: 'Bridge USDM: Cardano ↔ Midnight', to: '/docs/examples/guides/usdm-cardano-midnight'},
        ],
      },
    ],
  },
  {
    label: 'Reference',
    collapsed: false,
    items: [
      {label: 'Contract Source', to: '/docs/general/contract-source'},
      {
        label: 'Contracts',
        collapsed: true,
        items: [
          {label: 'ViaIntegrationV1', to: '/docs/general/ref-via-integration'},
          {label: 'VIAMintBurnTokenMinimal', to: '/docs/general/ref-mint-burn'},
          {label: 'VIALockerRelease', to: '/docs/general/ref-locker-release'},
          {label: 'FeeCollectorV1', to: '/docs/general/ref-fee-collector'},
          {label: 'GasRefundV1', to: '/docs/general/ref-gas-refund'},
        ],
      },
      {label: 'Supported Networks', to: '/docs/general/supported-networks'},
      {label: 'Error Reference', to: '/docs/general/error-reference'},
      {label: 'Audits', to: '/docs/general/audits'},
    ],
  },
  {label: 'Work With Us', to: '/docs/work-with-us/developers'},
  {label: 'Legal & Disclaimers', to: '/docs/legal/disclaimers'},
];

const EXTERNAL_LINKS = [
  {label: 'Main Site', href: 'https://vialabs.tech'},
  {label: 'GitHub', href: 'https://github.com/VIA-Labs-Tech'},
];

function isCategory(item: Item): item is Category {
  return (item as Category).items !== undefined;
}

function LeafItem({item}: {item: Leaf}) {
  const mobileSidebar = useNavbarMobileSidebar();
  const {pathname} = useLocation();
  const active = pathname === item.to || pathname === `${item.to}/`;
  return (
    <li className="menu__list-item">
      <Link
        className={clsx('menu__link', active && 'menu__link--active')}
        to={item.to}
        onClick={() => mobileSidebar.toggle()}>
        {item.label}
      </Link>
    </li>
  );
}

function CategoryItem({item}: {item: Category}) {
  const [collapsed, setCollapsed] = useState(item.collapsed);
  return (
    <li className={clsx('menu__list-item', collapsed && 'menu__list-item--collapsed')}>
      <div className="menu__list-item-collapsible">
        <a
          role="button"
          tabIndex={0}
          aria-expanded={!collapsed}
          className="menu__link menu__link--sublist menu__link--sublist-caret"
          onClick={() => setCollapsed((c) => !c)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setCollapsed((c) => !c);
            }
          }}>
          {item.label}
        </a>
      </div>
      {!collapsed && (
        <ul className="menu__list">
          {item.items.map((child, i) =>
            isCategory(child) ? <CategoryItem key={i} item={child} /> : <LeafItem key={i} item={child} />,
          )}
        </ul>
      )}
    </li>
  );
}

export default function NavbarMobilePrimaryMenu(): React.ReactElement {
  const mobileSidebar = useNavbarMobileSidebar();
  return (
    <ul className="menu__list">
      {TREE.map((item, i) =>
        isCategory(item) ? <CategoryItem key={i} item={item} /> : <LeafItem key={i} item={item} />,
      )}
      {EXTERNAL_LINKS.map((link) => (
        <li className="menu__list-item" key={link.href}>
          <a
            className="menu__link"
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => mobileSidebar.toggle()}>
            {link.label}
            <IconExternalLink />
          </a>
        </li>
      ))}
    </ul>
  );
}
