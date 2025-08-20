import {type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {useLoaderData, type MetaFunction} from 'react-router';
import {
  getSelectedProductOptions,
  Analytics,
  useOptimisticVariant,
  getProductOptions,
  getAdjacentAndFirstAvailableVariants,
  useSelectedOptionInUrlParam,
} from '@shopify/hydrogen';
import {ProductPrice} from '~/components/ProductPrice';
import {ProductImage} from '~/components/ProductImage';
import {ProductForm} from '~/components/ProductForm';
import {PartyForm} from '~/components/PartyForm';
import {requireDemo} from '~/lib/domain';

export const meta: MetaFunction<typeof loader> = ({data}) => {
  const title = data?.product?.title ?? 'ZDT’s';
  const handle = data?.product?.handle ?? '';
  return [
    {title: `ZDT's | ${title}`},
    {rel: 'canonical', href: `/products/${handle}`},
  ];
};

export async function loader(args: LoaderFunctionArgs) {
  // Check if this product is in an allowed collection for public access
  const product = await loadCriticalData(args);
  const isInAssetsCollection = product?.product?.collections?.nodes?.some(
    (collection: any) => collection.handle === 'assets'
  );
  
  if (isInAssetsCollection) {
    // Allow access to products in the assets collection
    const deferredData = loadDeferredData(args);
    console.log('new page loaded');
    return {...deferredData, ...product};
  } else {
    // Protect other products - only allow access on demo sites
    requireDemo(args.request);
    const deferredData = loadDeferredData(args);
    const criticalData = await loadCriticalData(args);
    console.log('new page loaded');
    return {...deferredData, ...criticalData};
  }
}

async function loadCriticalData({
  context,
  params,
  request,
}: LoaderFunctionArgs) {
  const {handle} = params;
  const {storefront} = context;

  if (!handle) throw new Error('Expected product handle to be defined');

  const [{product}, {metaobjects}] = await Promise.all([
    storefront.query(PRODUCT_QUERY, {
      variables: {handle, selectedOptions: getSelectedProductOptions(request)},
    }),
    storefront.query(HOURS_QUERY),
  ]);

  if (!product?.id) throw new Response(null, {status: 404});

  // Process hours data like in pages.hours.tsx
  const node = metaobjects?.edges?.[0]?.node;
  const hoursData = node?.hours?.value ? JSON.parse(node.hours.value) : {};

  return {product, hoursData};
}

function loadDeferredData({context, params}: LoaderFunctionArgs) {
  return {};
}

export default function Product() {
  const data = useLoaderData<typeof loader>();

  const product = data?.product;
  const hoursData = data?.hoursData;
  const isPartyProduct = product?.tags?.includes('partydeposit');

  // Always safe fallback
  const selectedVariant = useOptimisticVariant(
    product?.selectedOrFirstAvailableVariant,
    product ? getAdjacentAndFirstAvailableVariants(product) : [],
  );

  // Hook must always be called, even with fallback
  useSelectedOptionInUrlParam(selectedVariant?.selectedOptions ?? []);

  // Conditional render fallback
  if (!product) {
    return <div className="text-red-500 p-4">Product not found.</div>;
  }

  const productOptions = getProductOptions({
    ...product,
    selectedOrFirstAvailableVariant: selectedVariant,
  });

  const {title, descriptionHtml} = product;

  const availableForPurchase = !product.tags.includes('attraction');

  return (
    <div className="w-full px-4 py-12 md:py-20 bg-yellow-50 text-black font-sans">
      <div className="max-w-6xl mx-auto">
        {availableForPurchase && (
          <>
            {/* Product title only */}
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight leading-tight drop-shadow-md mb-8 text-center">
              {title}
            </h1>

            {/* Main product container with image and form integrated */}
            <div className="bg-white border-4 border-black rounded-lg shadow-xl overflow-hidden">
              {isPartyProduct && (
                <div className="grid grid-cols-1 gap-0">
                  <div className="p-8">
                    <div className="w-full sm:w-2/3 md:w-1/2 lg:w-1/3 max-w-md mx-auto mb-6">
                      <ProductImage 
                image={selectedVariant?.image} 
                media={product.media?.nodes} 
                selectedVariantId={selectedVariant?.id} />
                    </div>
                    <div
                      className="mt-4 mb-6 text-center max-w-4xl mx-auto product-description"
                      dangerouslySetInnerHTML={{__html: descriptionHtml}}
                    />
                    <PartyForm
                      productOptions={productOptions}
                      selectedVariant={selectedVariant}
                      tags={product.tags}
                      product={product}
                      hoursData={hoursData}
                    />
                  </div>
                </div>
              )}
              {!isPartyProduct && (
                <div className="grid grid-cols-1 gap-0">
                  <div className="p-8">
                    <div className="w-full sm:w-2/3 md:w-1/2 lg:w-1/3 max-w-md mx-auto mb-6">
                      <ProductImage 
                image={selectedVariant?.image} 
                media={product.media?.nodes} 
                selectedVariantId={selectedVariant?.id} />
                    </div>
                    <div
                      className="mt-4 mb-6 text-center max-w-4xl mx-auto product-description"
                      dangerouslySetInnerHTML={{__html: descriptionHtml}}
                    />
                    <ProductForm
                      productOptions={productOptions}
                      selectedVariant={selectedVariant}
                      tags={product.tags}
                    />
                  </div>
                </div>
              )}
            </div>
          </>
        )}
        {!availableForPurchase && (
          <>
            <div className="flex flex-col justify-start gap-6">
              <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight leading-tight drop-shadow-md">
                {title}
              </h1>
              <div className="w-full sm:w-2/3 md:w-1/2 lg:w-1/3 max-w-md">
                <ProductImage 
                  image={selectedVariant?.image} 
                  media={product.media?.nodes} 
                  selectedVariantId={selectedVariant?.id} />
              </div>

              <div
                className="max-w-4xl product-description"
                dangerouslySetInnerHTML={{__html: descriptionHtml}}
              />
            </div>
          </>
        )}
      </div>

      <Analytics.ProductView
        data={{
          products: [
            {
              id: product.id,
              title: product.title,
              price: selectedVariant?.price.amount || '0',
              vendor: product.vendor,
              variantId: selectedVariant?.id || '',
              variantTitle: selectedVariant?.title || '',
              quantity: 1,
            },
          ],
        }}
      />
    </div>
  );
}

const PRODUCT_VARIANT_FRAGMENT = `#graphql
  fragment ProductVariant on ProductVariant {
    availableForSale
    compareAtPrice {
      amount
      currencyCode
    }
    id
    image {
      __typename
      id
      url
      altText
      width
      height
    }
    price {
      amount
      currencyCode
    }
    product {
      title
      handle
    }
    selectedOptions {
      name
      value
    }
    sku
    title
    unitPrice {
      amount
      currencyCode
    }
    quantityAvailable
    sellingPlanAllocations(first: 10) {
      nodes {
        priceAdjustments {
          compareAtPrice {
            amount
            currencyCode
          }
          perDeliveryPrice {
            amount
            currencyCode
          }
          price {
            amount
            currencyCode
          }
        }
        sellingPlan {
          id
          name
          description
          recurringDeliveries
          billingPolicy {
            ... on SellingPlanRecurringBillingPolicy {
              interval
              intervalCount
            }
          }
          deliveryPolicy {
            ... on SellingPlanRecurringDeliveryPolicy {
              interval
              intervalCount
            }
          }
          options {
            name
            value
          }
          checkoutCharge {
            type
            value {
              ... on MoneyV2 {
                amount
                currencyCode
              }
              ... on SellingPlanCheckoutChargePercentageValue {
                percentage
              }
            }
          }
        }
      }
    }
  }
` as const;

const PRODUCT_FRAGMENT = `#graphql
  fragment Product on Product {
    id
    tags
    title
    vendor
    handle
    descriptionHtml
    description
    encodedVariantExistence
    encodedVariantAvailability
    requiresSellingPlan
    collections(first: 10) {
      nodes {
        handle
      }
    }
    media(first: 10) {
      nodes {
        ... on MediaImage {
          id
          image {
            id
            url
            altText
            width
            height
          }
        }
      }
    }
    options {
      name
      optionValues {
        name
        firstSelectableVariant {
          ...ProductVariant
        }
        swatch {
          color
          image {
            previewImage {
              url
            }
          }
        }
      }
    }
    selectedOrFirstAvailableVariant(selectedOptions: $selectedOptions, ignoreUnknownOptions: true, caseInsensitiveMatch: true) {
      ...ProductVariant
    }
    adjacentVariants (selectedOptions: $selectedOptions) {
      ...ProductVariant
    }
    seo {
      description
      title
    }
  }
  ${PRODUCT_VARIANT_FRAGMENT}
` as const;

const PRODUCT_QUERY = `#graphql
  query Product(
    $country: CountryCode
    $handle: String!
    $language: LanguageCode
    $selectedOptions: [SelectedOptionInput!]!
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      ...Product
    }
  }
  ${PRODUCT_FRAGMENT}
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
` as const;
