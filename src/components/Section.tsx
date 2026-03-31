import type { ReactNode } from 'react';

type SectionProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
};

export default function Section({ title, subtitle, children }: SectionProps) {
  return (
    <section className="py-16 max-md:py-12 px-6 max-md:px-5 border-t border-[rgba(100,116,139,0.15)]">
      <div className="max-w-[1100px] mx-auto">
        <h2 className="text-[2rem] max-md:text-[1.6rem] font-extrabold text-white mb-3 text-center">{title}</h2>
        {subtitle && (
          <p className="text-[1.05rem] text-[#94a3b8] text-center mb-10 leading-[1.6]">{subtitle}</p>
        )}
        {children}
      </div>
    </section>
  );
}
