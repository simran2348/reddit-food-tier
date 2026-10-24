import { useMemo, useState } from 'react';
import type { FoodReview } from '../../shared/api';
import { FoodList } from './reviews';

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const DAY_MS = 24 * 60 * 60 * 1000;

/** Local-date key, e.g. "2026-6-21" (month is 0-based). */
const dayKey = (date: Date) =>
  `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

const startOfDay = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

/** Current streak (ending today or yesterday) and best-ever streak, in days. */
const streaks = (days: Set<string>) => {
  const today = startOfDay(new Date());
  let current = 0;
  let cursor = days.has(dayKey(today))
    ? today
    : new Date(today.getTime() - DAY_MS);
  while (days.has(dayKey(cursor))) {
    current++;
    cursor = new Date(
      cursor.getFullYear(),
      cursor.getMonth(),
      cursor.getDate() - 1
    );
  }

  const sorted = [...days]
    .map((key) => {
      const [y = 0, m = 0, d = 0] = key.split('-').map(Number);
      return new Date(y, m, d).getTime();
    })
    .sort((a, b) => a - b);
  let best = 0;
  let run = 0;
  sorted.forEach((time, i) => {
    const prev = sorted[i - 1];
    // Allow for DST shifts by rounding the gap to whole days.
    run =
      prev !== undefined && Math.round((time - prev) / DAY_MS) === 1
        ? run + 1
        : 1;
    best = Math.max(best, run);
  });
  return { current, best };
};

export const Calendar = ({ reviews }: { reviews: FoodReview[] }) => {
  const today = startOfDay(new Date());
  const [month, setMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const [selected, setSelected] = useState(dayKey(today));

  const byDay = useMemo(() => {
    const map = new Map<string, FoodReview[]>();
    for (const review of reviews) {
      const key = dayKey(new Date(review.postedAt));
      map.set(key, [...(map.get(key) ?? []), review]);
    }
    return map;
  }, [reviews]);

  const { current, best } = useMemo(
    () => streaks(new Set(byDay.keys())),
    [byDay]
  );

  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const leading = month.getDay();

  const monthReviews = reviews.filter((r) => {
    const d = new Date(r.postedAt);
    return d.getFullYear() === year && d.getMonth() === monthIndex;
  });

  const topSpots = useMemo(() => {
    const spots = new Map<
      string,
      { place: string; count: number; image: string | undefined }
    >();
    for (const r of monthReviews) {
      const key = r.place.trim().toLowerCase();
      const spot = spots.get(key) ?? {
        place: r.place,
        count: 0,
        image: undefined,
      };
      spot.count++;
      spot.image ??= r.images[0];
      spots.set(key, spot);
    }
    return [...spots.values()].sort((a, b) => b.count - a.count).slice(0, 6);
  }, [monthReviews]);

  const shiftMonth = (delta: number) =>
    setMonth(new Date(year, monthIndex + delta, 1));

  const selectedReviews = byDay.get(selected) ?? [];
  const [sy = 0, sm = 0, sd = 0] = selected.split('-').map(Number);
  const selectedLabel =
    selected === dayKey(today)
      ? 'Today'
      : new Date(sy, sm, sd).toLocaleDateString(undefined, {
          weekday: 'long',
          day: 'numeric',
          month: 'short',
        });

  const navButton =
    'flex h-10 w-10 items-center justify-center rounded-full border border-line bg-soft text-lg font-bold text-soft-ink cursor-pointer hover:brightness-95 transition';

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <button
          onClick={() => shiftMonth(-1)}
          aria-label="Previous month"
          className={navButton}
        >
          ‹
        </button>
        <h2 className="text-xl font-bold text-ink">
          {month.toLocaleDateString(undefined, {
            month: 'long',
            year: 'numeric',
          })}
        </h2>
        <button
          onClick={() => shiftMonth(1)}
          aria-label="Next month"
          className={navButton}
        >
          ›
        </button>
      </div>

      <section className="rounded-2xl border border-line bg-soft p-4">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-cta text-2xl shadow-md">
            🔥
          </span>
          <div>
            <p className="text-xl font-extrabold text-ink">
              {current} day streak
            </p>
            <p className="text-xs text-muted">
              Best {best} · {monthReviews.length}{' '}
              {monthReviews.length === 1 ? 'meal' : 'meals'} this month
            </p>
          </div>
        </div>

        {topSpots.length > 0 && (
          <>
            <p className="mt-4 mb-2 border-t border-line pt-3 text-[11px] font-extrabold tracking-widest text-cta uppercase">
              Top spots this month
            </p>
            <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1">
              {topSpots.map((spot) => (
                <div key={spot.place} className="w-28 shrink-0">
                  {spot.image ? (
                    <img
                      src={spot.image}
                      alt=""
                      className="h-28 w-28 rounded-xl object-cover shadow-sm"
                    />
                  ) : (
                    <div className="flex h-28 w-28 items-center justify-center rounded-xl bg-cta/15 text-3xl">
                      🍽️
                    </div>
                  )}
                  <p className="mt-1.5 truncate text-sm font-bold text-ink">
                    {spot.place}
                  </p>
                  <p className="text-xs text-muted">
                    {spot.count} {spot.count === 1 ? 'meal' : 'meals'}
                  </p>
                </div>
              ))}
            </div>
          </>
        )}
      </section>

      <section className="rounded-2xl border border-line bg-surface p-3 backdrop-blur">
        <div className="mb-1 grid grid-cols-7 text-center text-xs font-semibold text-muted">
          {WEEKDAYS.map((d, i) => (
            <span key={i} className="py-1">
              {d}
            </span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {Array.from({ length: leading }, (_, i) => (
            <span key={`pad-${i}`} />
          ))}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const date = new Date(year, monthIndex, i + 1);
            const key = dayKey(date);
            const dayReviews = byDay.get(key) ?? [];
            const image = dayReviews.find((r) => r.images[0])?.images[0];
            const isToday = key === dayKey(today);
            const isSelected = key === selected;
            return (
              <button
                key={key}
                onClick={() => setSelected(key)}
                aria-pressed={isSelected}
                aria-label={`${date.toDateString()}: ${dayReviews.length} meals`}
                className={`relative flex aspect-square items-center justify-center overflow-hidden rounded-xl text-sm font-bold cursor-pointer transition ${
                  isSelected
                    ? 'ring-2 ring-cta ring-offset-1 ring-offset-surface'
                    : isToday
                      ? 'ring-2 ring-cta/50'
                      : ''
                } ${
                  image
                    ? 'text-white'
                    : dayReviews.length
                      ? 'bg-cta/20 text-ink'
                      : 'text-muted hover:bg-soft'
                }`}
              >
                {image && (
                  <>
                    <img
                      src={image}
                      alt=""
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                    <span className="absolute inset-0 bg-black/35" />
                  </>
                )}
                <span className="relative drop-shadow">{i + 1}</span>
              </button>
            );
          })}
        </div>
      </section>

      <div className="flex items-baseline justify-between px-1">
        <h3 className="text-lg font-extrabold text-ink">{selectedLabel}</h3>
        <span className="text-xs font-semibold text-muted">
          {selectedReviews.length}{' '}
          {selectedReviews.length === 1 ? 'meal' : 'meals'}
        </span>
      </div>
      <FoodList
        reviews={selectedReviews}
        emptyMessage="No meals logged this day."
      />
    </div>
  );
};
