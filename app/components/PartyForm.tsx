import { Link } from 'react-router';
import {useState} from 'react';
import {type MappedProductOptions} from '@shopify/hydrogen';
import type {ProductFragment} from 'storefrontapi.generated';

type PartyType = 'Birthday' | 'Team' | 'Company' | 'Other';
type BaseRate = 'Standard' | 'Deluxe' | 'Ultimate';

export function PartyForm({
  productOptions,
  selectedVariant,
  tags,
  product,
}: {
  productOptions: MappedProductOptions[];
  selectedVariant: ProductFragment['selectedOrFirstAvailableVariant'];
  tags: ProductFragment['tags'];
  product: ProductFragment;
}) {
  const partyDate = product.title.split(' - ')[0];
  const partyTime = selectedVariant?.title.split(' / ')[1];
  const roomName = selectedVariant?.title.split(' / ')[0];
  const parkHours = selectedVariant?.selectedOptions?.find(option => option.name === 'Park Hours')?.value;
  const depositDue = Number(selectedVariant?.price?.amount);

  // Controlled states for form fields
  const [partyType, setPartyType] = useState<PartyType>('Birthday');
  const [birthdayName, setBirthdayName] = useState('');
  const [birthdayAge, setBirthdayAge] = useState('');
  const [teamName, setTeamName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [otherParty, setOtherParty] = useState('');
  const [baseRate, setBaseRate] = useState<BaseRate | ''>('');
  const [numParticipants, setNumParticipants] = useState<number>(10);
  const [pizzaOption, setPizzaOption] = useState<string>('Cheese');
  const [drinkOption, setDrinkOption] = useState<string>('Water');
  const [contactPhone, setContactPhone] = useState('');
  const [ackList, setAckList] = useState(false);
  const [ackSocks, setAckSocks] = useState(false);
  const [ackEmail, setAckEmail] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Validate on submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple validation
    if (!baseRate) {
      setFormError('Please select a base party rate.');
      return;
    }
    if (!contactPhone) {
      setFormError('Please enter a contact phone number.');
      return;
    }
    if (!ackList || !ackSocks || !ackEmail) {
      setFormError('Please check all acknowledgements.');
      return;
    }
    if (partyType === 'Birthday' && (!birthdayName || !birthdayAge)) {
      setFormError("Please enter birthday child's name and age.");
      return;
    }
    if (partyType === 'Team' && !teamName) {
      setFormError('Please enter the team name.');
      return;
    }
    if (partyType === 'Company' && !companyName) {
      setFormError('Please enter the company name.');
      return;
    }
    if (partyType === 'Other' && !otherParty) {
      setFormError('Please describe the party.');
      return;
    }
    setFormError(null);
    // TODO: Implement continue to checkout logic (cart, API, etc.)
    alert('Continue to Checkout! (implement logic here)');
  };

  return (
    <form
      className="max-w-xl mx-auto p-4 bg-white rounded shadow"
      onSubmit={handleSubmit}
    >
      {/* Header with party details */}
      <div className="mb-6">
        <div className="flex items-center mb-2">
          <Link
            to="/collections/party-booking"
            className="text-sm text-blue-600 hover:underline flex items-center mr-4"
          >
            ← Change Party Date/Time
          </Link>
        </div>
        <div className="bg-yellow-100 rounded p-4 mb-2">
          <div className="text-lg font-bold">{partyDate}</div>
          <div className="text-md">{partyTime}</div>
          <div className="text-md font-semibold">{roomName}</div>
          <div className="text-sm text-gray-700">Park Hours: {parkHours}</div>
          <div className="text-md font-bold mt-2">
            Deposit Due: <span className="text-green-700">${depositDue?.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Party Type selection */}
      <div className="mb-6">
        <label htmlFor="partyType" className="block font-semibold mb-2">Type of Party</label>
        <div className="flex gap-4">
          <label className="flex items-center">
            <input
              type="radio"
              name="partyType"
              value="Birthday"
              checked={partyType === 'Birthday'}
              onChange={() => setPartyType('Birthday')}
              className="mr-2"
            />
            Birthday
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="partyType"
              value="Team"
              checked={partyType === 'Team'}
              onChange={() => setPartyType('Team')}
              className="mr-2"
            />
            Team
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="partyType"
              value="Company"
              checked={partyType === 'Company'}
              onChange={() => setPartyType('Company')}
              className="mr-2"
            />
            Company
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="partyType"
              value="Other"
              checked={partyType === 'Other'}
              onChange={() => setPartyType('Other')}
              className="mr-2"
            />
            Other
          </label>
        </div>
      </div>

      {/* Conditional Party Info Inputs */}
      {partyType === 'Birthday' && (
        <div className="mb-6">
          <label htmlFor="birthdayName" className="block mb-2 font-semibold">
            Birthday Child&apos;s Name
          </label>
          <input
            type="text"
            value={birthdayName}
            onChange={(e) => setBirthdayName(e.target.value)}
            className="w-full border rounded px-3 py-2 mb-2"
            placeholder="Name"
          />
          <label htmlFor="birthdayAge" className="block mb-2 font-semibold">
            Birthday Child&apos;s Age
          </label>
          <input
            type="number"
            value={birthdayAge}
            min={1}
            max={120}
            onChange={(e) => setBirthdayAge(e.target.value)}
            className="w-full border rounded px-3 py-2"
            placeholder="Age"
          />
        </div>
      )}
      {partyType === 'Team' && (
        <div className="mb-6">
          <label htmlFor="teamName" className="block mb-2 font-semibold">Team Name</label>
          <input
            type="text"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            className="w-full border rounded px-3 py-2"
            placeholder="Team Name"
          />
        </div>
      )}
      {partyType === 'Company' && (
        <div className="mb-6">
          <label htmlFor="companyName" className="block mb-2 font-semibold">Company Name</label>
          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className="w-full border rounded px-3 py-2"
            placeholder="Company Name"
          />
        </div>
      )}
      {partyType === 'Other' && (
        <div className="mb-6">
          <label htmlFor="otherParty" className="block mb-2 font-semibold">Describe the Party</label>
          <input
            type="text"
            value={otherParty}
            onChange={(e) => setOtherParty(e.target.value)}
            className="w-full border rounded px-3 py-2"
            placeholder="Party Description"
          />
        </div>
      )}

      {/* Base Party Rate */}
      <div className="mb-6">
        <label htmlFor="baseRate" className="block font-semibold mb-2">Base Party Rate</label>
        <div className="flex gap-4">
          <label className="flex items-center">
            <input
              type="radio"
              name="baseRate"
              value="Standard"
              checked={baseRate === 'Standard'}
              onChange={() => setBaseRate('Standard')}
              className="mr-2"
            />
            Standard
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="baseRate"
              value="Deluxe"
              checked={baseRate === 'Deluxe'}
              onChange={() => setBaseRate('Deluxe')}
              className="mr-2"
            />
            Deluxe
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="baseRate"
              value="Ultimate"
              checked={baseRate === 'Ultimate'}
              onChange={() => setBaseRate('Ultimate')}
              className="mr-2"
            />
            Ultimate
          </label>
        </div>
      </div>

      {/* Estimated Participants */}
      <div className="mb-6">
        <label htmlFor="numParticipants" className="block font-semibold mb-2">
          Estimated Number of Participants
        </label>
        <input
          type="number"
          min={1}
          max={100}
          value={numParticipants}
          onChange={(e) => setNumParticipants(Number(e.target.value))}
          className="w-32 border rounded px-3 py-2"
        />
      </div>

      {/* Food Options */}
      <div className="mb-6">
        <label htmlFor="pizzaOption" className="block font-semibold mb-2">Pizza Option</label>
        <select
          value={pizzaOption}
          onChange={(e) => setPizzaOption(e.target.value)}
          className="w-full border rounded px-3 py-2 mb-2"
        >
          <option value="Cheese">Cheese</option>
          <option value="Pepperoni">Pepperoni</option>
          <option value="Veggie">Veggie</option>
        </select>
        <label htmlFor="drinkOption" className="block font-semibold mb-2">Drink Option</label>
        <select
          value={drinkOption}
          onChange={(e) => setDrinkOption(e.target.value)}
          className="w-full border rounded px-3 py-2"
        >
          <option value="Water">Water</option>
          <option value="Soda">Soda</option>
          <option value="Juice">Juice</option>
        </select>
      </div>

      {/* Contact Phone */}
      <div className="mb-6">
        <label htmlFor="contactPhone" className="block font-semibold mb-2">Contact Phone</label>
        <input
          type="tel"
          value={contactPhone}
          onChange={(e) => setContactPhone(e.target.value)}
          className="w-full border rounded px-3 py-2"
          placeholder="(555) 555-5555"
        />
      </div>

      {/* Acknowledgements */}
      <div className="mb-6">
        <label htmlFor="ackList" className="block font-semibold mb-2">Acknowledgements</label>
        <div className="flex flex-col gap-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={ackList}
              onChange={() => setAckList(!ackList)}
              className="mr-2"
            />
            I acknowledge that I will provide a participant list.
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={ackSocks}
              onChange={() => setAckSocks(!ackSocks)}
              className="mr-2"
            />
            I acknowledge that all participants must wear socks.
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={ackEmail}
              onChange={() => setAckEmail(!ackEmail)}
              className="mr-2"
            />
            I acknowledge that I will receive a confirmation email.
          </label>
        </div>
      </div>

      {formError && (
        <div className="mb-4 text-red-600 font-semibold text-center">
          {formError}
        </div>
      )}

      {/* Continue to Checkout Button */}
      <div className="flex justify-center">
        <button
          type="submit"
          className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3 px-8 rounded-full text-lg shadow"
        >
          Continue to Checkout
        </button>
      </div>
    </form>
  );
}
