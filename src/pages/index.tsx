import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';

import styles from './index.module.css';

function HomepageHeader() {
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className="hero__title">
          VIA Labs Developer Docs
        </Heading>
        <p className="hero__subtitle">
          Build cross-chain applications with secure, direct smart contract messaging across 200+ networks.
        </p>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/docs">
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
}

type FeatureItem = {
  title: string;
  description: ReactNode;
  link: string;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'Cross-Chain Token',
    description: 'Deploy ERC20 tokens that transfer natively across blockchains.',
    link: '/docs/examples/crosschain-token',
  },
  {
    title: 'Cross-Chain NFT',
    description: 'Build NFTs that move seamlessly between networks with full metadata.',
    link: '/docs/examples/crosschain-nft',
  },
  {
    title: 'Private Oracle',
    description: 'Connect any off-chain data source to your smart contracts.',
    link: '/docs/examples/private-oracle',
  },
];

function Feature({title, description, link}: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className="padding-horiz--md padding-vert--lg">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
        <Link to={link}>View quickstart &rarr;</Link>
      </div>
    </div>
  );
}

export default function Home(): ReactNode {
  return (
    <Layout
      title="Developer Documentation"
      description="VIA Labs cross-chain infrastructure documentation for developers">
      <HomepageHeader />
      <main>
        <section className={styles.features}>
          <div className="container">
            <div className="row">
              {FeatureList.map((props, idx) => (
                <Feature key={idx} {...props} />
              ))}
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}
