import { useState, type CSSProperties, type ReactNode } from 'react';

type Veggie = { name: string; juice: string; art: ReactNode };

// Simple flat veggies on a 64×64 canvas, drawn upright and centred.
const VEGGIES: Veggie[] = [
  {
    name: 'onion',
    juice: '#d9487a',
    art: (
      <>
        <path d="M29 19 25 5l5-2 4 15z" fill="#5ccf8a" />
        <ellipse cx="32" cy="36" rx="22" ry="20" fill="#d9487a" />
        <path
          d="M32 16c-8 6-12 13-12 20s4 14 12 20M32 16c8 6 12 13 12 20s-4 14-12 20M32 16v40M24 18c-6 5-9 11-9 18s3 13 9 18M40 18c6 5 9 11 9 18s-3 13-9 18"
          fill="none"
          stroke="#f39ab8"
          strokeWidth="1.6"
        />
        <ellipse cx="32" cy="54" rx="5" ry="2.5" fill="#6b1836" />
      </>
    ),
  },
  {
    name: 'broccoli',
    juice: '#1f9e6a',
    art: (
      <>
        <path d="M27 36h10l-2 22h-6z" fill="#5ccf8a" />
        <circle cx="22" cy="28" r="11" fill="#1f9e6a" />
        <circle cx="42" cy="28" r="11" fill="#1f9e6a" />
        <circle cx="32" cy="18" r="12" fill="#23b07a" />
        <circle cx="32" cy="32" r="10" fill="#1a8c5d" />
      </>
    ),
  },
  {
    name: 'mushroom',
    juice: '#c98a5a',
    art: (
      <>
        <path
          d="M25 34h14l2 20a4 4 0 0 1-4 4H27a4 4 0 0 1-4-4z"
          fill="#f7e7d0"
        />
        <path d="M8 36C8 20 19 10 32 10s24 10 24 26z" fill="#c98a5a" />
        <circle cx="22" cy="24" r="3" fill="#e9b98d" />
        <circle cx="40" cy="20" r="2.4" fill="#e9b98d" />
        <circle cx="44" cy="30" r="2" fill="#e9b98d" />
      </>
    ),
  },
  {
    name: 'eggplant',
    juice: '#7b3f86',
    art: (
      <>
        <path
          d="M40 14c8 4 12 14 10 26-2 13-12 20-22 18S12 46 16 36c3-8 10-10 14-16 2-4 5-7 10-6z"
          fill="#7b3f86"
        />
        <path d="M34 8c4 0 10 3 12 8-4 2-10 2-14-2z" fill="#5ccf8a" />
        <path
          d="M40 8l2-5"
          stroke="#5ccf8a"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M22 40c2-4 6-6 8-10"
          fill="none"
          stroke="#a46cb0"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </>
    ),
  },
  {
    name: 'tomato',
    juice: '#f25c54',
    art: (
      <>
        <ellipse cx="32" cy="36" rx="22" ry="20" fill="#f25c54" />
        <ellipse cx="24" cy="30" rx="5" ry="3" fill="#ff8a80" />
        <path
          d="M32 18l3-5 2 6 6-1-4 5 5 3-7 1-1 6-4-5-4 5-1-6-7-1 5-3-4-5 6 1 2-6z"
          fill="#3fae6a"
        />
      </>
    ),
  },
  {
    name: 'carrot',
    juice: '#ff8a2a',
    art: (
      <>
        <path
          d="M28 12c-4-6-2-10 2-10 0 4 2 6 2 10M36 12c4-6 2-10-2-10"
          fill="#5ccf8a"
        />
        <path
          d="M32 6l2 8"
          stroke="#3fae6a"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path d="M20 16c8-4 16-4 24 0L34 60a2 2 0 0 1-4 0z" fill="#ff8a2a" />
        <path
          d="M24 26h6M34 34h6M26 42h5M33 50h3"
          stroke="#e06d12"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </>
    ),
  },
];

// Where each juice droplet flies when the veggie lands.
const DROPLETS = [
  { x: '-38px', y: '-26px', size: 9 },
  { x: '-22px', y: '-8px', size: 6 },
  { x: '30px', y: '-30px', size: 7 },
  { x: '40px', y: '-6px', size: 5 },
];

/**
 * Bouncing veggie loader: each bounce squashes on landing, splashes juice
 * and swaps to the next veggie while it's in the air.
 */
export const FoodLoader = ({ label = 'Loading…' }: { label?: string }) => {
  const [index, setIndex] = useState(0);
  const veggie = VEGGIES[index % VEGGIES.length];
  if (!veggie) return null;

  return (
    <div
      role="status"
      className="flex h-full flex-col items-center justify-center gap-4"
    >
      <div className="relative h-36 w-32">
        <div
          className="loader-veggie absolute top-0 left-1/2 h-16 w-16 -ml-8"
          onAnimationIteration={() => setIndex((i) => i + 1)}
        >
          <svg
            viewBox="0 0 64 64"
            aria-hidden
            className="loader-spin h-full w-full"
          >
            {veggie.art}
          </svg>
        </div>
        {DROPLETS.map((d, i) => {
          const style: CSSProperties & Record<'--dx' | '--dy', string> = {
            width: d.size,
            height: d.size,
            marginLeft: -d.size / 2,
            backgroundColor: veggie.juice,
            '--dx': d.x,
            '--dy': d.y,
          };
          // Keyed by bounce so each splash restarts in sync with the landing.
          return (
            <span
              key={`${index}-${i}`}
              className="loader-droplet absolute bottom-3 left-1/2 rounded-full"
              style={style}
            />
          );
        })}
        <span className="loader-shadow absolute bottom-1 left-1/2 h-2.5 w-14 -ml-7 rounded-full bg-ink/15" />
      </div>
      <span className="text-sm font-semibold text-muted">{label}</span>
    </div>
  );
};
