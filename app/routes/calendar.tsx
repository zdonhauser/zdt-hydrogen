import {redirect} from '@shopify/remix-oxygen';
import type {LoaderFunctionArgs} from '@shopify/remix-oxygen';

export async function loader(_: LoaderFunctionArgs) {
  return redirect('/pages/hours');
}

export default function CalendarRedirect() {
  return null;
}