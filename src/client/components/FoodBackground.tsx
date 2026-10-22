// Served from /public; the doodles are dark lines on a transparent background.
const PATTERN_URL = '/background.png';

/**
 * Saffron-to-orange gradient (chili red in the dark theme) with the food
 * doodles blended on top. In the dark theme the doodles are inverted so they
 * show as light lines.
 */
export const FoodBackground = () => (
  <div
    aria-hidden
    className="pointer-events-none fixed inset-0 -z-10 bg-linear-160 from-[#ffd36e] via-[#ffb04a] to-[#ff7a3d] dark:from-[#3a0f0b] dark:via-[#541a10] dark:to-[#2a0906]"
  >
    <div
      className="absolute bg-cover mix-blend-multiply dark:opacity-35 dark:mix-blend-screen dark:invert"
      style={{
        backgroundImage: `url(${PATTERN_URL})`,
        backgroundSize: '480px auto',
      }}
    />
  </div>
);
