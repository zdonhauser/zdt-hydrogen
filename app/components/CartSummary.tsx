import type {CartApiQueryFragment} from 'storefrontapi.generated';
import type {CartLayout} from '~/components/CartMain';
import {CartForm, Money, type OptimisticCart} from '@shopify/hydrogen';
import {useMemo, useRef} from 'react';
import {FetcherWithComponents} from '@remix-run/react';

type CartSummaryProps = {
  cart: OptimisticCart<CartApiQueryFragment | null>;
  layout: CartLayout;
};

export function CartSummary({cart, layout}: CartSummaryProps) {
  const className = "bg-white p-6 border border-black rounded shadow mt-6";

  const estimatedTaxRate = 0.0825; // 8.25% for Texas
  const estimatedTax = useMemo(() => {
    const total = parseFloat(cart.cost?.totalAmount?.amount || '0');
    return total * estimatedTaxRate;
  }, [cart.cost?.totalAmount?.amount]);

  const estimatedDiscounts = useMemo(() => {
    const subtotal = parseFloat(cart.cost?.subtotalAmount?.amount || '0');
    const total = parseFloat(cart.cost?.totalAmount?.amount || '0');
    return subtotal - total;
  }, [cart.cost?.subtotalAmount?.amount, cart.cost?.totalAmount?.amount]);

  return (
    <div aria-labelledby="cart-summary" className={className}>
      <h4 className="text-xl font-bold mb-4">Totals</h4>
      <dl className="flex justify-between pt-2 text-lg font-semibold">
        <dt>Subtotal</dt>
        <dd>
          {cart.cost?.subtotalAmount?.amount ? (
            <Money data={cart.cost?.subtotalAmount} />
          ) : (
            '-'
          )}
        </dd>
      </dl>
      {/* Discount totals */}
      {estimatedDiscounts > 0 && (
        <dl className="flex justify-between  pt-2 text-lg font-semibold">
          <dt>Discount</dt>
          <dd>{`($${estimatedDiscounts.toFixed(2)})`}</dd>
        </dl>
      )}
      {estimatedTax > 0 && (
        <dl className="flex justify-between  pt-2 text-lg font-semibold">
          <dt>Estimated Tax</dt>
          <dd>${estimatedTax.toFixed(2)}</dd>
        </dl>
      )}
      <dl className="flex justify-between pt-2 text-lg font-semibold">
        <dt>Total</dt>
        <dd>
          ${(Number(cart.cost?.totalAmount?.amount) + estimatedTax).toFixed(2)}
        </dd>
      </dl>
      <CartDiscounts discountCodes={cart.discountCodes} />
      <CartGiftCard giftCardCodes={cart.appliedGiftCards} />
      <CartCheckoutActions checkoutUrl={cart.checkoutUrl} />
      <br />

    </div>
  );
}
function CartCheckoutActions({checkoutUrl}: {checkoutUrl?: string}) {
  if (!checkoutUrl) return null;

  return (
    <div>
      <a
        href={checkoutUrl}
        target="_self"
        className="inline-block w-full text-right mt-4 bg-[var(--color-brand-yellow)] text-black font-bold px-6 py-3 rounded border border-black shadow hover:bg-[var(--color-brand-yellow-hover)] hover:text-black transition"
      >
        Continue to Checkout →
      </a>
      <br />
    </div>
  );
}

function CartDiscounts({
  discountCodes,
}: {
  discountCodes?: CartApiQueryFragment['discountCodes'];
}) {
  const codes: string[] =
    discountCodes
      ?.filter((discount) => discount.applicable)
      ?.map(({code}) => code) || [];

  return (
    <div>
      {/* Have existing discount, display it with a remove option */}
      <dl hidden={!codes.length}>
        <div>
          <dt>Discount(s)</dt>
          <UpdateDiscountForm>
            <div className="flex items-center gap-2 mt-2 bg-yellow-100 border border-black rounded px-4 py-2">
              <code className="text-black font-mono">{codes?.join(', ')}</code>
              <button className="text-red-600 font-bold hover:underline text-right">Remove</button>
              {/*discount amount*/}
            </div>
          </UpdateDiscountForm>
        </div>
      </dl>

      {/* Show an input to apply a discount */}
      <UpdateDiscountForm discountCodes={codes}>
        <div className="flex mt-2 gap-2">
          <input
            type="text"
            name="discountCode"
            placeholder="Discount code"
            className="border border-black rounded px-3 py-2 flex-grow w-3/4"
          />
          <button
            type="submit"
            className="bg-[var(--color-brand-yellow)] text-black font-bold w-1/4 px-4 py-2 rounded border border-black shadow hover:bg-[var(--color-brand-yellow-hover)] hover:text-black transition"
          >
            Apply
          </button>
        </div>
      </UpdateDiscountForm>
    </div>
  );
}

function UpdateDiscountForm({
  discountCodes,
  children,
}: {
  discountCodes?: string[];
  children: React.ReactNode;
}) {
  return (
    <CartForm
      route="/cart"
      action={CartForm.ACTIONS.DiscountCodesUpdate}
      inputs={{
        discountCodes: discountCodes || [],
      }}
    >
      {children}
    </CartForm>
  );
}

function CartGiftCard({
  giftCardCodes,
}: {
  giftCardCodes: CartApiQueryFragment['appliedGiftCards'] | undefined;
}) {
  const appliedGiftCardCodes = useRef<string[]>([]);
  const giftCardCodeInput = useRef<HTMLInputElement>(null);
  const codes: string[] =
    giftCardCodes?.map(({lastCharacters}) => `***${lastCharacters}`) || [];

  function saveAppliedCode(code: string) {
    const formattedCode = code.replace(/\s/g, ''); // Remove spaces
    if (!appliedGiftCardCodes.current.includes(formattedCode)) {
      appliedGiftCardCodes.current.push(formattedCode);
    }
    giftCardCodeInput.current!.value = '';
  }

  function removeAppliedCode() {
    appliedGiftCardCodes.current = [];
  }

  return (
    <div>
      {/* Have existing gift card applied, display it with a remove option */}
      <dl hidden={!codes.length}>
        <div>
          <dt>Applied Gift Card(s)</dt>
          <UpdateGiftCardForm>
            <div className="flex items-center gap-2 mt-2 bg-yellow-100 border border-black rounded px-4 py-2">
              <code className="text-black font-mono">{codes?.join(', ')}</code>
              &nbsp;
              <button className="text-red-600 font-bold hover:underline" onSubmit={() => removeAppliedCode}>Remove</button>
            </div>
          </UpdateGiftCardForm>
        </div>
      </dl>

      {/* Show an input to apply a discount */}
      <UpdateGiftCardForm
        giftCardCodes={appliedGiftCardCodes.current}
        saveAppliedCode={saveAppliedCode}
      >
        <div className="flex mt-2 gap-2">
          <input
            type="text"
            name="giftCardCode"
            placeholder="Gift card code"
            ref={giftCardCodeInput}
            className="border border-black rounded px-3 py-2 flex-grow w-3/4"
          />
          <button
            type="submit"
            className="bg-[var(--color-brand-yellow)] text-black font-bold w-1/4 px-4 py-2 rounded border border-black shadow hover:bg-[var(--color-brand-yellow-hover)] hover:text-black transition"
          >
            Apply
          </button>
        </div>
      </UpdateGiftCardForm>
    </div>
  );
}

function UpdateGiftCardForm({
  giftCardCodes,
  saveAppliedCode,
  children,
}: {
  giftCardCodes?: string[];
  saveAppliedCode?: (code: string) => void;
  removeAppliedCode?: () => void;
  children: React.ReactNode;
}) {
  return (
    <CartForm
      route="/cart"
      action={CartForm.ACTIONS.GiftCardCodesUpdate}
      inputs={{
        giftCardCodes: giftCardCodes || [],
      }}
    >
      {(fetcher: FetcherWithComponents<any>) => {
        const code = fetcher.formData?.get('giftCardCode');
        if (code && saveAppliedCode) {
          saveAppliedCode(code as string);
        }
        return children;
      }}
    </CartForm>
  );
}
