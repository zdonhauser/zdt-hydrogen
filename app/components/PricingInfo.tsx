import { Link } from 'react-router';

interface PricingInfoProps {
  showTitle?: boolean;
  className?: string;
}

export function PricingInfo({ showTitle = true, className = '' }: PricingInfoProps) {
  return (
    <div className={`space-y-12 ${className}`}>
      {showTitle && (
        <h2 className="text-3xl md:text-4xl font-black text-center mb-8">
          Pricing at the Gate
        </h2>
      )}

      {/* Main Unlimited Wristband */}
      <div className="bg-[var(--color-brand-cream)] border-4 border-[var(--color-brand-dark)] rounded-xl p-6 shadow-xl">
        <h3 className="text-2xl md:text-3xl font-black text-[var(--color-brand-dark)] mb-4">
          Unlimited Wristband: $35.99
        </h3>
        <p className="text-lg font-bold text-[var(--color-brand-dark)] mb-4">
          <strong>Unlimited FUN:</strong> All indoor and outdoor rides, attractions, and video games are included for the entire operating day!
        </p>
        
        <div className="bg-[var(--color-brand-yellow)] border-2 border-[var(--color-brand-dark)] rounded-lg p-4 mt-4">
          <h4 className="text-lg font-black text-[var(--color-brand-dark)] mb-2">
            Upgrade to Eat & Play Combo: +$9.99
          </h4>
          <p className="text-sm font-bold text-[var(--color-brand-dark)] mb-2">
            ADD one combo meal of choice from available Eat & Play Combo options, to be claimed at any time during the day of your visit.
          </p>
          <p className="text-sm font-bold text-[var(--color-brand-dark)] mb-3">
            (Value of up to $13.99)
          </p>
          <p className="text-xs text-[var(--color-brand-dark)]">
            <strong>Current Eat &amp; Play Combo Options:</strong> Cheeseburger Combo, Chicken Tender Combo, Chicken Sandwich Combo, Pizza Combo, Grilled Cheese Combo, Hot Dog Combo, Footlong Corndog Combo, or Southwest Veggie Burger Combo. All combos include fries or chips, and a medium drink or water bottle.
          </p>
        </div>
      </div>

      {/* Other Admission Options */}
      <div className="bg-white border-4 border-[var(--color-brand-dark)] rounded-xl p-6 shadow-xl">
        <h3 className="text-2xl font-black text-[var(--color-brand-dark)] mb-6">
          Other Admission Options Available At The Gate
        </h3>
        
        <div className="space-y-4">
          <div className="border-2 border-gray-300 rounded-lg p-4">
            <h4 className="text-lg font-bold text-[var(--color-brand-dark)] mb-2">
              Free Walk-In Admission Wristband
            </h4>
            <p className="text-sm text-[var(--color-brand-dark)]">
              Free Walk-In Admission is only available to adults and to children ages 2 and under. This option is not available to children ages 3-15. Free walk-in admission does not include any rides, video games, or attractions, and is only available to those who are accompanying or joining a paid person.
            </p>
          </div>

          <div className="border-2 border-gray-300 rounded-lg p-4">
            <h4 className="text-lg font-bold text-[var(--color-brand-dark)] mb-2">
              GoKart Driver Band - $9.99
            </h4>
            <p className="text-sm text-[var(--color-brand-dark)]">
              May be purchased by an adult to drive children on the GoKarts who are not yet tall enough to drive on their own (note: the GoKart Driver Band does not allow for driving the GoKarts without child as a passenger who has the Unlimited Wristband).
            </p>
          </div>

          <div className="border-2 border-gray-300 rounded-lg p-4">
            <h4 className="text-lg font-bold text-[var(--color-brand-dark)] mb-2">
              Indoor Wristband - $19.99
            </h4>
            <p className="text-sm text-[var(--color-brand-dark)]">
              Includes admission into the park with unlimited use of the following indoor attractions: Bungee Trampoline, MaxFlight Simulator, Indoor Rock Wall, Jungle Playground, All Arcade Games on Free Play. Not available for purchase online. Does not include any other rides or attractions.
            </p>
          </div>

          <div className="border-2 border-gray-300 rounded-lg p-4">
            <h4 className="text-lg font-bold text-[var(--color-brand-dark)] mb-2">
              Switchback Wristband - $19.99
            </h4>
            <p className="text-sm text-[var(--color-brand-dark)]">
              Includes admission into the park with unlimited rides on Switchback. This wristband does not include video games, and does not include any rides or attractions other than Switchback. Not available for purchase online.
            </p>
          </div>
        </div>
      </div>

      {/* Discounts */}
      <div className="bg-[var(--color-brand-green)] border-4 border-[var(--color-brand-dark)] rounded-xl p-6 shadow-xl">
        <h3 className="text-2xl font-black text-white mb-6">
          Discounts Available on the Unlimited Wristband at the Park Entrance:
        </h3>
        
        <div className="space-y-4">
          <div className="bg-white/20 rounded-lg p-4">
            <h4 className="text-lg font-bold text-white mb-2">
              Senior Citizens (65+) - $25.99
            </h4>
            <p className="text-sm text-white">ID Required</p>
          </div>

          <div className="bg-white/20 rounded-lg p-4">
            <h4 className="text-lg font-bold text-white mb-2">
              Military, Police, Firefighters, Teachers &amp; Their Dependents - 10% Off Full Gate Price
            </h4>
            <p className="text-sm text-white">ID Required</p>
          </div>

          <div className="bg-white/20 rounded-lg p-4">
            <h4 className="text-lg font-bold text-white mb-2">
              Under 42" Tall - $25.99
            </h4>
            <p className="text-sm text-white">
              Height Measured at the Gate; Must be over 36" to participate in any rides other than video games and playground. For reference, this height range includes most 3 and 4 year olds, and also includes some 2 or 5 year olds.
            </p>
          </div>
        </div>
      </div>

      {/* Water Rides Notice */}
      <div className="bg-blue-100 border-2 border-blue-600 rounded-lg p-4">
        <p className="text-sm text-blue-800 font-semibold">
          *Water rides are seasonal. For hours, see{' '}
          <Link to="/calendar" className="text-blue-600 hover:underline">
            zdtamusement.com/hours
          </Link>
        </p>
      </div>
    </div>
  );
}