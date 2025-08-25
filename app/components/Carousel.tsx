import {Product} from '@shopify/hydrogen/storefront-api-types';
import React, {useRef, useEffect, useState, useCallback} from 'react';
import type { AttractionProductsQuery } from 'storefrontapi.generated';

type ProductNode = NonNullable<
  AttractionProductsQuery['collections']
>['nodes'][0]['products']['nodes'][0];

/**
 * Brand colors cycled through for items without images
 * Creates visual variety when product images are missing
 */
const BRAND_COLORS = [
  'var(--color-brand-yellow)',
  'var(--color-brand-red)',
  'var(--color-brand-green)',
  'var(--color-brand-blue)',
  'var(--color-brand-pink)',
];

/**
 * Carousel Component
 * 
 * A horizontally scrolling product carousel with center-focused items.
 * Features:
 * - Automatic centering of clicked items
 * - Keyboard navigation (arrow buttons)
 * - Active item scaling for emphasis
 * - Two display modes: 'card' and 'square'
 * 
 * @param products - Array of product nodes to display
 * @param imageShape - Display format: 'card' (default) or 'square'
 */
export default function Carousel({
  products, 
  imageShape = 'card'
}: {
  products: ProductNode[], 
  imageShape?: 'card' | 'square'
}) {
  // DOM reference to the scrollable container
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Currently active (centered) item index
  const [activeIndex, setActiveIndex] = useState(0);
  
  // Track active index in a ref to avoid re-creating observer
  const activeIndexRef = useRef(0);
  
  // Track if we're currently scrolling to prevent conflicts
  const [isScrolling, setIsScrolling] = useState(false);
  const isScrollingRef = useRef(false);
  
  // Debounce timer for intersection changes
  const updateTimer = useRef<NodeJS.Timeout>();
  
  // Flag to prevent initial auto-scroll on mount
  const hasInitialized = useRef(false);

  /**
   * Manually scroll to center a specific item
   * Uses precise calculations instead of scrollIntoView for consistency
   * 
   * @param index - Index of item to center
   */
  const scrollToItem = useCallback((index: number) => {
    const container = containerRef.current;
    if (!container) return;
    
    // Find the target element
    const element = container.querySelector<HTMLElement>(
      `[data-carousel-index="${index}"]`
    );
    if (!element) return;
    
    // Calculate exact scroll position to center the item
    // Formula: item's left position - half container width + half item width
    const itemLeft = element.offsetLeft;
    const itemWidth = element.offsetWidth;
    const containerWidth = container.clientWidth;
    const targetScrollLeft = itemLeft - (containerWidth / 2) + (itemWidth / 2);
    
    // Set scrolling flag to prevent observer conflicts
    setIsScrolling(true);
    isScrollingRef.current = true;
    
    // Perform the scroll
    container.scrollTo({
      left: targetScrollLeft,
      behavior: 'smooth'
    });
    
    // Clear scrolling flag after animation completes
    // 500ms should cover most smooth scroll durations
    setTimeout(() => {
      setIsScrolling(false);
      isScrollingRef.current = false;
    }, 500);
  }, []);

  /**
   * Determine which item is most centered in the viewport
   * Uses IntersectionObserver for performance
   */
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
  
    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      if (isScrollingRef.current) return;
      clearTimeout(updateTimer.current);
      console.log('Intersection detected');
      if (isScrollingRef.current) return;
        
        // Find the intersecting item (should be only one with tight margins)
        const intersectingEntry = entries.find(entry => entry.isIntersecting);
        console.log('Intersecting entry:', intersectingEntry);
        if (intersectingEntry) {
          const newIndex = parseInt(
            intersectingEntry.target.getAttribute('data-carousel-index') || '0'
          );

          console.log('New index:', newIndex, 'Current:', activeIndexRef.current);
          
          // Only update state, don't trigger scrolling
          if (newIndex !== activeIndexRef.current) {
            activeIndexRef.current = newIndex;
            setActiveIndex(newIndex);
          }
        }
    };
  
    const observer = new IntersectionObserver(handleIntersection, {
      rootMargin: '0px -48% 0px -48%', // Center 2% detection zone
    });
  
    const items = container.querySelectorAll<HTMLElement>('[data-carousel-index]');
    items.forEach((item) => observer.observe(item));
  
    return () => {
      clearTimeout(updateTimer.current);
      observer.disconnect();
    };
  }, []);


  /**
   * Handle item clicks
   * - Click on active item: navigate to product page
   * - Click on inactive item: scroll to center it
   */
  const handleItemClick = useCallback((index: number, href: string, event: React.MouseEvent) => {
    event.preventDefault();
    
    if (index === activeIndex && !isScrolling) {
      // Active item clicked - navigate to product
      window.location.href = href;
    } else {
      // Inactive item clicked - scroll to center
      setActiveIndex(index);
      activeIndexRef.current = index;
      scrollToItem(index);
    }
  }, [activeIndex, isScrolling, scrollToItem]);

  /**
   * Navigate to previous item
   */
  const scrollLeft = useCallback(() => {
    if (activeIndex > 0) {
      const newIndex = activeIndex - 1;
      setActiveIndex(newIndex);
      activeIndexRef.current = newIndex;
      scrollToItem(newIndex);
    }
  }, [activeIndex, scrollToItem]);

  /**
   * Navigate to next item
   */
  const scrollRight = useCallback(() => {
    if (activeIndex < products.length - 1) {
      const newIndex = activeIndex + 1;
      setActiveIndex(newIndex);
      activeIndexRef.current = newIndex;
      scrollToItem(newIndex);
    }
  }, [activeIndex, products.length, scrollToItem]);

  /**
   * Initialize carousel on mount
   * Centers the first item without animation
   */
  useEffect(() => {
    if (!hasInitialized.current && containerRef.current) {
      hasInitialized.current = true;
      
      // Find the first item
      const firstItem = containerRef.current.querySelector<HTMLElement>(
        '[data-carousel-index="0"]'
      );
      
      if (firstItem) {
        // Calculate center position
        const itemLeft = firstItem.offsetLeft;
        const itemWidth = firstItem.offsetWidth;
        const containerWidth = containerRef.current.clientWidth;
        const targetScrollLeft = itemLeft - (containerWidth / 2) + (itemWidth / 2);
        
        // Scroll without animation on initial load
        containerRef.current.scrollTo({
          left: targetScrollLeft,
          behavior: 'auto'
        });
      }
    }
  }, []);

  return (
    <div className="relative w-full bg-[var(--color-brand-cream)] overflow-hidden">
      <div className="relative">
        {/* Previous button - hidden on mobile */}
        <button
          className="absolute top-1/2 -translate-y-1/2 left-2 bg-black bg-opacity-50 text-white p-2 rounded-full z-20 hover:bg-opacity-75 transition hidden md:block"
          onClick={scrollLeft}
          aria-label="Scroll left"
          disabled={activeIndex === 0}
        >
          ‹
        </button>
        
        {/* Scrollable container */}
        <div
          ref={containerRef}
          className="
            flex gap-4
            overflow-x-auto snap-x snap-mandatory
            scroll-smooth scrollbar-hide
          "
          style={{
            // Vertical padding for visual breathing room
            paddingTop: '4rem',
            paddingBottom: '4rem',
            // Horizontal padding to allow centering of first/last items
            // Uses viewport width to ensure items can scroll to center
            paddingInline: 'max(1rem, calc(50vw - 180px))',
          }}
        >
          {products.map((product, i) => {
            const isActive = i === activeIndex;
            
            // Dynamic sizing based on active state
            const width = isActive
              ? `clamp(280px, 25vw, 360px)`  // Active: larger with viewport scaling
              : `clamp(200px, 18vw, 280px)`;  // Inactive: smaller
              
            const height = imageShape === 'square' 
              ? (isActive 
                ? `clamp(580px, 40vw, 720px)`  // Square active: taller
                : `clamp(420px, 32vw, 560px)`) // Square inactive
              : (isActive 
                ? `clamp(460px, 32vw, 580px)`  // Card active: medium height
                : `clamp(300px, 24vw, 460px)`); // Card inactive

            const image = product.images?.nodes[0]?.url || null;

            return (
              <button
                key={product.id}
                onClick={(e) => handleItemClick(i, `/products/${product.handle}`, e)}
                data-carousel-index={i}
                className={`
                  shrink-0 snap-center
                  transition-all duration-300 ease-in-out
                  transform-gpu
                  ${isActive 
                    ? 'scale-110 z-10'  // Active: scaled up and above others
                    : 'scale-95 opacity-70 hover:opacity-90'} 
                `}
                style={{
                  width,
                  height,
                  transformOrigin: 'center',
                  cursor: isActive ? 'pointer' : 'pointer',
                }}
                aria-label={`${product.title} - ${isActive ? 'Click to view' : 'Click to focus'}`}
              >
                <div className="h-full rounded-xl shadow-lg overflow-hidden bg-[var(--color-light)] border-[var(--color-dark)] border-4">
                  {imageShape === 'square' ? (
                    // Square layout: larger image with extended description area
                    <>
                      {/* Square image panel */}
                      <div
                        className="w-full aspect-square border-[var(--color-dark)] border-b-4 rounded-br-xl rounded-bl-xl overflow-hidden"
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
                      
                      {/* Extended description panel - 1.5x the image height */}
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

                          {/* Fade gradient to indicate more content */}
                          <div
                            className="pointer-events-none absolute bottom-0 left-0 right-0 h-8"
                            style={{
                              background: 'linear-gradient(to top, var(--color-light), rgba(255,255,255,0))',
                            }}
                          />

                          {/* Visual indicator for truncated content */}
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
                    // Card layout: compact with image and description
                    <>
                      {/* Card image with title overlay */}
                      <div
                        className="flex flex-col items-center justify-center p-4 border-[var(--color-dark)] border-b-4 rounded-br-xl rounded-bl-xl w-full"
                        style={{
                          height: isActive ? '40%' : '50%',
                          backgroundImage: image ? `url(${image})` : undefined,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          backgroundColor: image ? undefined : BRAND_COLORS[i % BRAND_COLORS.length],
                        }}
                      >
                        {!image && (
                          // Fallback when no image available
                          <>
                            <img
                              src="/logos/black.png"
                              alt="ZDT's Logo"
                              className="w-50"
                            />
                            <p className={`${isActive ? 'text-xl' : 'text-sm'} font-black text-[var(--color-dark)] text-center m-0 p-0`}>
                              {product.title}
                            </p>
                          </>
                        )}
                        {image && (
                          // Title overlay on image
                          <h3 className="text-[var(--color-light)] text-center h-full flex items-end justify-end drop-shadow-[0_2px_0_rgba(0,0,0,0.8)]">
                            {product.title}
                          </h3>
                        )}
                      </div>
                      
                      {/* Card description panel */}
                      <div className="p-4 bg-[var(--color-light)] h-[55%]">
                        <div className="relative h-full">
                          <div
                            className="prose max-w-none h-full overflow-hidden"
                            dangerouslySetInnerHTML={{
                              __html: product.descriptionHtml,
                            }}
                          />

                          {/* Fade gradient for truncated content */}
                          <div
                            className="pointer-events-none absolute bottom-0 left-0 right-0 h-8"
                            style={{
                              background: 'linear-gradient(to top, var(--color-light), rgba(255,255,255,0))',
                            }}
                          />

                          {/* Ellipsis indicator */}
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
        
        {/* Next button - hidden on mobile */}
        <button
          className="absolute top-1/2 -translate-y-1/2 right-2 bg-black bg-opacity-50 text-white p-2 rounded-full z-20 hover:bg-opacity-75 transition hidden md:block"
          onClick={scrollRight}
          aria-label="Scroll right"
          disabled={activeIndex === products.length - 1}
        >
          ›
        </button>
      </div>
    </div>
  );
}