import {type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import { useLoaderData, type MetaFunction } from 'react-router';
import Hero from '~/components/Hero';
import ScrollingRibbon from '~/components/ScrollingRibbon';
import Carousel from '~/components/Carousel';
import Calendar from '~/components/Calendar';
import {AttractionProductsQuery} from 'storefrontapi.generated';

export const meta: MetaFunction = () => {
  return [{title: 'ZDT’s Amusement Park'}];
};

export async function loader(args: LoaderFunctionArgs) {
  const deferredData = loadDeferredData(args);
  const criticalData = await loadCriticalData(args);

  const {context} = args;
  const attractionsCollection = await context.storefront.query(
    ATTRACTION_PRODUCTS_QUERY,
  );
  const attractions = attractionsCollection.collections?.nodes[0];
  console.log(attractions);
  const admissionCollection: AttractionProductsQuery =
    await context.storefront.query(ADMISSION_PRODUCTS_QUERY);
  const admissionProducts =
    admissionCollection.collections?.nodes[0].products?.nodes ?? [];

  const {metaobjects} = await context.storefront.query(HOURS_QUERY);
  const edge = metaobjects?.edges?.[0];

  const hoursField = edge?.node?.hours;
  const waterField = edge?.node?.water;
  const notesField = edge?.node?.notes;

  type CalendarData = {
    [year: string]: {
      [month: string]: {
        [day: string]: string | null;
      };
    };
  };

  const hoursData: CalendarData = hoursField?.value
    ? (JSON.parse(hoursField.value as string) as CalendarData)
    : {};
  const waterData: CalendarData = waterField?.value
    ? (JSON.parse(waterField.value as string) as CalendarData)
    : {};
  const notesData: CalendarData = notesField?.value
    ? (JSON.parse(notesField.value as string) as CalendarData)
    : {};

  return {
    ...deferredData,
    ...criticalData,
    attractions: attractions.products.nodes,
    admissionProducts,
    hoursData,
    waterData,
    notesData,
  };
}

async function loadCriticalData({context}: LoaderFunctionArgs) {
  const [{collections}] = await Promise.all([
    context.storefront.query(FEATURED_COLLECTION_QUERY),
  ]);

  return {
    featuredCollection: collections.nodes[0],
  };
}

function loadDeferredData({context}: LoaderFunctionArgs) {
  const recommendedProducts = context.storefront
    .query(RECOMMENDED_PRODUCTS_QUERY)
    .catch((error) => {
      console.error(error);
      return null;
    });

  return {
    recommendedProducts,
  };
}

export default function Homepage() {
  const {attractions, admissionProducts, hoursData, waterData, notesData} =
    useLoaderData<typeof loader>();

  return (
    <>
      <Hero id="hero" />
      <ScrollingRibbon
        items={attractions.map((a: any) => a.title)}
        handles={attractions.map((a: any) => a.handle)}
      />
      <Carousel products={admissionProducts} />
      <Calendar
        hoursData={hoursData}
        waterData={waterData}
        notesData={notesData}
      />
      <Carousel products={attractions} />
    </>
  );
}
/*
function FeaturedCollection({
  collection,
}: {
  collection: FeaturedCollectionFragment;
}) {
  if (!collection) return null;
  const image = collection?.image;
  return (
    <Link
      className="featured-collection"
      to={`/collections/${collection.handle}`}
    >
      {image && (
        <div className="featured-collection-image">
          <Image data={image} sizes="100vw" />
        </div>
      )}
      <h1>{collection.title}</h1>
    </Link>
  );
}

function RecommendedProducts({
  products,
}: {
  products: Promise<RecommendedProductsQuery | null>;
}) {
  return (
    <div className="recommended-products">
      <h2>Recommended Products</h2>
      <Suspense fallback={<div>Loading...</div>}>
        <Await resolve={products}>
          {(response) => (
            <div className="recommended-products-grid">
              {response
                ? response.products.nodes.map((product) => (
                    <Link
                      key={product.id}
                      className="recommended-product"
                      to={`/products/${product.handle}`}
                    >
                      <Image
                        data={product.images.nodes[0]}
                        aspectRatio="1/1"
                        sizes="(min-width: 45em) 20vw, 50vw"
                      />
                      <h4>{product.title}</h4>
                      <small>
                        <Money data={product.priceRange.minVariantPrice} />
                      </small>
                    </Link>
                  ))
                : null}
            </div>
          )}
        </Await>
      </Suspense>
      <br />
    </div>
  );
}
*/
// list of products with tag 'attractions'
const ATTRACTION_PRODUCTS_QUERY = `#graphql
  query AttractionProducts($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    collections(first: 1, reverse: false, query: "Attractions") {
      nodes {
        products(first: 15) {
          nodes {
            title
            id
            handle
            descriptionHtml
            images(first: 1) {
              nodes {
                id
                url
                altText
                width
                height
              }
            }
          }
        }
      }
    }
  }
`;

const ADMISSION_PRODUCTS_QUERY = `#graphql
  query AdmissionProducts($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    collections(first: 1, reverse: false, query: "Tickets") {
      nodes {
        products(first: 10) {
          nodes {
            id
            title
            handle
            descriptionHtml
          }
        }
      }
    }
  }
` as const;

const FEATURED_COLLECTION_QUERY = `#graphql
  fragment FeaturedCollection on Collection {
    id
    title
    image {
      id
      url
      altText
      width
      height
    }
    handle
  }
  query FeaturedCollection($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    collections(first: 1, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...FeaturedCollection
      }
    }
  }
` as const;

const RECOMMENDED_PRODUCTS_QUERY = `#graphql
  fragment RecommendedProduct on Product {
    id
    title
    handle
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    images(first: 1) {
      nodes {
        id
        url
        altText
        width
        height
      }
    }
  }
  query RecommendedProducts ($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    products(first: 4, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...RecommendedProduct
      }
    }
  }
` as const;

const PRODUCTS_QUERY = `#graphql
  query Products($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    collections(first: 1, reverse: false, query: "Admission") {
      nodes {
        products(first: 100) {
          nodes {
            id
            title
            handle
            descriptionHtml
            priceRange {
              minVariantPrice {
                amount
                currencyCode
              }
            }
            images(first: 1) {
              nodes {
                id
                url
                altText
                width
                height
              }
            }
          }
        }
      }
    }
  }
` as const;

const HOURS_QUERY = `#graphql
  query CalendarHours {
    metaobjects(type: "park_hours", first: 1) {
      edges {
        node {
          hours: field(key: "hours") {
            value
          }
          water: field(key: "water") {
            value
          }
          notes: field(key: "notes") {
            value
          }
        }
      }
    }
  }
`;
