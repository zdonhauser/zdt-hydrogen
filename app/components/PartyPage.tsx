import { Link } from 'react-router';
import {useState} from 'react';

export default function PartyPage() {
  const [isPaused, setIsPaused] = useState(false);
  return (
    <div className="relative flex flex-col justify-center items-center px-4 py-10 bg-[var(--color-brand-green)] text-[var(--color-dark)] overflow-hidden">
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden flex flex-col items-center">
        {[...Array(30)].map((_, idx) => (
          <div
            key={idx}
            className={`flex whitespace-nowrap text-6xl md:text-8xl font-extrabold leading-none ${
              idx % 2 === 0 ? 'animate-[scroll-left_linear_infinite]' : 'animate-[scroll-right_linear_infinite]'
            } ${idx % 2 === 0 ? 'opacity-20' : 'opacity-50'} text-[var(--color-brand-green-hover)]`}
            style={{
              animationDuration: `${40 + idx * 5}s`,
              animationPlayState: isPaused ? 'paused' : 'running',
            }}
          >
            PARTY&nbsp;PARTY&nbsp;PARTY&nbsp;PARTY&nbsp;PARTY&nbsp;PARTY&nbsp;PARTY&nbsp;PARTY&nbsp;PARTY&nbsp;PARTY&nbsp;PARTY&nbsp;PARTY&nbsp;PARTY&nbsp;PARTY&nbsp;PARTY&nbsp;PARTY&nbsp;PARTY&nbsp;PARTY&nbsp;PARTY&nbsp;PARTY&nbsp;PARTY&nbsp;PARTY&nbsp;PARTY&nbsp;PARTY&nbsp;PARTY&nbsp;PARTY&nbsp;PARTY&nbsp;PARTY&nbsp;PARTY&nbsp;PARTY&nbsp;PARTY&nbsp;PARTY&nbsp;PARTY&nbsp;PARTY&nbsp;PARTY&nbsp;
          </div>
        ))}
      </div>
      <div className="relative z-10 w-full flex flex-col justify-center items-center px-4 py-10 ">
        <h1 className="text-4xl font-bold text-center mb-8">Party Rooms</h1>

        <p className="text-center text-lg max-w-3xl mb-10 m-auto">
          Rent out a party room for your next birthday party, company party, or
          event! There&apos;s no fee for the room, only a minimum number of
          wristbands you&apos;re required to purchase to reserve the room. We
          have rooms for all sizes of parties - starting at a minimum of 8 for
          our Carousel Room, up to a minimum of 75 for our Turning Point Party
          Station, a private building fully equipped with a microphone and
          projector for presentations, music, or photo slideshows!
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-16 w-full max-w-7xl">
          {/* Room Cards */}
          {partyRooms.map((room) => (
            <Link
              key={room.name}
              to={`/collections/party-booking`}
              className="relative flex flex-col items-center border-2 border-[var(--color-dark)] rounded-3xl p-6 shadow-xl bg-[var(--color-brand-cream)] hover:scale-105 hover:rotate-1 hover:shadow-2xl transition-all duration-300 ease-out"
            >
              <span className="absolute top-3 left-3 bg-[var(--color-brand-yellow)] text-[var(--color-dark)] font-bold text-xs px-3 py-1 rounded-full shadow-md">
                Min {room.minimum}
              </span>
              <img
                src={room.image}
                alt={room.name}
                className="rounded-2xl mb-4 w-full object-cover h-48 hover:scale-110 hover:-rotate-6 transition-all duration-300 ease-out"
              />
              <h2 className="text-xl font-bold mb-2 text-center">
                {room.name}
              </h2>
              <h4 className="text-md text-red-600 mb-4 text-center">
                {room.price}
                <br />
                <small>Minimum: {room.minimum}</small>
              </h4>
              <Link to="/collections/party-booking">
                <button className="bg-[var(--color-brand-yellow)] hover:bg-[var(--color-brand-yellow-hover)] text-[var(--color-dark)] font-bold px-4 py-2 rounded-full border-2 border-[var(--color-dark)] mb-4">
                  Book Now
                </button>
              </Link>
              <div className="text-sm text-center space-y-5">
                {room.features.map((feature, idx) => (
                  <>
                    <div key={idx} className="text-lg">
                      {feature}
                    </div>
                    <hr />
                  </>
                ))}
              </div>
            </Link>
          ))}
        </div>

        <h2 className="text-2xl font-bold mb-4">Food Options</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16 w-full max-w-5xl">
          {foodOptions.map((food) => (
            <div
              key={food.title}
              className="flex flex-col items-center border-2 border-[var(--color-dark)] rounded-2xl p-6 shadow-lg bg-[var(--color-brand-cream)] hover:bg-[var(--color-brand-cream-hover)] hover:scale-105 transition-all duration-300 ease-out"
            >
              <h5 className="text-lg font-bold mb-2">{food.title}</h5>
              {food.details.map((line, idx) => (
                <p key={idx} className="text-sm text-center">
                  {line}
                </p>
              ))}
            </div>
          ))}
        </div>

        <button className="bg-[var(--color-brand-yellow)] hover:bg-[var(--color-brand-yellow-hover)] active:scale-95 transition-transform font-bold px-10 py-4 rounded-full border-2 border-[var(--color-dark)] mb-12 shadow-xl text-[var(--color-dark)]">
          Book Now
        </button>

        <div className="max-w-3xl text-center mb-12 text-sm">
          <p>
            Notice: A $60 non-refundable deposit is required upon reservation
            for either the Carousel or Large Party Room, $100 for the Midway
            Point, or $400 for the Turning Point Party Station. No outside food
            or drinks are allowed in the Carousel or Large Party Rooms except
            birthday cake. The Midway and Turning Point Stations DO allow
            outside food (except prohibited items). Children ages 3-15 require
            wristbands. Adults 16+ are free to enter but must purchase a
            wristband or be part of the party to participate.
          </p>
        </div>

        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Printable Invitations:</h2>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <button
              className="bg-[var(--color-brand-yellow)] hover:bg-[var(--color-brand-yellow-hover)] text-[var(--color-dark)] font-bold px-5 py-3 rounded-full border-2 border-[var(--color-dark)] shadow-md transition-all"
              onClick={() =>
                window.open(
                  'https://cdn.shopify.com/s/files/1/0038/2527/0897/files/Invitation_Switchback.pdf?v=1586801554',
                )
              }
            >
              Switchback Style
            </button>
            <button
              className="bg-[var(--color-brand-yellow)] hover:bg-[var(--color-brand-yellow-hover)] text-[var(--color-dark)] font-bold px-5 py-3 rounded-full border-2 border-[var(--color-dark)] shadow-md transition-all"
              onClick={() =>
                window.open(
                  'https://cdn.shopify.com/s/files/1/0038/2527/0897/files/Invitation_Jungleland.pdf?v=1586801547',
                )
              }
            >
              JungleLand Style
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const partyRooms = [
  {
    name: 'Carousel Party Room',
    image:
      'https://cdn.shopify.com/s/files/1/0038/2527/0897/files/Carousel.jpg',
    price: '$32/Wristband',
    minimum: '8',
    features: [
      'Room Time: 1 Hour 45 Minutes',
      'Unlimited Rides, Attractions & Games All Day',
      'One Free Medium Drink Per Wristband',
      'Main Building Section, Capacity 30',
      'No Outside Food or Drinks (except cake)',
      'Free Adult Observation Passes',
    ],
  },
  {
    name: 'Large Party Room',
    image: 'https://cdn.shopify.com/s/files/1/0038/2527/0897/files/Large.jpg',
    price: '$32/Wristband',
    minimum: '10',
    features: [
      'Room Time: 1 Hour 45 Minutes',
      'Unlimited Rides, Attractions & Games All Day',
      'One Free Medium Drink Per Wristband',
      'Corner Room in Main Building, Capacity 50',
      'No Outside Food or Drinks (except cake)',
      'Free Adult Observation Passes',
    ],
  },
  {
    name: 'Midway Point Party Station',
    image: 'https://cdn.shopify.com/s/files/1/0038/2527/0897/files/Midway.jpg',
    price: '$32/Wristband',
    minimum: '25',
    features: [
      'Room Time: 4 Hours + 1 Hour Setup',
      'Private Air-Conditioned Building',
      'Unlimited Rides, Attractions & Games All Day',
      'Outside Food Allowed',
      'Capacity 100',
      'Free Adult Observation Passes',
    ],
  },
  {
    name: 'Turning Point Party Station',
    image:
      'https://cdn.shopify.com/s/files/1/0038/2527/0897/files/turningpoint.jpg',
    price: '$30/Wristband',
    minimum: '75',
    features: [
      'Room Time: 4 Hours + 1 Hour Setup',
      'Private Air-Conditioned Building with AV Equipment',
      'Unlimited Rides, Attractions & Games All Day',
      'Outside Food Allowed',
      'Capacity 250',
      'Free Adult Observation Passes',
    ],
  },
];

const foodOptions = [
  {
    title: 'Pizza Based on Party Attendance',
    details: ['+2 Slices Per Participant (+$7/Person)'],
  },
  {
    title: 'Whole Pizzas (10 Slices)',
    details: ['XL 16" Cheese Pizza: $19.99', 'XL 16" Pepperoni Pizza: $22.99'],
  },
  {
    title: 'Pitchers',
    details: ['$7.99 Per Pitcher with $4.99 Refills (party timeslots only)'],
  },
  {
    title: 'Other Food',
    details: ['Full menu available day of party'],
  },
];
