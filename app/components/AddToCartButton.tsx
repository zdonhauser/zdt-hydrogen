import { type FetcherWithComponents } from 'react-router';
import {CartForm, type OptimisticCartLineInput} from '@shopify/hydrogen';

export function AddToCartButton({
  analytics,
  children,
  disabled,
  lines,
  onClick,
}: {
  analytics?: unknown;
  children: React.ReactNode;
  disabled?: boolean;
  lines: Array<OptimisticCartLineInput>;
  onClick?: () => void;
}) {
  // Debug logging for cart lines
  console.log('=== AddToCartButton Debug ===');
  console.log('Lines being sent to cart:', lines);
  console.log('=== End AddToCartButton Debug ===');

  return (
    <CartForm route="/cart" inputs={{lines}} action={CartForm.ACTIONS.LinesAdd}>
      {(fetcher: FetcherWithComponents<any>) => (
        <>
          <input
            name="analytics"
            type="hidden"
            value={JSON.stringify(analytics)}
          />
          <button
            type="submit"
            onClick={onClick}
            disabled={disabled ?? fetcher.state !== 'idle'}
            className="bg-[var(--color-brand-yellow)] text-black font-bold px-6 py-3 rounded border border-black shadow hover:bg-[var(--color-brand-yellow-hover)] hover:text-black transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {children}
          </button>
        </>
      )}
    </CartForm>
  );
}
