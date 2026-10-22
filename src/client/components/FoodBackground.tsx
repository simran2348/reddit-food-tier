import type { CSSProperties } from 'react';
import { useTheme, type Art, type Palette } from '../lib/theme';

// The art is used as a mask and painted in the palette's text colour, so
// black or white source files both match whatever palette is chosen.
const artStyle = (palette: Palette, art: Art): CSSProperties => {
  const mask = `url(${art.url})`;
  return {
    backgroundColor: palette.colors.ink,
    opacity: (palette.dark ? 0.3 : 0.38) * art.weight,
    maskImage: mask,
    WebkitMaskImage: mask,
    // The frames are square with an empty middle; keep them whole and
    // centred behind the content.
    maskSize: 'contain',
    WebkitMaskSize: 'contain',
    maskRepeat: 'no-repeat',
    WebkitMaskRepeat: 'no-repeat',
    maskPosition: 'center',
    WebkitMaskPosition: 'center',
  };
};

/** A palette's background with a design's art layered on top. */
export const ThemeSurface = ({
  palette,
  art,
  className = '',
}: {
  palette: Palette;
  art?: Art;
  className?: string;
}) => (
  <div
    aria-hidden
    className={`pointer-events-none overflow-hidden ${className}`}
    style={{ background: palette.background }}
  >
    {art && <div className="absolute inset-0" style={artStyle(palette, art)} />}
  </div>
);

/** Full-page background for the selected theme. */
export const FoodBackground = () => {
  const { palette, art } = useTheme();
  return (
    <ThemeSurface palette={palette} art={art} className="fixed inset-0 -z-10" />
  );
};
