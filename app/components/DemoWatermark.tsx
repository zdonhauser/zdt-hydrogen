import React from 'react';

/**
 * DemoWatermark Component
 * Displays a persistent "DEMO" indicator on the demo site
 * Multiple style options available via 'variant' prop
 */

type WatermarkVariant = 'ribbon' | 'badge' | 'watermark';

interface DemoWatermarkProps {
  variant?: WatermarkVariant;
}

export function DemoWatermark({ variant = 'ribbon' }: DemoWatermarkProps) {
  
  // Ribbon style - corner ribbon
  if (variant === 'ribbon') {
    return (
      <div className="fixed top-0 right-0 z-[90] overflow-hidden pointer-events-none w-32 h-32">
        <div 
          className="
            absolute top-5 -right-10
            w-40 h-10
            bg-red-600
            transform rotate-45
            shadow-lg
            pointer-events-auto
          "
        >
          <div className="
            h-full flex items-center justify-center
            text-white font-black text-sm uppercase tracking-wider
            border-y-2 border-white/30
          ">
            DEMO
          </div>
        </div>
      </div>
    );
  }

  // Badge style - floating badge
  if (variant === 'badge') {
    return (
      <div className="fixed top-4 right-4 z-[90]">
        <div className="
          bg-red-600 text-white
          px-4 py-2 rounded-full
          font-black text-xs uppercase tracking-wider
          shadow-lg border-2 border-white
          animate-pulse
        ">
          Demo Site
        </div>
      </div>
    );
  }

  // Watermark style - subtle background text
  if (variant === 'watermark') {
    return (
      <div className="fixed inset-0 z-[1] pointer-events-none overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.2]">
          <div 
            className="
              text-[20rem] font-black uppercase
              text-black select-none
              transform -rotate-12
            "
            style={{
              fontFamily: 'system-ui, -apple-system, sans-serif',
              letterSpacing: '-0.05em',
            }}
          >
            DEMO
          </div>
        </div>
      </div>
    );
  }

  return null;
}

/**
 * Combination component that shows both ribbon and watermark
 * for maximum clarity that this is a demo site
 */
export function DemoIndicators() {
  return (
    <>
      <DemoWatermark variant="ribbon" />
      <DemoWatermark variant="watermark" />
    </>
  );
}