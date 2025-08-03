import { Link, useNavigate } from 'react-router';
import {type MappedProductOptions} from '@shopify/hydrogen';
import type {
  Maybe,
  ProductOptionValueSwatch,
} from '@shopify/hydrogen/storefront-api-types';
import {AddToCartButton} from './AddToCartButton';
import {useAside} from './Aside';
import type {ProductFragment} from 'storefrontapi.generated';
import {useMemo, useState, useEffect, useRef} from 'react';
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
  const requireMemberNameAndDOB = tags?.includes?.('requireMemberNameAndDOB');

  const formRef = useRef<HTMLDivElement>(null);
  const [calendarScrollable, setCalendarScrollable] = useState(false);
  const [showCartMessage, setShowCartMessage] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (!formRef.current) return;
      const rect = formRef.current.getBoundingClientRect();
      const bottomVisible = rect.bottom <= window.innerHeight - 20; // allow slight padding

      setCalendarScrollable(bottomVisible);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const calendarDates = useMemo(() => {
    if (!isChooseYourDate) return [];
    let openToday = false;

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
        const date = new Date(year, month, day, 0, 0, 0, 0);

        //if the date is today, set openToday to true
        if (date.toDateString() === new Date().toDateString()) {
          openToday = true;
        }

        //if the date is in the past, skip
        if (date.getTime() < new Date().getTime()) continue;

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
      if (openToday) {
        for (const value of option.optionValues) {
          const match = value.variant?.sku === 'TODAY';
          if (!match) continue;
          const date = new Date(); // Today
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
    }
    return Array.from(dateMap.values()).sort(
      (a, b) => a.date.getTime() - b.date.getTime(),
    );
  }, [productOptions, isChooseYourDate]);

  const [quantity, setQuantity] = useState(1);
  const [selectedSellingPlanId, setSelectedSellingPlanId] = useState<
    string | null
  >(null);

  useEffect(() => {
    if (selectedVariant?.sellingPlanAllocations?.nodes?.length) {
      setSelectedSellingPlanId(
        selectedVariant.sellingPlanAllocations?.nodes[0].sellingPlan.id,
      );
    } else {
      setSelectedSellingPlanId(null);
    }
  }, [selectedVariant]);

  // Member details state for name and DOB (month, day, year)
  const [memberDetails, setMemberDetails] = useState<
    {name: string; month: string; day: string; year: string}[]
  >([]);

useEffect(() => {
  setMemberDetails((prev) => {
    if (quantity > prev.length) {
      return [
        ...prev,
        ...Array.from({ length: quantity - prev.length }, () => ({
          name: '',
          month: '',
          day: '',
          year: '',
        })),
      ];
    } else {
      return prev.slice(0, quantity);
    }
  });
}, [quantity]);

  return (
    <div ref={formRef} className="product-form m-4">
      {productOptions.map((option) => {
        // If there is only a single value in the option values, don't display the option
        if (option.optionValues.length === 1) return null;

        return (
          <>
            {isChooseYourDate ? (
              <div className="my-4 flex-row">
                <h3 className="">Choose Your Date:</h3>
                <div
                  className={`grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-4 h-[50vh] ${calendarScrollable ? 'overflow-y-scroll' : 'overflow-hidden'} scrollbar scrollbar-track-transparent scrollbar-thumb-black/50 hover:scrollbar-thumb-black/80`}
                >
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
                          <span className="font-bold whitespace-nowrap">
                            Any Day
                          </span>
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
            ) : (
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
                          key={option.name + name}
                          prefetch="intent"
                          preventScrollReset
                          replace
                          to={`/products/${handle}?${variantUriQuery}`}
                          className={`
                            product-options-item
                            px-4 py-2 rounded-full text-sm font-semibold
                            transition-all duration-300 ease-out transform
                            ${
                              selected
                                ? 'bg-yellow-400 text-black shadow-lg scale-105'
                                : 'bg-white text-black border border-gray-300 hover:bg-yellow-100 hover:scale-105'
                            }
                            ${!available ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                          `}
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
                          key={option.name + name}
                          className={`
                            product-options-item
                            px-4 py-2 m-2 w-full rounded-full text-sm font-semibold
                            transition-all duration-300 ease-out transform
                            ${
                              selected
                                ? 'bg-[var(--color-brand-yellow)] text-black shadow-lg'
                                : 'bg-[var(--color-brand-cream)] text-black border border-gray-300 hover:bg-[var(--color-brand-cream-hover)] hover:scale-105'
                            }
                            ${!available ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                          `}
                          disabled={!exists}
                          hidden={!exists}
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
      {selectedVariant?.sellingPlanAllocations?.nodes?.length ? (
        <div className="my-4">
          <h5 className="text-left font-bold mb-2">Choose a Plan:</h5>
          <div className="flex flex-col gap-4">
            {selectedVariant.sellingPlanAllocations.nodes.map((allocation) => {
              const {sellingPlan, priceAdjustments} = allocation;
              const price = priceAdjustments?.[0]?.price?.amount;
              const compareAtPrice =
                priceAdjustments?.[0]?.compareAtPrice?.amount;
              const discount =
                compareAtPrice && price
                  ? (1 - Number(price) / Number(compareAtPrice)) * 100
                  : null;

              return (
                <button
                  key={sellingPlan.id}
                  type="button"
                  className={`w-full text-left px-4 py-3 rounded-lg border transition-all duration-300 ease-out transform ${
                    selectedSellingPlanId === sellingPlan.id
                      ? 'bg-[var(--color-brand-yellow)] text-black shadow-lg scale-105'
                      : 'bg-[var(--color-brand-cream)] text-black border-gray-300 hover:bg-[var(--color-brand-cream-hover)] hover:scale-105'
                  }`}
                  onClick={() => setSelectedSellingPlanId(sellingPlan.id)}
                >
                  <div className="font-bold">{sellingPlan.name}</div>
                  {sellingPlan.description && (
                    <div className="text-sm text-gray-700">
                      {sellingPlan.description}
                    </div>
                  )}
                  {price && (
                    <div className="text-sm mt-1">
                      <span className="font-semibold">
                        ${Number(price).toFixed(2)}
                      </span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ):null}
      {requireMemberNameAndDOB ? (
        <>
        <div className="mt-6 flex flex-col items-left  justify-center">
          {Array.from({length: quantity}).map((_, index) => (
            <div key={index} className="space-y-4">
              <h3 className="text-xl font-bold">Member {index + 1} Details</h3>
              <div className="flex items-center border border-black rounded bg-white ">
                <input
                  type="text"
                  placeholder="First and Last Name"
                  className="w-full px-4 py-2 text-xl font-bold text-black"
                  value={memberDetails[index]?.name || ''}
                  onChange={(e) => {
                    const updated = [...memberDetails];
                    updated[index].name = e.target.value;
                    setMemberDetails(updated);
                  }}
                />
              </div>
              <div className="flex gap-2">
                <select
                  className="border p-2 rounded w-1/3"
                  value={memberDetails[index]?.month || ''}
                  onChange={(e) => {
                    const updated = [...memberDetails];
                    updated[index].month = e.target.value;
                    setMemberDetails(updated);
                  }}
                >
                  <option value="">Month</option>
                  {Array.from({length: 12}, (_, i) => (
                    <option key={i} value={String(i + 1).padStart(2, '0')}>
                      {new Date(0, i).toLocaleString('default', {
                        month: 'short',
                      })}
                    </option>
                  ))}
                </select>

                <select
                  className="border p-2 rounded w-1/3"
                  value={memberDetails[index]?.day || ''}
                  onChange={(e) => {
                    const updated = [...memberDetails];
                    updated[index].day = e.target.value;
                    setMemberDetails(updated);
                  }}
                >
                  <option value="">Day</option>
                  {Array.from({length: 31}, (_, i) => (
                    <option key={i} value={String(i + 1).padStart(2, '0')}>
                      {i + 1}
                    </option>
                  ))}
                </select>

                <select
                  className="border p-2 rounded w-1/3"
                  value={memberDetails[index]?.year || ''}
                  onChange={(e) => {
                    const updated = [...memberDetails];
                    updated[index].year = e.target.value;
                    setMemberDetails(updated);
                  }}
                >
                  <option value="">Year</option>
                  {Array.from({length: 120}, (_, i) => {
                    const year = new Date().getFullYear() - i;
                    return (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    );
                  })}
                </select>
              </div>
              <br />
            </div>
          ))}
        </div>
        {memberDetails.every(
          (member) =>
            member.name.trim() && member.month && member.day && member.year,
        ) ? null : (
          <p className="text-center text-red-600">
            Please enter all required fields before adding to cart
          </p>
        )}
        </>
      ):null}

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
          disabled={
            !selectedVariant ||
            !selectedVariant.availableForSale ||
            (requireMemberNameAndDOB &&
              memberDetails.some(
                (member) =>
                  !member.name.trim() ||
                  !member.month ||
                  !member.day ||
                  !member.year,
              ))
          }
          onClick={() => open('cart')}
          lines={
            selectedVariant
              ? requireMemberNameAndDOB
                ? memberDetails.map((member) => ({
                    merchandiseId: selectedVariant.id,
                    quantity: 1,
                    selectedVariant,
                    attributes: [
                      {key: 'Name', value: member.name},
                      {
                        key: 'Date of Birth',
                        value: `${member.month}/${member.day}/${member.year}`,
                      },
                    ],
                    sellingPlanId: selectedSellingPlanId || undefined,
                  }))
                : [
                    {
                      merchandiseId: selectedVariant.id,
                      quantity,
                      selectedVariant,
                      sellingPlanId: selectedSellingPlanId || undefined,
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
