import { Link } from 'react-router';
import { AnimatedBackground } from '~/components/AnimatedBackground';

export default function PrivateEventsPage() {
  return (
    <div className="relative flex flex-col justify-center items-center px-4 py-10 text-[var(--color-dark)] overflow-hidden" style={{background: 'linear-gradient(135deg, var(--color-brand-yellow) 0%, var(--color-brand-yellow-hover) 100%)'}}>
      <AnimatedBackground 
        text="PRIVATE" 
        textColor="text-yellow-600" 
        opacity="opacity-10"
      />
      
      <div className="relative z-10 w-full flex flex-col justify-center items-center px-4 py-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Hero Image */}
          <div className="mb-8">
            <img
              src="https://cdn.shopify.com/s/files/1/0038/2527/0897/files/Cover_600x600.jpg?v=1586817025"
              alt="Private Events at ZDT's Amusement Park"
              className="w-full max-w-2xl mx-auto rounded-xl border-4 border-[var(--color-brand-dark)] shadow-2xl"
            />
          </div>

          <h1 className="text-5xl md:text-6xl font-black text-center mb-8 drop-shadow-lg">Private Events</h1>

          <div className="space-y-6 text-left">
            <div className="bg-white/10 rounded-lg p-6 drop-shadow-lg">
              <p className="text-xl md:text-2xl font-bold leading-relaxed">
                Private Events are recommended for larger groups (100 to 2000 people) that would like to enjoy the park to themselves. 
                Perfect for corporate events, Christmas or holiday parties, private field trips, project graduations, bar mitzvahs, or even an unforgettable birthday party!
              </p>
            </div>

            <div className="bg-white/10 rounded-lg p-6 drop-shadow-lg">
              <p className="text-lg md:text-xl font-bold leading-relaxed">
                Reservations can be made for a time the park is not already scheduled to open. This includes most weekdays during the school year, before we open, or after we close on a regular operating day. 
                You can reserve from as few as three of our attractions for your event, or rent out the whole park if you would like! If you are looking to reserve a private building within the park, but do not need the whole park to yourself, we recommend inquiring about the Turning Point Party Station which can be reserved during regular operating hours.{' '}
                <Link to="/pages/party" className="text-black hover:underline font-black">
                  Click here for details.
                </Link>
              </p>
            </div>

            <div className="bg-white/10 rounded-lg p-6 drop-shadow-lg">
              <p className="text-lg md:text-xl font-bold leading-relaxed">
                To request information, give us an idea of how many people might be attending in the form below, so we can give you relevant information:
              </p>
            </div>
          </div>

          {/* Call to Action Button */}
          <div className="mt-12">
            <Link to="/pages/private-event-inquiry">
              <button className="bg-red-600 hover:bg-red-700 text-white font-black text-2xl px-10 py-6 rounded-lg border-4 border-black shadow-2xl transition-all duration-200 transform hover:scale-105">
                Request Private Event Info
              </button>
            </Link>
          </div>

          {/* Additional Information */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-[var(--color-brand-cream)] border-4 border-[var(--color-brand-dark)] rounded-xl p-6 shadow-xl">
              <h3 className="text-2xl font-black mb-4 text-[var(--color-brand-dark)]">Perfect For:</h3>
              <ul className="text-left space-y-2 text-[var(--color-brand-dark)] font-semibold">
                <li>• Corporate Events</li>
                <li>• Holiday Celebrations</li>
                <li>• School Field Trips</li>
                <li>• Project Graduations</li>
                <li>• Bar/Bat Mitzvahs</li>
                <li>• Large Birthday Parties</li>
                <li>• Team Building Events</li>
                <li>• Fundraisers</li>
              </ul>
            </div>

            <div className="bg-[var(--color-brand-cream)] border-4 border-[var(--color-brand-dark)] rounded-xl p-6 shadow-xl">
              <h3 className="text-2xl font-black mb-4 text-[var(--color-brand-dark)]">Event Options:</h3>
              <ul className="text-left space-y-2 text-[var(--color-brand-dark)] font-semibold">
                <li>• Full Park Rental</li>
                <li>• Select Attractions (minimum 3)</li>
                <li>• Weekday Exclusive Times</li>
                <li>• Before/After Hours Events</li>
                <li>• Custom Catering Options</li>
                <li>• Groups 100-2000 people</li>
                <li>• Lock-in Events Available</li>
                <li>• AV Equipment Available</li>
              </ul>
            </div>
          </div>

          {/* Contact Information */}
          <div className="mt-12 bg-[var(--color-brand-green)] p-6 rounded-xl border-4 border-[var(--color-brand-dark)] shadow-xl">
            <h3 className="text-2xl font-black text-white mb-4">Ready to Start Planning?</h3>
            <p className="text-white text-lg font-bold">
              Call us at <span className="text-3xl font-black">(830) 217-3565</span> to discuss your private event needs,
              or fill out our inquiry form to get a custom quote!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}