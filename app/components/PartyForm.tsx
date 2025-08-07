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

  // Room time info based on room type
  const getRoomTimeInfo = () => {
    if (!roomName) return '1 Hour 45 Minutes';
    
    if (roomName.includes('Midway') || roomName.includes('Turning')) {
      return '4 Hours + 1 Hour Setup';
    } else {
      return '1 Hour 45 Minutes';
    }
  };

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
    // For Midway and Turning Point rooms, only require drinks if pizza is selected
    if (roomName && (roomName.includes('Midway') || roomName.includes('Turning'))) {
      if (foodOption === '$7' && drinkChoices.length === 0) return false;
    } else {
      // For other rooms, always require drinks
      if (drinkChoices.length === 0) return false;
    }
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
    // For Midway and Turning Point rooms, only require drinks if pizza is selected
    if (roomName && (roomName.includes('Midway') || roomName.includes('Turning'))) {
      if (foodOption === '$7' && drinkChoices.length === 0) {
        setFormError('Please select at least one drink option for your pizza order.');
        return false;
      }
    } else {
      // For other rooms, always require drinks
      if (drinkChoices.length === 0) {
        setFormError('Please select at least one drink option.');
        return false;
      }
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

    // Calculate tax (8.25%) on entire party for estimation purposes
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

  // Define the steps
  const totalSteps = 6;
  const stepTitles = [
    "Party Details",
    "Guest Count", 
    "Pizza & Drinks",
    "Add-ons",
    "Contact & Acknowledgements",
    "Review & Book"
  ];

  // Step validation functions
  const canProceedFromStep = (step: number): boolean => {
    switch(step) {
      case 1: // Party Details
        if (partyType === 'Birthday') return !!(birthdayName && birthdayAge);
        if (partyType === 'Team') return !!(teamName && teamActivity);
        if (partyType === 'Company') return !!companyName;
        if (partyType === 'Other') return !!otherParty;
        return true;
      case 2: // Guest Count
        return numParticipants >= roomDetails.minParticipants;
      case 3: // Pizza & Drinks
        // For Midway and Turning Point rooms, only require drink selection if pizza is selected
        if (roomName && (roomName.includes('Midway') || roomName.includes('Turning'))) {
          return foodOption === '$7' ? drinkChoices.length > 0 : true;
        }
        // For other rooms, always require drink selection
        return drinkChoices.length > 0;
      case 4: // Add-ons (optional)
        return true;
      case 5: // Contact & Acknowledgements
        return !!(contactPhone && ackList && ackSocks && ackEmail);
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (canProceedFromStep(currentStep) && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
      setFormError(null);
      // Scroll wizard into view
      setTimeout(() => {
        const wizardElement = document.querySelector('[data-wizard-container]');
        if (wizardElement) {
          wizardElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } else {
      // Show validation error
      if (currentStep === 1) {
        if (partyType === 'Birthday' && (!birthdayName || !birthdayAge)) {
          setFormError('Please enter the birthday star\'s name and age.');
        } else if (partyType === 'Team' && (!teamName || !teamActivity)) {
          setFormError('Please enter team name and activity.');
        } else if (partyType === 'Company' && !companyName) {
          setFormError('Please enter company name.');
        } else if (partyType === 'Other' && !otherParty) {
          setFormError('Please describe what you\'re celebrating.');
        }
      } else if (currentStep === 2) {
        setFormError(`A minimum of ${roomDetails.minParticipants} participants is required for the ${roomDetails.room} room.`);
      } else if (currentStep === 3) {
        // For Midway and Turning Point rooms, only show error if pizza is selected
        if (roomName && (roomName.includes('Midway') || roomName.includes('Turning')) && foodOption === '$7') {
          setFormError('Please select at least one drink choice for your pizza order.');
        } else if (!roomName || (!roomName.includes('Midway') && !roomName.includes('Turning'))) {
          setFormError('Please select at least one drink choice.');
        }
      } else if (currentStep === 5) {
        setFormError('Please complete all contact information and acknowledgements.');
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setFormError(null);
      // Scroll wizard into view
      setTimeout(() => {
        const wizardElement = document.querySelector('[data-wizard-container]');
        if (wizardElement) {
          wizardElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  };

  return (
    <div className="w-full p-2" data-wizard-container>
      {/* Compact Progress Header */}
      <div className="bg-white border-4 border-black rounded-xl p-4 mb-6 shadow-xl">
        <div className="text-center mb-4">
          <h1 className="text-2xl md:text-4xl lg:text-5xl font-black uppercase tracking-wide text-black">
            LET&apos;S PARTY!
          </h1>
          <p className="text-sm md:text-lg lg:text-xl font-bold text-gray-700 mt-1">
            Step {currentStep} of {totalSteps}: {stepTitles[currentStep - 1]}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-2">
          <div className="flex justify-between items-center mb-2">
            {stepTitles.map((title, index) => (
              <div key={index} className={`text-xs font-bold text-center ${
                index + 1 <= currentStep ? 'text-black' : 'text-gray-400'
              }`}>
                <div className={`w-6 h-6 rounded-full border-2 border-black flex items-center justify-center text-xs font-black mb-1 ${
                  index + 1 <= currentStep ? 'bg-gray-900 text-white' : 'bg-gray-100'
                }`}>
                  {index + 1}
                </div>
                {/* Only show title on larger screens or current step */}
                <div className={`w-12 text-xs leading-tight ${
                  index + 1 === currentStep ? 'block' : 'hidden sm:block'
                }`}>
                  {title}
                </div>
              </div>
            ))}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 border-2 border-black">
            <div 
              className="bg-gray-900 h-full rounded-full transition-all duration-300"
              style={{width: `${(currentStep / totalSteps) * 100}%`}}
            ></div>
          </div>
        </div>
      </div>

      {/* Step Content */}
      {currentStep === 1 && (
        <>
          {/* Back to Date/Time Selection */}
          <div className="bg-white border-4 border-black rounded-xl p-4 mb-4 shadow-lg">
            <div className="text-center">
              <Link
                to="/collections/party-booking"
                className="inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-black font-bold px-4 py-2 rounded-lg border-2 border-black transition-all duration-200 hover:scale-105"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Change Party Date/Time
              </Link>
            </div>
          </div>

          {/* Party Type selection */}
          <div className="bg-white border-4 border-black rounded-xl p-4 mb-4 shadow-lg">
            <h2 className="text-xl md:text-2xl font-black uppercase text-center text-black mb-4 tracking-wide">
              What Kind of Party?
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <button
                type="button"
                onClick={() => setPartyType('Birthday')}
                className={`p-3 border-4 border-black rounded-xl font-bold text-sm md:text-base transition-all duration-200 hover:scale-105 ${
                  partyType === 'Birthday'
                    ? 'bg-gray-900 text-white shadow-xl scale-105'
                    : 'bg-gray-100 text-black hover:bg-gray-200'
                }`}
              >
                Birthday
              </button>
              <button
                type="button"
                onClick={() => setPartyType('Team')}
                className={`p-3 border-4 border-black rounded-xl font-bold text-sm md:text-base transition-all duration-200 hover:scale-105 ${
                  partyType === 'Team'
                    ? 'bg-gray-900 text-white shadow-xl scale-105'
                    : 'bg-gray-100 text-black hover:bg-gray-200'
                }`}
              >
                Team
              </button>
              <button
                type="button"
                onClick={() => setPartyType('Company')}
                className={`p-3 border-4 border-black rounded-xl font-bold text-sm md:text-base transition-all duration-200 hover:scale-105 ${
                  partyType === 'Company'
                    ? 'bg-gray-900 text-white shadow-xl scale-105'
                    : 'bg-gray-100 text-black hover:bg-gray-200'
                }`}
              >
                Company
              </button>
              <button
                type="button"
                onClick={() => setPartyType('Other')}
                className={`p-3 border-4 border-black rounded-xl font-bold text-sm md:text-base transition-all duration-200 hover:scale-105 ${
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
            <div className="bg-gray-50 border-4 border-black rounded-xl p-4 mb-4 shadow-lg">
              <h3 className="text-lg md:text-2xl lg:text-3xl font-black uppercase text-center text-black mb-4 tracking-wide">
                Birthday Details
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-base md:text-lg lg:text-xl font-black text-black mb-2">
                    Birthday Star&apos;s Name:
                    <input
                      type="text"
                      value={birthdayName}
                      onChange={(e) => setBirthdayName(e.target.value)}
                      className="w-full text-base font-bold px-4 py-3 rounded-xl border-4 border-black focus:ring-4 focus:ring-yellow-300 transition-all duration-200 shadow-lg"
                      placeholder="Enter their name"
                    />
                  </label>
                </div>
                <div>
                  <label className="block text-base md:text-lg lg:text-xl font-black text-black mb-2">
                    Age:
                    <input
                      type="number"
                      value={birthdayAge}
                      min={1}
                      max={120}
                      onChange={(e) => setBirthdayAge(e.target.value)}
                      className="w-full text-base font-bold px-4 py-3 rounded-xl border-4 border-black focus:ring-4 focus:ring-yellow-300 transition-all duration-200 shadow-lg"
                      placeholder="Age"
                    />
                  </label>
                </div>
              </div>
            </div>
          )}
          {partyType === 'Team' && (
            <div className="bg-gray-50 border-4 border-black rounded-xl p-4 mb-4 shadow-lg">
              <h3 className="text-lg md:text-2xl lg:text-3xl font-black uppercase text-center text-black mb-4 tracking-wide">
                Team Details
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-base md:text-lg lg:text-xl font-black text-black mb-2">
                    Team Name:
                  <input
                    type="text"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    className="w-full text-base font-bold px-4 py-3 rounded-xl border-4 border-black focus:ring-4 focus:ring-yellow-300 transition-all duration-200 shadow-lg"
                    placeholder="Enter team name"
                  />
                  </label>
                </div>
                
                <div>
                  <label className="block text-base md:text-lg lg:text-xl font-black text-black mb-2">
                    Sport or Activity:
                    <input
                      type="text"
                      value={teamActivity}
                      onChange={(e) => setTeamActivity(e.target.value)}
                      className="w-full text-base font-bold px-4 py-3 rounded-xl border-4 border-black focus:ring-4 focus:ring-yellow-300 transition-all duration-200 shadow-lg"
                      placeholder="What sport or activity?"
                    />
                  </label>
                </div>
              </div>
            </div>
          )}
          {partyType === 'Company' && (
            <div className="bg-gray-50 border-4 border-black rounded-xl p-4 mb-4 shadow-lg">
              <h3 className="text-lg md:text-2xl lg:text-3xl font-black uppercase text-center text-black mb-4 tracking-wide">
                Company Details
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-base md:text-lg lg:text-xl font-black text-black mb-2">
                    Company Name:
                 
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full text-base font-bold px-4 py-3 rounded-xl border-4 border-black focus:ring-4 focus:ring-yellow-300 transition-all duration-200 shadow-lg"
                    placeholder="Enter company name"
                  />
                   </label>
                </div>
              </div>
            </div>
          )}
          {partyType === 'Other' && (
            <div className="bg-gray-50 border-4 border-black rounded-xl p-4 mb-4 shadow-lg">
              <h3 className="text-lg md:text-2xl lg:text-3xl font-black uppercase text-center text-black mb-4 tracking-wide">
                Party Details
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-base md:text-lg lg:text-xl font-black text-black mb-2">
                    What are you celebrating?
                  <input
                    type="text"
                    value={otherParty}
                    onChange={(e) => setOtherParty(e.target.value)}
                    className="w-full text-base font-bold px-4 py-3 rounded-xl border-4 border-black focus:ring-4 focus:ring-yellow-300 transition-all duration-200 shadow-lg"
                    placeholder="Describe your celebration"
                  />
                  </label>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {currentStep === 2 && (
        <>
          {/* Party Rate Info */}
          <div className="bg-white border-4 border-black rounded-xl p-4 mb-4 shadow-lg">
            <h2 className="text-xl md:text-2xl font-black uppercase text-center text-black mb-3 tracking-wide">
              Party Rate: ${roomDetails.baseRate}/Wristband
            </h2>
            <div className="bg-gray-50 border-2 border-black rounded-lg p-3 mb-4">
              <h3 className="text-base font-black text-black mb-2">What's Included:</h3>
              <ul className="text-sm text-black space-y-1">
                <li>• Room Time: {getRoomTimeInfo()}</li>
                <li>• Unlimited rides, attractions & games all day</li>
                {roomName && (roomName.includes('Carousel') || roomName.includes('Large')) && <li>• One free medium drink per wristband</li>}
                <li>• Free adult observation passes</li>
              </ul>
            </div>
            <div className="bg-blue-50 border-2 border-black rounded-lg p-3">
              <h3 className="text-base font-black text-black mb-2">Who Needs Wristbands:</h3>
              <ul className="text-sm text-black space-y-1">
                <li>• <strong>Kids ages 3-15:</strong> Must be included in party package</li>
                <li>• <strong>Adults (16+):</strong> Free to enter, or can be added at same rate</li>
                <li>• <strong>Children 2 and under:</strong> Free, or can be included if 36" tall</li>
              </ul>
            </div>
          </div>

          {/* Estimated Participants */}
          <div className="bg-white border-4 border-black rounded-xl p-4 mb-4 shadow-lg">
            <h2 className="text-xl md:text-2xl font-black uppercase text-center text-black mb-4 tracking-wide">
              How Many Participants?
            </h2>
            <div className="flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={() =>
                  setNumParticipants((prev) =>
                    Math.max(prev - 1, roomDetails.minParticipants),
                  )
                }
                className="text-2xl w-12 h-12 rounded-full bg-gray-100 hover:bg-gray-200 border-4 border-black flex items-center justify-center font-black transition-all duration-200 hover:scale-110 shadow-lg"
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
                  className="text-2xl font-black text-center w-24 px-3 py-2 rounded-xl border-4 border-black focus:ring-4 focus:ring-yellow-300 transition-all duration-200 shadow-lg"
                />
              </div>
              <button
                type="button"
                onClick={() =>
                  setNumParticipants((prev) => Math.min(prev + 1, 100))
                }
                className="text-2xl w-12 h-12 rounded-full bg-gray-100 hover:bg-gray-200 border-4 border-black flex items-center justify-center font-black transition-all duration-200 hover:scale-110 shadow-lg"
              >
                +
              </button>
            </div>
            <div className="text-center mt-3 text-sm font-bold text-gray-600">
              Minimum: {roomDetails.minParticipants} people required
            </div>
          </div>
        </>
      )}

      {currentStep === 3 && (
        <>
          {/* Food Options */}
          <div className="bg-white border-4 border-black rounded-xl p-4 mb-4 shadow-lg">
            <h2 className="text-xl md:text-2xl font-black uppercase text-center text-black mb-4 tracking-wide">
              Pizza Options
            </h2>
            <div className="bg-blue-50 border-2 border-black rounded-lg p-3 mb-4">
              <p className="text-xs text-black text-center font-bold">
                Note: You'll have the option to add whole pizzas and drink pitchers on the next step!
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFoodOption('')}
                className={`p-3 border-4 border-black rounded-xl font-bold text-sm transition-all duration-200 hover:scale-105 ${
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
                className={`p-3 border-4 border-black rounded-xl font-bold text-sm transition-all duration-200 hover:scale-105 ${
                  foodOption === '$7'
                    ? 'bg-gray-900 text-white shadow-xl scale-105'
                    : 'bg-gray-100 text-black hover:bg-gray-200'
                }`}
              >
                {roomName && (roomName.includes('Midway') || roomName.includes('Turning')) 
                  ? '2 Slices + Drink Each' 
                  : '2 Slices Each'}
                <div className="text-xs font-bold">+$7/Person</div>
              </button>
            </div>

            {/* Show pizza type only if food option selected */}
            {foodOption === '$7' && (
              <div className="mt-4 bg-gray-50 border-2 border-black rounded-xl p-3">
                <h3 className="text-base font-black uppercase text-center text-black mb-3 tracking-wide">
                  Pizza Type
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPizzaType('Pepperoni')}
                    className={`p-2 border-2 border-black rounded-lg font-bold text-xs transition-all duration-200 hover:scale-105 ${
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
                    className={`p-2 border-2 border-black rounded-lg font-bold text-xs transition-all duration-200 hover:scale-105 ${
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
                    className={`p-2 border-2 border-black rounded-lg font-bold text-xs transition-all duration-200 hover:scale-105 ${
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

          {/* Drink Choices – up to 3 - For Carousel/Large rooms always, or Midway/Turning when pizza is selected */}
          {roomName && (
            (!roomName.includes('Midway') && !roomName.includes('Turning')) || 
            ((roomName.includes('Midway') || roomName.includes('Turning')) && foodOption === '$7')
          ) && (
            <div className="bg-white border-4 border-black rounded-xl p-4 mb-4 shadow-lg">
              <h2 className="text-xl md:text-2xl font-black uppercase text-center text-black mb-2 tracking-wide">
                Choose Drinks
              </h2>
              <p className="text-sm font-bold text-center text-gray-700 mb-3">
                Pick up to 3 drinks
              </p>
              <div className="bg-blue-50 border-2 border-black rounded-lg p-3 mb-4">
                <p className="text-xs text-black text-center">
                  {roomName && (roomName.includes('Midway') || roomName.includes('Turning'))
                    ? 'One medium drink per participant is included with your pizza selection!'
                    : 'One medium drink per participant is included in your party rate!'}
                </p>
              </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
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
                  className={`p-2 border-2 border-black rounded-lg font-bold text-xs transition-all duration-200 hover:scale-105 ${
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
          )}
        </>
      )}

      {currentStep === 4 && (
        <>
          {/* Whole Pizza Ordering */}
          <div className="bg-white border-4 border-black rounded-xl p-4 mb-4 shadow-lg">
            <h2 className="text-xl md:text-2xl font-black uppercase text-center text-black mb-2 tracking-wide">
              Extra Whole Pizzas
            </h2>
            <div className="bg-yellow-50 border-2 border-black rounded-lg p-3 mb-4">
              <p className="text-xs text-black text-center">
                <strong>Optional:</strong> We recommend placing your pizza order now to ensure timely service on party day. Orders can be adjusted on the day of your party.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {/* Pepperoni Pizzas */}
              <div className="bg-gray-50 border-2 border-black rounded-lg p-3 text-center">
                <h3 className="text-sm font-black text-black mb-2">Pepperoni</h3>
                <div className="flex items-center justify-center gap-1 mb-2">
                  <button
                    type="button"
                    onClick={() =>
                      setWholePepperoniPizzas(Math.max(0, wholePepperoniPizzas - 1))
                    }
                    className="text-base w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 border-2 border-black flex items-center justify-center font-black transition-all duration-200 hover:scale-110"
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
                    className="text-sm font-black text-center w-10 px-1 py-1 rounded border-2 border-black focus:ring-2 focus:ring-yellow-300"
                    min="0"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setWholePepperoniPizzas(wholePepperoniPizzas + 1)
                    }
                    className="text-base w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 border-2 border-black flex items-center justify-center font-black transition-all duration-200 hover:scale-110"
                  >
                    +
                  </button>
                </div>
                <div className="text-xs">
                  <div className="font-black text-black">$22.99</div>
                  <div className="font-bold text-gray-600">16" XL</div>
                </div>
              </div>

              {/* Cheese Pizzas */}
              <div className="bg-gray-50 border-2 border-black rounded-lg p-3 text-center">
                <h3 className="text-sm font-black text-black mb-2">Cheese</h3>
                <div className="flex items-center justify-center gap-1 mb-2">
                  <button
                    type="button"
                    onClick={() =>
                      setWholeCheesePizzas(Math.max(0, wholeCheesePizzas - 1))
                    }
                    className="text-base w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 border-2 border-black flex items-center justify-center font-black transition-all duration-200 hover:scale-110"
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
                    className="text-sm font-black text-center w-10 px-1 py-1 rounded border-2 border-black focus:ring-2 focus:ring-yellow-300"
                    min="0"
                  />
                  <button
                    type="button"
                    onClick={() => setWholeCheesePizzas(wholeCheesePizzas + 1)}
                    className="text-base w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 border-2 border-black flex items-center justify-center font-black transition-all duration-200 hover:scale-110"
                  >
                    +
                  </button>
                </div>
                <div className="text-xs">
                  <div className="font-black text-black">$19.99</div>
                  <div className="font-bold text-gray-600">16" XL</div>
                </div>
              </div>

              {/* Half & Half Pizzas */}
              <div className="bg-gray-50 border-2 border-black rounded-lg p-3 text-center">
                <h3 className="text-sm font-black text-black mb-2">Half & Half</h3>
                <div className="flex items-center justify-center gap-1 mb-2">
                  <button
                    type="button"
                    onClick={() =>
                      setWholeHalfHalfPizzas(Math.max(0, wholeHalfHalfPizzas - 1))
                    }
                    className="text-base w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 border-2 border-black flex items-center justify-center font-black transition-all duration-200 hover:scale-110"
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
                    className="text-sm font-black text-center w-10 px-1 py-1 rounded border-2 border-black focus:ring-2 focus:ring-yellow-300"
                    min="0"
                  />
                  <button
                    type="button"
                    onClick={() => setWholeHalfHalfPizzas(wholeHalfHalfPizzas + 1)}
                    className="text-base w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 border-2 border-black flex items-center justify-center font-black transition-all duration-200 hover:scale-110"
                  >
                    +
                  </button>
                </div>
                <div className="text-xs">
                  <div className="font-black text-black">$22.99</div>
                  <div className="font-bold text-gray-600">16" XL</div>
                </div>
              </div>
            </div>
          </div>

          {/* Add Pitchers */}
          <div className="bg-white border-4 border-black rounded-xl p-4 mb-4 shadow-lg">
            <h2 className="text-xl md:text-2xl font-black uppercase text-center text-black mb-2 tracking-wide">
              Drink Pitchers
            </h2>
            <p className="text-xs text-gray-600 mb-4 text-center">
              $7.99 Each • $4.99 Refills
            </p>
            <p className="text-xs text-black text-center">
              {roomName && (roomName.includes('Midway') || roomName.includes('Turning'))
                ? 'Drink pitchers can be ordered for your party.'
                : 'One medium drink per participant is already included in your party rate! If ordered, pitchers are for additional drinks or refills.'}
            </p>
            <br/>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(drinkPitchers).map(([drinkName, quantity]) => (
                <div
                  key={drinkName}
                  className="bg-gray-50 border-2 border-black rounded-lg p-2 text-center"
                >
                  <h3 className="text-xs font-black text-black mb-2">
                    {drinkName}
                  </h3>
                  <div className="flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setDrinkPitchers((prev) => ({
                          ...prev,
                          [drinkName]: Math.max(0, prev[drinkName] - 1),
                        }))
                      }
                      className="text-sm w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 border-2 border-black flex items-center justify-center font-black transition-all duration-200 hover:scale-110"
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
                      className="text-xs font-black text-center w-10 px-1 py-1 rounded border-2 border-black focus:ring-2 focus:ring-yellow-300"
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
                      className="text-sm w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 border-2 border-black flex items-center justify-center font-black transition-all duration-200 hover:scale-110"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {currentStep === 5 && (
        <>
          {/* Contact Phone */}
          <div className="bg-white border-4 border-black rounded-xl p-4 mb-4 shadow-lg">
            <h2 className="text-xl md:text-2xl font-black uppercase text-center text-black mb-4 tracking-wide">
              Contact Info
            </h2>
            <div className="max-w-md mx-auto">
              <label className="block text-base font-black text-black mb-2">
                Phone Number:
              
              <input
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(formatPhoneNumber(e.target.value))}
                className="w-full text-base font-bold px-4 py-3 rounded-xl border-4 border-black focus:ring-4 focus:ring-yellow-300 transition-all duration-200 shadow-lg text-center"
                placeholder="(555) 555-5555"
              />
              </label>
            </div>
          </div>

          {/* Acknowledgements */}
          <div className="bg-white border-4 border-black rounded-xl p-4 mb-4 shadow-lg">
            <h2 className="text-xl md:text-2xl font-black uppercase text-center text-black mb-4 tracking-wide">
              Important Info
            </h2>
            
            {/* Deposit Info */}
            <div className="bg-green-50 border-2 border-black rounded-lg p-3 mb-4">
              <h3 className="text-base font-black text-black mb-2">Booking Details:</h3>
              <ul className="text-sm text-black space-y-1">
                <li>• <strong>Non-refundable $60 deposit</strong> due at booking</li>
                <li>• Remaining balance paid day of party based on actual attendance</li>
                <li>• Minimum of {roomDetails.minParticipants} participants required</li>
              </ul>
            </div>

            <div className="space-y-3">
              <div className="bg-gray-50 border-2 border-black rounded-lg p-3">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={ackList}
                    onChange={() => setAckList(!ackList)}
                    className="mt-1 w-5 h-5 accent-gray-900 transition-transform duration-200 scale-100 focus:scale-110"
                  />
                  <div className="text-sm font-semibold text-black">
                    <strong>Guest List Required:</strong> On the day of your party, please bring a list of names for those who you would like to receive a wristband. This list should include all children ages 3‑15 who have been invited. Adults (16+) are free to enter the park, and only need to be included if you would like to purchase wristbands for them to play games and ride rides.
                  </div>
                </label>
              </div>

              <div className="bg-gray-50 border-2 border-black rounded-lg p-3">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={ackSocks}
                    onChange={() => setAckSocks(!ackSocks)}
                    className="mt-1 w-5 h-5 accent-gray-900 transition-transform duration-200 scale-100 focus:scale-110"
                  />
                  <div className="text-sm font-semibold text-black">
                    <strong>Socks Required:</strong> Some attractions at ZDT's require socks to participate. Please remind all of your guests to make sure to bring socks if they wish to participate in these attractions!
                  </div>
                </label>
              </div>

              <div className="bg-gray-50 border-2 border-black rounded-lg p-3">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={ackEmail}
                    onChange={() => setAckEmail(!ackEmail)}
                    className="mt-1 w-5 h-5 accent-gray-900 transition-transform duration-200 scale-100 focus:scale-110"
                  />
                  <div className="text-sm font-semibold text-black">
                    <strong>Email Confirmation:</strong> After checkout, you should receive an email confirmation to confirm your booking has gone through. Please be sure the email address entered at checkout is correct.
                  </div>
                </label>
              </div>
            </div>
          </div>
        </>
      )}

      {currentStep === 6 && (
        <>
          {/* Review Summary */}
          <div className="bg-white border-4 border-black rounded-xl p-4 mb-4 shadow-lg">
            <h2 className="text-xl md:text-2xl font-black uppercase text-center text-black mb-4 tracking-wide">
              Party Summary
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 border-2 border-black rounded-lg p-3">
                <h3 className="text-base font-black text-black mb-2">Party Details</h3>
                <div className="space-y-1 text-sm">
                  <div><strong>Type:</strong> {partyType}</div>
                  {partyType === 'Birthday' && (
                    <>
                      <div><strong>Name:</strong> {birthdayName}</div>
                      <div><strong>Age:</strong> {birthdayAge}</div>
                    </>
                  )}
                  {partyType === 'Team' && (
                    <>
                      <div><strong>Team:</strong> {teamName}</div>
                      <div><strong>Activity:</strong> {teamActivity}</div>
                    </>
                  )}
                  {partyType === 'Company' && <div><strong>Company:</strong> {companyName}</div>}
                  {partyType === 'Other' && <div><strong>Details:</strong> {otherParty}</div>}
                  <div><strong>Participants:</strong> {numParticipants}</div>
                  <div><strong>Phone:</strong> {contactPhone}</div>
                </div>
              </div>
              
              <div className="bg-gray-50 border-2 border-black rounded-lg p-3">
                <h3 className="text-base font-black text-black mb-2">Food & Drinks</h3>
                <div className="space-y-1 text-sm">
                  <div><strong>Pizza:</strong> {foodOption ? `2 slices each (${pizzaType})` : 'None'}</div>
                  <div><strong>Drinks:</strong> {drinkChoices.join(', ') || 'None selected'}</div>
                  {(wholePepperoniPizzas > 0 || wholeCheesePizzas > 0 || wholeHalfHalfPizzas > 0) && (
                    <div className="mt-1">
                      <strong>Whole Pizzas:</strong>
                      {wholePepperoniPizzas > 0 && <div>• {wholePepperoniPizzas} Pepperoni</div>}
                      {wholeCheesePizzas > 0 && <div>• {wholeCheesePizzas} Cheese</div>}
                      {wholeHalfHalfPizzas > 0 && <div>• {wholeHalfHalfPizzas} Half & Half</div>}
                    </div>
                  )}
                  {Object.entries(drinkPitchers).some(([, qty]) => qty > 0) && (
                    <div className="mt-1">
                      <strong>Pitchers:</strong>
                      {Object.entries(drinkPitchers).map(([drink, qty]) => 
                        qty > 0 && <div key={drink}>• {qty} {drink}</div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Cost Estimator */}
          <div className="bg-white border-4 border-black rounded-xl p-4 mb-4 shadow-lg">
            <h2 className="text-xl md:text-3xl lg:text-4xl font-black uppercase text-center text-black mb-6 tracking-wide">
              Cost Summary
            </h2>

            {/* Itemized breakdown */}
            <div className="space-y-3">
              {estimatedCost.itemizedCosts.map((item, index) => (
                <div key={index} className="flex justify-between items-center text-sm md:text-lg lg:text-xl font-bold bg-gray-50 border-2 border-gray-300 rounded-lg p-3 md:p-4">
                  <div className="flex flex-col">
                    <span className="font-black">{item.name}</span>
                    <span className="text-xs md:text-sm text-gray-600 font-normal">
                      {item.quantity} × ${item.price.toFixed(2)}
                    </span>
                  </div>
                  <span className="font-black">${item.total.toFixed(2)}</span>
                </div>
              ))}
              
              {/* Subtotal */}
              <div className="border-t-2 border-black pt-2 mt-4">
                <div className="flex justify-between items-center text-base md:text-xl lg:text-2xl font-bold bg-gray-100 border-2 border-black rounded-lg p-3 md:p-4">
                  <span>Subtotal:</span>
                  <span>${estimatedCost.subtotal.toFixed(2)}</span>
                </div>
              </div>
              
              {/* Tax */}
              <div className="flex justify-between items-center text-base md:text-xl lg:text-2xl font-bold bg-gray-100 border-2 border-black rounded-lg p-3 md:p-4">
                <span>Tax (8.25%):</span>
                <span>${estimatedCost.tax.toFixed(2)}</span>
              </div>
              
              {/* Total */}
              <div className="flex justify-between items-center text-lg md:text-2xl lg:text-3xl font-black bg-yellow-100 border-4 border-black rounded-lg p-4 md:p-5">
                <span>Total Cost:</span>
                <span>${estimatedCost.total.toFixed(2)}</span>
              </div>
              
              {/* Deposit */}
              <div className="flex justify-between items-center text-lg md:text-2xl lg:text-3xl font-black bg-green-100 border-4 border-black rounded-lg p-4 md:p-5">
                <span>Deposit Due Now:</span>
                <span>
                  ${Number(selectedVariant?.price?.amount || 0).toFixed(2)}
                </span>
              </div>
              
              {/* Balance */}
              <div className="flex justify-between items-center text-base md:text-xl lg:text-2xl font-bold bg-blue-100 border-2 border-black rounded-lg p-3 md:p-4">
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

            <div className="mt-4 bg-gray-50 border-2 border-black rounded-lg p-3">
              <p className="text-xs font-semibold text-gray-700 text-center">
                Amounts are estimates. Final pricing may vary based on actual attendance and day-of purchases.
              </p>
            </div>
          </div>

          {/* Continue to Checkout Button */}
          <div className="bg-white border-4 border-black rounded-xl p-4 shadow-xl">
            <div className="text-center mb-4">
              <h2 className="text-xl md:text-2xl font-black uppercase text-black mb-1 tracking-wide">
                Ready to Book?
              </h2>
              <p className="text-sm font-bold text-gray-700">
                Complete booking and pay deposit
              </p>
            </div>
            <div className="flex justify-center">
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
        </>
      )}

      {/* Error Display */}
      {formError && (
        <div className="bg-red-100 border-4 border-red-500 rounded-xl p-6 mb-8 shadow-lg">
          <div className="text-2xl font-black text-red-800 text-center">
            {formError}
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center mt-8">
        <button
          type="button"
          onClick={prevStep}
          disabled={currentStep === 1}
          className={`px-8 py-4 rounded-xl font-black text-xl border-4 border-black transition-all duration-200 ${
            currentStep === 1
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-gray-100 text-black hover:bg-gray-200 hover:scale-105 shadow-lg'
          }`}
        >
          ← Back
        </button>

        {currentStep < totalSteps ? (
          <button
            type="button"
            onClick={nextStep}
            className="px-8 py-4 rounded-xl font-black text-xl border-4 border-black bg-gray-900 text-white hover:bg-gray-800 hover:scale-105 transition-all duration-200 shadow-lg"
          >
            Continue →
          </button>
        ) : null}
      </div>
    </div>
  );
}
