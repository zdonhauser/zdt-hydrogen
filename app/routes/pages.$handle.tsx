import {type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import { useLoaderData, type MetaFunction } from 'react-router';
import PartyPage from '~/components/PartyPage';

export const meta: MetaFunction<typeof loader> = ({data}) => {
  return [{title: `ZDT's Amusement Park | ${data?.page.title ?? ''}`}];
};

export async function loader(args: LoaderFunctionArgs) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  return {...deferredData, ...criticalData};
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 */
async function loadCriticalData({context, params}: LoaderFunctionArgs) {
  if (!params.handle) {
    throw new Error('Missing page handle');
  }

  const [{page}] = await Promise.all([
    context.storefront.query(PAGE_QUERY, {
      variables: {
        handle: params.handle,
      },
    }),
    // Add other queries here, so that they are loaded in parallel
  ]);

  if (!page) {
    throw new Response('Not Found', {status: 404});
  }

  return {
    page,
  };
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
function loadDeferredData({context}: LoaderFunctionArgs) {
  return {};
}

export default function Page() {
  const {page} = useLoaderData<typeof loader>();

  if (page.handle === 'party') {
    return <PartyPage/>;
  }
  
  // Special styling for About Us page
  if (page.handle === 'about-us') {
    return (
      <div className="page bg-gradient-to-b from-[var(--color-brand-blue)] to-[var(--color-light)] min-h-screen py-12 px-4">
        <div className="max-w-4xl mx-auto bg-[var(--color-light)] p-6 md:p-8 rounded-xl shadow-2xl border-4 border-[var(--color-brand-dark)]">
          <header className="mb-8 text-center">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-wide text-[var(--color-dark)] mb-4">
              {page.title}
            </h1>
            <div className="h-1 w-24 bg-[var(--color-brand-blue)] mx-auto rounded-full"></div>
          </header>
          <main className="prose prose-lg max-w-none">
            <div 
              className="text-[var(--color-dark)] space-y-6"
              dangerouslySetInnerHTML={{
                __html: page.body
                  .replace(/<p>/g, '<p class="mb-4">')
                  .replace(/<h2>/g, '<h2 class="text-2xl font-bold text-[var(--color-brand-dark)] mt-8 mb-4">')
                  .replace(/<ul>/g, '<ul class="list-disc pl-6 space-y-2 my-4">')
                  .replace(/<ol>/g, '<ol class="list-decimal pl-6 space-y-2 my-4">')
                  .replace(/<a /g, '<a class="text-[var(--color-brand-blue)] hover:underline font-medium" ')
                  .replace(/<img([^>]*)>/g, (match, attributes) => {
                    // Add classes to images while preserving existing attributes
                    return `<img${attributes} class="mx-auto my-6 max-w-full h-auto rounded-lg border-2 border-[var(--color-brand-dark)] shadow-md" />`;
                  })
              }}
            />
          </main>
          
          {/* Team section if needed */}
          {/* <section className="mt-12">
            <h2 className="text-2xl font-bold text-[var(--color-brand-dark)] mb-6">Our Team</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              Team member cards can go here
            </div>
          </section> */}
          
          <div className="mt-12 pt-8 border-t-2 border-[var(--color-brand-blue)]">
            <p className="text-center text-[var(--color-brand-dark)] font-medium">
              Thanks for being part of our adventure! 🚀
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  // Default page template for other pages
  return (
    <div className="page bg-gradient-to-b from-[var(--color-brand-blue)] to-[var(--color-light)] min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto bg-[var(--color-light)] p-6 md:p-8 rounded-xl shadow-2xl border-4 border-[var(--color-brand-dark)]">
        <header className="mb-8">
          <h1 className="text-3xl font-extrabold text-[var(--color-brand-dark)]">
            {page.title}
          </h1>
        </header>
        <main 
          className="prose max-w-none text-[var(--color-dark)]"
          dangerouslySetInnerHTML={{
            __html: page.body
              .replace(/<p>/g, '<p class="mb-4">')
              .replace(/<h2>/g, '<h2 class="text-2xl font-bold text-[var(--color-brand-dark)] mt-8 mb-4">')
          }}
        />
      </div>
    </div>
  );
}

const PAGE_QUERY = `#graphql
  query Page(
    $language: LanguageCode,
    $country: CountryCode,
    $handle: String!
  )
  @inContext(language: $language, country: $country) {
    page(handle: $handle) {
      id
      title
      handle
      body
      seo {
        description
        title
      }
    }
  }
` as const;
