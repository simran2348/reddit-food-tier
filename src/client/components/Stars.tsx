import { MAX_RATING, ratingToStars } from '../../shared/food';

/** A rating out of 10 shown as five stars (half stars allowed). */
export const Stars = ({ rating }: { rating: number }) => {
  const stars = ratingToStars(rating);
  return (
    <span
      className="inline-flex gap-0.5 text-sm leading-none"
      aria-label={`${rating} out of ${MAX_RATING}`}
    >
      {Array.from({ length: 5 }, (_, i) => {
        // How much of this star is filled: 0, 0.5 or 1.
        const fill = Math.min(1, Math.max(0, stars - i));
        return (
          <span key={i} className="relative text-muted/35">
            ★
            {fill > 0 && (
              <span
                className="absolute inset-0 overflow-hidden text-accent"
                style={{ width: `${fill * 100}%` }}
              >
                ★
              </span>
            )}
          </span>
        );
      })}
    </span>
  );
};

/** Pick a whole-number rating from 1 to 10. */
export const RatingPicker = ({
  value,
  onChange,
}: {
  value: number;
  onChange: (rating: number) => void;
}) => (
  <div className="grid grid-cols-10 gap-1">
    {Array.from({ length: MAX_RATING }, (_, i) => {
      const n = i + 1;
      const active = n === value;
      return (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          aria-pressed={active}
          aria-label={`Rate ${n} out of ${MAX_RATING}`}
          className={`aspect-square rounded-lg text-sm font-bold cursor-pointer transition-colors ${
            active
              ? 'bg-cta text-cta-ink shadow-sm'
              : n < value
                ? 'bg-cta/20 text-ink'
                : 'border border-line bg-field text-muted hover:text-ink'
          }`}
        >
          {n}
        </button>
      );
    })}
  </div>
);
