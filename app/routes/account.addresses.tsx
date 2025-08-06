import type {CustomerAddressInput} from '@shopify/hydrogen/customer-account-api-types';
import type {
  AddressFragment,
  CustomerFragment,
} from 'customer-accountapi.generated';
import {
  data,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from '@shopify/remix-oxygen';
import {
  Form,
  useActionData,
  useNavigation,
  useOutletContext,
  type MetaFunction,
  type Fetcher,
} from 'react-router';
import {
  UPDATE_ADDRESS_MUTATION,
  DELETE_ADDRESS_MUTATION,
  CREATE_ADDRESS_MUTATION,
} from '~/graphql/customer-account/CustomerAddressMutations';

export type ActionResponse = {
  addressId?: string | null;
  createdAddress?: AddressFragment;
  defaultAddress?: string | null;
  deletedAddress?: string | null;
  error: Record<AddressFragment['id'], string> | null;
  updatedAddress?: AddressFragment;
};

export const meta: MetaFunction = () => {
  return [{title: 'Addresses'}];
};

export async function loader({context}: LoaderFunctionArgs) {
  await context.customerAccount.handleAuthStatus();

  return {};
}

export async function action({request, context}: ActionFunctionArgs) {
  const {customerAccount} = context;

  try {
    const form = await request.formData();

    const addressId = form.has('addressId')
      ? String(form.get('addressId'))
      : null;
    if (!addressId) {
      throw new Error('You must provide an address id.');
    }

    // this will ensure redirecting to login never happen for mutatation
    const isLoggedIn = await customerAccount.isLoggedIn();
    if (!isLoggedIn) {
      return data(
        {error: {[addressId]: 'Unauthorized'}},
        {
          status: 401,
        },
      );
    }

    const defaultAddress = form.has('defaultAddress')
      ? String(form.get('defaultAddress')) === 'on'
      : false;
    const address: CustomerAddressInput = {};
    const keys: (keyof CustomerAddressInput)[] = [
      'address1',
      'address2',
      'city',
      'company',
      'territoryCode',
      'firstName',
      'lastName',
      'phoneNumber',
      'zoneCode',
      'zip',
    ];

    for (const key of keys) {
      const value = form.get(key);
      if (typeof value === 'string') {
        address[key] = value;
      }
    }

    switch (request.method) {
      case 'POST': {
        // handle new address creation
        try {
          const {data, errors} = await customerAccount.mutate(
            CREATE_ADDRESS_MUTATION,
            {
              variables: {address, defaultAddress},
            },
          );

          if (errors?.length) {
            throw new Error(errors[0].message);
          }

          if (data?.customerAddressCreate?.userErrors?.length) {
            throw new Error(data?.customerAddressCreate?.userErrors[0].message);
          }

          if (!data?.customerAddressCreate?.customerAddress) {
            throw new Error('Customer address create failed.');
          }

          return {
            error: null,
            createdAddress: data?.customerAddressCreate?.customerAddress,
            defaultAddress,
          };
        } catch (error: unknown) {
          if (error instanceof Error) {
            return data(
              {error: {[addressId]: error.message}},
              {
                status: 400,
              },
            );
          }
          return data(
            {error: {[addressId]: error}},
            {
              status: 400,
            },
          );
        }
      }

      case 'PUT': {
        // handle address updates
        try {
          const {data, errors} = await customerAccount.mutate(
            UPDATE_ADDRESS_MUTATION,
            {
              variables: {
                address,
                addressId: decodeURIComponent(addressId),
                defaultAddress,
              },
            },
          );

          if (errors?.length) {
            throw new Error(errors[0].message);
          }

          if (data?.customerAddressUpdate?.userErrors?.length) {
            throw new Error(data?.customerAddressUpdate?.userErrors[0].message);
          }

          if (!data?.customerAddressUpdate?.customerAddress) {
            throw new Error('Customer address update failed.');
          }

          return {
            error: null,
            updatedAddress: address,
            defaultAddress,
          };
        } catch (error: unknown) {
          if (error instanceof Error) {
            return data(
              {error: {[addressId]: error.message}},
              {
                status: 400,
              },
            );
          }
          return data(
            {error: {[addressId]: error}},
            {
              status: 400,
            },
          );
        }
      }

      case 'DELETE': {
        // handles address deletion
        try {
          const {data, errors} = await customerAccount.mutate(
            DELETE_ADDRESS_MUTATION,
            {
              variables: {addressId: decodeURIComponent(addressId)},
            },
          );

          if (errors?.length) {
            throw new Error(errors[0].message);
          }

          if (data?.customerAddressDelete?.userErrors?.length) {
            throw new Error(data?.customerAddressDelete?.userErrors[0].message);
          }

          if (!data?.customerAddressDelete?.deletedAddressId) {
            throw new Error('Customer address delete failed.');
          }

          return {error: null, deletedAddress: addressId};
        } catch (error: unknown) {
          if (error instanceof Error) {
            return data(
              {error: {[addressId]: error.message}},
              {
                status: 400,
              },
            );
          }
          return data(
            {error: {[addressId]: error}},
            {
              status: 400,
            },
          );
        }
      }

      default: {
        return data(
          {error: {[addressId]: 'Method not allowed'}},
          {
            status: 405,
          },
        );
      }
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      return data(
        {error: error.message},
        {
          status: 400,
        },
      );
    }
    return data(
      {error},
      {
        status: 400,
      },
    );
  }
}

export default function Addresses() {
  const {customer} = useOutletContext<{customer: CustomerFragment}>();
  const {defaultAddress, addresses} = customer;

  return (
    <div className="max-w-4xl mx-auto">
        <div className="bg-white border-4 border-[var(--color-brand-dark)] rounded-xl shadow-xl overflow-hidden">
          <div className="bg-[var(--color-brand-pink)] border-b-4 border-[var(--color-brand-dark)] p-6">
            <h2 className="text-3xl font-black uppercase tracking-wide text-white text-center">
              My Addresses
            </h2>
          </div>
          
          <div className="p-8 space-y-8">
            {!addresses.nodes.length ? (
              <div className="text-center py-12">
                <div className="bg-[var(--color-brand-cream)] border-4 border-[var(--color-brand-dark)] rounded-xl p-8 max-w-md mx-auto">
                  <h3 className="text-2xl font-black uppercase tracking-wide text-[var(--color-brand-dark)] mb-4">
                    No Addresses Saved
                  </h3>
                  <p className="text-lg font-semibold text-gray-600 mb-6">
                    You have no addresses saved.
                  </p>
                </div>
              </div>
            ) : (
              <ExistingAddresses
                addresses={addresses}
                defaultAddress={defaultAddress}
              />
            )}
            
            {/* Create New Address Section */}
            <div className="bg-[var(--color-brand-cream)] border-4 border-[var(--color-brand-dark)] rounded-xl p-6">
              <h3 className="text-2xl font-black uppercase tracking-wide text-[var(--color-brand-dark)] mb-6 text-center">
                Add New Address
              </h3>
              <NewAddressForm />
            </div>
          </div>
        </div>
    </div>
  );
}

function NewAddressForm() {
  const newAddress = {
    address1: '',
    address2: '',
    city: '',
    company: '',
    territoryCode: '',
    firstName: '',
    id: 'new',
    lastName: '',
    phoneNumber: '',
    zoneCode: '',
    zip: '',
  } as CustomerAddressInput;

  return (
    <AddressForm
      addressId={'NEW_ADDRESS_ID'}
      address={newAddress}
      defaultAddress={null}
    >
      {({stateForMethod}) => (
        <div className="flex justify-center">
          <button
            disabled={stateForMethod('POST') !== 'idle'}
            formMethod="POST"
            type="submit"
            className="bg-[var(--color-brand-blue)] hover:bg-[var(--color-brand-blue-hover)] disabled:bg-gray-400 text-white font-black text-lg px-8 py-4 rounded-xl border-4 border-[var(--color-brand-dark)] shadow-lg hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {stateForMethod('POST') !== 'idle' ? 'Creating...' : 'Create Address'}
          </button>
        </div>
      )}
    </AddressForm>
  );
}

function ExistingAddresses({
  addresses,
  defaultAddress,
}: Pick<CustomerFragment, 'addresses' | 'defaultAddress'>) {
  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-black uppercase tracking-wide text-[var(--color-brand-dark)] text-center">
        Saved Addresses
      </h3>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {addresses.nodes.map((address) => (
          <div key={address.id} className="bg-white border-4 border-[var(--color-brand-dark)] rounded-xl p-6">
            <AddressForm
              addressId={address.id}
              address={address}
              defaultAddress={defaultAddress}
            >
              {({stateForMethod}) => (
                <div className="flex gap-3 justify-center">
                  <button
                    disabled={stateForMethod('PUT') !== 'idle'}
                    formMethod="PUT"
                    type="submit"
                    className="bg-[var(--color-brand-green)] hover:bg-[var(--color-brand-green-hover)] disabled:bg-gray-400 text-white font-black px-6 py-3 rounded-xl border-2 border-[var(--color-brand-dark)] shadow-md hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {stateForMethod('PUT') !== 'idle' ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    disabled={stateForMethod('DELETE') !== 'idle'}
                    formMethod="DELETE"
                    type="submit"
                    className="bg-[var(--color-brand-red)] hover:bg-[var(--color-brand-red-hover)] disabled:bg-gray-400 text-white font-black px-6 py-3 rounded-xl border-2 border-[var(--color-brand-dark)] shadow-md hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {stateForMethod('DELETE') !== 'idle' ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              )}
            </AddressForm>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AddressForm({
  addressId,
  address,
  defaultAddress,
  children,
}: {
  addressId: AddressFragment['id'];
  address: CustomerAddressInput;
  defaultAddress: CustomerFragment['defaultAddress'];
  children: (props: {
    stateForMethod: (method: 'PUT' | 'POST' | 'DELETE') => Fetcher['state'];
  }) => React.ReactNode;
}) {
  const {state, formMethod} = useNavigation();
  const action = useActionData<ActionResponse>();
  const error = action?.error?.[addressId];
  const isDefaultAddress = defaultAddress?.id === addressId;
  
  const inputClasses = "w-full px-4 py-3 text-lg font-semibold border-4 border-[var(--color-brand-dark)] rounded-xl bg-white focus:bg-[var(--color-brand-cream)] focus:outline-none focus:ring-0 transition-colors";
  const labelClasses = "block text-lg font-bold text-[var(--color-brand-dark)] mb-2";
  
  return (
    <Form id={addressId} className="space-y-4">
      <fieldset className="space-y-4">
        <input type="hidden" name="addressId" defaultValue={addressId} />
        
        {isDefaultAddress && (
          <div className="text-center mb-4">
            <span className="inline-block bg-[var(--color-brand-yellow)] border-2 border-[var(--color-brand-dark)] rounded-lg px-3 py-1 text-sm font-black text-[var(--color-brand-dark)]">
              DEFAULT ADDRESS
            </span>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className={labelClasses}>First name*</label>
            <input
              aria-label="First name"
              autoComplete="given-name"
              defaultValue={address?.firstName ?? ''}
              id="firstName"
              name="firstName"
              placeholder="First name"
              required
              type="text"
              className={inputClasses}
            />
          </div>
          <div>
            <label htmlFor="lastName" className={labelClasses}>Last name*</label>
            <input
              aria-label="Last name"
              autoComplete="family-name"
              defaultValue={address?.lastName ?? ''}
              id="lastName"
              name="lastName"
              placeholder="Last name"
              required
              type="text"
              className={inputClasses}
            />
          </div>
        </div>
        
        <div>
          <label htmlFor="company" className={labelClasses}>Company</label>
          <input
            aria-label="Company"
            autoComplete="organization"
            defaultValue={address?.company ?? ''}
            id="company"
            name="company"
            placeholder="Company"
            type="text"
            className={inputClasses}
          />
        </div>
        
        <div>
          <label htmlFor="address1" className={labelClasses}>Address line*</label>
          <input
            aria-label="Address line 1"
            autoComplete="address-line1"
            defaultValue={address?.address1 ?? ''}
            id="address1"
            name="address1"
            placeholder="Address line 1*"
            required
            type="text"
            className={inputClasses}
          />
        </div>
        
        <div>
          <label htmlFor="address2" className={labelClasses}>Address line 2</label>
          <input
            aria-label="Address line 2"
            autoComplete="address-line2"
            defaultValue={address?.address2 ?? ''}
            id="address2"
            name="address2"
            placeholder="Address line 2"
            type="text"
            className={inputClasses}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="city" className={labelClasses}>City*</label>
            <input
              aria-label="City"
              autoComplete="address-level2"
              defaultValue={address?.city ?? ''}
              id="city"
              name="city"
              placeholder="City"
              required
              type="text"
              className={inputClasses}
            />
          </div>
          <div>
            <label htmlFor="zoneCode" className={labelClasses}>State*</label>
            <input
              aria-label="State/Province"
              autoComplete="address-level1"
              defaultValue={address?.zoneCode ?? ''}
              id="zoneCode"
              name="zoneCode"
              placeholder="TX"
              required
              type="text"
              className={inputClasses}
            />
          </div>
          <div>
            <label htmlFor="zip" className={labelClasses}>Zip Code*</label>
            <input
              aria-label="Zip"
              autoComplete="postal-code"
              defaultValue={address?.zip ?? ''}
              id="zip"
              name="zip"
              placeholder="12345"
              required
              type="text"
              className={inputClasses}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="territoryCode" className={labelClasses}>Country Code*</label>
            <input
              aria-label="territoryCode"
              autoComplete="country"
              defaultValue={address?.territoryCode ?? 'US'}
              id="territoryCode"
              name="territoryCode"
              placeholder="US"
              required
              type="text"
              maxLength={2}
              className={inputClasses}
            />
          </div>
          <div>
            <label htmlFor="phoneNumber" className={labelClasses}>Phone</label>
            <input
              aria-label="Phone Number"
              autoComplete="tel"
              defaultValue={address?.phoneNumber ?? ''}
              id="phoneNumber"
              name="phoneNumber"
              placeholder="+1 (555) 123-4567"
              pattern="^\+?[1-9]\d{3,14}$"
              type="tel"
              className={inputClasses}
            />
          </div>
        </div>
        
        <div className="flex items-center gap-3 justify-center pt-2">
          <input
            defaultChecked={isDefaultAddress}
            id="defaultAddress"
            name="defaultAddress"
            type="checkbox"
            className="w-5 h-5 border-2 border-[var(--color-brand-dark)] rounded focus:ring-2 focus:ring-[var(--color-brand-yellow)]"
          />
          <label htmlFor="defaultAddress" className="text-lg font-bold text-[var(--color-brand-dark)]">
            Set as default address
          </label>
        </div>
        
        {error ? (
          <div className="bg-[var(--color-brand-red)] border-4 border-[var(--color-brand-dark)] rounded-xl p-4 mt-4">
            <p className="text-white font-black text-center">
              {error}
            </p>
          </div>
        ) : null}
        
        <div className="pt-4">
          {children({
            stateForMethod: (method) => (formMethod === method ? state : 'idle'),
          })}
        </div>
      </fieldset>
    </Form>
  );
}
