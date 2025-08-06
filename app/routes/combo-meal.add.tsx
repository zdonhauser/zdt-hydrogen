import { type ActionFunctionArgs } from '@shopify/remix-oxygen';

export async function action({ request, context }: ActionFunctionArgs) {
  const { cart } = context;

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { 
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const formData = await request.formData();
  const wristbandVariantId = String(formData.get('wristbandVariantId'));
  const quantity = parseInt(String(formData.get('quantity')), 10) || 1;

  if (!wristbandVariantId) {
    return new Response(JSON.stringify({ error: 'Wristband variant ID is required' }), { 
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const lines = [
      {
        merchandiseId: wristbandVariantId,
        quantity,
      },
      {
        merchandiseId: 'gid://shopify/ProductVariant/31774731534449', // Combo meal variant ID
        quantity,
      }
    ];

    const result = await cart.addLines(lines);

    if (result.cart) {
      return new Response(JSON.stringify({ success: true, cart: result.cart }), {
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      return new Response(JSON.stringify({ error: 'Failed to add items to cart' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  } catch (error) {
    console.error('Error adding combo meal to cart:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}