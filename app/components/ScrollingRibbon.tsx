import React, {useRef, useState} from 'react';
import {Link} from '@remix-run/react';

export default function ScrollingRibbon({
  items = [],
  handles = [],
  speed = 100,
}: {
  items: string[];
  speed?: number;
  handles?: string[];
}) {
  const renderedItems = [...items, ...items];
  const [isPaused, setIsPaused] = useState(false);

  return (
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
    <div
      className="relative w-full border-y-4 border-black bg-[var(--color-brand-yellow)] text-black font-extrabold uppercase tracking-widest text-lg sm:text-xl overflow-x-auto overflow-y-hidden select-none touch-pan-x scrollbar-hide"
      style={{
        WebkitOverflowScrolling: 'touch',
        touchAction: 'pan-x',
      }}
      role="marquee"
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
      onMouseDown={() => setIsPaused(true)}
      onMouseUp={() => setIsPaused(false)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div
        className="whitespace-nowrap inline-block animate-[scroll-left_linear_infinite] select-none"
        style={{
          animationDuration: `${speed}s`,
          animationPlayState: isPaused ? 'paused' : 'running',
        }}
      >
        {renderedItems.map((item, i) => (
          <React.Fragment key={`${item}-${i}`}>
            <Link
              to={`/products/${handles[i % handles.length]}`}
              className="inline-block px-8 hover:text-red-600 transition-colors"
            >
              {item}
            </Link>
            <span className="inline-block px-8">✦</span>
          </React.Fragment>
        ))}
      </div>

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
          .select-none {
            -webkit-user-select: none;
            user-select: none;
            -webkit-touch-callout: none;
          }
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
        `}
      </style>
    </div>
  );
}