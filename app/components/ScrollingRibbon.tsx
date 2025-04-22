import React from 'react';

export default function ScrollingRibbon({
  items = [],
  speed = 50, // lower = faster
}: {
  items: string[];
  speed?: number;
}) {
  return (
    <div className="relative w-full overflow-hidden border-y-4 border-black bg-yellow-400 text-black font-extrabold uppercase tracking-widest text-lg sm:text-xl">
      <div
        className="whitespace-nowrap inline-block animate-[scroll-left_linear_infinite]"
        style={{
          animationDuration: `${speed}s`,
        }}
      >
        {items.map((item) => (
          <>
            <span key={item} className="inline-block px-8">
              {item}
            </span>
            <span key={`${item}-*`} className="inline-block px-8">
              ✦
            </span>
          </>
        ))}
        {items.map((item) => (
          <>
            <span key={`copy-${item}`} className="inline-block px-8">
              {item}
            </span>
            <span key={`copy-${item}-*`} className="inline-block px-8">
              ✦
            </span>
        </>
        ))}
      </div>

      {/* Inline keyframes for Tailwind v4 compatibility */}
      <style>
        {`
          @keyframes scroll-left {
            0% {
              transform: translateX(0%);
            }
            100% {
              transform: translateX(-50%);
            }
          }
        `}
      </style>
    </div>
  );
}