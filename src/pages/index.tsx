import type { ReactNode } from 'react';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import styles from './index.module.css';

/* ── Inline SVG Icons ─────────────────────────────── */

function HelloIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="6" width="32" height="22" rx="4" stroke="#00E5E5" strokeWidth="2" />
      <path d="M12 15h8M12 20h5" stroke="#00E5E5" strokeWidth="1.5" opacity="0.5" />
      <path d="M4 12l16 8 16-8" stroke="#00E5E5" strokeWidth="1.5" opacity="0.3" />
      <circle cx="30" cy="30" r="6" stroke="#00E5E5" strokeWidth="1.5" />
      <path d="M28 30l2 2 3-4" stroke="#00E5E5" strokeWidth="1.5" />
    </svg>
  );
}

function BurnMintIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="14" cy="20" r="10" stroke="#00E5E5" strokeWidth="2" />
      <circle cx="26" cy="20" r="10" stroke="#00E5E5" strokeWidth="2" opacity="0.4" />
      <path d="M14 15v10M11 18l3-3 3 3" stroke="#00E5E5" strokeWidth="1.5" opacity="0.7" />
      <path d="M26 25v-10M23 22l3 3 3-3" stroke="#00E5E5" strokeWidth="1.5" opacity="0.7" />
    </svg>
  );
}

function LockReleaseIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="6" y="18" width="14" height="12" rx="2" stroke="#00E5E5" strokeWidth="2" />
      <path d="M10 18v-4a4 4 0 018 0v4" stroke="#00E5E5" strokeWidth="1.5" />
      <circle cx="13" cy="24" r="2" fill="#00E5E5" opacity="0.8" />
      <rect x="24" y="18" width="12" height="12" rx="2" stroke="#00E5E5" strokeWidth="1.5" opacity="0.5" />
      <path d="M28 18v-4a3 3 0 016 0" stroke="#00E5E5" strokeWidth="1.5" opacity="0.5" />
      <path d="M20 24h4" stroke="#00E5E5" strokeWidth="1.5" strokeDasharray="2 2" />
    </svg>
  );
}

function OracleIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="8" width="32" height="24" rx="4" stroke="#00E5E5" strokeWidth="2" />
      <path d="M12 18h16M12 24h10" stroke="#00E5E5" strokeWidth="1.5" opacity="0.5" />
      <circle cx="32" cy="12" r="4" fill="#00E5E5" opacity="0.8" />
      <path d="M32 8V4M36 12h4" stroke="#00E5E5" strokeWidth="1.5" opacity="0.6" />
    </svg>
  );
}

function NetworkIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="6" r="4" stroke="#00E5E5" strokeWidth="1.5" />
      <circle cx="6" cy="26" r="4" stroke="#00E5E5" strokeWidth="1.5" />
      <circle cx="26" cy="26" r="4" stroke="#00E5E5" strokeWidth="1.5" />
      <path d="M16 10v6m-4 4l-4 4m12-4l4 4" stroke="#00E5E5" strokeWidth="1.5" opacity="0.5" />
      <circle cx="16" cy="18" r="2" fill="#00E5E5" opacity="0.8" />
    </svg>
  );
}

function DirectIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="10" width="10" height="12" rx="2" stroke="#00E5E5" strokeWidth="1.5" />
      <rect x="20" y="10" width="10" height="12" rx="2" stroke="#00E5E5" strokeWidth="1.5" />
      <path d="M12 16h8" stroke="#00E5E5" strokeWidth="2" />
      <path d="M17 13l3 3-3 3" stroke="#00E5E5" strokeWidth="1.5" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 3L28 8v8c0 7-5.5 12.5-12 14C9.5 28.5 4 23 4 16V8l12-5z" stroke="#00E5E5" strokeWidth="1.5" />
      <path d="M12 16l3 3 6-6" stroke="#00E5E5" strokeWidth="2" />
    </svg>
  );
}

function CodeIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 10L4 16l6 6M22 10l6 6-6 6" stroke="#00E5E5" strokeWidth="2" />
      <path d="M18 6l-4 20" stroke="#00E5E5" strokeWidth="1.5" opacity="0.5" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M7 4l6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ── Data ──────────────────────────────────────────── */

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

const codeSnippet = `contract VIAHelloWorld is ViaIntegrationV1 {
    string public receivedMessage;

    function sendHello(uint64 destChainId) external payable {
        messageSend(destChainId, abi.encode("Hello World"), 1);
    }

    function messageProcess(
        uint256, uint64, bytes32, bytes32,
        bytes memory data, bytes memory, uint256
    ) internal override {
        receivedMessage = abi.decode(data, (string));
    }
}`;

/* ── Sections ──────────────────────────────────────── */

function HeroSection() {
  return (
    <section className={styles.hero}>
      <div className={styles.heroGrid} />
      <div className={styles.heroContent}>
        <span className={styles.heroBadge}>Cross-Chain Infrastructure</span>
        <h1 className={styles.heroTitle}>
          Build Across<br />Every Chain
        </h1>
        <p className={styles.heroSubtitle}>
          Secure, direct smart contract messaging across 140+ networks.<br />
          Ship cross-chain dApps in minutes, not months.
        </p>
        <div className={styles.heroButtons}>
          <Link to="/docs" className={styles.btnPrimary}>
            Get Started
          </Link>
          <Link
            to="https://github.com/VIA-Labs-Tech"
            className={styles.btnOutline}
          >
            View on GitHub
          </Link>
        </div>
      </div>
    </section>
  );
}

function QuickstartSection() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <h2 className={styles.sectionTitle}>Start Building</h2>
        <p className={styles.sectionSubtitle}>
          Issue cross-chain assets or send data to blockchains.
        </p>
        <div className={styles.cardGrid4}>
          {quickstarts.map((item) => (
            <Link key={item.title} to={item.link} className={styles.quickstartCard}>
              <div className={styles.quickstartIcon}>{item.icon}</div>
              <h3 className={styles.cardTitle}>{item.title}</h3>
              <p className={styles.cardDescription}>{item.description}</p>
              <span className={styles.cardLink}>
                View quickstart <ArrowIcon />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <h2 className={styles.sectionTitle}>Built for Developers</h2>
        <div className={styles.cardGrid2}>
          {features.map((item) => (
            <div key={item.title} className={styles.featureCard}>
              <div className={styles.featureIcon}>{item.icon}</div>
              <div>
                <h3 className={styles.featureTitle}>{item.title}</h3>
                <p className={styles.featureDescription}>{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CodeSection() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <h2 className={styles.sectionTitle}>It's This Simple</h2>
        <p className={styles.sectionSubtitle}>
          Inherit <code className={styles.inlineCode}>ViaIntegrationV1</code>, send a message, handle it on the other side. That's it.
        </p>
        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>
            <span className={styles.codeDot} />
            <span className={styles.codeDot} />
            <span className={styles.codeDot} />
            <span className={styles.codeFilename}>VIAHelloWorld.sol</span>
          </div>
          <pre className={styles.codePre}>
            <code>{codeSnippet}</code>
          </pre>
        </div>
        <Link to="/docs/examples/hello-world" className={styles.codeLink}>
          View full tutorial <ArrowIcon />
        </Link>
      </div>
    </section>
  );
}

function ExploreSection() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <h2 className={styles.sectionTitle}>Explore the Docs</h2>
        <div className={styles.cardGrid2}>
          {docLinks.map((item) => (
            <Link key={item.title} to={item.link} className={styles.docCard}>
              <div className={styles.docCardContent}>
                <h3 className={styles.docCardTitle}>{item.title}</h3>
                <p className={styles.docCardDescription}>{item.description}</p>
              </div>
              <ArrowIcon />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Page ──────────────────────────────────────────── */

export default function Home(): ReactNode {
  return (
    <Layout
      title="Developer Documentation"
      description="VIA Labs cross-chain infrastructure documentation for developers"
    >
      <main>
        <HeroSection />
        <QuickstartSection />
        <FeaturesSection />
        <CodeSection />
        <ExploreSection />
      </main>
    </Layout>
  );
}
