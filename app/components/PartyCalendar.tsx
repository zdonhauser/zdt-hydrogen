import {useState, useMemo} from 'react';
import { Link } from 'react-router';

export default function PartyCalendar({products}: {products: any[]}) {
  const today = useMemo(() => new Date(), []);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Build a map of available dates
  const availableDates = useMemo(() => {
    const dates: {[date: string]: any[]} = {};
    console.log('products', products);
    products.forEach((product) => {
      product.variants?.nodes?.forEach((variant: any) => {
        if (variant?.sku) {
          const dateKey = variant.sku.slice(0, 6); // MMDDYY
          const dateObject = new Date(
            parseInt(dateKey.slice(4, 6)) + 2000,
            parseInt(dateKey.slice(0, 2)) - 1,
            parseInt(dateKey.slice(2, 4)),
          );
          console.log(dateKey, 'for', product.title);
          if (!dates[dateKey]) dates[dateKey] = [];
          dates[dateKey].push({
            variantId: variant.id,
            title: variant.title,
            handle: product.handle,
            roomName: variant.title,
            availableForSale: variant.availableForSale,
            date: dateObject,
          });
        }
      });
    });
    return dates;
  }, [products]);

  const months = useMemo(() => {
    const list = [];
    for (let i = 0; i < 12; i++) {
      list.push(new Date(today.getFullYear(), today.getMonth() + i, 1));
    }
    return list;
  }, [today]);

  const formatDateKey = (date: Date) => {
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const y = String(date.getFullYear()).slice(-2);
    return `${m}${d}${y}`;
  };

  const currentMonthStart = months[currentIndex];
  const month = currentMonthStart.getMonth();
  const year = currentMonthStart.getFullYear();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const cells = [];

  for (let i = 0; i < firstDay; i++) {
    cells.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const thisDate = new Date(year, month, d);
    cells.push(thisDate);
  }
  while (cells.length % 7 !== 0) {
    cells.push(null);
  }

  return (
    <div className="relative flex flex-col w-full items-center px-4 py-10 text-[var(--color-dark)] overflow-hidden min-h-screen">
      <div className="max-w-5xl w-full">
        <h1 className="text-3xl md:text-5xl font-extrabold mb-8 text-center">
          Select Your Party Date
        </h1>

        <div className="mb-16 w-full">
          <div className="flex items-center justify-between mb-6 px-4">
            <button
              onClick={() => setCurrentIndex((i) => Math.max(i - 1, 0))}
              disabled={currentIndex === 0}
              className="px-4 py-2 bg-[var(--color-brand-blue)] text-[var(--color-dark)] font-bold rounded-full hover:bg-[var(--color-brand-blue-hover)] border-4 border-[var(--color-brand-dark)] disabled:opacity-50 transition"
            >
              Prev
            </button>
            <h2 className="text-3xl font-extrabold text-center">
              {currentMonthStart.toLocaleString('default', {month: 'long'})}{' '}
              {year}
            </h2>
            <button
              onClick={() =>
                setCurrentIndex((i) => Math.min(i + 1, months.length - 1))
              }
              disabled={currentIndex === months.length - 1}
              className="px-4 py-2 bg-[var(--color-brand-blue)] text-[var(--color-dark)] font-bold rounded-full hover:bg-[var(--color-brand-blue-hover)] border-4 border-[var(--color-brand-dark)] disabled:opacity-50 transition"
            >
              Next
            </button>
          </div>

          <div className="grid grid-cols-7 gap-2 border-4 border-[var(--color-dark)] bg-[var(--color-brand-cream)] p-4 rounded-lg w-full">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day) => (
              <div key={day} className="text-center font-bold">
                {day}
              </div>
            ))}
            {cells.map((date, idx) => {
              if (!date) return <div key={idx} />;
              const dateKey = formatDateKey(date);
              const exists = availableDates[dateKey]?.length > 0;
              const isAvailable = availableDates[dateKey]?.some(
                (slot: any) => slot.availableForSale,
              );
              return (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedDate(dateKey);
                    // Scroll to room times section after a brief delay
                    setTimeout(() => {
                      const roomSection = document.querySelector('[data-room-times]');
                      if (roomSection) {
                        roomSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }
                    }, 100);
                  }}
                  className={`h-10 sm:h-20 flex flex-col items-center justify-center border-2 rounded-lg ${
                    exists
                      ? selectedDate === dateKey
                        ? 'bg-[var(--color-brand-yellow)] text-[var(--color-dark)] font-bold border-[var(--color-brand-dark)] scale-120'
                        : 'bg-[var(--color-brand-yellow)] hover:bg-[var(--color-brand-yellow-hover)] text-[var(--color-dark)] font-bold'
                      : 'bg-[var(--color-light)] text-gray-400'
                  }
                    ${exists && !isAvailable ? 'bg-gray-400 hover:bg-gray-600 text-black' : ''}
                  `}
                >
                  {date.getDate()}
                  {isAvailable && (
                    <span className="text-xs mt-1 hidden md:block">Available</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {selectedDate && (
          <div data-room-times>
            <h2 className="text-3xl font-extrabold mb-8 text-center">
              Available Party Rooms for{' '}
              {availableDates[selectedDate]?.[0]?.date.toLocaleDateString(
                'en-US',
                {year: '2-digit', month: '2-digit', day: '2-digit'},
              )}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
              {Object.entries(
                availableDates[selectedDate]?.reduce(
                  (acc: {[room: string]: any[]}, slot) => {
                    const roomKey = slot.roomName.split('/')[0].trim();
                    const timeSlot = slot.roomName.split('/')[1].trim();
                    slot.timeSlot = timeSlot;
                    if (!acc[roomKey]) acc[roomKey] = [];
                    acc[roomKey].push(slot);
                    return acc;
                  },
                  {},
                ) || {},
              )
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([room, slots]) => {
                  let imageUrl = '';
                  if (room.includes('Carousel')) {
                    imageUrl =
                      'https://cdn.shopify.com/s/files/1/0038/2527/0897/files/Carousel.jpg';
                  } else if (room.includes('Midway')) {
                    imageUrl =
                      'https://cdn.shopify.com/s/files/1/0038/2527/0897/files/Midway.jpg';
                  } else if (room.includes('Turning')) {
                    imageUrl =
                      'https://cdn.shopify.com/s/files/1/0038/2527/0897/files/turningpoint.jpg';
                  } else {
                    imageUrl =
                      'https://cdn.shopify.com/s/files/1/0038/2527/0897/files/Large.jpg';
                  }

                  return (
                    <div
                      key={room}
                      className="flex flex-col bg-[var(--color-light)] border-4 border-[var(--color-dark)] rounded-xl shadow-lg overflow-hidden"
                    >
                      <img
                        src={imageUrl}
                        alt={room}
                        className="w-full h-48 object-cover"
                      />
                      <div className="flex flex-col p-4 items-center gap-3">
                        <h3 className="text-xl font-bold text-center">
                          {room}
                        </h3>
                        <p className="room-minimum">
                          {room.includes('Carousel')
                            ? 'Minimum 8 Participants'
                            : room.includes('Large')
                              ? 'Minimum 10 Participants'
                              : room.includes('Midway')
                                ? 'Minimum 25 Participants'
                                : room.includes('Turning')
                                  ? 'Minimum 75 Participants'
                                  : ''}
                        </p>
                        <div className="flex flex-wrap justify-center gap-2">
                          {slots.map((slot) =>
                            slot.availableForSale ? (
                              <Link
                                key={slot.variantId}
                                to={`/products/${slot.handle}?Party+Room=${encodeURIComponent(room)}&Room+Time=${encodeURIComponent(slot.timeSlot)}`}
                                className="bg-[var(--color-brand-yellow)] hover:bg-[var(--color-brand-yellow-hover)] hover:scale-120 text-[var(--color-dark)] font-bold px-3 py-2 rounded-full border-2 border-[var(--color-dark)] text-sm shadow-md"
                              >
                                {slot.timeSlot}
                              </Link>
                            ) : (
                              <div
                                key={slot.variantId}
                                className="bg-gray-300 text-gray-600 font-bold px-3 py-2 rounded-full border-2 border-gray-400 text-sm cursor-not-allowed"
                              >
                                {slot.timeSlot}
                              </div>
                            ),
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
