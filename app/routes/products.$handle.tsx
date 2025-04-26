import {type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {useLoaderData, type MetaFunction} from '@remix-run/react';
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

export const meta: MetaFunction<typeof loader> = ({data}) => {
  const title = data?.product?.title ?? 'ZDT’s';
  const handle = data?.product?.handle ?? '';
  return [
    {title: `ZDT's | ${title}`},
    {rel: 'canonical', href: `/products/${handle}`},
  ];
};

export async function loader(args: LoaderFunctionArgs) {
  const deferredData = loadDeferredData(args);
  const criticalData = await loadCriticalData(args);
  console.log('new page loaded');
  return {...deferredData, ...criticalData};
}

async function loadCriticalData({
  context,
  params,
  request,
}: LoaderFunctionArgs) {
  const {handle} = params;
  const {storefront} = context;

  if (!handle) throw new Error('Expected product handle to be defined');

  const [{product}] = await Promise.all([
    storefront.query(PRODUCT_QUERY, {
      variables: {handle, selectedOptions: getSelectedProductOptions(request)},
    }),
  ]);

  if (!product?.id) throw new Response(null, {status: 404});

  return {product};
}

function loadDeferredData({context, params}: LoaderFunctionArgs) {
  return {};
}

export default function Product() {
  const data = useLoaderData<typeof loader>();

  const product = data?.product;
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
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
        {availableForPurchase && (
          <>
            <div className="w-full">
              <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight leading-tight drop-shadow-md">
                {title}
              </h1>
              <ProductImage image={selectedVariant?.image} />
              <div
                className="prose max-w-none text-lg leading-relaxed overflow-hidden"
                dangerouslySetInnerHTML={{__html: descriptionHtml}}
              />
            </div>
            <div className="flex flex-col justify-start gap-6 p-4">
              {/*
              <div className="bg-yellow-300 text-black text-xl font-extrabold px-4 py-2 rounded shadow-md w-fit">
                <ProductPrice
                  price={selectedVariant?.price}
                  compareAtPrice={selectedVariant?.compareAtPrice}
                />
              </div>
              */}
              {isPartyProduct && (
                <div className="bg-white border border-black rounded-lg p-6 shadow-xl h-full">
                  <PartyForm
                    productOptions={productOptions}
                    selectedVariant={selectedVariant}
                    tags={product.tags}
                    product={product}
                  />
                </div>
              )}
              {!isPartyProduct && (
                <div className="bg-white border border-black rounded-lg p-6 shadow-xl h-full">
                  <ProductForm
                    productOptions={productOptions}
                    selectedVariant={selectedVariant}
                    tags={product.tags}
                  />
                </div>
              )}
            </div>
          </>
        )}
        {!availableForPurchase && (
          <>
            <div className="w-full">
              <ProductImage image={selectedVariant?.image} />
            </div>
            <div className="flex flex-col justify-start gap-6">
              <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight leading-tight drop-shadow-md">
                {title}
              </h1>
              <div
                className="prose max-w-none text-lg leading-relaxed"
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
