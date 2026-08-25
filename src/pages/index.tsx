import type { ReactNode } from 'react';
import Layout from '@theme/Layout';
import HeroSection from '../components/HeroSection';
import VMSection from '../components/VMSection';
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
      <main className="relative">
        <div
          className="fixed inset-0 pointer-events-none z-0"
          aria-hidden="true"
          style={{
            backgroundImage:
              'linear-gradient(rgba(0,229,229,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,229,0.02) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
        <div className="relative z-[1]">
          <HeroSection />
          <VMSection />
          <QuickstartSection />
          <FeaturesSection />
          <CodeSection />
          <ExploreSection />
        </div>
      </main>
    </Layout>
  );
}
