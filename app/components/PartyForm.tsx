import {Link} from 'react-router';
import {useState, useEffect, useCallback} from 'react';
import {type MappedProductOptions} from '@shopify/hydrogen';
import type {ProductFragment} from 'storefrontapi.generated';
import {AddToCartButton} from './AddToCartButton';
import {useAside} from './Aside';
import type {CalendarData} from './Calendar';

type PartyType = 'Birthday' | 'Team' | 'Company' | 'Other';

export function PartyForm({
  productOptions,
  selectedVariant,
  tags,
  product,
  hoursData,
}: {
  productOptions: MappedProductOptions[];
  selectedVariant: ProductFragment['selectedOrFirstAvailableVariant'];
  tags: ProductFragment['tags'];
  product: ProductFragment;
  hoursData?: CalendarData;
}) {
  const {open} = useAside();
  const partyDate = product.title.split(' - ')[0];
  const partyTime = selectedVariant?.title.split(' / ')[1];
  const roomName = selectedVariant?.title.split(' / ')[0];
  const depositDue = Number(selectedVariant?.price?.amount);

  // Get park hours from hoursData for the specific date
  const getParkHours = () => {
    if (!hoursData || !selectedVariant?.sku) return 'Hours not available';

    const sku = selectedVariant.sku;
    if (sku.length < 8) return 'Hours not available';

    // Parse date from SKU (MMDDYYHH format) - e.g., "08272503" = Aug 27, 2025 at 3pm
    const mm = sku.substring(0, 2);
    const dd = sku.substring(2, 4);
    const yy = sku.substring(4, 6);

    // Get hours using the same pattern as Calendar component
    const parkHours =
      hoursData[yy]?.[String(parseInt(mm, 10) - 1)]?.[
        String(parseInt(dd, 10))
      ] || 'Closed';
    return parkHours;
  };

  const parkHours = getParkHours();

  // Room-specific logic based on Liquid template
  const getRoomDetails = () => {
    if (!roomName) return {minParticipants: 8, baseRate: 32, room: 'Carousel'};

    if (roomName.includes('Large')) {
      return {minParticipants: 10, baseRate: 32, room: 'Large'};
    } else if (roomName.includes('Midway')) {
      return {minParticipants: 25, baseRate: 32, room: 'Midway'};
    } else if (roomName.includes('Turning')) {
      return {minParticipants: 75, baseRate: 30, room: 'Turning Point'};
    } else {
      return {minParticipants: 8, baseRate: 32, room: 'Carousel'};
    }
  };

  const roomDetails = getRoomDetails();

  // Dynamic date/time parsing from variant SKU (format: MMDDYYHH)
  const getDateDetailsFromSKU = () => {
    const sku = selectedVariant?.sku;
    if (!sku || sku.length < 8)
      return {
        isWinter: false,
        isWater: false,
        year: null,
        month: null,
        date: null,
      };

    const monthString = sku.slice(0, 2);
    const dateString = sku.slice(2, 4);
    const yearString = sku.slice(4, 6);

    const year = parseInt(yearString, 10) + 2000;
    const month = parseInt(monthString, 10) - 1; // JS months are 0-indexed
    const date = parseInt(dateString, 10);

    // Determine if it's winter season (Oct-Feb)
    const isWinter = month >= 9 || month <= 1; // Oct(9), Nov(10), Dec(11), Jan(0), Feb(1)

    // Water park availability (typically Mar-Sep, but this would come from your data)
    const isWater = !isWinter; // Simplified - you'd want this from your Shopify metafields

    return {isWinter, isWater, year, month, date};
  };

  const dateDetails = getDateDetailsFromSKU();

  // Last 3 hours discount logic
  const getLast3HoursInfo = () => {
    if (!parkHours || !partyTime) return {isLast3Hours: false, hoursLeft: 0};

    // Parse park hours (format: "11am-7pm" or "11:00-19:00")
    const hoursMatch = parkHours.match(/(\d{1,2})(?::?\d{0,2})?\s*(?:pm|PM)/);
    if (!hoursMatch) return {isLast3Hours: false, hoursLeft: 0};

    const closingHour = parseInt(hoursMatch[1], 10);
    const adjustedClosing = closingHour === 12 ? 12 : closingHour + 12; // Convert to 24hr format

    // Parse party start time (format: "11:00" or "2:00")
    const partyMatch = partyTime.match(/(\d{1,2})/);
    if (!partyMatch) return {isLast3Hours: false, hoursLeft: 0};

    const partyStartHour = parseInt(partyMatch[1], 10);
    const adjustedPartyStart =
      partyStartHour < 8 ? partyStartHour + 12 : partyStartHour; // Assume PM if before 8

    const hoursLeft = adjustedClosing - adjustedPartyStart;
    const isLast3Hours = hoursLeft <= 3 && hoursLeft > 1;

    return {isLast3Hours, hoursLeft};
  };

  const last3HoursInfo = getLast3HoursInfo();

  // Phone number formatting function
  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');

    // Format based on length
    if (digits.length <= 3) {
      return digits;
    } else if (digits.length <= 6) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    } else {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
    }
  };

  // Controlled states for form fields
  const [partyType, setPartyType] = useState<PartyType>('Birthday');
  const [birthdayName, setBirthdayName] = useState('');
  const [birthdayAge, setBirthdayAge] = useState('');
  const [teamName, setTeamName] = useState('');
  const [teamActivity, setTeamActivity] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [otherParty, setOtherParty] = useState('');
  const [numParticipants, setNumParticipants] = useState<number>(
    roomDetails.minParticipants,
  );
  const [contactPhone, setContactPhone] = useState('');
  const [ackList, setAckList] = useState(false);
  const [ackSocks, setAckSocks] = useState(false);
  const [ackEmail, setAckEmail] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);

  // Cost calculation state
  const [estimatedCost, setEstimatedCost] = useState({
    subtotal: 0,
    tax: 0,
    total: 0,
    itemizedCosts: [] as Array<{
      name: string;
      quantity: number;
      price: number;
      total: number;
    }>,
  });
  // Food & Drink
  const [foodOption, setFoodOption] = useState<string>('');
  const [pizzaType, setPizzaType] = useState<string>('Pepperoni');
  const [drinkChoices, setDrinkChoices] = useState<string[]>([]);

  // Whole Pizza ordering
  const [wholePepperoniPizzas, setWholePepperoniPizzas] = useState<number>(0);
  const [wholeCheesePizzas, setWholeCheesePizzas] = useState<number>(0);
  const [wholeHalfHalfPizzas, setWholeHalfHalfPizzas] = useState<number>(0);

  // Drink Pitcher ordering ($7.99 each)
  const [drinkPitchers, setDrinkPitchers] = useState<{[key: string]: number}>({
    Coke: 0,
    'Dr Pepper': 0,
    Sprite: 0,
    'Pink Lemonade': 0,
    'Coke Zero': 0,
    'Root Beer': 0,
    'Sweet Tea': 0,
    'Unsweet Tea': 0,
  });
  const toggleDrink = (d: string) => {
    setDrinkChoices((prev) => {
      if (prev.includes(d)) {
        // Remove if already selected
        return prev.filter((x) => x !== d);
      } else if (prev.length >= 3) {
        // Show error message when trying to select more than 3
        setFormError('You can only select up to 3 drink options.');
        setTimeout(() => setFormError(null), 3000); // Clear error after 3 seconds
        return prev;
      } else {
        // Add new selection
        setFormError(null); // Clear any existing error
        return [...prev, d];
      }
    });
  };

  // Pure validation function (no state updates)
  const isFormValid = () => {
    if (numParticipants < roomDetails.minParticipants) return false;
    if (!contactPhone) return false;
    if (!ackList || !ackSocks || !ackEmail) return false;
    if (partyType === 'Birthday' && (!birthdayName || !birthdayAge))
      return false;
    if (partyType === 'Team' && (!teamName || !teamActivity)) return false;
    if (partyType === 'Company' && !companyName) return false;
    if (partyType === 'Other' && !otherParty) return false;
    if (drinkChoices.length === 0) return false;
    return true;
  };

  // Form validation function with error messages (for onClick)
  const validateForm = () => {
    if (numParticipants < roomDetails.minParticipants) {
      setFormError(
        `A minimum of ${roomDetails.minParticipants} participants is required for the ${roomDetails.room} room.`,
      );
      return false;
    }
    if (!contactPhone) {
      setFormError('Please enter a contact phone number.');
      return false;
    }
    if (!ackList || !ackSocks || !ackEmail) {
      setFormError('Please check all acknowledgements.');
      return false;
    }
    if (partyType === 'Birthday' && (!birthdayName || !birthdayAge)) {
      setFormError("Please enter birthday child's name and age.");
      return false;
    }
    if (partyType === 'Team') {
      if (!teamName) {
        setFormError('Please enter the team name.');
        return false;
      }
      if (!teamActivity) {
        setFormError('Please enter the sport or activity.');
        return false;
      }
    }
    if (partyType === 'Company' && !companyName) {
      setFormError('Please enter the company name.');
      return false;
    }
    if (partyType === 'Other' && !otherParty) {
      setFormError('Please describe the party.');
      return false;
    }
    if (drinkChoices.length === 0) {
      setFormError('Please select at least one drink option.');
      return false;
    }
    setFormError(null);
    return true;
  };

  // Create cart line with all party details as attributes
  const createCartLine = () => {
    if (!selectedVariant) return [];

    const attributes = [
      {key: 'Party Type', value: partyType},
      {
        key: 'Estimated Number of Participants',
        value: numParticipants.toString(),
      },
      {key: 'Contact Phone', value: contactPhone},
      {key: 'Drink Choices', value: drinkChoices.join(', ')},
    ];

    // Add party-type specific attributes
    if (partyType === 'Birthday') {
      attributes.push(
        {key: 'Birthday Name', value: birthdayName},
        {key: 'Age', value: birthdayAge},
      );
    } else if (partyType === 'Team') {
      attributes.push(
        {key: 'Team Name', value: teamName},
        {key: 'Team Activity', value: teamActivity},
      );
    } else if (partyType === 'Company') {
      attributes.push({key: 'Company Name', value: companyName});
    } else if (partyType === 'Other') {
      attributes.push({key: 'Details', value: otherParty});
    }

    // Add food options
    if (foodOption) {
      attributes.push({key: 'Food Option', value: foodOption});
      if (pizzaType && foodOption.includes('Pizza')) {
        attributes.push({key: 'Pizza Type', value: pizzaType});
      }
    }

    // Add whole pizza orders
    if (wholePepperoniPizzas > 0) {
      attributes.push({
        key: 'Whole Pepperoni Pizzas',
        value: wholePepperoniPizzas.toString(),
      });
    }
    if (wholeCheesePizzas > 0) {
      attributes.push({
        key: 'Whole Cheese Pizzas',
        value: wholeCheesePizzas.toString(),
      });
    }
    if (wholeHalfHalfPizzas > 0) {
      attributes.push({
        key: 'Whole 1/2 1/2 Pizzas',
        value: wholeHalfHalfPizzas.toString(),
      });
    }

    // Add drink pitcher orders
    Object.entries(drinkPitchers).forEach(([drinkName, quantity]) => {
      if (quantity > 0) {
        attributes.push({
          key: `${drinkName} Pitchers`,
          value: quantity.toString(),
        });
      }
    });

    return [
      {
        merchandiseId: selectedVariant.id,
        quantity: 1,
        selectedVariant,
        attributes,
      },
    ];
  };

  // Cost calculation function
  const calculateCost = useCallback(() => {
    if (!selectedVariant) return;

    const itemizedCosts: Array<{
      name: string;
      quantity: number;
      price: number;
      total: number;
    }> = [];
    let subtotal = 0;

    // Base party rate - room-specific and season-specific pricing
    let baseRate = roomDetails.baseRate;
    let rateName = 'Party Rate';

    // Apply last 3 hours discount (takes precedence over other discounts)
    if (last3HoursInfo.isLast3Hours) {
      baseRate = 18; // Last 3 hours discount rate
      rateName = 'Last 3 Hours Discount Rate';
    } else {
      // Apply winter discount for Turning Point room (from Liquid template)
      if (dateDetails.isWinter && roomDetails.room === 'Turning Point') {
        baseRate = 26; // Winter rate for Turning Point
        rateName = 'Winter Party Rate';
      } else if (dateDetails.isWinter) {
        baseRate = 28; // Winter rate for other rooms
        rateName = 'Winter Party Rate';
      }
      // Summer rates remain as room defaults (30 for Turning Point, 32 for others)
    }
    const baseCost = baseRate * numParticipants;
    itemizedCosts.push({
      name: rateName,
      quantity: numParticipants,
      price: baseRate,
      total: baseCost,
    });
    subtotal += baseCost;

    // Food cost per person (if selected)
    if (foodOption && foodOption.includes('$7')) {
      const foodCost = 7 * numParticipants;
      itemizedCosts.push({
        name: 'Party Food Servings',
        quantity: numParticipants,
        price: 7,
        total: foodCost,
      });
      subtotal += foodCost;
    }

    // Whole pizzas
    if (wholePepperoniPizzas > 0) {
      const cost = wholePepperoniPizzas * 22.99;
      itemizedCosts.push({
        name: 'Whole Pepperoni Pizzas',
        quantity: wholePepperoniPizzas,
        price: 22.99,
        total: cost,
      });
      subtotal += cost;
    }

    if (wholeCheesePizzas > 0) {
      const cost = wholeCheesePizzas * 19.99;
      itemizedCosts.push({
        name: 'Whole Cheese Pizzas',
        quantity: wholeCheesePizzas,
        price: 19.99,
        total: cost,
      });
      subtotal += cost;
    }

    if (wholeHalfHalfPizzas > 0) {
      const cost = wholeHalfHalfPizzas * 22.99;
      itemizedCosts.push({
        name: 'Whole 1/2 Pep 1/2 Cheese Pizzas',
        quantity: wholeHalfHalfPizzas,
        price: 22.99,
        total: cost,
      });
      subtotal += cost;
    }

    // Drink pitchers
    Object.entries(drinkPitchers).forEach(([drinkName, quantity]) => {
      if (quantity > 0) {
        const cost = quantity * 7.99;
        itemizedCosts.push({
          name: `${drinkName} Pitchers`,
          quantity,
          price: 7.99,
          total: cost,
        });
        subtotal += cost;
      }
    });

    // Calculate tax (8.25%)
    const tax = subtotal * 0.0825;
    const total = subtotal + tax;

    setEstimatedCost({
      subtotal,
      tax,
      total,
      itemizedCosts,
    });
  }, [
    selectedVariant,
    numParticipants,
    foodOption,
    roomDetails.baseRate,
    roomDetails.room,
    dateDetails.isWinter,
    last3HoursInfo.isLast3Hours,
    wholePepperoniPizzas,
    wholeCheesePizzas,
    wholeHalfHalfPizzas,
    drinkPitchers,
  ]);

  // Recalculate cost when relevant values change
  useEffect(() => {
    calculateCost();
  }, [calculateCost]);

  return (
    <div className="w-full p-2">
      {/* Party Header */}
      <div className="bg-white border-4 border-black rounded-xl p-6 mb-8 shadow-xl">
        <div className="text-center mb-4">
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-wide text-black drop-shadow-lg">
            LET&apos;S PARTY!
          </h1>
          <p className="text-xl font-bold text-gray-700 mt-2">
            Time to plan your EPIC celebration!
          </p>
        </div>

        <div className="flex items-center justify-center mb-4">
          <Link
            to="/collections/party-booking"
            className="bg-[var(--color-brand-cream)] text-black font-bold px-6 py-3 rounded-full border-4 border-black hover:bg-[var(--color-brand-cream-hover)] hover:scale-105 transition-all duration-200 shadow-lg text-lg"
          >
            ← Change Party Date/Time
          </Link>
        </div>

        <div className="bg-[var(--color-brand-cream)] border-4 border-black rounded-lg p-6 shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
            <div className="bg-white border-2 border-black rounded-lg p-4">
              <div className="text-2xl font-black text-black">{partyDate}</div>
              <div className="text-xl font-bold text-black">{partyTime}</div>
            </div>
            <div className="bg-white border-2 border-black rounded-lg p-4">
              <div className="text-2xl font-black text-black">{roomName}</div>
              <div className="text-lg font-bold text-gray-700">
                Park Hours: {parkHours}
              </div>
            </div>
          </div>
          <div className="mt-4 bg-gray-100 border-2 border-black rounded-lg p-4">
            <div className="text-center">
              <div className="text-lg font-black text-black">
                Min: {roomDetails.minParticipants} people | $
                {last3HoursInfo.isLast3Hours
                  ? '18'
                  : dateDetails.isWinter && roomDetails.room === 'Turning Point'
                    ? '26'
                    : dateDetails.isWinter
                      ? '28'
                      : roomDetails.baseRate}
                /person
              </div>
              {last3HoursInfo.isLast3Hours && (
                <div className="bg-green-100 border-2 border-black rounded-lg p-2 mt-2">
                  <div className="text-lg font-black text-black">
                    LAST 3 HOURS SPECIAL!
                  </div>
                  <div className="text-sm font-bold text-black">
                    Guests cannot arrive until the last 3 hours begin
                  </div>
                </div>
              )}
              {!last3HoursInfo.isLast3Hours && dateDetails.isWinter && (
                <div className="bg-blue-100 border-2 border-black rounded-lg p-2 mt-2">
                  <div className="text-lg font-bold text-black">
                    WINTER RATES
                  </div>
                </div>
              )}
            </div>
          </div>

          {dateDetails.isWater && (
            <div className="mt-2 bg-blue-100 border-2 border-black rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-black">
                Water rides may be open!
              </div>
              <div className="text-sm font-semibold text-black">
                (weather permitting)
              </div>
            </div>
          )}
          {!dateDetails.isWater && (
            <div className="mt-2 bg-gray-100 border-2 border-black rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-black">
                Water rides closed this date
              </div>
            </div>
          )}

          <div className="mt-4 bg-yellow-100 border-3 border-black rounded-lg p-4 text-center">
            <div className="text-2xl font-black text-black">
              DEPOSIT DUE: ${depositDue?.toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      {/* Party Type selection */}
      <div className="bg-white border-4 border-black rounded-xl p-6 mb-8 shadow-lg">
        <h2 className="text-3xl font-black uppercase text-center text-black mb-6 tracking-wide">
          What Kind of AMAZING Party?
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            type="button"
            onClick={() => setPartyType('Birthday')}
            className={`p-4 border-4 border-black rounded-xl font-bold text-lg transition-all duration-200 hover:scale-105 ${
              partyType === 'Birthday'
                ? 'bg-gray-900 text-white shadow-xl scale-105'
                : 'bg-gray-100 text-black hover:bg-gray-200'
            }`}
          >
            Birthday Party
          </button>
          <button
            type="button"
            onClick={() => setPartyType('Team')}
            className={`p-4 border-4 border-black rounded-xl font-bold text-lg transition-all duration-200 hover:scale-105 ${
              partyType === 'Team'
                ? 'bg-gray-900 text-white shadow-xl scale-105'
                : 'bg-gray-100 text-black hover:bg-gray-200'
            }`}
          >
            Team Party
          </button>
          <button
            type="button"
            onClick={() => setPartyType('Company')}
            className={`p-4 border-4 border-black rounded-xl font-bold text-lg transition-all duration-200 hover:scale-105 ${
              partyType === 'Company'
                ? 'bg-gray-900 text-white shadow-xl scale-105'
                : 'bg-gray-100 text-black hover:bg-gray-200'
            }`}
          >
            Company Party
          </button>
          <button
            type="button"
            onClick={() => setPartyType('Other')}
            className={`p-4 border-4 border-black rounded-xl font-bold text-lg transition-all duration-200 hover:scale-105 ${
              partyType === 'Other'
                ? 'bg-gray-900 text-white shadow-xl scale-105'
                : 'bg-gray-100 text-black hover:bg-gray-200'
            }`}
          >
            Other
          </button>
        </div>
      </div>

      {/* Birthday Party Info */}
      {partyType === 'Birthday' && (
        <div className="bg-gray-50 border-4 border-black rounded-xl p-6 mb-8 shadow-lg">
          <h3 className="text-3xl font-black uppercase text-center text-black mb-6 tracking-wide">
            Birthday Details!
          </h3>
          <div className="space-y-6">
            <div>
              <label className="block text-2xl font-black text-black mb-3">
                Birthday Star&apos;s Name:
                <input
                  type="text"
                  value={birthdayName}
                  onChange={(e) => setBirthdayName(e.target.value)}
                  className="w-full text-2xl font-bold px-6 py-4 rounded-xl border-4 border-black focus:ring-4 focus:ring-yellow-300 transition-all duration-200 shadow-lg"
                  placeholder="Enter their awesome name!"
                />
              </label>
            </div>
            <div>
              <label className="block text-2xl font-black text-black mb-3">
                Turning How Old?
                <input
                  type="number"
                  value={birthdayAge}
                  min={1}
                  max={120}
                  onChange={(e) => setBirthdayAge(e.target.value)}
                  className="w-full text-2xl font-bold px-6 py-4 rounded-xl border-4 border-black focus:ring-4 focus:ring-yellow-300 transition-all duration-200 shadow-lg"
                  placeholder="Age"
                />
              </label>
            </div>
          </div>
        </div>
      )}
      {partyType === 'Team' && (
        <div className="bg-gray-50 border-4 border-black rounded-xl p-6 mb-8 shadow-lg">
          <h3 className="text-3xl font-black uppercase text-center text-black mb-6 tracking-wide">
            Team Details!
          </h3>
          <div className="space-y-6">
            <div>
              <label className="block text-2xl font-black text-black mb-3">
                Team Name:
              <input
                type="text"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                className="w-full text-2xl font-bold px-6 py-4 rounded-xl border-4 border-black focus:ring-4 focus:ring-yellow-300 transition-all duration-200 shadow-lg"
                placeholder="Enter team name"
              />
              </label>
            </div>
            
            <div>
              <label className="block text-2xl font-black text-black mb-3">
                Sport or Activity:
                <input
                  type="text"
                  value={teamActivity}
                  onChange={(e) => setTeamActivity(e.target.value)}
                  className="w-full text-2xl font-bold px-6 py-4 rounded-xl border-4 border-black focus:ring-4 focus:ring-yellow-300 transition-all duration-200 shadow-lg"
                  placeholder="What sport or activity?"
                />
              </label>
            </div>
          </div>
        </div>
      )}
      {partyType === 'Company' && (
        <div className="bg-gray-50 border-4 border-black rounded-xl p-6 mb-8 shadow-lg">
          <h3 className="text-3xl font-black uppercase text-center text-black mb-6 tracking-wide">
            Company Details!
          </h3>
          <div className="space-y-6">
            <div>
              <label className="block text-2xl font-black text-black mb-3">
                Company Name:
             
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full text-2xl font-bold px-6 py-4 rounded-xl border-4 border-black focus:ring-4 focus:ring-yellow-300 transition-all duration-200 shadow-lg"
                placeholder="Enter company name"
              />
               </label>
            </div>
          </div>
        </div>
      )}
      {partyType === 'Other' && (
        <div className="bg-gray-50 border-4 border-black rounded-xl p-6 mb-8 shadow-lg">
          <h3 className="text-3xl font-black uppercase text-center text-black mb-6 tracking-wide">
            Party Details!
          </h3>
          <div className="space-y-6">
            <div>
              <label className="block text-2xl font-black text-black mb-3">
                What are you celebrating?
              <input
                type="text"
                value={otherParty}
                onChange={(e) => setOtherParty(e.target.value)}
                className="w-full text-2xl font-bold px-6 py-4 rounded-xl border-4 border-black focus:ring-4 focus:ring-yellow-300 transition-all duration-200 shadow-lg"
                placeholder="Describe your celebration"
              />
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Base Party Rate */}
      <div className="bg-white border-4 border-black rounded-xl p-6 mb-8 shadow-lg">
        <h2 className="text-3xl font-black uppercase text-center text-black mb-6 tracking-wide">
          Party Rate
        </h2>
        <div className="text-center">
          <div className="bg-gray-100 border-4 border-black rounded-xl p-6 inline-block">
            <div className="text-3xl font-black text-black">
              $32 / Wristband
            </div>
            <input
              type="radio"
              name="baseRate"
              value="$32 / Wristband"
              checked
              readOnly
              className="sr-only"
            />
          </div>
        </div>
      </div>

      {/* Estimated Participants */}
      <div className="bg-white border-4 border-black rounded-xl p-6 mb-8 shadow-lg">
        <h2 className="text-3xl font-black uppercase text-center text-black mb-6 tracking-wide">
          How Many Guests?
        </h2>
        <div className="flex items-center justify-center gap-6">
          <button
            type="button"
            onClick={() =>
              setNumParticipants((prev) =>
                Math.max(prev - 1, roomDetails.minParticipants),
              )
            }
            className="text-4xl w-16 h-16 rounded-full bg-gray-100 hover:bg-gray-200 border-4 border-black flex items-center justify-center font-black transition-all duration-200 hover:scale-110 shadow-lg"
          >
            −
          </button>
          <div className="text-center">
            <input
              type="number"
              min={1}
              max={100}
              value={numParticipants}
              onChange={(e) => setNumParticipants(Number(e.target.value))}
              className="text-4xl font-black text-center w-32 px-4 py-3 rounded-xl border-4 border-black focus:ring-4 focus:ring-yellow-300 transition-all duration-200 shadow-lg"
            />
            <div className="text-lg font-bold text-gray-600 mt-2">
              Participants
            </div>
          </div>
          <button
            type="button"
            onClick={() =>
              setNumParticipants((prev) => Math.min(prev + 1, 100))
            }
            className="text-4xl w-16 h-16 rounded-full bg-gray-100 hover:bg-gray-200 border-4 border-black flex items-center justify-center font-black transition-all duration-200 hover:scale-110 shadow-lg"
          >
            +
          </button>
        </div>
      </div>

      {/* Food Options */}
      <div className="bg-white border-4 border-black rounded-xl p-6 mb-8 shadow-lg">
        <h2 className="text-3xl font-black uppercase text-center text-black mb-6 tracking-wide">
          Add Pizza to Your Party
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setFoodOption('')}
            className={`p-6 border-4 border-black rounded-xl font-bold text-xl transition-all duration-200 hover:scale-105 ${
              foodOption === ''
                ? 'bg-gray-900 text-white shadow-xl scale-105'
                : 'bg-gray-100 text-black hover:bg-gray-200'
            }`}
          >
            No Pizza
          </button>
          <button
            type="button"
            onClick={() => setFoodOption('$7')}
            className={`p-6 border-4 border-black rounded-xl font-bold text-xl transition-all duration-200 hover:scale-105 ${
              foodOption === '$7'
                ? 'bg-gray-900 text-white shadow-xl scale-105'
                : 'bg-gray-100 text-black hover:bg-gray-200'
            }`}
          >
            2 Slices Each
            <div className="text-lg font-bold">+$7/Person</div>
          </button>
        </div>

        {/* Show pizza type only if food option selected */}
        {foodOption === '$7' && (
          <div className="mt-8 bg-gray-50 border-4 border-black rounded-xl p-6">
            <h3 className="text-2xl font-black uppercase text-center text-black mb-6 tracking-wide">
              Choose Pizza Type
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                type="button"
                onClick={() => setPizzaType('Pepperoni')}
                className={`p-4 border-4 border-black rounded-xl font-bold text-lg transition-all duration-200 hover:scale-105 ${
                  pizzaType === 'Pepperoni'
                    ? 'bg-gray-900 text-white shadow-xl scale-105'
                    : 'bg-white text-black hover:bg-gray-100'
                }`}
              >
                Pepperoni
              </button>
              <button
                type="button"
                onClick={() => setPizzaType('Cheese')}
                className={`p-4 border-4 border-black rounded-xl font-bold text-lg transition-all duration-200 hover:scale-105 ${
                  pizzaType === 'Cheese'
                    ? 'bg-gray-900 text-white shadow-xl scale-105'
                    : 'bg-white text-black hover:bg-gray-100'
                }`}
              >
                Cheese
              </button>
              <button
                type="button"
                onClick={() => setPizzaType('1/2 Pepperoni 1/2 Cheese')}
                className={`p-4 border-4 border-black rounded-xl font-bold text-lg transition-all duration-200 hover:scale-105 ${
                  pizzaType === '1/2 Pepperoni 1/2 Cheese'
                    ? 'bg-gray-900 text-white shadow-xl scale-105'
                    : 'bg-white text-black hover:bg-gray-100'
                }`}
              >
                Half & Half
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Whole Pizza Ordering */}
      <div className="bg-white border-4 border-black rounded-xl p-6 mb-8 shadow-lg">
        <h2 className="text-3xl font-black uppercase text-center text-black mb-4 tracking-wide">
          Add Whole Pizzas
        </h2>
        <p className="text-lg text-gray-600 mb-6 text-center">
          We recommend placing your pizza order at the time of booking to ensure
          that it is served out in a timely manner on the day of your party.
          However, this order can also be adjusted on the day of the party.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pepperoni Pizzas */}
          <div className="bg-gray-50 border-4 border-black rounded-xl p-6 text-center">
            <h3 className="text-2xl font-black text-black mb-4">Pepperoni</h3>
            <div className="flex items-center justify-center gap-4 mb-4">
              <button
                type="button"
                onClick={() =>
                  setWholePepperoniPizzas(Math.max(0, wholePepperoniPizzas - 1))
                }
                className="text-2xl w-12 h-12 rounded-full bg-gray-100 hover:bg-gray-200 border-4 border-black flex items-center justify-center font-black transition-all duration-200 hover:scale-110 shadow-lg"
              >
                −
              </button>
              <input
                type="number"
                value={wholePepperoniPizzas}
                onChange={(e) =>
                  setWholePepperoniPizzas(
                    Math.max(0, parseInt(e.target.value) || 0),
                  )
                }
                className="text-2xl font-black text-center w-20 px-3 py-2 rounded-xl border-4 border-black focus:ring-4 focus:ring-yellow-300 transition-all duration-200 shadow-lg"
                min="0"
              />
              <button
                type="button"
                onClick={() =>
                  setWholePepperoniPizzas(wholePepperoniPizzas + 1)
                }
                className="text-2xl w-12 h-12 rounded-full bg-gray-100 hover:bg-gray-200 border-4 border-black flex items-center justify-center font-black transition-all duration-200 hover:scale-110 shadow-lg"
              >
                +
              </button>
            </div>
            <div className="text-lg space-y-1">
              <div className="text-2xl font-black text-black">$22.99 Each</div>
              <div className="font-bold text-gray-600">16&quot; XL Pizza</div>
              <div className="font-bold text-gray-600">10 Slices</div>
            </div>
          </div>

          {/* Cheese Pizzas */}
          <div className="bg-gray-50 border-4 border-black rounded-xl p-6 text-center">
            <h3 className="text-2xl font-black text-black mb-4">Cheese</h3>
            <div className="flex items-center justify-center gap-4 mb-4">
              <button
                type="button"
                onClick={() =>
                  setWholeCheesePizzas(Math.max(0, wholeCheesePizzas - 1))
                }
                className="text-2xl w-12 h-12 rounded-full bg-gray-100 hover:bg-gray-200 border-4 border-black flex items-center justify-center font-black transition-all duration-200 hover:scale-110 shadow-lg"
              >
                −
              </button>
              <input
                type="number"
                value={wholeCheesePizzas}
                onChange={(e) =>
                  setWholeCheesePizzas(
                    Math.max(0, parseInt(e.target.value) || 0),
                  )
                }
                className="text-2xl font-black text-center w-20 px-3 py-2 rounded-xl border-4 border-black focus:ring-4 focus:ring-yellow-300 transition-all duration-200 shadow-lg"
                min="0"
              />
              <button
                type="button"
                onClick={() => setWholeCheesePizzas(wholeCheesePizzas + 1)}
                className="text-2xl w-12 h-12 rounded-full bg-gray-100 hover:bg-gray-200 border-4 border-black flex items-center justify-center font-black transition-all duration-200 hover:scale-110 shadow-lg"
              >
                +
              </button>
            </div>
            <div className="text-lg space-y-1">
              <div className="text-2xl font-black text-black">$19.99 Each</div>
              <div className="font-bold text-gray-600">16&quot; XL Pizza</div>
              <div className="font-bold text-gray-600">10 Slices</div>
            </div>
          </div>

          {/* Half & Half Pizzas */}
          <div className="bg-gray-50 border-4 border-black rounded-xl p-6 text-center">
            <h3 className="text-2xl font-black text-black mb-4">Half & Half</h3>
            <div className="flex items-center justify-center gap-4 mb-4">
              <button
                type="button"
                onClick={() =>
                  setWholeHalfHalfPizzas(Math.max(0, wholeHalfHalfPizzas - 1))
                }
                className="text-2xl w-12 h-12 rounded-full bg-gray-100 hover:bg-gray-200 border-4 border-black flex items-center justify-center font-black transition-all duration-200 hover:scale-110 shadow-lg"
              >
                −
              </button>
              <input
                type="number"
                value={wholeHalfHalfPizzas}
                onChange={(e) =>
                  setWholeHalfHalfPizzas(
                    Math.max(0, parseInt(e.target.value) || 0),
                  )
                }
                className="text-2xl font-black text-center w-20 px-3 py-2 rounded-xl border-4 border-black focus:ring-4 focus:ring-yellow-300 transition-all duration-200 shadow-lg"
                min="0"
              />
              <button
                type="button"
                onClick={() => setWholeHalfHalfPizzas(wholeHalfHalfPizzas + 1)}
                className="text-2xl w-12 h-12 rounded-full bg-gray-100 hover:bg-gray-200 border-4 border-black flex items-center justify-center font-black transition-all duration-200 hover:scale-110 shadow-lg"
              >
                +
              </button>
            </div>
            <div className="text-lg space-y-1">
              <div className="text-2xl font-black text-black">$22.99 Each</div>
              <div className="font-bold text-gray-600">16&quot; XL Pizza</div>
              <div className="font-bold text-gray-600">10 Slices</div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Pitchers */}
      <div className="bg-white border-4 border-black rounded-xl p-6 mb-8 shadow-lg">
        <h2 className="text-3xl font-black uppercase text-center text-black mb-4 tracking-wide">
          Add Drink Pitchers
        </h2>
        <p className="text-lg text-gray-600 mb-6 text-center">
          $7.99 Each and $4.99 Per Refill
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(drinkPitchers).map(([drinkName, quantity]) => (
            <div
              key={drinkName}
              className="bg-gray-50 border-4 border-black rounded-xl p-6 text-center"
            >
              <h3 className="text-2xl font-black text-black mb-4">
                {drinkName}
              </h3>
              <div className="flex items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={() =>
                    setDrinkPitchers((prev) => ({
                      ...prev,
                      [drinkName]: Math.max(0, prev[drinkName] - 1),
                    }))
                  }
                  className="text-2xl w-12 h-12 rounded-full bg-gray-100 hover:bg-gray-200 border-4 border-black flex items-center justify-center font-black transition-all duration-200 hover:scale-110 shadow-lg"
                >
                  −
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) =>
                    setDrinkPitchers((prev) => ({
                      ...prev,
                      [drinkName]: Math.max(0, parseInt(e.target.value) || 0),
                    }))
                  }
                  className="text-2xl font-black text-center w-20 px-3 py-2 rounded-xl border-4 border-black focus:ring-4 focus:ring-yellow-300 transition-all duration-200 shadow-lg"
                  min="0"
                />
                <button
                  type="button"
                  onClick={() =>
                    setDrinkPitchers((prev) => ({
                      ...prev,
                      [drinkName]: prev[drinkName] + 1,
                    }))
                  }
                  className="text-2xl w-12 h-12 rounded-full bg-gray-100 hover:bg-gray-200 border-4 border-black flex items-center justify-center font-black transition-all duration-200 hover:scale-110 shadow-lg"
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Drink Choices – up to 3 */}
      <div className="bg-white border-4 border-black rounded-xl p-6 mb-8 shadow-lg">
        <h2 className="text-3xl font-black uppercase text-center text-black mb-4 tracking-wide">
          Choose Your Drinks
        </h2>
        <p className="text-xl font-bold text-center text-gray-700 mb-6">
          Pick up to 3 drinks - {drinkChoices.length}/3 selected
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[
            'Coke',
            'Dr Pepper',
            'Sprite',
            'Hi‑C Pink Lemonade',
            'Root Beer',
            'Coke Zero',
            'Sweet Tea',
            'Unsweet Tea',
            'Water Bottles',
          ].map((drink) => (
            <button
              key={drink}
              type="button"
              onClick={() => toggleDrink(drink)}
              disabled={
                !drinkChoices.includes(drink) && drinkChoices.length >= 3
              }
              className={`p-4 border-4 border-black rounded-xl font-bold text-lg transition-all duration-200 hover:scale-105 ${
                drinkChoices.includes(drink)
                  ? 'bg-gray-900 text-white shadow-xl scale-105'
                  : 'bg-gray-100 text-black hover:bg-gray-200'
              } ${!drinkChoices.includes(drink) && drinkChoices.length >= 3 ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {drink}
            </button>
          ))}
        </div>
      </div>

      {/* Contact Phone */}
      <div className="bg-white border-4 border-black rounded-xl p-6 mb-8 shadow-lg">
        <h2 className="text-3xl font-black uppercase text-center text-black mb-6 tracking-wide">
          Contact Information
        </h2>
        <div className="max-w-md mx-auto">
          <label className="block text-2xl font-black text-black mb-3">
            Phone Number:
          
          <input
            type="tel"
            value={contactPhone}
            onChange={(e) => setContactPhone(formatPhoneNumber(e.target.value))}
            className="w-full text-2xl font-bold px-6 py-4 rounded-xl border-4 border-black focus:ring-4 focus:ring-yellow-300 transition-all duration-200 shadow-lg text-center"
            placeholder="(555) 555-5555"
          />
          </label>
        </div>
      </div>

      {/* Acknowledgements */}
      <div className="bg-white border-4 border-black rounded-xl p-6 mb-8 shadow-lg">
        <h2 className="text-3xl font-black uppercase text-center text-black mb-6 tracking-wide">
          Important Information
        </h2>
        <div className="space-y-6">
          <div className="bg-gray-50 border-4 border-black rounded-xl p-6">
            <label className="flex items-start gap-4 cursor-pointer">
              <input
                type="checkbox"
                checked={ackList}
                onChange={() => setAckList(!ackList)}
                className="mt-1 w-6 h-6 accent-gray-900 transition-transform duration-200 scale-100 focus:scale-110"
              />
              <div className="text-lg font-semibold text-black">
                <strong>Guest List Required:</strong> On the day of your party,
                please bring in a list of names for those who you would like to
                receive a wristband. This list should include all children ages
                3‑15 who have been invited. Adults (16+) are free to enter the
                park, and only need to be included if you would like to purchase
                wristbands for them to play games and ride rides.
              </div>
            </label>
          </div>

          <div className="bg-gray-50 border-4 border-black rounded-xl p-6">
            <label className="flex items-start gap-4 cursor-pointer">
              <input
                type="checkbox"
                checked={ackSocks}
                onChange={() => setAckSocks(!ackSocks)}
                className="mt-1 w-6 h-6 accent-gray-900 transition-transform duration-200 scale-100 focus:scale-110"
              />
              <div className="text-lg font-semibold text-black">
                <strong>Socks Required:</strong> Some attractions at ZDT&apos;s
                require socks to participate. Please remind all of your guests
                to make sure to bring socks if they wish to participate in these
                attractions!
              </div>
            </label>
          </div>

          <div className="bg-gray-50 border-4 border-black rounded-xl p-6">
            <label className="flex items-start gap-4 cursor-pointer">
              <input
                type="checkbox"
                checked={ackEmail}
                onChange={() => setAckEmail(!ackEmail)}
                className="mt-1 w-6 h-6 accent-gray-900 transition-transform duration-200 scale-100 focus:scale-110"
              />
              <div className="text-lg font-semibold text-black">
                <strong>Email Confirmation:</strong> After checkout, you should
                receive an email confirmation to confirm your booking has gone
                through. Please be sure the email address entered at checkout is
                correct.
              </div>
            </label>
          </div>
        </div>
      </div>

      {formError && (
        <div className="bg-red-100 border-4 border-red-500 rounded-xl p-6 mb-8 shadow-lg">
          <div className="text-2xl font-black text-red-800 text-center">
            {formError}
          </div>
        </div>
      )}

      {/* Cost Estimator */}
      <div className="bg-white border-4 border-black rounded-xl p-6 mb-8 shadow-lg">
        <h2 className="text-3xl font-black uppercase text-center text-black mb-6 tracking-wide">
          Cost Breakdown
        </h2>

        {/* Itemized costs */}
        <div className="bg-gray-50 border-4 border-black rounded-xl p-6 mb-6">
          <div className="space-y-3">
            {estimatedCost.itemizedCosts.map((item) => (
              <div
                key={item.name}
                className="flex justify-between items-center text-lg font-bold"
              >
                <span className="text-black">
                  {item.name} x {item.quantity}
                </span>
                <span className="text-black">${item.total.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Totals */}
        <div className="space-y-4">
          <div className="flex justify-between items-center text-xl font-bold bg-gray-100 border-2 border-black rounded-lg p-4">
            <span>Subtotal:</span>
            <span>${estimatedCost.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center text-xl font-bold bg-gray-100 border-2 border-black rounded-lg p-4">
            <span>Sales Tax (8.25%):</span>
            <span>${estimatedCost.tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center text-2xl font-black bg-yellow-100 border-4 border-black rounded-lg p-6">
            <span>Total Estimated Cost:</span>
            <span>${estimatedCost.total.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center text-2xl font-black bg-green-100 border-4 border-black rounded-lg p-6">
            <span>Deposit Due at Booking:</span>
            <span>
              ${Number(selectedVariant?.price?.amount || 0).toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between items-center text-xl font-bold bg-blue-100 border-2 border-black rounded-lg p-4">
            <span>Balance Due on Party Day:</span>
            <span>
              $
              {Math.max(
                0,
                estimatedCost.total -
                  Number(selectedVariant?.price?.amount || 0),
              ).toFixed(2)}
            </span>
          </div>
        </div>

        <div className="mt-6 bg-gray-50 border-2 border-black rounded-lg p-4">
          <p className="text-sm font-semibold text-gray-700 text-center">
            Please note that amounts displayed are estimates based on
            information provided and are not guaranteed. Final pricing may vary
            based on actual party attendance, additional purchases, taxes, and
            other factors on the day of the event.
          </p>
        </div>
      </div>

      {/* Continue to Checkout Button */}
      <div className="bg-white border-4 border-black rounded-xl p-8 shadow-xl">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-black uppercase text-black mb-2 tracking-wide">
            Ready to Book Your Party?
          </h2>
          <p className="text-lg font-bold text-gray-700">
            Complete your booking and pay your deposit
          </p>
        </div>
        <div className="flex justify-center">
          <div className="bg-gray-900 hover:bg-gray-800 text-white font-black text-2xl px-12 py-6 rounded-xl border-4 border-black shadow-xl hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100">
            <AddToCartButton
              disabled={!selectedVariant || !isFormValid()}
              onClick={() => {
                if (validateForm()) {
                  open('cart');
                }
              }}
              lines={createCartLine()}
            >
              Continue to Checkout
            </AddToCartButton>
          </div>
        </div>
      </div>
    </div>
  );
}
