import type { CSSProperties } from 'react';
import { useTheme, type Palette } from '../lib/theme';

const ART_URL = '/art/h2.png';

// The art is used as a mask and painted solid in the palette's art colour,
// so it always matches the chosen theme.
const artStyle = (palette: Palette): CSSProperties => {
  const mask = `url(${ART_URL})`;
  return {
    backgroundColor: palette.artColor,
    maskImage: mask,
    WebkitMaskImage: mask,
    maskSize: 'cover',
    WebkitMaskSize: 'cover',
    maskRepeat: 'no-repeat',
    WebkitMaskRepeat: 'no-repeat',
    maskPosition: 'center',
    WebkitMaskPosition: 'center',
  };
};

/** A palette's background with the food art on top. */
export const ThemeSurface = ({
  palette,
  className = '',
}: {
  palette: Palette;
  className?: string;
}) => (
  <div
    aria-hidden
    className={`pointer-events-none overflow-hidden ${className}`}
    style={{ background: palette.background }}
  >
    <div className="absolute inset-0" style={artStyle(palette)} />
  </div>
);

/** Full-page background for the selected theme. */
export const FoodBackground = () => (
  <ThemeSurface palette={useTheme()} className="fixed inset-0 -z-10" />
);
