import Link from '@docusaurus/Link';

export default function HeroSection() {
  return (
    <section
      className="relative text-center overflow-hidden px-6 max-md:px-5 pt-24 pb-20 max-md:pt-16 max-md:pb-14"
      style={{ background: 'linear-gradient(180deg, #0F1117 0%, #1a1b23 100%)' }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(rgba(0,229,229,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,229,0.04) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
          maskImage: 'radial-gradient(ellipse at 50% 50%, black 20%, transparent 75%)',
          WebkitMaskImage: 'radial-gradient(ellipse at 50% 50%, black 20%, transparent 75%)',
        }}
      />
      <div className="relative max-w-[720px] mx-auto">
        <span className="inline-block rounded-full uppercase text-[#00E5E5] font-semibold py-[0.35rem] px-4 mb-6 text-[0.75rem] tracking-[0.05em] bg-[rgba(0,229,229,0.1)] border border-[rgba(0,229,229,0.25)]">
          Cross-Chain Infrastructure
        </span>
        <h1 className="text-white font-black text-[3rem] max-lg:text-[2.75rem] max-md:text-[2.25rem] leading-[1.1] mb-5">
          Build Across<br />Every Chain
        </h1>
        <p className="text-[#94a3b8] text-[1.125rem] max-md:text-base leading-[1.7] mb-10">
          Secure, direct smart contract messaging across 140+ networks.<br className="max-md:hidden" />
          Ship cross-chain dApps in minutes, not months.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link
            to="/docs"
            className="inline-flex items-center py-3 px-8 text-[0.95rem] font-semibold rounded-full no-underline transition-all duration-200 hover:no-underline hover:-translate-y-px hover:shadow-[0_0_30px_rgba(0,229,229,0.4)]"
            style={{ color: '#0F1117', background: 'linear-gradient(135deg, #00E5E5, #00CED1)', boxShadow: '0 0 20px rgba(0,229,229,0.25)' }}
          >
            Get Started
          </Link>
          <Link
            to="https://github.com/VIA-Labs-Tech"
            className="inline-flex items-center py-3 px-8 text-[0.95rem] font-semibold text-[#e2e8f0] bg-transparent border border-[rgba(100,116,139,0.4)] rounded-full no-underline transition-all duration-200 hover:no-underline hover:text-white hover:border-[rgba(100,116,139,0.7)] hover:bg-[rgba(255,255,255,0.03)]"
          >
            View on GitHub
          </Link>
        </div>
      </div>
    </section>
  );
}
