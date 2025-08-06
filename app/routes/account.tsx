import {
  data as remixData,
  type LoaderFunctionArgs,
} from '@shopify/remix-oxygen';
import { Form, NavLink, Outlet, useLoaderData } from 'react-router';
import {CUSTOMER_DETAILS_QUERY} from '~/graphql/customer-account/CustomerDetailsQuery';

export function shouldRevalidate() {
  return true;
}

export async function loader({context}: LoaderFunctionArgs) {
  const {data, errors} = await context.customerAccount.query(
    CUSTOMER_DETAILS_QUERY,
  );

  if (errors?.length || !data?.customer) {
    throw new Error('Customer not found');
  }

  return remixData(
    {customer: data.customer},
    {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    },
  );
}

export default function AccountLayout() {
  const {customer} = useLoaderData<typeof loader>();

  const heading = customer
    ? customer.firstName
      ? `Welcome, ${customer.firstName}!`
      : `Welcome to your account!`
    : 'Account Details';

  return (
    <div className="w-full px-4 py-8 bg-[var(--color-brand-cream)] min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-wide text-[var(--color-brand-dark)] mb-6">
            {heading}
          </h1>
          <AccountMenu />
        </div>
        
        {/* Content */}
        <Outlet context={{customer}} />
      </div>
    </div>
  );
}

function AccountMenu() {
  function getNavLinkClasses({
    isActive,
    isPending,
  }: {
    isActive: boolean;
    isPending: boolean;
  }) {
    return `
      px-6 py-3 font-black text-lg uppercase tracking-wide rounded-xl border-4 border-[var(--color-brand-dark)] shadow-lg hover:scale-105 transition-all duration-200
      ${isActive 
        ? 'bg-[var(--color-brand-yellow)] text-[var(--color-brand-dark)] scale-105' 
        : 'bg-white text-[var(--color-brand-dark)] hover:bg-[var(--color-brand-cream)]'
      }
      ${isPending ? 'opacity-50' : ''}
    `;
  }

  return (
    <nav role="navigation" className="flex flex-wrap justify-center gap-4 mb-8">
      <NavLink to="/account/orders" className={getNavLinkClasses}>
        Orders
      </NavLink>
      <NavLink to="/account/profile" className={getNavLinkClasses}>
        Profile
      </NavLink>
      <NavLink to="/account/addresses" className={getNavLinkClasses}>
        Addresses
      </NavLink>
      <Logout />
    </nav>
  );
}

function Logout() {
  return (
    <Form method="POST" action="/account/logout">
      <button 
        type="submit"
        className="px-6 py-3 font-black text-lg uppercase tracking-wide rounded-xl border-4 border-[var(--color-brand-dark)] shadow-lg hover:scale-105 transition-all duration-200 bg-[var(--color-brand-red)] hover:bg-[var(--color-brand-red-hover)] text-white"
      >
        Sign Out
      </button>
    </Form>
  );
}
