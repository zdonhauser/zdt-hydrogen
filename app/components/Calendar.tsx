import {useState, useMemo} from 'react';

export type CalendarData = {
  [year: string]: {
    [month: string]: {
      [day: string]: string | null;
    };
  };
};

export default function Calendar({
  hoursData,
  waterData,
  notesData,
  expanded = false,
}: {
  hoursData: CalendarData;
  waterData: CalendarData;
  notesData: CalendarData;
  expanded?: boolean;
}) {
  const today = useMemo(() => new Date(), []);
  const months = useMemo(() => {
    const list = [];
    // Add previous 6 months
    for (let i = -6; i < 12; i++) {
      const date = new Date(today.getFullYear(), today.getMonth() + i, 1);
      const yy = date.getFullYear().toString().slice(-2);
      const m = date.getMonth().toString();
      const monthObj = hoursData[yy]?.[m] || {};
      // require at least one non-empty hours entry in this month (ignore non-day keys)
      const hasHours = Object.entries(monthObj)
        .filter(([key]) => /^\d+$/.test(key))
        .some(([, v]) => typeof v === 'string' && v.trim() !== '');
      // Only add months with data or future months
      if (hasHours || i >= 0) {
        list.push(date);
      }
    }
    return list;
  }, [today, hoursData]);
  
  // Set initial index to the current month (6 months back from today)
  const [currentIndex, setCurrentIndex] = useState(6);
  // toggle between summary and full calendar
  const [showFull, setShowFull] = useState(expanded);


  const [activeNoteCell, setActiveNoteCell] = useState<string | null>(null);

  // build summary of today + next 6 open days
  const summaryDays = useMemo(() => {
    const days: Date[] = [];
    for (let i = 0; i < 30; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() + i);
      days.push(d);
    }
    return days;
  }, [today]);

  const currentDate = months[currentIndex];
  // use last two digits of year to match keys like "25"
  const year = currentDate.getFullYear().toString().slice(-2);
  const month = currentDate.getMonth().toString(); // 1-12
  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0,
  ).getDate();
  const firstWeekday = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1,
  ).getDay(); // 0-6

  const weeks = useMemo(() => {
    const cells: Array<{day: number | null}> = [];
    // blank days
    for (let i = 0; i < firstWeekday; i++) cells.push({day: null});
    // days of month
    for (let d = 1; d <= daysInMonth; d++) cells.push({day: d});
    // fill last week
    while (cells.length % 7 !== 0) cells.push({day: null});
    const rows = [];
    for (let r = 0; r < cells.length / 7; r++) {
      rows.push(cells.slice(r * 7, r * 7 + 7));
    }
    return rows;
  }, [daysInMonth, firstWeekday]);

  return (
    <> {/*upcoming hours, summary only*/}
      {!showFull && (
        <div className="w-full bg-[var(--color-brand-blue)] py-8 relative overflow-hidden border-t-5 border-b-5 border-[var(--color-brand-dark)]">
          <div className="absolute inset-0 z-0 text-6xl md:text-8xl font-black text-[var(--color-brand-dark)] opacity-10 pointer-events-none flex flex-wrap">
            HOURS&nbsp;HOURS&nbsp;HOURS&nbsp;HOURS&nbsp;HOURS&nbsp;
            URS&nbsp;HOURS&nbsp;HOURS&nbsp;HOURS&nbsp;HOURS&nbsp;HO
            S&nbsp;HOURS&nbsp;HOURS&nbsp;HOURS&nbsp;HOURS&nbsp;HOUR
            HOURS&nbsp;HOURS&nbsp;HOURS&nbsp;HOURS&nbsp;HOURS&nbsp;
            URS&nbsp;HOURS&nbsp;HOURS&nbsp;HOURS&nbsp;HOURS&nbsp;HO
            S&nbsp;HOURS&nbsp;HOURS&nbsp;HOURS&nbsp;HOURS&nbsp;HOUR
          </div>
          <div className="relative px-4 z-10">
            <h3 className="text-xl font-bold mb-2 text-[var(--color-dark)]">
              Upcoming Hours
            </h3>
            <div className="relative flex gap-4 overflow-x-auto scrollbar-hide pb-2">
              {summaryDays.map((d) => {
                const yy = d.getFullYear().toString().slice(-2);
                const m = d.getMonth().toString();
                const dd = d.getDate().toString();
                const parkHours : string = hoursData[yy]?.[m]?.[dd] || 'Closed';
                const waterHours = waterData[yy]?.[m]?.[dd];
                const note = notesData[yy]?.[m]?.[dd] || '';
                return (
                  <div
                    key={d.toISOString()}
                    className={`flex-none w-24 p-2  rounded-lg shadow border-4 border-[var(--color-brand-dark)] text-center ${parkHours === 'Closed' ? 'bg-[var(--color-light)]' : 'bg-[var(--color-light)]'}`}
                  >
                    <div className="font-bold">
                      {d.toLocaleDateString('default', {weekday: 'short'})}
                    </div>
                    <div className="text-2xl font-light">
                      {d.getMonth() + 1}/{d.getDate()}
                    </div>
                    <div className={`text-md ${parkHours === 'Closed' ? 'font-light' : 'font-bold'}`}>{parkHours}</div>
                    {waterHours && (
                      <div className="text-xs text-blue-600">
                        Water:{waterHours}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <button
              onClick={() => setShowFull(true)}
              className="mt-4 px-4 py-2 bg-[var(--color-brand-blue)] text-[var(--color-dark)] font-bold rounded-full hover:bg-[var(--color-brand-blue-hover)] transition border-4 border-[var(--color-brand-dark)]"
            >
              View Full Calendar
            </button>
          </div>
        </div>
      )}
      {showFull && (
        <div className="w-full bg-[var(--color-brand-blue)] py-8 px-2 relative border-t-4 border-b-4 border-[var(--color-brand-dark)] overflow-hidden">
          {/* Feastables texture overlay */}
          <div className="absolute inset-0 z-0 text-6xl md:text-8xl font-black text-[var(--color-brand-dark)] opacity-10 pointer-events-none flex flex-wrap">
            HOURS&nbsp;HOURS&nbsp;HOURS&nbsp;HOURS&nbsp;HOURS&nbsp;
            URS&nbsp;HOURS&nbsp;HOURS&nbsp;HOURS&nbsp;HOURS&nbsp;HO
            S&nbsp;HOURS&nbsp;HOURS&nbsp;HOURS&nbsp;HOURS&nbsp;HOUR
            HOURS&nbsp;HOURS&nbsp;HOURS&nbsp;HOURS&nbsp;HOURS&nbsp;
            URS&nbsp;HOURS&nbsp;HOURS&nbsp;HOURS&nbsp;HOURS&nbsp;HO
            S&nbsp;HOURS&nbsp;HOURS&nbsp;HOURS&nbsp;HOURS&nbsp;HOUR
            HOURS&nbsp;HOURS&nbsp;HOURS&nbsp;HOURS&nbsp;HOURS&nbsp;
            URS&nbsp;HOURS&nbsp;HOURS&nbsp;HOURS&nbsp;HOURS&nbsp;HO
            S&nbsp;HOURS&nbsp;HOURS&nbsp;HOURS&nbsp;HOURS&nbsp;HOUR
            HOURS&nbsp;HOURS&nbsp;HOURS&nbsp;HOURS&nbsp;HOURS&nbsp;
            URS&nbsp;HOURS&nbsp;HOURS&nbsp;HOURS&nbsp;HOURS&nbsp;HO
            S&nbsp;HOURS&nbsp;HOURS&nbsp;HOURS&nbsp;HOURS&nbsp;HOUR
            HOURS&nbsp;HOURS&nbsp;HOURS&nbsp;HOURS&nbsp;HOURS&nbsp;
            URS&nbsp;HOURS&nbsp;HOURS&nbsp;HOURS&nbsp;HOURS&nbsp;HO
            S&nbsp;HOURS&nbsp;HOURS&nbsp;HOURS&nbsp;HOURS&nbsp;HOUR
            HOURS&nbsp;HOURS&nbsp;HOURS&nbsp;HOURS&nbsp;HOURS&nbsp;
            URS&nbsp;HOURS&nbsp;HOURS&nbsp;HOURS&nbsp;HOURS&nbsp;HO
            S&nbsp;HOURS&nbsp;HOURS&nbsp;HOURS&nbsp;HOURS&nbsp;HOUR
          </div>
          <div className="max-w-4xl mx-auto bg-[var(--color-light)] p-4 rounded-xl shadow-lg border-6 border-[var(--color-brand-dark)] relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4 px-4 md:px-8">
                <button
                  onClick={() => setCurrentIndex((i) => Math.max(i - 1, 0))}
                  disabled={currentIndex === 0}
                  className="px-4 py-2 bg-[var(--color-brand-blue)] text-[var(--color-dark)] font-bold rounded-full hover:bg-[var(--color-brand-blue-hover)] border-3 border-[var(--color-brand-dark)] disabled:opacity-50 transition"
                >
                  Prev
                </button>
                <h2 className="text-lg md:text-2xl lg:text-2xl font-extrabold tracking-wide text-[var(--color-dark)]">
                  {currentDate.toLocaleString('default', {month: 'long'})}{' '}
                  {year}
                </h2>
                <button
                  onClick={() =>
                    setCurrentIndex((i) => Math.min(i + 1, months.length - 1))
                  }
                  disabled={currentIndex === months.length - 1}
                  className="px-4 py-2 bg-[var(--color-brand-blue)] text-[var(--color-dark)] font-bold rounded-full hover:bg-[var(--color-brand-blue-hover)] border-3 border-[var(--color-brand-dark)] disabled:opacity-50 transition"
                >
                  Next
                </button>
              </div>
              <div className="overflow-hidden shadow-sm ">
                <table className="w-full table-auto border-collapse text-center bg-[var(--color-light)]">
                  <thead>
                    <tr className="bg-[var(--color-brand-blue)] border-3 border-[var(--color-brand-dark)] text-[var(--color-dark)] font-bold">
                      {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((wd) => (
                        <th
                          key={wd}
                          className="p-2 bg-[var(--color-brand-blue)] text-[var(--color-dark)] font-bold"
                        >
                          {wd}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {weeks.map((row, ri) => (
                      <tr key={ri}>
                        {row.map((cell, ci) => {
                          const d = cell.day;
                          const parkHours = d && hoursData[year]?.[month]?.[d];
                          const waterHours = d && waterData[year]?.[month]?.[d];
                          const note = d && notesData[year]?.[month]?.[d];
                          const cellId = `${year}-${month}-${d}`;
                          const isFirst = ci === 0;
                          const isLast = ci === 6;
                          return (
                            <td
                              key={ci}
                              className="group relative h-20 p-1 border-3 border-[var(--color-dark)] align-top hover:bg-[var(--color-brand-blue-hover)] transition cursor-pointer w-[calc(100%/7)]"
                              onClick={() =>
                                setActiveNoteCell(
                                  activeNoteCell === cellId ? null : cellId,
                                )
                              }
                            >
                              {d ? (
                                <>
                                  <div className="font-bold">{d}{note && '*'}</div>
                                  <div className="text-sm">
                                    {parkHours || ''}
                                  </div>
                                  <div className="text-xs text-blue-600">
                                    {waterHours
                                      ? `Water: ${waterHours}`
                                      : ""}
                                    {note && (
                                      <button
                                        className="relative inline-block cursor-pointer"
                                        onClick={() =>
                                          setActiveNoteCell(
                                            activeNoteCell === cellId
                                              ? null
                                              : cellId,
                                          )
                                        }
                                      >
                                        
                                        <div
                                          className={`
                                            absolute z-10 top-full mt-1 transform
                                            ${isFirst ? 'left-2' : isLast ? 'right-2' : 'left-1/2 -translate-x-1/2'}
                                            ${activeNoteCell === cellId ? 'block' : 'hidden'} group-hover:block
                                          `}
                                        >
                                          {/* notch triangle */}
                                          <div
                                            className={`
                                              absolute top-0 -translate-y-1 w-0 h-0
                                              border-l-4 border-r-4 border-b-5 border-transparent border-b-[var(--color-dark)]
                                              ${isFirst ? 'left-2' : isLast ? 'right-2' : 'left-1/2 -translate-x-1/2'}
                                            `}
                                          />
                                          {/* bubble body */}
                                          <div
                                            className="border-2 border-[var(--color-dark)] rounded px-3 py-2
                                                     bg-[var(--color-light)] text-[var(--color-dark)]
                                                     shadow-lg w-32 text-sm mt-1"
                                          >
                                            {note}
                                          </div>
                                        </div>
                                      </button>
                                    )}
                                  </div>
                                </>
                              ) : null}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-2 text-xs italic text-[var(--color-dark)]">
                * Hover or tap an asterisk to see notes.
              </p>
              <button
                onClick={() => setShowFull(false)}
                className="mt-4 px-4 py-2 bg-[var(--color-brand-blue)] text-[var(--color-dark)] font-bold rounded-full hover:bg-[var(--color-brand-blue-hover)] border-3 border-[var(--color-brand-dark)] transition"
              >
                Close Calendar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
