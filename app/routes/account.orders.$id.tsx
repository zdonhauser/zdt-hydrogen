import {redirect, type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import { useLoaderData, type MetaFunction } from 'react-router';
import {Money, Image, flattenConnection} from '@shopify/hydrogen';
import type {OrderLineItemFullFragment} from 'customer-accountapi.generated';
import {CUSTOMER_ORDER_QUERY} from '~/graphql/customer-account/CustomerOrderQuery';

export const meta: MetaFunction<typeof loader> = ({data}) => {
  return [{title: `Order ${data?.order?.name}`}];
};

export async function loader({params, context}: LoaderFunctionArgs) {
  if (!params.id) {
    return redirect('/account/orders');
  }

  const orderId = atob(params.id);
  const {data, errors} = await context.customerAccount.query(
    CUSTOMER_ORDER_QUERY,
    {
      variables: {orderId},
    },
  );

  if (errors?.length || !data?.order) {
    throw new Error('Order not found');
  }

  const {order} = data;

  const lineItems = flattenConnection(order.lineItems);
  const discountApplications = flattenConnection(order.discountApplications);

  const fulfillmentStatus =
    flattenConnection(order.fulfillments)[0]?.status ?? 'N/A';

  const firstDiscount = discountApplications[0]?.value;

  const discountValue =
    firstDiscount?.__typename === 'MoneyV2' && firstDiscount;

  const discountPercentage =
    firstDiscount?.__typename === 'PricingPercentageValue' &&
    firstDiscount?.percentage;

  return {
    order,
    lineItems,
    discountValue,
    discountPercentage,
    fulfillmentStatus,
  };
}

export default function OrderRoute() {
  const {
    order,
    lineItems,
    discountValue,
    discountPercentage,
    fulfillmentStatus,
  } = useLoaderData<typeof loader>();
  return (
    <div className="max-w-6xl mx-auto">
        <div className="bg-white border-4 border-[var(--color-brand-dark)] rounded-xl shadow-xl overflow-hidden">
          <div className="bg-[var(--color-brand-green)] border-b-4 border-[var(--color-brand-dark)] p-6">
            <h2 className="text-3xl font-black uppercase tracking-wide text-white text-center">
              Order {order.name}
            </h2>
            <p className="text-lg font-semibold text-white text-center mt-2">
              Placed on {new Date(order.processedAt!).toDateString()}
            </p>
          </div>
          
          <div className="p-8 space-y-8">
            {/* Order Items Table */}
            <div className="overflow-x-auto">
              <table className="w-full border-4 border-[var(--color-brand-dark)] rounded-xl overflow-hidden">
                <thead className="bg-[var(--color-brand-yellow)]">
                  <tr>
                    <th scope="col" className="px-6 py-4 text-left text-lg font-black uppercase tracking-wide text-[var(--color-brand-dark)] border-b-4 border-[var(--color-brand-dark)]">Product</th>
                    <th scope="col" className="px-6 py-4 text-left text-lg font-black uppercase tracking-wide text-[var(--color-brand-dark)] border-b-4 border-[var(--color-brand-dark)]">Price</th>
                    <th scope="col" className="px-6 py-4 text-left text-lg font-black uppercase tracking-wide text-[var(--color-brand-dark)] border-b-4 border-[var(--color-brand-dark)]">Quantity</th>
                    <th scope="col" className="px-6 py-4 text-left text-lg font-black uppercase tracking-wide text-[var(--color-brand-dark)] border-b-4 border-[var(--color-brand-dark)]">Total</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {lineItems.map((lineItem, lineItemIndex) => (
                    <OrderLineRow key={lineItemIndex} lineItem={lineItem} />
                  ))}
                </tbody>
                <tfoot className="bg-[var(--color-brand-cream)]">
                  {((discountValue && discountValue.amount) || discountPercentage) && (
                    <tr className="border-t-4 border-[var(--color-brand-dark)]">
                      <th scope="row" colSpan={3} className="px-6 py-4 text-right text-lg font-black text-[var(--color-brand-dark)]">
                        Discounts:
                      </th>
                      <td className="px-6 py-4 text-lg font-bold text-[var(--color-brand-red)]">
                        {discountPercentage ? (
                          <span>-{discountPercentage}% OFF</span>
                        ) : (
                          discountValue && <Money data={discountValue!} />
                        )}
                      </td>
                    </tr>
                  )}
                  <tr className="border-t-4 border-[var(--color-brand-dark)]">
                    <th scope="row" colSpan={3} className="px-6 py-4 text-right text-lg font-black text-[var(--color-brand-dark)]">
                      Subtotal:
                    </th>
                    <td className="px-6 py-4 text-lg font-bold text-[var(--color-brand-dark)]">
                      <Money data={order.subtotal!} />
                    </td>
                  </tr>
                  <tr>
                    <th scope="row" colSpan={3} className="px-6 py-4 text-right text-lg font-black text-[var(--color-brand-dark)]">
                      Tax:
                    </th>
                    <td className="px-6 py-4 text-lg font-bold text-[var(--color-brand-dark)]">
                      <Money data={order.totalTax!} />
                    </td>
                  </tr>
                  <tr className="border-t-4 border-[var(--color-brand-dark)]">
                    <th scope="row" colSpan={3} className="px-6 py-4 text-right text-xl font-black text-[var(--color-brand-dark)]">
                      Total:
                    </th>
                    <td className="px-6 py-4 text-xl font-black text-[var(--color-brand-dark)]">
                      <Money data={order.totalPrice!} />
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Order Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Shipping Address */}
              <div className="bg-[var(--color-brand-cream)] border-4 border-[var(--color-brand-dark)] rounded-xl p-6">
                <h3 className="text-2xl font-black uppercase tracking-wide text-[var(--color-brand-dark)] mb-4">
                  Shipping Address
                </h3>
                {order?.shippingAddress ? (
                  <address className="not-italic space-y-2">
                    <p className="text-lg font-bold text-[var(--color-brand-dark)]">{order.shippingAddress.name}</p>
                    {order.shippingAddress.formatted && (
                      <p className="text-base font-semibold text-gray-700">{order.shippingAddress.formatted}</p>
                    )}
                    {order.shippingAddress.formattedArea && (
                      <p className="text-base font-semibold text-gray-700">{order.shippingAddress.formattedArea}</p>
                    )}
                  </address>
                ) : (
                  <p className="text-base font-semibold text-gray-600">No shipping address defined</p>
                )}
              </div>

              {/* Order Status */}
              <div className="bg-[var(--color-brand-cream)] border-4 border-[var(--color-brand-dark)] rounded-xl p-6">
                <h3 className="text-2xl font-black uppercase tracking-wide text-[var(--color-brand-dark)] mb-4">
                  Status
                </h3>
                <span className="inline-block bg-white border-2 border-[var(--color-brand-dark)] rounded-lg px-4 py-2 text-lg font-bold text-[var(--color-brand-dark)]">
                  {fulfillmentStatus}
                </span>
              </div>
            </div>

            {/* View Order Status Link */}
            <div className="text-center pt-4">
              <a 
                target="_blank" 
                href={order.statusPageUrl} 
                rel="noreferrer"
                className="inline-block bg-[var(--color-brand-blue)] hover:bg-[var(--color-brand-blue-hover)] text-white font-black text-lg px-8 py-4 rounded-xl border-4 border-[var(--color-brand-dark)] shadow-lg hover:scale-105 transition-all duration-200"
              >
                View Order Status →
              </a>
            </div>
          </div>
        </div>
    </div>
  );
}

function OrderLineRow({lineItem}: {lineItem: OrderLineItemFullFragment}) {
  return (
    <tr key={lineItem.id} className="border-b-2 border-gray-200 hover:bg-[var(--color-brand-cream)] transition-colors">
      <td className="px-6 py-4">
        <div className="flex items-center gap-4">
          {lineItem?.image && (
            <div className="w-16 h-16 border-2 border-[var(--color-brand-dark)] rounded-lg overflow-hidden flex-shrink-0">
              <Image data={lineItem.image} width={64} height={64} className="w-full h-full object-cover" />
            </div>
          )}
          <div>
            <p className="text-lg font-bold text-[var(--color-brand-dark)]">{lineItem.title}</p>
            {lineItem.variantTitle && (
              <p className="text-sm font-semibold text-gray-600">{lineItem.variantTitle}</p>
            )}
          </div>
        </div>
      </td>
      <td className="px-6 py-4 text-lg font-bold text-[var(--color-brand-dark)]">
        <Money data={lineItem.price!} />
      </td>
      <td className="px-6 py-4 text-lg font-bold text-[var(--color-brand-dark)]">
        {lineItem.quantity}
      </td>
      <td className="px-6 py-4 text-lg font-bold text-[var(--color-brand-dark)]">
        <Money data={lineItem.totalDiscount!} />
      </td>
    </tr>
  );
}
