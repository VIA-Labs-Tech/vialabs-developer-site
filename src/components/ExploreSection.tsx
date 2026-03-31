import Link from '@docusaurus/Link';
import { ArrowIcon } from './icons';
import Section from './Section';

type DocLinkItem = {
  title: string;
  description: string;
  link: string;
};

const docLinks: DocLinkItem[] = [
  {
    title: 'Technology Overview',
    description: 'Understand how VIA Labs cross-chain messaging works under the hood.',
    link: '/docs/general/technology-overview',
  },
  {
    title: 'SDK Reference',
    description: 'Complete API reference for the VIA cross-chain package.',
    link: '/docs/general/package',
  },
  {
    title: 'Supported Networks',
    description: 'Full list of supported chains, chain IDs, and contract addresses.',
    link: '/docs/general/supported-networks',
  },
  {
    title: 'Fees & Gas',
    description: 'How gas estimation and cross-chain fees work.',
    link: '/docs/general/fees-and-gas',
  },
];

export default function ExploreSection() {
  return (
    <Section title="Explore the Docs">
      <div className="grid grid-cols-2 max-md:grid-cols-1 gap-[1.25rem] mt-8">
        {docLinks.map((item) => (
          <Link
            key={item.title}
            to={item.link}
            className="flex items-center justify-between py-5 px-6 bg-[#1a1b23] border border-[rgba(100,116,139,0.2)] rounded-[0.875rem] no-underline text-[#64748b] transition-all duration-[250ms] hover:border-[rgba(0,229,229,0.3)] hover:bg-[#1e1f28] hover:text-[#00E5E5] hover:no-underline"
          >
            <div className="flex-1">
              <h3 className="text-white font-bold text-[0.95rem] mb-1">{item.title}</h3>
              <p className="text-[#64748b] m-0 text-[0.8rem] leading-normal">{item.description}</p>
            </div>
            <ArrowIcon />
          </Link>
        ))}
      </div>
    </Section>
  );
}
