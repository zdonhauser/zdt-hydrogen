import * as React from 'react';
import { useEffect, useRef } from 'react';
import {Pagination} from '@shopify/hydrogen';

/**
 * <PaginatedResourceSection > is a component that encapsulate how the previous and next behaviors throughout your application.
 */
export function PaginatedResourceSection<NodesType>({
  connection,
  children,
  resourcesClassName,
}: {
  connection: React.ComponentProps<typeof Pagination<NodesType>>['connection'];
  children: React.FunctionComponent<{node: NodesType; index: number}>;
  resourcesClassName?: string;
}) {
  const nextLinkRef = useRef<HTMLAnchorElement>(null);

  return (
    <Pagination connection={connection}>
      {({nodes, isLoading, PreviousLink, NextLink}) => {
        const resourcesMarkup = nodes.map((node, index) =>
          children({node, index}),
        );

        // Infinite scroll effect
        useEffect(() => {
          const nextLink = nextLinkRef.current;
          if (!nextLink) return;

          const observer = new IntersectionObserver(
            (entries) => {
              entries.forEach((entry) => {
                if (entry.isIntersecting && !isLoading) {
                  nextLink.click();
                }
              });
            },
            { rootMargin: '200px' }
          );

          observer.observe(nextLink);

          return () => {
            observer.disconnect();
          };
        }, [isLoading]);

        return (
          <div>
            <div className="text-center mb-6">
              <PreviousLink className="inline-block bg-[var(--color-brand-blue)] hover:bg-[var(--color-brand-blue-hover)] text-white font-black px-8 py-4 rounded-xl border-4 border-[var(--color-brand-dark)] shadow-lg hover:shadow-xl transition-all duration-200 text-lg uppercase tracking-wider transform hover:scale-105">
                {isLoading ? 'Loading...' : <span>↑ Load Previous</span>}
              </PreviousLink>
            </div>
            
            {resourcesClassName ? (
              <div className={resourcesClassName}>{resourcesMarkup}</div>
            ) : (
              resourcesMarkup
            )}
            
            <div className="text-center mt-8">
              <NextLink 
                ref={nextLinkRef}
                className="inline-block bg-[var(--color-brand-yellow)] hover:bg-[var(--color-brand-yellow-hover)] text-[var(--color-brand-dark)] font-black px-12 py-6 rounded-xl border-4 border-[var(--color-brand-dark)] shadow-lg hover:shadow-xl transition-all duration-200 text-xl uppercase tracking-wider transform hover:scale-105"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8v8H4z"/>
                    </svg>
                    Loading More...
                  </span>
                ) : (
                  <span>Load More ↓</span>
                )}
              </NextLink>
            </div>
          </div>
        );
      }}
    </Pagination>
  );
}
