import type { ReactNode } from 'react';
import { NetworkIcon, DirectIcon, ShieldIcon, CodeIcon } from './icons';
import Section from './Section';

type FeatureItem = {
  icon: ReactNode;
  title: string;
  description: string;
};

const features: FeatureItem[] = [
  {
    icon: <NetworkIcon />,
    title: '140+ Networks',
    description: 'Deploy once, reach every major chain. No fragmented deployments.',
  },
  {
    icon: <DirectIcon />,
    title: 'Direct Messaging',
    description: 'Smart contract to smart contract. No intermediary tokens or wrapped assets.',
  },
  {
    icon: <ShieldIcon />,
    title: 'Production Ready',
    description: 'Battle-tested infrastructure securing millions in cross-chain value.',
  },
  {
    icon: <CodeIcon />,
    title: 'Simple Integration',
    description: 'Inherit one contract, override one function. Ship in an afternoon.',
  },
];

export default function FeaturesSection() {
  return (
    <Section title="Built for Developers">
      <div className="grid grid-cols-2 max-md:grid-cols-1 gap-[1.25rem] mt-8">
        {features.map((item) => (
          <div
            key={item.title}
            className="flex items-start gap-4 p-6 bg-[#1a1b23] border border-[rgba(100,116,139,0.2)] rounded-2xl transition-all duration-[250ms] hover:border-[rgba(100,116,139,0.35)] hover:bg-[#1e1f28]"
          >
            <div className="shrink-0 mt-[2px]">{item.icon}</div>
            <div>
              <h3 className="text-white font-bold text-base mb-[0.3rem]">{item.title}</h3>
              <p className="text-[#94a3b8] m-0 text-[0.875rem] leading-[1.55]">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}
