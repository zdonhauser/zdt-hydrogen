import {redirect} from '@shopify/remix-oxygen';
import type {LoaderFunctionArgs} from '@shopify/remix-oxygen';

export async function loader(_: LoaderFunctionArgs) {
  return redirect('/pages/contact-us');
}

export default function ContactRedirect() {
  return null;
}