import { MAX_RATING } from '../../shared/food';

type StarsProps = {
  rating: number;
  onChange?: (rating: number) => void;
  size?: 'sm' | 'lg';
};

export const Stars = ({ rating, onChange, size = 'sm' }: StarsProps) => {
  const textSize = size === 'lg' ? 'text-3xl' : 'text-sm';
  return (
    <span
      className={`inline-flex gap-0.5 ${textSize}`}
      aria-label={`${rating} out of ${MAX_RATING}`}
    >
      {Array.from({ length: MAX_RATING }, (_, i) => {
        const value = i + 1;
        const filled = value <= rating;
        const star = (
          <span className={filled ? 'text-accent' : 'text-muted/35'}>★</span>
        );
        return onChange ? (
          <button
            key={value}
            type="button"
            className="cursor-pointer leading-none"
            onClick={() => onChange(value)}
            aria-label={`Rate ${value}`}
          >
            {star}
          </button>
        ) : (
          <span key={value}>{star}</span>
        );
      })}
    </span>
  );
};
