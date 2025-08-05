import { type MetaFunction } from '@shopify/remix-oxygen';
import { Link } from 'react-router';
import { PricingInfo } from '~/components/PricingInfo';
import { AnimatedBackground } from '~/components/AnimatedBackground';

export const meta: MetaFunction = () => {
  return [{ title: 'Pricing - ZDT\'s Amusement Park' }];
};

export default function PricingPage() {
  return (
    <div className="relative flex flex-col justify-center items-center px-4 py-10 text-[var(--color-dark)] overflow-hidden" style={{background: 'linear-gradient(135deg, var(--color-brand-blue) 0%, var(--color-brand-blue-hover) 100%)'}}>
      <AnimatedBackground 
        text="PRICING" 
        textColor="text-blue-300" 
        opacity="opacity-10"
      />
      
      <div className="relative z-10 w-full flex flex-col justify-center items-center px-4 py-10">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-black text-center mb-8 drop-shadow-lg">
            Pricing
          </h1>
          
          <p className="text-center text-xl md:text-2xl font-bold max-w-3xl mb-10 mx-auto drop-shadow-lg">
            Get the most value for your fun! Check out our admission options and discounts available at the gate.
          </p>

          <PricingInfo />

          {/* Additional Call to Action */}
          <div className="mt-12 text-center">
            <div className="bg-[var(--color-brand-yellow)] p-6 rounded-xl border-4 border-[var(--color-brand-dark)] shadow-xl">
              <h3 className="text-2xl font-black text-[var(--color-brand-dark)] mb-4">
                Ready to Visit?
              </h3>
              <p className="text-lg font-bold text-[var(--color-brand-dark)] mb-4">
                Purchase your tickets online or at the gate. Gates open at 10 AM!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  to="/products/unlimitedwristband"
                  className="bg-[var(--color-brand-green)] hover:bg-[var(--color-brand-green-hover)] text-white font-bold px-6 py-3 rounded-lg border-2 border-[var(--color-brand-dark)] shadow-md transition-all text-center"
                >
                  Buy Tickets Online
                </Link>
                <Link 
                  to="/pages/hours"
                  className="bg-[var(--color-brand-blue)] hover:bg-[var(--color-brand-blue-hover)] text-white font-bold px-6 py-3 rounded-lg border-2 border-[var(--color-brand-dark)] shadow-md transition-all text-center"
                >
                  View Park Hours
                </Link>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="mt-8 text-center">
            <div className="bg-white/10 p-4 rounded-lg">
              <p className="text-lg font-bold drop-shadow-md">
                Questions about pricing? Call us at{' '}
                <span className="text-2xl font-black">(830) 386-0151</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}