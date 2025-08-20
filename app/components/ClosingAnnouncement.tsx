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
              For more than 18 years, we had the privilege of filling your days with smiles, thrills, and unforgettable memories. After much consideration, we made the difficult decision to close ZDT's Amusement Park. 
              <br /> 
            <span className="text-[var(--color-brand-red)] font-black">We are now permanently closed as of August 17, 2025</span>.
            </p>

            <p className="text-lg md:text-xl font-bold text-[var(--color-brand-dark)] mb-6">
              Thank you for making ZDT's part of your story. We truly couldn't have done it without you.
            </p>
            
            <p className="text-base md:text-lg font-semibold text-[var(--color-brand-dark)] italic mb-8">
              <span className="font-black">The ZDT's Team</span>
            </p>
          </div>
          
          {/* Equipment for Sale Section */}
          <div className="mt-12 pt-8 border-t-4 border-[var(--color-brand-dark)] text-center">
            <div className="bg-[var(--color-brand-yellow)] border-4 border-[var(--color-brand-dark)] rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <h3 className="text-xl md:text-2xl font-black text-[var(--color-brand-dark)] mb-4 uppercase tracking-wide">
                Own a Piece of ZDT's History
              </h3>
              <p className="text-base md:text-lg font-bold text-[var(--color-brand-dark)] mb-4">
                Purchase a piece of ZDT's legacy! Browse our remaining inventory of equipment available for sale.
              </p>
              <p className="text-sm md:text-base font-semibold text-[var(--color-brand-dark)] mb-4">
                Park buildings are also available for lease or sale - please contact us for details.
              </p>
              <Link
                to="/collections/assets"
                className="inline-block bg-[var(--color-brand-green)] hover:bg-[var(--color-brand-green-hover)] text-white font-black px-8 py-4 rounded-xl border-4 border-[var(--color-brand-dark)] shadow-lg hover:shadow-xl transition-all duration-200 text-lg uppercase tracking-wider transform hover:scale-105"
              >
                Browse Available Equipment →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}