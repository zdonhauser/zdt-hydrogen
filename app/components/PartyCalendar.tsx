import {useState, useMemo} from 'react';
import { Link } from 'react-router';

export default function PartyCalendar({products, selectedRoom}: {products: any[], selectedRoom: string | null}) {
  const today = useMemo(() => {
    const now = new Date();
    // Set time to midnight for consistent date comparison
    now.setHours(0, 0, 0, 0);
    return now;
  }, []);
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

          {selectedRoom && (
            <div className="mb-4 p-4 bg-white rounded-lg border-2 border-[var(--color-brand-dark)] shadow-lg">
              <h3 className="font-bold text-center mb-2">Calendar Color Guide:</h3>
              <div className="flex flex-wrap justify-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-[var(--color-brand-yellow)] border border-[var(--color-brand-dark)] rounded"></div>
                  <span>{selectedRoom} Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-[var(--color-brand-blue)] border border-[var(--color-brand-dark)] rounded"></div>
                  <span>Other Options Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-400 border border-gray-600 rounded"></div>
                  <span>No Availability</span>
                </div>
              </div>
            </div>
          )}

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
              
              // Check if this is today or in the past (block same-day bookings)
              const tomorrow = new Date(today);
              tomorrow.setDate(tomorrow.getDate() + 1);
              const isPastOrToday = date < tomorrow;
              
              // Check availability based on selected room
              let isAvailable = false;
              let hasOtherRooms = false;
              
              if (selectedRoom && availableDates[dateKey]) {
                // Check if selected room is available
                isAvailable = availableDates[dateKey].some(
                  (slot: any) => slot.availableForSale && slot.roomName.toLowerCase().includes(selectedRoom.toLowerCase())
                );
                // Check if other rooms are available
                hasOtherRooms = availableDates[dateKey].some(
                  (slot: any) => slot.availableForSale && !slot.roomName.toLowerCase().includes(selectedRoom.toLowerCase())
                );
              } else {
                // No specific room selected, show any availability
                isAvailable = availableDates[dateKey]?.some(
                  (slot: any) => slot.availableForSale,
                );
              }
              return (
                <button
                  key={idx}
                  onClick={() => {
                    if (!isPastOrToday) {
                      setSelectedDate(dateKey);
                      // Scroll to room times section after a brief delay
                      setTimeout(() => {
                        const roomSection = document.querySelector('[data-room-times]');
                        if (roomSection) {
                          roomSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                      }, 100);
                    }
                  }}
                  disabled={isPastOrToday}
                  title={isPastOrToday ? 'Bookings must be made at least one day in advance' : ''}
                  className={`h-10 sm:h-20 flex flex-col items-center justify-center border-2 rounded-lg ${
                    isPastOrToday
                      ? 'bg-gray-200 text-gray-500 border-gray-300 cursor-not-allowed opacity-50'
                      : exists
                        ? selectedDate === dateKey
                          ? isAvailable 
                            ? 'bg-[var(--color-brand-yellow)] text-[var(--color-dark)] font-bold border-[var(--color-brand-dark)] scale-120'
                            : hasOtherRooms
                              ? 'bg-[var(--color-brand-blue)] text-[var(--color-dark)] font-bold border-[var(--color-brand-dark)] scale-120'
                              : 'bg-gray-400 text-black font-bold border-[var(--color-brand-dark)] scale-120'
                          : isAvailable
                            ? 'bg-[var(--color-brand-yellow)] hover:bg-[var(--color-brand-yellow-hover)] text-[var(--color-dark)] font-bold border-[var(--color-brand-dark)]'
                            : hasOtherRooms
                              ? 'bg-[var(--color-brand-blue)] hover:bg-[var(--color-brand-blue-hover)] text-[var(--color-dark)] font-bold border-[var(--color-brand-dark)]'
                              : 'bg-gray-400 hover:bg-gray-600 text-black border-gray-600'
                        : 'bg-[var(--color-light)] text-gray-400 border-gray-300'
                  }`}
                >
                  {date.getDate()}
                  {isPastOrToday ? (
                    <span className="text-xs mt-1 hidden md:block">
                      Unavailable
                    </span>
                  ) : exists && (
                    <span className="text-xs mt-1 hidden md:block">
                      {isAvailable 
                        ? selectedRoom ? `${selectedRoom} Available` : 'Available'
                        : hasOtherRooms
                          ? 'Other Options'
                          : 'Full'
                      }
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {selectedDate && (
          <div data-room-times>
            <h2 className="text-3xl font-extrabold mb-8 text-center">
              {selectedRoom 
                ? selectedRoom.includes('Point') 
                  ? `${selectedRoom} Party Station`
                  : `${selectedRoom} Party Room`
                : 'Available Party Options'} for{' '}
              {availableDates[selectedDate]?.[0]?.date.toLocaleDateString(
                'en-US',
                {year: '2-digit', month: '2-digit', day: '2-digit'},
              )}
            </h2>
            
            {selectedRoom && (
              <p className="text-lg font-bold text-center mb-6 bg-[var(--color-brand-yellow)] text-[var(--color-brand-dark)] p-3 rounded-lg mx-auto max-w-2xl border-2 border-[var(--color-brand-dark)] shadow-lg">
                Showing your selected {selectedRoom.includes('Point') ? 'party station' : 'party room'}: <strong>{selectedRoom}</strong>
                <br />
                <small>Other available options are shown below</small>
              </p>
            )}
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
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
                // Sort by selected room first, then alphabetically
                .sort(([a], [b]) => {
                  if (selectedRoom) {
                    const aIsSelected = a.toLowerCase().includes(selectedRoom.toLowerCase());
                    const bIsSelected = b.toLowerCase().includes(selectedRoom.toLowerCase());
                    if (aIsSelected && !bIsSelected) return -1;
                    if (!aIsSelected && bIsSelected) return 1;
                  }
                  return a.localeCompare(b);
                })
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

                  const isSelectedRoom = selectedRoom && room.toLowerCase().includes(selectedRoom.toLowerCase());

                  return (
                    <div
                      key={room}
                      className={`flex flex-col bg-[var(--color-light)] rounded-xl shadow-lg overflow-hidden border-4 border-[var(--color-brand-dark)] ${
                        isSelectedRoom 
                          ? 'shadow-[0_0_20px_4px_rgba(255,193,7,0.6)] ring-4 ring-[var(--color-brand-yellow)]/30 scale-105' 
                          : ''
                      }`}
                    >
                      <img
                        src={imageUrl}
                        alt={room}
                        className="w-full h-32 sm:h-40 md:h-48 object-cover"
                      />
                      {isSelectedRoom && (
                        <div className="absolute top-2 right-2 bg-[var(--color-brand-yellow)] text-[var(--color-brand-dark)] font-black text-xs px-2 py-1 rounded-full border-2 border-[var(--color-brand-dark)] shadow-lg z-10">
                          YOUR CHOICE
                        </div>
                      )}
                      <div className="flex flex-col p-4 items-center gap-3 relative">
                        <h3 className="text-xl font-bold text-center text-[var(--color-brand-dark)]">
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
                                className="relative bg-gray-300 text-gray-600 font-bold px-3 py-2 rounded-full border-2 border-black text-sm cursor-not-allowed"
                                title="This time slot is already booked"
                              >
                                <span className="line-through">{slot.timeSlot}</span>
                                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs px-2 py-0.5 rounded-full font-black uppercase">
                                  Booked
                                </span>
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
