import { Link } from 'react-router';
import { AnimatedBackground } from '~/components/AnimatedBackground';

export default function GroupsPage() {
  return (
    <div className="relative flex flex-col justify-center items-center px-4 py-10 text-[var(--color-dark)] overflow-hidden" style={{background: 'linear-gradient(135deg, var(--color-brand-blue) 0%, var(--color-brand-blue-hover) 100%)'}}>
      <AnimatedBackground 
        text="GROUPS" 
        textColor="text-blue-300" 
        opacity="opacity-20"
      />
      
      <div className="relative z-10 w-full flex flex-col justify-center items-center px-4 py-10">
        <h1 className="text-5xl md:text-6xl font-black text-center mb-8 drop-shadow-lg">Group Trips</h1>

        <p className="text-center text-xl md:text-2xl font-bold max-w-3xl mb-10 m-auto drop-shadow-lg p-4">
          Bring your group for an unforgettable day at ZDT&apos;s! Perfect for school field trips, 
          corporate events, church groups, and more. Enjoy unlimited access to all rides, 
          attractions, and video games at special group rates.
        </p>

        <div className="w-full max-w-6xl mb-16">
          <div className="flex flex-col items-center border-2 border-[var(--color-dark)] rounded-3xl p-8 shadow-xl bg-[var(--color-brand-cream)]">
            <h2 className="text-3xl font-bold mb-6 text-center">Unlimited Group Trip</h2>
            <p className="text-lg mb-4"><strong>Minimum of 15 participating group members</strong></p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 w-full max-w-4xl">
              <div className="text-center bg-[var(--color-brand-yellow)] p-4 rounded-xl border-2 border-[var(--color-dark)]">
                <div className="font-bold text-xl">$20/Person</div>
                <div className="text-sm">3 Hours</div>
              </div>
              <div className="text-center bg-[var(--color-brand-yellow)] p-4 rounded-xl border-2 border-[var(--color-dark)]">
                <div className="font-bold text-xl">$22/Person</div>
                <div className="text-sm">4 Hours</div>
              </div>
              <div className="text-center bg-[var(--color-brand-yellow)] p-4 rounded-xl border-2 border-[var(--color-dark)]">
                <div className="font-bold text-xl">$24/Person</div>
                <div className="text-sm">5 Hours</div>
              </div>
              <div className="text-center bg-[var(--color-brand-yellow)] p-4 rounded-xl border-2 border-[var(--color-dark)]">
                <div className="font-bold text-xl">$26/Person</div>
                <div className="text-sm">All Day</div>
              </div>
            </div>

            <div className="text-center mb-6 p-4 bg-[var(--color-brand-green)] rounded-xl border-2 border-[var(--color-dark)] w-full">
              <h4 className="text-xl font-bold">Includes Unlimited Access to ALL Rides, Attractions, and Video Games in the Park!</h4>
            </div>

            <div className="text-center mb-6 p-4 bg-white rounded-xl border-2 border-[var(--color-dark)] w-full">
              <p className="text-lg">
                <strong>Add Pizza</strong> for an additional $7/person<br />
                <span className="text-sm">(includes two slices of pizza and a drink each)</span>
              </p>
            </div>
          </div>
        </div>

        {/* Party Room Options */}
        <div className="w-full max-w-6xl mb-16">
          <div className="text-center mb-8 p-6">
            <h2 className="text-4xl md:text-5xl font-black mb-4 drop-shadow-lg">Optional: Add a Party Room</h2>
            <p className="text-xl md:text-2xl font-bold drop-shadow-md">Add a party room to your group package for an additional <strong>$2/person</strong></p>
            <p className="text-lg md:text-xl font-bold drop-shadow-md">(minimum of 50 participants)</p>
            <p className="text-md md:text-lg font-bold drop-shadow-md">Deposit of $100 required upon booking to reserve a party room</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {groupPartyRooms.map((room) => (
              <div
                key={room.name}
                className="flex flex-col items-center border-2 border-[var(--color-dark)] rounded-3xl p-6 shadow-xl bg-[var(--color-brand-cream)] hover:scale-105 transition-all duration-300 ease-out"
              >
                <img
                  src={room.image}
                  alt={room.name}
                  className="rounded-2xl mb-4 w-full object-cover aspect-square hover:scale-110 transition-all duration-300 ease-out"
                />
                <h3 className="text-xl font-bold mb-4 text-center">{room.name}</h3>
                <div className="text-sm text-center space-y-3 w-full">
                  {room.features.map((feature, idx) => (
                    <div key={idx}>
                      <p className="text-md">{feature}</p>
                      {idx < room.features.length - 1 && <hr className="my-2" />}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Info */}
        <div className="max-w-4xl text-center mb-12 space-y-6">
          <div className="p-6 bg-[var(--color-brand-cream)] rounded-xl border-2 border-[var(--color-dark)]">
            <p className="text-lg">
              One adult wristband will be provided free for every 10 children to participate. 
              Other adults (16+) may come in for free to watch. Additional adult bands are 
              the same price as the children&apos;s bands for those wishing to participate.
            </p>
          </div>

          <div className="p-6 bg-[var(--color-brand-yellow)] rounded-xl border-2 border-[var(--color-dark)]">
            <p className="text-lg">
              For weekday field trips in May, a $100 deposit will be required due to capacity limits. 
              All other dates do not require a deposit.
            </p>
          </div>

          <div className="p-4 bg-white rounded-xl border-2 border-[var(--color-dark)]">
            <p className="text-sm">
              *Water rides are seasonal.{' '}
              <Link 
                to="/calendar" 
                className="text-blue-600 hover:underline"
              >
                For water ride hours please see our calendar.
              </Link>
            </p>
          </div>
        </div>

        {/* Contact Section */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-red-600 mb-4">(830) 217-3565</h2>
          <p className="text-xl text-red-600 mb-6">- or -</p>
          <Link 
            to="/pages/group-inquiry"
            className="bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-4 rounded-full border-2 border-[var(--color-dark)] shadow-xl transition-all"
          >
            Inquire Online
          </Link>
        </div>

        {/* Navigation Buttons */}
        <div className="text-center space-y-4 max-w-4xl">
          <Link to="/pages/private-events">
            <button className="w-full bg-[var(--color-brand-green)] hover:bg-[var(--color-brand-green-hover)] text-[var(--color-dark)] font-bold px-6 py-4 rounded-xl border-2 border-[var(--color-dark)] shadow-lg transition-all mb-4">
              For groups over 500 participants that would like the park to themselves, or wish to visit on a time or date that we are not already 
              scheduled to open, please click here to see our private events page.
            </button>
          </Link>

          <Link to="/pages/party">
            <button className="w-full bg-[var(--color-brand-yellow)] hover:bg-[var(--color-brand-yellow-hover)] text-[var(--color-dark)] font-bold px-6 py-4 rounded-xl border-2 border-[var(--color-dark)] shadow-lg transition-all">
              For groups of less than 15, click here see our party room rates.
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

const groupPartyRooms = [
  {
    name: 'Midway Point Party Station',
    image: 'https://cdn.shopify.com/s/files/1/0038/2527/0897/files/Midway.jpg',
    features: [
      'Private air-conditioned building in the Midway section of the park, including private restrooms.',
      'Required Minimum Number of Participants: 50',
      'Recommended Maximum Number of Participants: 100'
    ],
  },
  {
    name: 'Turning Point Party Station',
    image: 'https://cdn.shopify.com/s/files/1/0038/2527/0897/files/turningpoint.jpg',
    features: [
      'Private air-conditioned building in the Midway section of the park, including private restrooms.',
      'Podium with microphone, projector, and overhead speakers are also available on request for announcements or presentations.',
      'Required Minimum Number of Participants: 100',
      'Recommended Maximum Number of Participants: 250'
    ],
  },
];