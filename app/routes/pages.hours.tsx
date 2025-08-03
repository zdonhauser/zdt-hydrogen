import { type LoaderFunctionArgs } from '@shopify/remix-oxygen';
import { useLoaderData, type MetaFunction } from 'react-router';
import Calendar from '~/components/Calendar';
import type { CalendarData } from '~/components/Calendar';

export const meta: MetaFunction = () => {
  return [{ title: 'ZDT Jungle | Hours & Calendar' }];
};

const HOURS_QUERY = `#graphql
  query CalendarHours {
    metaobjects(type: "park_hours", first: 1) {
      edges {
        node {
          hours: field(key: "hours") {
            value
          }
          water: field(key: "water") {
            value
          }
          notes: field(key: "notes") {
            value
          }
        }
      }
    }
  }
`;

export async function loader({ context }: LoaderFunctionArgs) {
  const { metaobjects } = await context.storefront.query<{metaobjects: any}>(HOURS_QUERY);
  const node = metaobjects?.edges?.[0]?.node;
  
  const hoursData = (node?.hours?.value 
    ? JSON.parse(node.hours.value) 
    : {}) as CalendarData;
  const waterData = (node?.water?.value 
    ? JSON.parse(node.water.value) 
    : {}) as CalendarData;
  const notesData = (node?.notes?.value 
    ? JSON.parse(node.notes.value) 
    : {}) as CalendarData;

  return { hoursData, waterData, notesData };
}

export default function HoursPage() {
  const { hoursData, waterData, notesData } = useLoaderData<typeof loader>();
  return (
    <div className="min-h-screen bg-gradient-to-b from-[var(--color-brand-blue)] to-[var(--color-light)] py-12">
      <div className=" mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-wide text-[var(--color-dark)] mb-2">
            Hours & Calendar
          </h1>
          <p className="text-lg text-[var(--color-brand-dark)]">
            Check out our opening hours and plan your visit
          </p>
        </header>
        
        <Calendar 
          hoursData={hoursData}
          waterData={waterData}
          notesData={notesData}
          expanded={true}
        />
        
        <div className="mt-8 text-center text-[var(--color-brand-dark)]">
          <p className="font-medium">
            Have questions about our hours?{' '}
            <a 
              href="/pages/contact" 
              className="text-[var(--color-brand-blue)] hover:underline font-bold"
            >
              Contact us!
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
