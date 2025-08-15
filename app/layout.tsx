import {useNonce, Analytics} from '@shopify/hydrogen';
import { Links, Meta, Scripts, useRouteLoaderData, ScrollRestoration, Outlet, useLocation } from 'react-router';
import { useEffect, useState } from 'react';
import resetStyles from '~/styles/reset.css?url';
import appStyles from '~/styles/app.css?url';
import tailwindCss from './styles/tailwind.css?url';
import {PageLayout} from '~/components/PageLayout';
import FarewellHero from '~/components/FarewellHero';
import {RootLoader} from './root';

// Helper function to create a date in Central Time
function createCentralDate(dateString: string): Date {
  // If no time zone specified, assume Central Time
  if (!dateString.includes('T') && !dateString.includes(' ')) {
    // Just a date like "2025-08-18"
    return new Date(dateString + 'T00:00:00-05:00');
  }
  
  // If it has time but no timezone, assume Central Time
  if (!dateString.includes('+') && !dateString.includes('-05:00') && !dateString.includes('Z')) {
    return new Date(dateString + '-05:00');
  }
  
  return new Date(dateString);
}

export default function Layout() {
  const nonce = useNonce();
  const data = useRouteLoaderData<RootLoader>('root');
  const location = useLocation();
  
  // Check for park closure immediately
  const PARK_CLOSING_DATE = new Date('2025-08-17T23:59:59-05:00'); // Central Time
  const params = new URLSearchParams(location.search);
  const dateOverride = params.get('date');
  
  let isParkClosed = false;
  
  if (dateOverride) {
    const testDate = createCentralDate(dateOverride);
    if (!isNaN(testDate.getTime())) {
      isParkClosed = testDate > PARK_CLOSING_DATE;
    }
  } else {
    // Check if park is closed from server data or current date
    isParkClosed = data?.isParkClosed || new Date() > PARK_CLOSING_DATE;
  }

  // If park is closed, show farewell page on all routes
  if (isParkClosed) {
    return (
      <html lang="en">
        <head>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width,initial-scale=1" />
          <link rel="stylesheet" href={tailwindCss}></link>
          <link rel="stylesheet" href={resetStyles}></link>
          <link rel="stylesheet" href={appStyles}></link>
          <title>ZDT's Amusement Park - Thank You for 18 Amazing Years</title>
          <meta name="description" content="ZDT's Amusement Park is now closed. Thank you for 18 amazing years of memories." />
          <Meta />
          <Links />
        </head>
        <body>
          <FarewellHero />
          <Scripts nonce={nonce} />
        </body>
      </html>
    );
  }

  // Normal operation before closing date
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <link rel="stylesheet" href={tailwindCss}></link>
        <link rel="stylesheet" href={resetStyles}></link>
        <link rel="stylesheet" href={appStyles}></link>
        <Meta />
        <Links />
      </head>
      <body>
        {data ? (
          <Analytics.Provider
            cart={data.cart}
            shop={data.shop}
            consent={data.consent}
          >
            <PageLayout {...data}>
              <Outlet />
            </PageLayout>
          </Analytics.Provider>
        ) : (
          <Outlet />
        )}
        <ScrollRestoration nonce={nonce} />
        <Scripts nonce={nonce} />
      </body>
    </html>
  );
}
