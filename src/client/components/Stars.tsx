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
