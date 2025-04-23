import {Link} from '@remix-run/react';
import React, {useRef, useEffect, useState} from 'react';

interface Product {
  id: string;
  title: string;
  priceRange: {
    minVariantPrice: {amount: string; currencyCode: string};
  };
  descriptionHtml: string;
  handle: string;
  images: {
    altText: string;
    id: string;
    previewImage: {
      altText: string;
      height: number;
      width: number;
      id: string;
      transformed: {
        altText: string;
        height: number;
        width: number;
        id: string;
        url: string;
      };
      url: string;
    };
  }[];
}

// cycle these through the top panels
const BRAND_COLORS = [
  'var(--color-brand-yellow)',
  'var(--color-brand-red)',
  'var(--color-brand-green)',
  'var(--color-brand-blue)',
  'var(--color-brand-pink)',
];

export default function Carousel({products}: {products: Product[]}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const timeoutRef = useRef<number>();

  const hasMounted = useRef(false);

  // 1) watch which card is most centered
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const items = Array.from(
      container.querySelectorAll<HTMLElement>('[data-carousel-index]'),
    );

    const obs = new IntersectionObserver(
      (entries) => {
        // find all currently intersecting, then pick the one whose center is
        // closest to the container’s midpoint
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => {
            const c = container.clientWidth / 2;
            const aC =
              a.boundingClientRect.left + a.boundingClientRect.width / 2;
            const bC =
              b.boundingClientRect.left + b.boundingClientRect.width / 2;
            return Math.abs(aC - c) - Math.abs(bC - c);
          });
        if (!visible[0]) return;
        const idx = Number(
          visible[0].target.getAttribute('data-carousel-index'),
        );
        setActiveIndex(idx);
      },
      {root: container, threshold: 0.6},
    );

    items.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [products]);

  // 2) whenever activeIndex changes, smooth-scroll it into center
  useEffect(() => {
    window.clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => {
      const container = containerRef.current;
      const el = container?.querySelector<HTMLElement>(
        `[data-carousel-index="${activeIndex}"]`,
      );
      if (hasMounted.current) {
        el?.scrollIntoView({
          behavior: 'smooth',
          inline: 'center',
          block: 'nearest',
        });
      } else {
        hasMounted.current = true;
      }
    }, 100);
  }, [activeIndex]);
  
  const handleClick = (index: number, href: string) => {
    if (index === activeIndex) {
      window.location.href = href; // or use `navigate()` if using router
    } else {
      setActiveIndex(index);
    }
  };

  return (
    <div className="relative w-full bg-[var(--color-brand-cream)] overflow-hidden">
      <div
        ref={containerRef}
        className="
    flex gap-4
    overflow-x-auto snap-x snap-mandatory
    scroll-smooth scrollbar-hide
  "
        style={{
          paddingTop: '4rem',
          paddingBottom: '4rem',
          paddingLeft: 'calc(50vw - 180px)', // half viewport - half card width
          paddingRight: 'calc(50vw - 180px)',
        }}
      >
        {products.map((product, i) => {
          const isActive = i === activeIndex;
          const bgColor = BRAND_COLORS[i % BRAND_COLORS.length];
          const width = isActive
            ? `clamp(280px,25vw,360px)`
            : `clamp(200px,18vw,280px)`;
          const height = isActive
            ? `clamp(460px,32vw,580px)`
            : `clamp(300px,24vw,460px)`;

          return (
            <button
              key={product.id}
              onClick={() => handleClick(i, `/products/${product.handle}`)}
              data-carousel-index={i}
              className={`
                shrink-0 snap-center
                transition-transform duration-300 ease-in-out
                transform-gpu
                ${isActive ? 'scale-110 z-10' : 'scale-95 opacity-70'}
              `}
              style={{
                width,
                height,
                transformOrigin: 'center',
                //pointerEvents: isActive ? undefined : 'none',
              }}
            >
              <div className="h-full rounded-xl shadow-lg overflow-hidden bg-[var(--color-light)] border-[var(--color-dark)] border-4">
                {/* top colored panel */}
                <div
                  className="flex flex-col items-center justify-center p-4 border-[var(--color-dark)] border-b-4 rounded-br-xl rounded-bl-xl w-full"
                  style={{
                    backgroundColor: bgColor,
                    height: isActive ? '40%' : '50%',
                  }}
                >
                  <img
                    src="/logos/black.png"
                    alt="ZDT's Logo"
                    className="w-50"
                  />
                  <h3
                    className={`${isActive ? 'text-xl' : 'text-sm'} font-black text-[var(--color-dark)] text-center m-0 p-0`}
                  >
                    {product.title}
                  </h3>
                </div>
                {/* bottom white panel */}
                <div className="p-4 bg-[var(--color-light)] h-[55%]">
                  <div className="relative h-full">
                    <div
                      className="prose max-w-none h-full overflow-hidden"
                      dangerouslySetInnerHTML={{
                        __html: product.descriptionHtml,
                      }}
                    />

                    {/* fade‐out gradient */}
                    <div
                      className="pointer-events-none absolute bottom-0 left-0 right-0 h-8"
                      style={{
                        background:
                          'linear-gradient(to top, var(--color-light), rgba(255,255,255,0))',
                      }}
                    />

                    {/* ellipsis indicator */}
                    <br />
                    <span
                      className="pointer-events-none absolute left-0 right-0 bottom-[-10%] text-xl font-bold text-[var(--color-brand-dark)] text-center w-full"
                      aria-hidden="true"
                    >
                      …
                    </span>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
