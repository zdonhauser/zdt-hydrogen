import type {LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {redirect} from '@shopify/remix-oxygen';

export async function loader(_: LoaderFunctionArgs) {
  return redirect('/');
}

export default function CatchAllPage() {
  return null;
}
