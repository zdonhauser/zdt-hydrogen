import { Link } from 'react-router';

export default function ClosingAnnouncement() {
  return (
    <section className="relative bg-gradient-to-br from-black to-gray-800 overflow-hidden border-t-4 border-b-4 border-[var(--color-brand-dark)]">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="text-gray-300 text-[20rem] font-black leading-none select-none pointer-events-none absolute -top-20 -left-20 rotate-12">
          THANK YOU
        </div>
        <div className="text-gray-300 text-[15rem] font-black leading-none select-none pointer-events-none absolute -bottom-10 -right-10 -rotate-12">
          18 YEARS
        </div>
      </div>
      
      <div className="relative z-10 py-16 px-4 container mx-auto max-w-4xl">
        <div className="bg-white/95 backdrop-blur-sm border-4 border-[var(--color-brand-dark)] rounded-2xl p-8 md:p-12 shadow-2xl">
          <h2 className="text-4xl md:text-5xl font-black text-center mb-8 text-[var(--color-brand-dark)] uppercase tracking-wide">
            Thank You for 18 Amazing Years!
          </h2>
          
          <div className="prose prose-lg max-w-none text-center">
            <p className="text-lg md:text-xl font-bold text-[var(--color-brand-dark)] leading-relaxed mb-6">
              For more than 18 years, we've had the privilege of filling your days with smiles, thrills, and unforgettable memories. After much consideration, we've made the difficult decision to close ZDT's Amusement Park. Our last day of operation will be <span className="text-[var(--color-brand-red)] font-black">Sunday, August 17, 2025</span>. We would love to see you one more time before the gates close.
            </p>
            
            <p className="text-base md:text-lg font-semibold text-[var(--color-brand-dark)] mb-4">
              If you've been holding on to ZDT's gift cards or 'any day' tickets, please plan to redeem them before that date.
            </p>
            
            <p className="text-base md:text-lg font-semibold text-[var(--color-brand-dark)] mb-4">
              <strong>Current members:</strong> Keep an eye on your inbox—we sent an email explaining how memberships will be handled going forward.
            </p>
            
            <p className="text-lg md:text-xl font-bold text-[var(--color-brand-dark)] mb-6">
              Thank you for making ZDT's part of your story. We truly couldn't have done it without you.
            </p>
            
            <p className="text-base md:text-lg font-semibold text-[var(--color-brand-dark)] italic mb-8">
              Hope to see you around the park,<br />
              <span className="font-black">The ZDT's Team</span>
            </p>
          </div>
          
          {/* Equipment for Sale Section */}
          <div className="mt-12 pt-8 border-t-4 border-[var(--color-brand-dark)] text-center">
            <div className="bg-[var(--color-brand-yellow)] border-4 border-[var(--color-brand-dark)] rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <h3 className="text-xl md:text-2xl font-black text-[var(--color-brand-dark)] mb-4 uppercase tracking-wide">
                Want a Piece of ZDT's History?
              </h3>
              <p className="text-base md:text-lg font-bold text-[var(--color-brand-dark)] mb-4">
                Want to purchase a piece of ZDT's? Click here to view our current inventory of games and equipment for sale.
              </p>
              <p className="text-sm md:text-base font-semibold text-[var(--color-brand-dark)] mb-4">
                All park buildings will be up for lease or sale starting in September 2025 - please contact us for details.
              </p>
              <Link
                to="/collections/assets"
                className="inline-block bg-[var(--color-brand-green)] hover:bg-[var(--color-brand-green-hover)] text-white font-black px-8 py-4 rounded-xl border-4 border-[var(--color-brand-dark)] shadow-lg hover:shadow-xl transition-all duration-200 text-lg uppercase tracking-wider transform hover:scale-105"
              >
                View Equipment For Sale →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}