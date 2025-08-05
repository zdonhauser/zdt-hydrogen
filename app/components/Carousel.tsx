import {Product} from '@shopify/hydrogen/storefront-api-types';
import React, {useRef, useEffect, useState} from 'react';
import type { AttractionProductsQuery } from 'storefrontapi.generated';


type ProductNode = NonNullable<
  AttractionProductsQuery['collections']
>['nodes'][0]['products']['nodes'][0];


// cycle these through the top panels
const BRAND_COLORS = [
  'var(--color-brand-yellow)',
  'var(--color-brand-red)',
  'var(--color-brand-green)',
  'var(--color-brand-blue)',
  'var(--color-brand-pink)',
];

export default function Carousel({products, imageShape = 'card'}: {products: ProductNode[], imageShape?: 'card' | 'square'}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [prevActiveIndex, setPrevActiveIndex] = useState(0);
  const timeoutRef = useRef<number>();
  const scrolling = useRef(false);
  const isMounted = useRef(false);
  // 1) watch which card is most centered
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const items = Array.from(
      container.querySelectorAll<HTMLElement>('[data-carousel-index]'),
    );

    const visibleEntries = new Map<number, IntersectionObserverEntry>();

    const obs = new IntersectionObserver(
      (entries) => {
        const containerCenter =
          container.scrollLeft + container.clientWidth / 2;

        entries.forEach((entry) => {
          const indexAttr = entry.target.getAttribute('data-carousel-index');
          if (!indexAttr) return;
          const idx = Number(indexAttr);
          if (entry.isIntersecting) {
            visibleEntries.set(idx, entry);
          } else {
            visibleEntries.delete(idx);
          }
        });

        const sortedVisible = Array.from(visibleEntries.entries())
          .map(([idx, entry]) => {
            const el = entry.target as HTMLElement;
            const elCenter = el.offsetLeft + el.offsetWidth / 2;
            const distance = Math.abs(elCenter - containerCenter);
            return {idx, distance};
          })
          .sort((a, b) => a.distance - b.distance);

        if (sortedVisible.length === 0) return;

        console.log(
          'number of visible items: ',
          sortedVisible.length,
          'visible item indices: ',
          sortedVisible.map((v) => v.idx),
          'distances: ',
          sortedVisible.map((v) => v.distance),
        );

        const closestIdx = sortedVisible[0].idx;
        console.log('closest index: ', closestIdx);

        if (scrolling.current) {
          console.log('skipping centerline scroll');
          return;
        }
        console.log('setting active index to centerline index ', closestIdx);
        setActiveIndex(closestIdx);
      },
      {root: container, threshold: 0.6},
    );

    items.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [products]);

  // 2) whenever activeIndex changes, smooth-scroll it into center
  useEffect(() => {
    console.log('active index changed to', activeIndex);
    window.clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => {
      if (scrolling.current) {
        console.log('skipping scroll');
        return;
      }
      console.log('scrolling to', activeIndex);
      scrolling.current = true;
      setTimeout(
        () => {
          scrolling.current = false;
        },
        Math.min(300 * Math.abs(activeIndex - prevActiveIndex), 300),
      );
      setPrevActiveIndex(activeIndex);
      const container = containerRef.current;
      const el = container?.querySelector<HTMLElement>(
        `[data-carousel-index="${activeIndex}"]`,
      );
      if (!isMounted.current) {
        isMounted.current = true;
        return;
      }
      el?.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'center',
      });
    }, 100);
  }, [activeIndex]);

  const handleClick = (index: number, href: string) => {
    if (index === activeIndex && !scrolling.current) {
      window.location.href = href;
    } else {
      console.log('click on index', index);
      setActiveIndex(index);
    }
  };

  const scrollLeft = () => {
    if (activeIndex > 0) {
      setActiveIndex(activeIndex - 1);
    }
  };

  const scrollRight = () => {
    if (activeIndex < products.length - 1) {
      setActiveIndex(activeIndex + 1);
    }
  };

  return (
    <div className="relative w-full bg-[var(--color-brand-cream)] overflow-hidden">
      <div className="relative">
        <button
          className="absolute top-1/2 -translate-y-1/2 left-2 bg-black bg-opacity-50 text-white p-2 rounded-full z-20 hover:bg-opacity-75 transition hidden md:block"
          onClick={scrollLeft}
          aria-label="Scroll left"
        >
          ‹
        </button>
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
            paddingInline: 'max(1rem, calc(50vw - 180px))',
          }}
        >
          {products.map((product, i) => {
            const isActive = i === activeIndex;
            const width = isActive
              ? `clamp(280px,25vw,360px)`
              : `clamp(200px,18vw,280px)`;
            const height = imageShape === 'square' 
              ? (isActive ? `clamp(580px,40vw,720px)` : `clamp(420px,32vw,560px)`)
              : (isActive ? `clamp(460px,32vw,580px)` : `clamp(300px,24vw,460px)`);

            const image = product.images?.nodes[0]?.url || null;

            return (
              <button
                key={product.id}
                onMouseDown={() => handleClick(i, `/products/${product.handle}`)}
                data-carousel-index={i}
                className={`
                  shrink-0 snap-center
                  transition-transform duration-300 ease-in-out
                  transform-gpu
                  ${isActive ? 'scale-110 z-10 ' : 'scale-95 opacity-70'}
                `}
                style={{
                  width,
                  height,
                  transformOrigin: 'center',
                  //pointerEvents: isActive ? undefined : 'none',
                }}
              >
                <div className="h-full rounded-xl shadow-lg overflow-hidden bg-[var(--color-light)] border-[var(--color-dark)] border-4">
                  {imageShape === 'square' ? (
                    <>
                      {/* Square image panel */}
                      <div
                        className={`w-full aspect-square border-[var(--color-dark)] border-b-4 rounded-br-xl rounded-bl-xl overflow-hidden`}
                        style={{
                          backgroundImage: image ? `url(${image})` : undefined,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          backgroundColor: image ? undefined : BRAND_COLORS[i % BRAND_COLORS.length],
                        }}
                      >
                        {!image && (
                          <div className="flex flex-col items-center justify-center h-full p-4">
                            <img
                              src="/logos/black.png"
                              alt="ZDT's Logo"
                              className="w-50"
                            />
                          </div>
                        )}
                      </div>
                      {/* Bottom panel with title and description - 1.5x the image height */}
                      <div className="p-4 bg-[var(--color-light)]" style={{ height: '150%' }}>
                        <div className="relative h-full">
                          <h3 className={`${isActive ? 'text-xl' : 'text-lg'} font-black text-[var(--color-dark)] text-center mb-3`}>
                            {product.title}
                          </h3>
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
                    </>
                  ) : (
                    <>
                      {/* Card shape - image with title overlay */}
                      <div
                        className={`flex flex-col items-center justify-center p-4 border-[var(--color-dark)] border-b-4 rounded-br-xl rounded-bl-xl w-full`}
                        style={{
                          height: isActive ? '40%' : '50%',
                          backgroundImage: image ? `url(${image})` : undefined,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          backgroundColor: image ? undefined : BRAND_COLORS[i % BRAND_COLORS.length],
                        }}
                      >
                        {!image && (
                          <>
                            <img
                              src="/logos/black.png"
                              alt="ZDT's Logo"
                              className="w-50"
                            />
                            <p
                              className={`${isActive ? 'text-xl' : 'text-sm'} font-black text-[var(--color-dark)] text-center m-0 p-0`}
                            >
                              {product.title}
                            </p>
                          </>
                        )}
                        {image && (
                          <h3
                            className="text-[var(--color-light)] text-center h-full flex items-end justify-end drop-shadow-[0_2px_0_rgba(0,0,0,0.8)]"
                          >
                            {product.title}
                          </h3>
                        )}
                      </div>
                      {/* Card shape - description only panel */}
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
                    </>
                  )}
                </div>
              </button>
            );
          })}
        </div>
        <button
          className="absolute top-1/2 -translate-y-1/2 right-2 bg-black bg-opacity-50 text-white p-2 rounded-full z-20 hover:bg-opacity-75 transition hidden md:block"
          onClick={scrollRight}
          aria-label="Scroll right"
        >
          ›
        </button>
      </div>
    </div>
  );
}
