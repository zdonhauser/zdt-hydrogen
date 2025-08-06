import { Link, useLoaderData, type MetaFunction } from 'react-router';
import {
  Money,
  getPaginationVariables,
  flattenConnection,
} from '@shopify/hydrogen';
import {type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {CUSTOMER_ORDERS_QUERY} from '~/graphql/customer-account/CustomerOrdersQuery';
import type {
  CustomerOrdersFragment,
  OrderItemFragment,
} from 'customer-accountapi.generated';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';

export const meta: MetaFunction = () => {
  return [{title: 'Orders'}];
};

export async function loader({request, context}: LoaderFunctionArgs) {
  const paginationVariables = getPaginationVariables(request, {
    pageBy: 20,
  });

  const {data, errors} = await context.customerAccount.query(
    CUSTOMER_ORDERS_QUERY,
    {
      variables: {
        ...paginationVariables,
      },
    },
  );

  if (errors?.length || !data?.customer) {
    throw Error('Customer orders not found');
  }

  return {customer: data.customer};
}

export default function Orders() {
  const {customer} = useLoaderData<{customer: CustomerOrdersFragment}>();
  const {orders} = customer;
  return (
    <div className="max-w-4xl mx-auto">
        <div className="bg-white border-4 border-[var(--color-brand-dark)] rounded-xl shadow-xl overflow-hidden">
          <div className="bg-[var(--color-brand-blue)] border-b-4 border-[var(--color-brand-dark)] p-6">
            <h2 className="text-3xl font-black uppercase tracking-wide text-white text-center">
              My Orders
            </h2>
          </div>
          
          <div className="p-8">
            {orders.nodes.length ? <OrdersTable orders={orders} /> : <EmptyOrders />}
          </div>
        </div>
    </div>
  );
}

function OrdersTable({orders}: Pick<CustomerOrdersFragment, 'orders'>) {
  return (
    <div className="space-y-4">
      {orders?.nodes.length ? (
        <PaginatedResourceSection connection={orders}>
          {({node: order}) => <OrderItem key={order.id} order={order} />}
        </PaginatedResourceSection>
      ) : (
        <EmptyOrders />
      )}
    </div>
  );
}

function EmptyOrders() {
  return (
    <div className="text-center py-12">
      <div className="bg-[var(--color-brand-cream)] border-4 border-[var(--color-brand-dark)] rounded-xl p-8 max-w-md mx-auto">
        <h3 className="text-2xl font-black uppercase tracking-wide text-[var(--color-brand-dark)] mb-4">
          No Orders Yet
        </h3>
        <p className="text-lg font-semibold text-gray-600 mb-6">
          You haven't placed any orders yet.
        </p>
        <Link 
          to="/collections"
          className="inline-block bg-[var(--color-brand-yellow)] hover:bg-[var(--color-brand-yellow-hover)] text-[var(--color-brand-dark)] font-black text-lg px-8 py-4 rounded-xl border-4 border-[var(--color-brand-dark)] shadow-lg hover:scale-105 transition-all duration-200"
        >
          Start Shopping →
        </Link>
      </div>
    </div>
  );
}

function OrderItem({order}: {order: OrderItemFragment}) {
  const fulfillmentStatus = flattenConnection(order.fulfillments)[0]?.status;
  return (
    <div className="bg-[var(--color-brand-cream)] border-4 border-[var(--color-brand-dark)] rounded-xl p-6 hover:shadow-lg transition-shadow">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-2">
          <Link 
            to={`/account/orders/${btoa(order.id)}`}
            className="text-2xl font-black text-[var(--color-brand-dark)] hover:text-[var(--color-brand-blue)] transition-colors"
          >
            #{order.number}
          </Link>
          <p className="text-lg font-semibold text-gray-700">
            {new Date(order.processedAt).toDateString()}
          </p>
          <div className="flex flex-wrap gap-3">
            <span className="inline-block bg-white border-2 border-[var(--color-brand-dark)] rounded-lg px-3 py-1 text-sm font-bold text-[var(--color-brand-dark)]">
              {order.financialStatus}
            </span>
            {fulfillmentStatus && (
              <span className="inline-block bg-white border-2 border-[var(--color-brand-dark)] rounded-lg px-3 py-1 text-sm font-bold text-[var(--color-brand-dark)]">
                {fulfillmentStatus}
              </span>
            )}
          </div>
        </div>
        
        <div className="flex flex-col items-end gap-3">
          <div className="text-2xl font-black text-[var(--color-brand-dark)]">
            <Money data={order.totalPrice} />
          </div>
          <Link 
            to={`/account/orders/${btoa(order.id)}`}
            className="bg-[var(--color-brand-green)] hover:bg-[var(--color-brand-green-hover)] text-white font-black px-6 py-2 rounded-xl border-2 border-[var(--color-brand-dark)] shadow-md hover:scale-105 transition-all duration-200"
          >
            View Order →
          </Link>
        </div>
      </div>
    </div>
  );
}
