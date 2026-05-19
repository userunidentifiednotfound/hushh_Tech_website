import React from 'react';

interface HushhIDHeroProps {
  userName?: string;
  onCreateClick: () => void;
}

const BENEFITS = [
  'Create your investor profile once.',
  'Save to wallet. Share anywhere.',
  'No more repetitive forms.',
];

/**
 * Mobile-first investor profile hero rebuilt with a WorldQuant-inspired,
 * white-on-white editorial layout, hairline micro-accents, and subtle tactile states.
 */
export const HushhIDHero: React.FC<HushhIDHeroProps> = ({
  userName = 'there',
  onCreateClick,
}) => {

  return (
    <section className="bg-white">
      <div
        className="mx-auto max-w-[520px] px-6 pt-[56px] pb-[48px] sm:px-8"
        style={{
          fontFamily:
            '"Inter", "SF Pro Display", "Segoe UI", system-ui, -apple-system, sans-serif',
        }}
      >
        {/* Header block */}
        <div className="text-left">
          <p
            className="text-[12px] font-semibold tracking-[0.18em] uppercase text-[#6B7280] mb-4"
            style={{ letterSpacing: '0.18em' }}
          >
            Investor Profile
          </p>
          <h1 className="text-[36px] font-[500] leading-[1.10] text-[#0B1120] mb-5">
            Hello {userName},
          </h1>
          <p className="text-[18px] leading-[1.65] text-[#475569] max-w-[90%] mb-8">
            Create your verified investor identity once and carry it everywhere—secure, shareable, and ready when you are.
          </p>
          <div className="relative h-px w-full bg-[#E5E7EB]">
            <span
              aria-hidden
              className="absolute left-0 top-1/2 h-[2px] w-4 -translate-y-1/2 bg-[#00A9E0]"
            />
          </div>
        </div>

        {/* Benefit panel */}
        <div className="mt-6">
          <ul className="rounded-[18px] border border-[#E5E7EB] divide-y divide-[#E5E7EB] overflow-hidden list-none p-0">
            {BENEFITS.map((benefit) => (
              <li
                key={benefit}
                className="flex items-center gap-4 px-4 py-4 min-h-[64px] text-left transition-colors duration-150 hover:bg-[#F9FAFB] active:bg-[#F3F4F6]"
              >
                <span className="w-2 h-2 rounded-full bg-[#00A9E0] flex-shrink-0 mt-[2px]" aria-hidden="true" />
                <p className="text-[18px] font-semibold leading-[1.45] text-[#111827]">{benefit}</p>
              </li>
            ))}
          </ul>
        </div>

        {/* CTA area */}
        <div className="mt-6 space-y-3">
          <button
            onClick={onCreateClick}
            aria-label="Create Your Hushh ID"
            className="w-full h-[54px] rounded-[16px] text-[#0B1120] text-[17px] font-semibold tracking-[0.01em] transition-[transform,filter,background] duration-150 hover:brightness-[1.04] active:scale-[0.985] active:brightness-[0.94] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0B1120] focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            style={{
              background: 'linear-gradient(to right, #00A9E0, #6DD3EF)',
              fontWeight: 500,
            }}
          >
            Create Your Hushh ID →
          </button>
          <p className="text-[13px] leading-[1.45] text-[#6B7280]">
            Takes under a minute. Your details stay private.
          </p>
        </div>
      </div>
    </section>
  );
};

export default HushhIDHero;
