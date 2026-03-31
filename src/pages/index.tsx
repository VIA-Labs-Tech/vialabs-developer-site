import type { ReactNode } from 'react';
import Layout from '@theme/Layout';
import HeroSection from '../components/HeroSection';
import QuickstartSection from '../components/QuickstartSection';
import FeaturesSection from '../components/FeaturesSection';
import CodeSection from '../components/CodeSection';
import ExploreSection from '../components/ExploreSection';

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
