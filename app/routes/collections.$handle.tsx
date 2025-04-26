import {redirect, type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {useLoaderData, Link, type MetaFunction} from '@remix-run/react';
import {
  getPaginationVariables,
  Image,
  Money,
  Analytics,
} from '@shopify/hydrogen';
import type {ProductItemFragment} from 'storefrontapi.generated';
import {useVariantUrl} from '~/lib/variants';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import PartyCalendar from '~/components/PartyCalendar';

export const meta: MetaFunction<typeof loader> = ({data}) => {
  return [{title: `Hydrogen | ${data?.collection.title ?? ''} Collection`}];
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
async function loadCriticalData({
  context,
  params,
  request,
}: LoaderFunctionArgs) {
  const {handle} = params;
  const {storefront} = context;
  const paginationVariables = getPaginationVariables(request, {
    pageBy: handle === 'party-booking' ? 100 : 8,
  });

  if (!handle) {
    throw redirect('/collections');
  }

  const [{collection}] = await Promise.all([
    storefront.query(COLLECTION_QUERY, {
      variables: {handle, ...paginationVariables},
      // Add other queries here, so that they are loaded in parallel
    }),
  ]);

  if (!collection) {
    throw new Response(`Collection ${handle} not found`, {
      status: 404,
    });
  }

  return {
    collection,
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

export default function Collection() {
  const {collection} = useLoaderData<typeof loader>();
  const collectionTitle = collection.title;

  return (
    <div className="relative flex flex-col items-center px-4 py-10 bg-[var(--color-brand-green)] text-[var(--color-dark)] overflow-hidden min-h-screen">
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden flex flex-col items-center">
        {[...Array(30)].map((_, idx) => (
          <div
            key={collectionTitle + idx}
            className={`flex whitespace-nowrap text-5xl md:text-8xl font-extrabold leading-none ${
              idx % 2 === 0
                ? 'animate-[scroll-left_linear_infinite]'
                : 'animate-[scroll-right_linear_infinite]'
            } ${idx % 2 === 0 ? 'opacity-10' : 'opacity-25'} text-[var(--color-brand-yellow)]`}
            style={{
              animationDuration: `${30 + idx * 5}s`,
              animationTimingFunction: 'linear',
              animationIterationCount: 'infinite',
            }}
          >
            {collectionTitle}&nbsp;{collectionTitle}&nbsp;{collectionTitle}
            &nbsp;{collectionTitle}&nbsp;{collectionTitle}&nbsp;
            {collectionTitle}&nbsp;{collectionTitle}&nbsp;{collectionTitle}
            &nbsp;{collectionTitle}&nbsp;{collectionTitle}&nbsp;
            {collectionTitle}&nbsp;{collectionTitle}&nbsp;{collectionTitle}
            &nbsp;{collectionTitle}&nbsp;{collectionTitle}&nbsp;
            {collectionTitle}&nbsp;
          </div>
        ))}
      </div>
      {collection.title === 'Party Rooms' && (
        <PartyCalendar products={collection.products.nodes} />
      )}
      {!(collection.title === 'Party Rooms') && (
        <div className="relative z-10 w-full max-w-7xl flex flex-col items-center">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 text-center">
            {collection.title}
          </h1>
          <p className="text-lg md:text-xl text-center mb-10 max-w-2xl">
            {collection.description}
          </p>
          <PaginatedResourceSection
            connection={collection.products}
            resourcesClassName="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {({node: product, index}) => (
              <ProductItem
                key={product.id}
                product={product}
                loading={index < 8 ? 'eager' : undefined}
              />
            )}
          </PaginatedResourceSection>
          <Analytics.CollectionView
            data={{
              collection: {
                id: collection.id,
                handle: collection.handle,
              },
            }}
          />
        </div>
      )}
    </div>
  );
}

function ProductItem({
  product,
  loading,
}: {
  product: ProductItemFragment;
  loading?: 'eager' | 'lazy';
}) {
  const variantUrl = useVariantUrl(product.handle);
  return (
    <Link
      className="flex flex-col items-center border-2 border-[var(--color-dark)] bg-[var(--color-light)] rounded-xl p-4 shadow-md hover:scale-105 hover:shadow-lg transition-all"
      key={product.id}
      prefetch="intent"
      to={variantUrl}
    >
      {product.featuredImage && (
        <Image
          alt={product.featuredImage.altText || product.title}
          aspectRatio="1/1"
          data={product.featuredImage}
          loading={loading}
          sizes="(min-width: 45em) 400px, 100vw"
        />
      )}
      <h4 className="text-md font-bold mt-2 text-center">{product.title}</h4>
      <small className="text-sm text-[var(--color-dark)]">
        <Money data={product.priceRange.minVariantPrice} />
      </small>
    </Link>
  );
}

const PRODUCT_ITEM_FRAGMENT = `#graphql
  fragment MoneyProductItem on MoneyV2 {
    amount
    currencyCode
  }
  fragment ProductItem on Product {
    id
    handle
    title
    featuredImage {
      id
      altText
      url
      width
      height
    }
    priceRange {
      minVariantPrice {
        ...MoneyProductItem
      }
      maxVariantPrice {
        ...MoneyProductItem
      }
    }
    variants(first: 100) {
      nodes {
        id
        title
        sku
        availableForSale
      }
    }
  }
` as const;

// NOTE: https://shopify.dev/docs/api/storefront/2022-04/objects/collection
const COLLECTION_QUERY = `#graphql
  ${PRODUCT_ITEM_FRAGMENT}
  query Collection(
    $handle: String!
    $country: CountryCode
    $language: LanguageCode
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
  ) @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      id
      handle
      title
      description
      products(
        first: $first,
        last: $last,
        before: $startCursor,
        after: $endCursor
      ) {
        nodes {
          ...ProductItem
        }
        pageInfo {
          hasPreviousPage
          hasNextPage
          endCursor
          startCursor
        }
      }
    }
  }
` as const;
