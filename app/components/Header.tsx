import {Suspense, useState} from 'react';
import {Await, NavLink, useAsyncValue} from '@remix-run/react';
import {
  type CartViewPayload,
  useAnalytics,
  useOptimisticCart,
} from '@shopify/hydrogen';
import type {HeaderQuery, CartApiQueryFragment} from 'storefrontapi.generated';
import {Aside, useAside} from '~/components/Aside';

interface HeaderProps {
  header: HeaderQuery;
  cart: Promise<CartApiQueryFragment | null>;
  isLoggedIn: Promise<boolean>;
  publicStoreDomain: string;
}

type Viewport = 'desktop' | 'mobile';

export function Header({
  header,
  isLoggedIn,
  cart,
  publicStoreDomain,
}: HeaderProps) {
  const {menu} = header;

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-[var(--color-brand-yellow)] text-black border-b-4 border-black font-black tracking-wide shadow-[0_4px_0_rgba(0,0,0,0.6)] px-4 py-3 flex items-center justify-between">
        <NavLink to="/" className="flex items-center">
          <img
            src="/logos/black.png"
            alt="ZDT's Logo"
            className="w-14 h-auto md:w-32 drop-shadow-md"
          />
        </NavLink>

        <HeaderMenuMobileToggle />

        {/* Desktop menu */}
        <HeaderMenu
          menu={menu}
          viewport="desktop"
          primaryDomainUrl={header.shop.primaryDomain.url}
          publicStoreDomain={publicStoreDomain}
        />
      </header>

      {/* Mobile menu inside Aside */}
      <Aside type="mobile" heading="Menu">
        <HeaderMenu
          menu={menu || FALLBACK_HEADER_MENU}
          viewport="mobile"
          primaryDomainUrl={header.shop.primaryDomain.url}
          publicStoreDomain={publicStoreDomain}
        />
      </Aside>
    </>
  );
}

export function HeaderMenu({
  menu,
  primaryDomainUrl,
  viewport,
  publicStoreDomain,
}: {
  menu: HeaderProps['header']['menu'];
  primaryDomainUrl: HeaderProps['header']['shop']['primaryDomain']['url'];
  viewport: Viewport;
  publicStoreDomain: HeaderProps['publicStoreDomain'];
}) {
  const {close} = useAside();
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpandedMenus((prev: Record<string, boolean>) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const baseStyles =
    'flex flex-col gap-6 text-lg font-black uppercase tracking-wide';
  const desktopStyles = 'hidden md:flex md:flex-row md:items-center';
  const mobileStyles = 'p-6 text-black';

  const className =
    viewport === 'desktop'
      ? `${baseStyles} ${desktopStyles}`
      : `${baseStyles} ${mobileStyles}`;

  return (
    <nav className={className} role="navigation">
      {(menu || FALLBACK_HEADER_MENU)?.items.map((item) => {
        const hasChildren = item.items?.length > 0;
        const isExpanded = expandedMenus[item.id];
        const url =
          item.url?.includes('myshopify.com') ||
          item.url?.includes(publicStoreDomain) ||
          item.url?.includes(primaryDomainUrl)
            ? new URL(item.url).pathname
            : item.url;

        return (
          <div key={item.id} className="flex flex-col gap-2">
            {hasChildren ? (
              <>
                <button
                  type="button"
                  className="flex items-center justify-between w-full hover:text-red-600 transition-colors"
                  onClick={() => toggleExpand(item.id)}
                >
                  {item.title}
                  <span>{isExpanded ? '▲' : '▼'}</span>
                </button>
                {isExpanded && (
                  <ul className="ml-4 mt-1 flex flex-col gap-1">
                    {item.items.map((sub) => {
                      const subUrl =
                        sub.url?.includes('myshopify.com') ||
                        sub.url?.includes(publicStoreDomain) ||
                        sub.url?.includes(primaryDomainUrl)
                          ? new URL(sub.url).pathname
                          : sub.url;

                      return (
                        <li key={sub.id}>
                          <NavLink
                            to={subUrl || ''}
                            onClick={close}
                            className="text-base hover:text-red-600 transition-colors"
                          >
                            {sub.title}
                          </NavLink>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </>
            ) : (
              <NavLink
                to={url || ''}
                onClick={close}
                prefetch="intent"
                className="hover:text-red-600 transition-colors"
              >
                {item.title}
              </NavLink>
            )}
          </div>
        );
      })}
    </nav>
  );
}


function HeaderMenuMobileToggle() {
  const {open} = useAside();
  return (
    <button
      className="bg-black text-[var(--color-brand-yellow)] px-4 py-2 rounded-full shadow-[0_3px_0_rgba(0,0,0,0.6)] hover:bg-[var(--color-brand-yellow-hover)] hover:text-black transition-all md:hidden"
      onClick={() => open('mobile')}
    >
      ☰
    </button>
  );
}

function activeLinkStyle({
  isActive,
  isPending,
}: {
  isActive: boolean;
  isPending: boolean;
}) {
  return {
    fontWeight: isActive ? 'bold' : undefined,
    color: isPending ? 'rgba(255,255,255,0.6)' : 'white',
  };
}

function CartBadge({count}: {count: number | null}) {
  const {open} = useAside();
  const {publish, shop, cart, prevCart} = useAnalytics();

  return (
    <a
      href="/cart"
      className="bg-black text-[var(--color-brand-yellow)] px-4 py-2 rounded-full shadow-[0_3px_0_rgba(0,0,0,0.6)] hover:bg-[var(--color-brand-yellow-hover)] hover:text-black transition-all"
      onClick={(e) => {
        e.preventDefault();
        open('cart');
        publish('cart_viewed', {
          cart,
          prevCart,
          shop,
          url: window.location.href || '',
        } as CartViewPayload);
      }}
    >
      Cart {count === null ? <span>&nbsp;</span> : count}
    </a>
  );
}

function CartToggle({cart}: Pick<HeaderProps, 'cart'>) {
  return (
    <Suspense fallback={<CartBadge count={null} />}>
      <Await resolve={cart}>
        <CartBanner />
      </Await>
    </Suspense>
  );
}

function CartBanner() {
  const originalCart = useAsyncValue() as CartApiQueryFragment | null;
  const cart = useOptimisticCart(originalCart);
  return <CartBadge count={cart?.totalQuantity ?? 0} />;
}

const FALLBACK_HEADER_MENU: HeaderProps['header']['menu'] = {
  id: 'gid://shopify/Menu/199655587896',
  items: [
    {
      id: 'gid://shopify/MenuItem/461609500728',
      resourceId: null,
      tags: [],
      title: 'Collections',
      type: 'HTTP',
      url: '/collections',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609533496',
      resourceId: null,
      tags: [],
      title: 'Blog',
      type: 'HTTP',
      url: '/blogs/journal',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609566264',
      resourceId: null,
      tags: [],
      title: 'Policies',
      type: 'HTTP',
      url: '/policies',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609599032',
      resourceId: 'gid://shopify/Page/92591030328',
      tags: [],
      title: 'About',
      type: 'PAGE',
      url: '/pages/about',
      items: [],
    },
  ],
};
