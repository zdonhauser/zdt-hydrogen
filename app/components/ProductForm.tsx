import { Link, useNavigate } from 'react-router';
import {type MappedProductOptions, CartForm} from '@shopify/hydrogen';
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
  const notAvailable = tags?.includes?.('notavailable');
  const notOnline = tags?.includes?.('notonline');
  const is4Packs = tags?.includes?.('4-Packs');
  const addFood = tags?.includes?.('addfood');

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

  // Get available inventory for the selected variant
  // If availableForSale is true but quantityAvailable is 0, null, or negative, allow overselling
  const allowsOverselling = selectedVariant?.availableForSale && (selectedVariant?.quantityAvailable == null || selectedVariant?.quantityAvailable <= 0);
  const maxQuantity = allowsOverselling ? 999 : (selectedVariant?.quantityAvailable || 999);
  const showInventoryWarning = !allowsOverselling && maxQuantity < 10 && maxQuantity > 0;
  
  const [quantity, setQuantity] = useState(1);
  const [selectedSellingPlanId, setSelectedSellingPlanId] = useState<
    string | null
  >(null);
  const [showEatAndPlayModal, setShowEatAndPlayModal] = useState(false);
  const [addComboMeal, setAddComboMeal] = useState<boolean | null>(null);

  // Auto-select first available date if none selected
  useEffect(() => {
    if (isChooseYourDate && calendarDates.length > 0) {
      const hasSelection = calendarDates.some(d => d.value.selected);
      if (!hasSelection) {
        // Navigate to first date option
        const firstDate = calendarDates[0];
        navigate(firstDate.url, {
          replace: true,
          preventScrollReset: true,
        });
      }
    }
  }, [isChooseYourDate, calendarDates, navigate]);

  useEffect(() => {
    if (selectedVariant?.sellingPlanAllocations?.nodes?.length) {
      setSelectedSellingPlanId(
        selectedVariant.sellingPlanAllocations?.nodes[0].sellingPlan.id,
      );
    } else {
      setSelectedSellingPlanId(null);
    }
    
    // Reset quantity to 1 when variant changes and ensure it doesn't exceed max
    setQuantity(1);
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
      {/* Not Available Banner */}
      {notAvailable && (
        <div className="mb-6 bg-[var(--color-brand-red)] border-4 border-[var(--color-brand-dark)] rounded-xl p-6 text-center shadow-lg">
          <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-wide">
            ⚠️ Not Currently Available
          </h3>
          <p className="text-lg font-bold text-white">
            This item is not currently available for purchase.
          </p>
        </div>
      )}
      
      {productOptions.map((option) => {
        // If there is only a single value in the option values, don't display the option
        if (option.optionValues.length === 1) return null;

        return (
          <div key={option.name}>
            {isChooseYourDate ? (
              <div className="my-6">
                <h3 className="text-2xl font-black uppercase tracking-wide text-center mb-4 text-[var(--color-brand-dark)]">Choose Your Date:</h3>
                <div className="relative py-2 overflow-visible">
                  <button
                    type="button"
                    onClick={() => {
                      const container = document.getElementById('date-carousel');
                      if (container) {
                        container.scrollBy({ left: -300, behavior: 'smooth' });
                      }
                    }}
                    className="absolute -left-14 top-1/2 -translate-y-1/2 z-20 bg-[var(--color-brand-yellow)] hover:bg-[var(--color-brand-yellow-hover)] text-[var(--color-brand-dark)] p-2 rounded-full border-4 border-[var(--color-brand-dark)] shadow-lg hover:scale-110 transition-all"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const container = document.getElementById('date-carousel');
                      if (container) {
                        container.scrollBy({ left: 300, behavior: 'smooth' });
                      }
                    }}
                    className="absolute -right-14 top-1/2 -translate-y-1/2 z-20 bg-[var(--color-brand-yellow)] hover:bg-[var(--color-brand-yellow-hover)] text-[var(--color-brand-dark)] p-2 rounded-full border-4 border-[var(--color-brand-dark)] shadow-lg hover:scale-110 transition-all"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                  <div id="date-carousel" className="flex gap-4 overflow-x-auto overflow-y-visible py-4 px-4 snap-x snap-mandatory scrollbar-none">
                  {calendarDates.map(({date, price, url, value}, index) => {
                    const lowestPrice = Math.min(...calendarDates.map(d => parseFloat(d.price)));
                    const isLowestPrice = parseFloat(price) === lowestPrice;
                    const isBelowAverage = parseFloat(price) < (calendarDates.reduce((sum, d) => sum + parseFloat(d.price), 0) / calendarDates.length);
                    
                    return (
                    <button
                      key={date.toISOString()}
                      type="button"
                      className={`relative flex-shrink-0 w-32 sm:w-36 p-4 border-4 border-[var(--color-brand-dark)] rounded-xl text-center shadow-lg hover:shadow-xl cursor-pointer transition-all duration-300 transform hover:scale-105 snap-center ${
                        value.selected ? 'scale-105 shadow-[0_0_20px_rgba(255,242,0,0.4)]' : 'hover:bg-[var(--color-brand-cream)]'
                      }`}
                      style={{
                        backgroundColor: value.selected
                          ? 'var(--color-brand-yellow)'
                          : isLowestPrice 
                            ? 'var(--color-brand-green)'
                            : isBelowAverage
                              ? 'var(--color-brand-blue)'
                              : 'white',
                      }}
                      onClick={() => {
                        navigate(url, {
                          replace: true,
                          preventScrollReset: true,
                        });
                      }}
                    >
                      {isLowestPrice && (
                        <div className="absolute -top-2 -right-2 bg-[var(--color-brand-red)] text-white font-black text-xs px-2 py-1 rounded-full border-2 border-[var(--color-brand-dark)] shadow-md z-10 animate-pulse">
                          BEST DEAL
                        </div>
                      )}
                      {!isLowestPrice && isBelowAverage && (
                        <div className="absolute -top-2 -right-2 bg-[var(--color-brand-yellow)] text-[var(--color-brand-dark)] font-black text-xs px-2 py-1 rounded-full border-2 border-[var(--color-brand-dark)] shadow-md z-10">
                          SAVE
                        </div>
                      )}
                      {value.variant.sku === 'ANYDAY' && (
                        <>
                          <span className="font-black text-lg whitespace-nowrap">
                            Any Day
                          </span>
                          <div className="font-black text-base">Ticket</div>
                          <div className="text-2xl font-black text-white drop-shadow-lg">
                            ${parseFloat(price).toFixed(2)}
                          </div>
                        </>
                      )}
                      {!(value.variant.sku === 'ANYDAY') && (
                        <>
                          <div className="font-black text-sm uppercase">{format(date, 'EEE')}</div>
                          <div className="font-black text-xl">{format(date, 'MMM d')}</div>
                          <div className={`text-2xl font-black drop-shadow-lg ${isLowestPrice || isBelowAverage ? 'text-white' : 'text-[var(--color-brand-dark)]'}`}>
                            ${parseFloat(price).toFixed(2)}
                          </div>
                        </>
                      )}
                    </button>
                    );
                  })}
                  </div>
                </div>
                {/* Price Legend */}
                <div className="flex flex-wrap justify-center gap-4 mt-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-[var(--color-brand-green)] border-2 border-[var(--color-brand-dark)] rounded"></div>
                    <span className="font-bold">Best Deal</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-[var(--color-brand-blue)] border-2 border-[var(--color-brand-dark)] rounded"></div>
                    <span className="font-bold">Below Average</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-white border-2 border-[var(--color-brand-dark)] rounded"></div>
                    <span className="font-bold">Regular Price</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-[var(--color-brand-yellow)] border-2 border-[var(--color-brand-dark)] rounded"></div>
                    <span className="font-bold">Selected</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="product-options mb-6" key={option.name}>
                <h5 className="text-2xl font-black uppercase tracking-wide text-center mb-4 text-[var(--color-brand-dark)]">{option.name}</h5>
                <div className="product-options-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                            product-options-item block
                            px-6 py-4 rounded-xl text-base font-black border-4 border-[var(--color-brand-dark)]
                            transition-all duration-300 ease-out transform hover:scale-110
                            shadow-lg hover:shadow-xl
                            ${
                              selected
                                ? 'bg-[var(--color-brand-yellow)] text-[var(--color-brand-dark)] shadow-[0_0_20px_rgba(255,242,0,0.4)] scale-105'
                                : 'bg-white text-[var(--color-brand-dark)] hover:bg-[var(--color-brand-cream)] hover:shadow-[0_0_15px_rgba(0,0,0,0.2)]'
                            }
                            ${!available ? 'opacity-50 cursor-not-allowed grayscale' : 'cursor-pointer'}
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
                            px-6 py-4 m-2 w-full rounded-xl text-base font-black border-4 border-[var(--color-brand-dark)]
                            transition-all duration-300 ease-out transform hover:scale-110
                            shadow-lg hover:shadow-xl
                            ${
                              selected
                                ? 'bg-[var(--color-brand-yellow)] text-[var(--color-brand-dark)] shadow-[0_0_20px_rgba(255,242,0,0.4)] scale-105'
                                : 'bg-white text-[var(--color-brand-dark)] hover:bg-[var(--color-brand-cream)] hover:shadow-[0_0_15px_rgba(0,0,0,0.2)]'
                            }
                            ${!available ? 'opacity-50 cursor-not-allowed grayscale' : 'cursor-pointer'}
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
          </div>
        );
      })}
      {selectedVariant?.sellingPlanAllocations?.nodes?.length ? (
        <div className="my-6">
          <h5 className="text-2xl font-black uppercase tracking-wide text-center mb-4 text-[var(--color-brand-dark)]">Choose a Plan:</h5>
          <div className="flex flex-col gap-4">
            {selectedVariant.sellingPlanAllocations.nodes.map((allocation) => {
              const {sellingPlan, priceAdjustments} = allocation;
              const price = priceAdjustments?.[0]?.price?.amount;
              const compareAtPrice =
                priceAdjustments?.[0]?.compareAtPrice?.amount;

              return (
                <button
                  key={sellingPlan.id}
                  type="button"
                  className={`w-full text-left px-6 py-4 rounded-xl border-4 border-[var(--color-brand-dark)] transition-all duration-300 ease-out transform hover:scale-105 shadow-lg hover:shadow-xl ${
                    selectedSellingPlanId === sellingPlan.id
                      ? 'bg-[var(--color-brand-yellow)] text-[var(--color-brand-dark)] shadow-[0_0_20px_rgba(255,242,0,0.4)] scale-105'
                      : 'bg-white text-[var(--color-brand-dark)] hover:bg-[var(--color-brand-cream)] hover:shadow-[0_0_15px_rgba(0,0,0,0.2)]'
                  }`}
                  onClick={() => setSelectedSellingPlanId(sellingPlan.id)}
                >
                  <div className="font-black text-lg">{sellingPlan.name}</div>
                  {sellingPlan.description && (
                    <div className="text-sm text-gray-700">
                      {sellingPlan.description}
                    </div>
                  )}
                  {price && (
                    <div className="text-base mt-2">
                      <span className="font-black text-xl">
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
            <div key={`member-${index}`} className="space-y-4">
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
                    <option key={`month-${i}`} value={String(i + 1).padStart(2, '0')}>
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
                    <option key={`day-${i}`} value={String(i + 1).padStart(2, '0')}>
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
                      <option key={`year-${year}`} value={year}>
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

{!(notAvailable || notOnline) && (
        <div className="mt-8 flex flex-col items-center gap-4 justify-center">
          <h5 className="text-xl font-black uppercase tracking-wide text-center text-[var(--color-brand-dark)]">
            {is4Packs ? 'Number of Fun Packs:' : isChooseYourDate ? 'Number of Wristbands:' : 'Quantity:'}
          </h5>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center border-4 border-[var(--color-brand-dark)] rounded-xl bg-white shadow-lg">
                <button
                  type="button"
                  className="px-4 py-3 text-2xl font-black text-[var(--color-brand-dark)] hover:bg-[var(--color-brand-yellow)] transition-all duration-200 rounded-l-lg"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                >
                  −
                </button>
                <span className="px-6 py-3 text-xl font-black min-w-[3rem] text-center">{quantity}</span>
                <button
                  type="button"
                  className="px-4 py-3 text-2xl font-black text-[var(--color-brand-dark)] hover:bg-[var(--color-brand-yellow)] transition-all duration-200 rounded-r-lg"
                  onClick={() => setQuantity((q) => Math.min(maxQuantity, q + 1))}
                  disabled={quantity >= maxQuantity}
                >
                  +
                </button>
              </div>
              
              {/* Inventory Display */}
              {!allowsOverselling && showInventoryWarning && (
                <div className="text-center">
                  <p className="text-sm font-bold text-[var(--color-brand-red)]">
                    Only {maxQuantity} left in stock!
                  </p>
                </div>
              )}
              {!allowsOverselling && maxQuantity < 999 && maxQuantity >= 10 && (
                <div className="text-center">
                  <p className="text-xs font-semibold text-gray-600">
                    {maxQuantity} available
                  </p>
                </div>
              )}
            </div>

{isChooseYourDate && addFood ? (
            <button
              type="button"
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
              onClick={() => {
                setShowEatAndPlayModal(true);
              }}
              className="bg-[var(--color-brand-yellow)] text-black font-bold px-6 py-3 rounded border border-black shadow hover:bg-[var(--color-brand-yellow-hover)] hover:text-black transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {selectedVariant?.availableForSale ? 'Add to Cart' : 'Sold Out'}
            </button>
          ) : (
            <AddToCartButton
              data-add-to-cart-button
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
              onClick={() => {
                open('cart');
              }}
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
            )}
          </div>
        </div>
      )}
      
      {/* Unavailable Items Notice */}
      {(notAvailable || notOnline) && (
        <div className="mt-8 flex justify-center">
          <div className="bg-gray-100 border-4 border-[var(--color-brand-dark)] rounded-xl p-6 text-center max-w-md">
            <p className="text-lg font-black text-[var(--color-brand-dark)] mb-2">
              {notAvailable ? 'Not Currently Available' : 'Not Available Online'}
            </p>
            <p className="text-sm font-semibold text-gray-600">
              {notAvailable 
                ? 'This item is not currently available for purchase.' 
                : 'This item is not available for online purchase. Please visit the park or call for availability.'}
            </p>
          </div>
        </div>
      )}

      {/* Eat & Play Modal */}
      {showEatAndPlayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4" onClick={() => setShowEatAndPlayModal(false)}>
          <div 
            className="bg-white border-4 border-[var(--color-brand-dark)] rounded-xl p-8 max-w-2xl w-full shadow-2xl relative" 
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowEatAndPlayModal(false)}
              className="absolute top-4 right-4 text-3xl font-black text-[var(--color-brand-dark)] hover:text-[var(--color-brand-red)] transition-colors"
            >
              ×
            </button>
            
            <h2 className="text-3xl font-black uppercase text-center mb-6 text-[var(--color-brand-dark)]">
              Make it an Eat & Play Combo?
            </h2>
            
            <div className="text-center mb-6">
              <p className="text-xl font-bold mb-2">
                Add a combo meal for just <span className="text-[var(--color-brand-green)] text-2xl">$9.99</span> each!
              </p>
              <p className="text-sm text-gray-600">
                (Value of up to $13.99 compared to current in-park food pricing)
              </p>
            </div>
            
            <div className="bg-[var(--color-brand-cream)] border-2 border-[var(--color-brand-dark)] rounded-lg p-4 mb-4">
              <p className="text-sm font-semibold mb-2">Your combo meal includes one of the following:</p>
              <ul className="grid grid-cols-2 gap-2 text-sm">
                <li>• Cheeseburger Combo</li>
                <li>• Chicken Tender Combo</li>
                <li>• Chicken Sandwich Combo</li>
                <li>• Pizza Combo</li>
                <li>• Grilled Cheese Combo</li>
                <li>• Hot Dog Combo</li>
                <li>• Footlong Corndog Combo</li>
              </ul>
              <p className="text-xs mt-2 font-semibold">
                All combos include fries or chips, and a medium drink or water bottle.
              </p>
            </div>
            
            <div className="bg-yellow-50 border-2 border-[var(--color-brand-dark)] rounded-lg p-3 mb-6">
              <p className="text-xs font-bold text-gray-700 text-center">
                ⚠️ Note: Menu items are subject to availability. Some meal options may not be available on your visit date due to inventory.
              </p>
            </div>
            
            <div className="flex gap-4">
              {/* Yes - Add Combo Meal */}
              <CartForm 
                route="/cart" 
                inputs={{ 
                  lines: selectedVariant ? [
                    { merchandiseId: selectedVariant.id, quantity },
                    { merchandiseId: 'gid://shopify/ProductVariant/31774731534449', quantity } // Combo meal
                  ] : [] 
                }} 
                action={CartForm.ACTIONS.LinesAdd}
              >
                {(cartFetcher: any) => (
                  <button
                    type="submit"
                    onClick={() => {
                      // Let the form submit first, then close modal and open cart
                      setTimeout(() => {
                        setShowEatAndPlayModal(false);
                        open('cart');
                      }, 100);
                    }}
                    disabled={cartFetcher.state !== 'idle'}
                    className="flex-1 bg-[var(--color-brand-green)] hover:bg-[var(--color-brand-green-hover)] text-white font-black text-lg px-6 py-4 rounded-xl border-4 border-[var(--color-brand-dark)] shadow-lg hover:scale-105 transition-all duration-200 disabled:opacity-50"
                  >
                    Yes, Add Combo Meal!
                  </button>
                )}
              </CartForm>
              
              {/* No - Wristband Only */}
              <CartForm 
                route="/cart" 
                inputs={{ lines: selectedVariant ? [{ merchandiseId: selectedVariant.id, quantity }] : [] }} 
                action={CartForm.ACTIONS.LinesAdd}
              >
                {(cartFetcher: any) => (
                  <button
                    type="submit"
                    onClick={(e) => {
                      // Let the form submit first, then close modal and open cart
                      setTimeout(() => {
                        setShowEatAndPlayModal(false);
                        open('cart');
                      }, 100);
                    }}
                    disabled={cartFetcher.state !== 'idle'}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-[var(--color-brand-dark)] font-black text-lg px-6 py-4 rounded-xl border-4 border-[var(--color-brand-dark)] shadow-lg hover:scale-105 transition-all duration-200 disabled:opacity-50"
                  >
                    No Thanks
                  </button>
                )}
              </CartForm>
            </div>
          </div>
        </div>
      )}
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
