import type { ReactNode } from 'react';
import Link from '@docusaurus/Link';
import { HelloIcon, BurnMintIcon, LockMintIcon, LockReleaseIcon, OracleIcon, ArrowIcon } from './icons';
import Section from './Section';

type QuickstartItem = {
  icon: ReactNode;
  title: string;
  description: string;
  link: string;
};

const quickstarts: QuickstartItem[] = [
  {
    icon: <HelloIcon />,
    title: 'Hello World',
    description: 'Send a simple cross-chain message between two EVM contracts. The easiest way to start.',
    link: '/docs/examples/hello-world',
  },
  {
    icon: <BurnMintIcon />,
    title: 'Burn & Mint Token',
    description: 'Deploy an ERC20 that burns on the source chain and mints on the destination.',
    link: '/docs/examples/burn-mint-token',
  },
  {
    icon: <LockMintIcon />,
    title: 'Lock & Mint Token',
    description: 'Lock tokens on source and mint a synthetic version on destination. No liquidity pools needed.',
    link: '/docs/examples/lock-mint-token',
  },
  {
    icon: <LockReleaseIcon />,
    title: 'Lock & Release Token',
    description: 'Lock tokens in a vault on one chain and release equivalent tokens on another.',
    link: '/docs/examples/lock-release-token',
  },
  {
    icon: <OracleIcon />,
    title: 'Private Oracle',
    description: 'Connect any off-chain data source to your smart contracts across chains.',
    link: '/docs/examples/private-oracle',
  },
];

export default function QuickstartSection() {
  return (
    <Section title="Start Building" subtitle="Issue cross-chain assets or send data to blockchains.">
      <div className="grid grid-cols-3 max-lg:grid-cols-2 max-md:grid-cols-1 gap-[1.25rem] mt-8">
        {quickstarts.map((item) => (
          <Link
            key={item.title}
            to={item.link}
            className="group flex flex-col py-7 px-6 bg-[#1a1b23] border border-[rgba(100,116,139,0.25)] border-t-2 border-t-[rgba(0,229,229,0.5)] rounded-2xl no-underline cursor-pointer transition-all duration-300 hover:no-underline hover:-translate-y-[3px] hover:border-t-[#00E5E5] hover:shadow-[0_8px_30px_rgba(0,229,229,0.08),0_0_1px_rgba(0,229,229,0.3)]"
          >
            <div className="mb-4">{item.icon}</div>
            <h3 className="text-white font-bold text-[1.05rem] mb-[0.4rem]">{item.title}</h3>
            <p className="text-[#94a3b8] flex-1 mb-4 text-[0.85rem] leading-[1.55]">{item.description}</p>
            <span className="inline-flex items-center gap-[0.35rem] text-[0.8rem] font-semibold text-[#00E5E5] group-hover:gap-[0.6rem] transition-all duration-200">
              View quickstart <ArrowIcon />
            </span>
          </Link>
        ))}
      </div>
    </Section>
  );
}
