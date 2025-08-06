import type {CustomerFragment} from 'customer-accountapi.generated';
import type {CustomerUpdateInput} from '@shopify/hydrogen/customer-account-api-types';
import {CUSTOMER_UPDATE_MUTATION} from '~/graphql/customer-account/CustomerUpdateMutation';
import {
  data,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from '@shopify/remix-oxygen';
import { Form, useActionData, useNavigation, useOutletContext, type MetaFunction } from 'react-router';

export type ActionResponse = {
  error: string | null;
  customer: CustomerFragment | null;
};

export const meta: MetaFunction = () => {
  return [{title: 'Profile'}];
};

export async function loader({context}: LoaderFunctionArgs) {
  await context.customerAccount.handleAuthStatus();

  return {};
}

export async function action({request, context}: ActionFunctionArgs) {
  const {customerAccount} = context;

  if (request.method !== 'PUT') {
    return data({error: 'Method not allowed'}, {status: 405});
  }

  const form = await request.formData();

  try {
    const customer: CustomerUpdateInput = {};
    const validInputKeys = ['firstName', 'lastName'] as const;
    for (const [key, value] of form.entries()) {
      if (!validInputKeys.includes(key as any)) {
        continue;
      }
      if (typeof value === 'string' && value.length) {
        customer[key as (typeof validInputKeys)[number]] = value;
      }
    }

    // update customer and possibly password
    const {data, errors} = await customerAccount.mutate(
      CUSTOMER_UPDATE_MUTATION,
      {
        variables: {
          customer,
        },
      },
    );

    if (errors?.length) {
      throw new Error(errors[0].message);
    }

    if (!data?.customerUpdate?.customer) {
      throw new Error('Customer profile update failed.');
    }

    return {
      error: null,
      customer: data?.customerUpdate?.customer,
    };
  } catch (error: any) {
    return data(
      {error: error.message, customer: null},
      {
        status: 400,
      },
    );
  }
}

export default function AccountProfile() {
  const account = useOutletContext<{customer: CustomerFragment}>();
  const {state} = useNavigation();
  const action = useActionData<ActionResponse>();
  const customer = action?.customer ?? account?.customer;

  return (
    <div className="max-w-2xl mx-auto">
        <div className="bg-white border-4 border-[var(--color-brand-dark)] rounded-xl shadow-xl overflow-hidden">
          <div className="bg-[var(--color-brand-yellow)] border-b-4 border-[var(--color-brand-dark)] p-6">
            <h2 className="text-3xl font-black uppercase tracking-wide text-[var(--color-brand-dark)] text-center">
              My Profile
            </h2>
          </div>
          
          <div className="p-8">
            <Form method="PUT" className="space-y-6">
              <fieldset className="space-y-6">
                <legend className="text-xl font-black uppercase tracking-wide text-[var(--color-brand-dark)] mb-4">
                  Personal Information
                </legend>
                
                <div className="space-y-2">
                  <label htmlFor="firstName" className="block text-lg font-bold text-[var(--color-brand-dark)]">
                    First name
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    autoComplete="given-name"
                    placeholder="First name"
                    aria-label="First name"
                    defaultValue={customer.firstName ?? ''}
                    minLength={2}
                    className="w-full px-4 py-3 text-lg font-semibold border-4 border-[var(--color-brand-dark)] rounded-xl bg-white focus:bg-[var(--color-brand-cream)] focus:outline-none focus:ring-0 transition-colors"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="lastName" className="block text-lg font-bold text-[var(--color-brand-dark)]">
                    Last name
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    autoComplete="family-name"
                    placeholder="Last name"
                    aria-label="Last name"
                    defaultValue={customer.lastName ?? ''}
                    minLength={2}
                    className="w-full px-4 py-3 text-lg font-semibold border-4 border-[var(--color-brand-dark)] rounded-xl bg-white focus:bg-[var(--color-brand-cream)] focus:outline-none focus:ring-0 transition-colors"
                  />
                </div>
              </fieldset>
              
              {action?.error ? (
                <div className="bg-[var(--color-brand-red)] border-4 border-[var(--color-brand-dark)] rounded-xl p-4">
                  <p className="text-white font-black text-center">
                    {action.error}
                  </p>
                </div>
              ) : null}
              
              <div className="flex justify-center pt-4">
                <button 
                  type="submit" 
                  disabled={state !== 'idle'}
                  className="bg-[var(--color-brand-green)] hover:bg-[var(--color-brand-green-hover)] disabled:bg-gray-400 text-white font-black text-lg px-8 py-4 rounded-xl border-4 border-[var(--color-brand-dark)] shadow-lg hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {state !== 'idle' ? 'Updating...' : 'Update Profile'}
                </button>
              </div>
            </Form>
          </div>
        </div>
    </div>
  );
}
