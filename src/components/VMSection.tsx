import type { ReactNode } from 'react';
import Link from '@docusaurus/Link';
import { EvmIcon, CardanoIcon, MidnightIcon, ArrowIcon } from './icons';
import Section from './Section';

type VMItem = {
  icon: ReactNode;
  title: string;
  description: string;
  link: string;
  cta: string;
};

const vms: VMItem[] = [
  {
    icon: <EvmIcon />,
    title: 'EVM',
    description: 'Solidity contracts on 150+ EVM networks. Inherit one contract, override one function.',
    link: '/docs/examples/hello-world',
    cta: 'View quickstart',
  },
  {
    icon: <CardanoIcon />,
    title: 'Cardano',
    description: 'How messaging works on Cardano — UTxOs, validators, and the reference clients.',
    link: '/docs/examples/cardano/overview',
    cta: 'View overview',
  },
  {
    icon: <MidnightIcon />,
    title: 'Midnight',
    description: 'Compact contracts with ZK proofs — the client shape, endpoints, and the tested version set.',
    link: '/docs/examples/midnight/overview',
    cta: 'View overview',
  },
];

export default function VMSection() {
  return (
    <Section title="Choose Your VM" subtitle="VIA connects EVM, Cardano, and Midnight. Pick where you build.">
      <div className="grid grid-cols-3 max-lg:grid-cols-2 max-md:grid-cols-1 gap-[1.25rem] mt-8">
        {vms.map((item) => (
          <Link
            key={item.title}
            to={item.link}
            className="group flex flex-col py-7 px-6 bg-[#1a1b23] border border-[rgba(100,116,139,0.25)] border-t-2 border-t-[rgba(0,229,229,0.5)] rounded-2xl no-underline cursor-pointer transition-all duration-300 hover:no-underline hover:-translate-y-[3px] hover:border-t-[#00E5E5] hover:shadow-[0_8px_30px_rgba(0,229,229,0.08),0_0_1px_rgba(0,229,229,0.3)]"
          >
            <div className="mb-4">{item.icon}</div>
            <h3 className="text-white font-bold text-[1.05rem] mb-[0.4rem]">{item.title}</h3>
            <p className="text-[#94a3b8] flex-1 mb-4 text-[0.85rem] leading-[1.55]">{item.description}</p>
            <span className="inline-flex items-center gap-[0.35rem] text-[0.8rem] font-semibold text-[#00E5E5] group-hover:gap-[0.6rem] transition-all duration-200">
              {item.cta} <ArrowIcon />
            </span>
          </Link>
        ))}
      </div>
    </Section>
  );
}
