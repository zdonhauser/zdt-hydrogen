import {Link, useNavigate} from '@remix-run/react';
import {type MappedProductOptions} from '@shopify/hydrogen';
import type {
  Maybe,
  ProductOptionValueSwatch,
} from '@shopify/hydrogen/storefront-api-types';
import {AddToCartButton} from './AddToCartButton';
import {useAside} from './Aside';
import type {ProductFragment} from 'storefrontapi.generated';
import {useMemo, useState} from 'react';
import {format} from 'date-fns';

export function ProductForm({
  productOptions,
  selectedVariant,
  tags,
}: {
  productOptions: MappedProductOptions[];
  selectedVariant: ProductFragment['selectedOrFirstAvailableVariant'];
  tags: ProductFragment['tags'];
}) {
  const navigate = useNavigate();
  const {open} = useAside();

  const isChooseYourDate = tags?.includes?.('chooseyourdate');

  const calendarDates = useMemo(() => {
    if (!isChooseYourDate) return [];

    const dateMap = new Map<
      string,
      {
        date: Date;
        price: string;
        url: string;
        value: MappedProductOptions['optionValues'][number];
      }
    >();

    for (const option of productOptions) {
      for (const value of option.optionValues) {
        if (!/^\d{6}/.test(value.variant?.sku || '')) continue;

        const match = value.variant?.sku?.match(/^(\d{2})(\d{2})(\d{2})/);
        if (!match) continue;
        const [, mm, dd, yy] = match;
        const year = parseInt(yy, 10) + 2000;
        const month = parseInt(mm, 10) - 1;
        const day = parseInt(dd, 10);
        const date = new Date(year, month, day);

        const variant = value.variant;

        if (variant?.price?.amount) {
          dateMap.set(date.toISOString(), {
            date,
            price: variant.price.amount,
            url: `/products/${variant.product.handle}?${value.variantUriQuery}`,
            value,
          });
        }
      }
    }
    // Add "ANYDAY" option after main loop so it appears last
    for (const option of productOptions) {
      for (const value of option.optionValues) {
        const match = value.variant?.sku === 'ANYDAY';
        if (!match) continue;
        const date = new Date(2000, 0, 1); // Jan 1, 2099
        const variant = value.variant;

        if (variant?.price?.amount) {
          dateMap.set(date.toISOString(), {
            date,
            price: variant.price.amount,
            url: `/products/${variant.product.handle}?${value.variantUriQuery}`,
            value,
          });
        }
      }
    }
    return Array.from(dateMap.values()).sort(
      (a, b) => a.date.getTime() - b.date.getTime(),
    );
  }, [productOptions, isChooseYourDate]);

  const [quantity, setQuantity] = useState(1);

  return (
    <div className="product-form m-4">
      {productOptions.map((option) => {
        // If there is only a single value in the option values, don't display the option
        if (option.optionValues.length === 1) return null;

        return (
          <>
            {isChooseYourDate && (
              <div className="my-4 flex-row">
                <h3 className="">Choose Your Date:</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4 h-[50vh] overflow-y-scroll scrollbar scrollbar-track-transparent scrollbar-thumb-black/50 hover:scrollbar-thumb-black/80">
                  {' '}
                  {calendarDates.map(({date, price, url, value}) => (
                    <button
                      key={date.toISOString()}
                      type="button"
                      className={`p-4 border border-black rounded bg-white text-center shadow hover:bg-yellow-100 cursor-pointer`}
                      style={{
                        backgroundColor: value.selected
                          ? 'var(--color-brand-yellow)'
                          : 'var(--color-brand-cream)',
                      }}
                      onClick={() => {
                        navigate(url, {
                          replace: true,
                          preventScrollReset: true,
                        });
                      }}
                    >
                      {value.variant.sku === 'ANYDAY' && (
                        <>
                          <div className="font-bold">Any Day</div>
                          <div className="font-bold">Ticket</div>
                          <div className="text-lg">
                            ${parseFloat(price).toFixed(2)}
                          </div>
                        </>
                      )}
                      {!(value.variant.sku === 'ANYDAY') && (
                        <>
                          <div>{format(date, 'EEE')}</div>
                          <div className="font-bold">{format(date, 'M/d')}</div>
                          <div className="text-lg">
                            ${parseFloat(price).toFixed(2)}
                          </div>
                        </>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {!isChooseYourDate && (
              <div className="product-options" key={option.name}>
                <h5>{option.name}</h5>
                <div className="product-options-grid">
                  {option.optionValues.map((value) => {
                    const {
                      name,
                      handle,
                      variantUriQuery,
                      selected,
                      available,
                      exists,
                      isDifferentProduct,
                      swatch,
                    } = value;

                    if (isDifferentProduct) {
                      // SEO
                      // When the variant is a combined listing child product
                      // that leads to a different url, we need to render it
                      // as an anchor tag
                      return (
                        <Link
                          className="product-options-item"
                          key={option.name + name}
                          prefetch="intent"
                          preventScrollReset
                          replace
                          to={`/products/${handle}?${variantUriQuery}`}
                          style={{
                            border: selected
                              ? '1px solid black'
                              : '1px solid transparent',
                            opacity: available ? 1 : 0.3,
                          }}
                        >
                          <ProductOptionSwatch swatch={swatch} name={name} />
                        </Link>
                      );
                    } else {
                      // SEO
                      // When the variant is an update to the search param,
                      // render it as a button with javascript navigating to
                      // the variant so that SEO bots do not index these as
                      // duplicated links
                      return (
                        <button
                          type="button"
                          className={`product-options-item${
                            exists && !selected ? ' link' : ''
                          }`}
                          key={option.name + name}
                          style={{
                            border: selected
                              ? '1px solid black'
                              : '1px solid transparent',
                            opacity: available ? 1 : 0.3,
                          }}
                          disabled={!exists}
                          onClick={() => {
                            if (!selected) {
                              navigate(`?${variantUriQuery}`, {
                                replace: true,
                                preventScrollReset: true,
                              });
                            }
                          }}
                        >
                          <ProductOptionSwatch swatch={swatch} name={name} />
                        </button>
                      );
                    }
                  })}
                </div>
                <br />
              </div>
            )}
          </>
        );
      })}

      <div className="mt-6 flex items-center gap-4 justify-center">
        <div className="flex items-center border border-black rounded bg-white ">
          <button
            type="button"
            className="px-3 py-2 text-xl font-bold text-black hover:bg-yellow-200"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          >
            -
          </button>
          <span className="px-4 text-lg font-semibold">{quantity}</span>
          <button
            type="button"
            className="px-3 py-2 text-xl font-bold text-black hover:bg-yellow-200"
            onClick={() => setQuantity((q) => q + 1)}
          >
            +
          </button>
        </div>
        <AddToCartButton
          disabled={!selectedVariant || !selectedVariant.availableForSale}
          onClick={() => open('cart')}
          lines={
            selectedVariant
              ? [
                  {
                    merchandiseId: selectedVariant.id,
                    quantity,
                    selectedVariant,
                  },
                ]
              : []
          }
        >
          {selectedVariant?.availableForSale ? 'Add to Cart' : 'Sold Out'}
        </AddToCartButton>
      </div>
    </div>
  );
}

function ProductOptionSwatch({
  swatch,
  name,
}: {
  swatch?: Maybe<ProductOptionValueSwatch> | undefined;
  name: string;
}) {
  const image = swatch?.image?.previewImage?.url;
  const color = swatch?.color;

  if (!image && !color) return name;

  return (
    <div
      aria-label={name}
      className="product-option-label-swatch"
      style={{
        backgroundColor: color || 'transparent',
      }}
    >
      {!!image && <img src={image} alt={name} />}
    </div>
  );
}
