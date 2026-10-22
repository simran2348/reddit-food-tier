import { useSyncExternalStore } from 'react';
import type { ThemePreference } from '../../shared/api';
import type { ArtId, PaletteId } from '../../shared/theme';

/** UI colours a palette provides; exposed to Tailwind as `ink`, `cta`, … */
type PaletteColors = {
  /** Headings and body text. */
  ink: string;
  /** Secondary text. */
  muted: string;
  /** Primary buttons and highlights, with the text drawn on them. */
  cta: string;
  ctaInk: string;
  /** Secondary buttons and chips, with their text. */
  soft: string;
  softInk: string;
  /** Cards and header bars. */
  surface: string;
  /** Borders and dividers. */
  line: string;
  /** Text inputs. */
  field: string;
  /** Stars and small highlights. */
  accent: string;
};

export type Palette = {
  id: PaletteId;
  name: string;
  /** Dark palettes use light text (and light art). */
  dark: boolean;
  background: string;
  colors: PaletteColors;
};

export type Art = {
  id: ArtId;
  name: string;
  /** Single-colour frame art; only its shape is used (see FoodBackground). */
  url: string;
  /** Opacity scale, so bold silhouettes don't overpower fine line art. */
  weight: number;
};

export type Theme = { palette: Palette; art: Art };

const radial = (...stops: string[]) =>
  `radial-gradient(circle at 50% 35%, ${stops.join(', ')})`;
const linear = (...stops: string[]) =>
  `linear-gradient(160deg, ${stops.join(', ')})`;

const lightColors = (
  colors: Omit<PaletteColors, 'ctaInk' | 'surface' | 'field' | 'accent'> &
    Partial<PaletteColors>
): PaletteColors => ({
  ctaInk: '#ffffff',
  surface: 'rgb(255 255 255 / 0.86)',
  field: '#ffffff',
  accent: '#f4b400',
  ...colors,
});

const darkColors = (
  colors: Pick<PaletteColors, 'ink' | 'muted' | 'cta' | 'softInk'>
): PaletteColors => ({
  ctaInk: '#ffffff',
  soft: 'rgb(255 255 255 / 0.1)',
  surface: 'rgb(0 0 0 / 0.42)',
  line: 'rgb(255 255 255 / 0.14)',
  field: 'rgb(0 0 0 / 0.35)',
  accent: '#f4c430',
  ...colors,
});

const LAGOON: Palette = {
  id: 'lagoon',
  name: 'Lagoon',
  dark: false,
  background: radial('#8ad1d7', '#3ebdcc', '#04afc4'),
  colors: lightColors({
    ink: '#083a40',
    muted: '#2c636b',
    cta: '#e8541f',
    soft: '#e3f6f8',
    softInk: '#0b4a52',
    line: 'rgb(255 255 255 / 0.6)',
  }),
};

const CHILI: Palette = {
  id: 'chili',
  name: 'Chili Night',
  dark: true,
  background: linear('#3a0f0b', '#541a10', '#2a0906'),
  colors: darkColors({
    ink: '#fff4ef',
    muted: '#f0c4b4',
    cta: '#e8541f',
    softInk: '#ffd9c9',
  }),
};

export const PALETTES: Palette[] = [
  // Cream and Sage follow the "Cream & Editorial" / "Fresh Minimal" specs.
  {
    id: 'cream',
    name: 'Cream',
    dark: false,
    background: linear('#fffcf5', '#fff9ed', '#fdf1dc'),
    colors: lightColors({
      ink: '#1b5e3a',
      muted: '#6b7f73',
      cta: '#ff6b2d',
      soft: '#ffe8d6',
      softInk: '#1b5e3a',
      surface: 'rgb(255 255 255 / 0.9)',
      line: '#dce7d8',
      field: '#f5f8f1',
      accent: '#f4c430',
    }),
  },
  {
    id: 'sage',
    name: 'Sage',
    dark: false,
    background: linear('#f1f7ee', '#eaf3e7', '#dde9d8'),
    colors: lightColors({
      ink: '#1b5e3a',
      muted: '#6b7f73',
      cta: '#ff6b2d',
      soft: '#e8f1ea',
      softInk: '#1b5e3a',
      surface: 'rgb(255 255 255 / 0.92)',
      line: '#d6e4d4',
      accent: '#f4c430',
    }),
  },
  LAGOON,
  {
    id: 'saffron',
    name: 'Saffron',
    dark: false,
    background: linear('#fff8e6', '#ffecc2', '#ffdc9e'),
    colors: lightColors({
      ink: '#4a2a06',
      muted: '#7a5a33',
      cta: '#e2551b',
      soft: '#fff1d6',
      softInk: '#7a3d0c',
      line: '#f3dcae',
    }),
  },
  {
    id: 'matcha',
    name: 'Matcha',
    dark: false,
    background: radial('#eef3d6', '#cfe0a3', '#a3c472'),
    colors: lightColors({
      ink: '#24361a',
      muted: '#55663f',
      cta: '#d9531e',
      soft: '#f1f6e4',
      softInk: '#3b5223',
      line: '#d5e2bb',
    }),
  },
  {
    id: 'peach',
    name: 'Peach',
    dark: false,
    background: linear('#ffe9dc', '#ffcdb2', '#ffab8a'),
    colors: lightColors({
      ink: '#4a2216',
      muted: '#80513f',
      cta: '#d9431e',
      soft: '#fff1ea',
      softInk: '#8a3a1f',
      line: '#f6cdb8',
    }),
  },
  {
    id: 'berry',
    name: 'Berry Smoothie',
    dark: false,
    background: linear('#fbe0ec', '#f4b3cd', '#e38bb0'),
    colors: lightColors({
      ink: '#4a1630',
      muted: '#7f4562',
      cta: '#c8285f',
      soft: '#fde9f1',
      softInk: '#8c1f4b',
      line: '#f1c3d6',
    }),
  },
  {
    id: 'vanilla',
    name: 'Vanilla',
    dark: false,
    background: radial('#fffaf0', '#fdeec8', '#f6d98f'),
    colors: lightColors({
      ink: '#3f2f10',
      muted: '#76643f',
      cta: '#e0601f',
      soft: '#fff4dc',
      softInk: '#7a4a10',
      line: '#efe0b8',
    }),
  },
  CHILI,
  {
    id: 'blueberry',
    name: 'Blueberry',
    dark: true,
    background: linear('#1d1b3a', '#2c2860', '#15132c'),
    colors: darkColors({
      ink: '#f0eeff',
      muted: '#bdb8e6',
      cta: '#f0643a',
      softInk: '#d9d4ff',
    }),
  },
  {
    id: 'espresso',
    name: 'Espresso',
    dark: true,
    background: linear('#2e1f17', '#422c20', '#1f140e'),
    colors: darkColors({
      ink: '#fbf1e8',
      muted: '#d4bca8',
      cta: '#e8763a',
      softInk: '#f3d6bd',
    }),
  },
  {
    id: 'olive',
    name: 'Olive Grove',
    dark: true,
    background: linear('#1f2b1b', '#2f4026', '#161f12'),
    colors: darkColors({
      ink: '#eef5e6',
      muted: '#b9c9a8',
      cta: '#e8763a',
      softInk: '#d6e6c2',
    }),
  },
];

const HERBS: Art = {
  id: 'herbs',
  name: 'Herbs',
  url: '/art/h1.png',
  weight: 1,
};

export const ARTS: Art[] = [
  HERBS,
  { id: 'leaves', name: 'Leaves', url: '/art/h2.png', weight: 0.7 },
  { id: 'wreath', name: 'Wreath', url: '/art/h3.png', weight: 0.75 },
  { id: 'pantry', name: 'Pantry', url: '/art/h4.png', weight: 1 },
  { id: 'spices', name: 'Spices', url: '/art/h5.png', weight: 1 },
];

const STORAGE_KEYS = { palette: 'food-tier:theme', art: 'food-tier:art' };

let current: Theme = { palette: LAGOON, art: HERBS };
const listeners = new Set<() => void>();

const readStorage = (key: string) => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

const writeStorage = (key: string, value: string) => {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Storage can be unavailable in the webview; the theme still applies.
  }
};

const findPalette = (id: string | null) => {
  // Values saved by the old light/dark toggle.
  if (id === 'light') return LAGOON;
  if (id === 'dark') return CHILI;
  return PALETTES.find((p) => p.id === id);
};

const findArt = (id: string | null) => ARTS.find((a) => a.id === id);

const applyTheme = (theme: Theme) => {
  current = theme;
  const root = document.documentElement;
  const c = theme.palette.colors;
  root.classList.toggle('dark', theme.palette.dark);
  root.style.colorScheme = theme.palette.dark ? 'dark' : 'light';
  // Mapped to Tailwind colours in index.css.
  const vars: [string, string][] = [
    ['--ink', c.ink],
    ['--muted', c.muted],
    ['--cta', c.cta],
    ['--cta-ink', c.ctaInk],
    ['--soft', c.soft],
    ['--soft-ink', c.softInk],
    ['--surface', c.surface],
    ['--line', c.line],
    ['--field', c.field],
    ['--accent', c.accent],
  ];
  for (const [name, value] of vars) root.style.setProperty(name, value);
  listeners.forEach((listener) => listener());
};

/** Apply the saved (or system-matching) theme before the first render. */
export const initTheme = () => {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  applyTheme({
    palette:
      findPalette(readStorage(STORAGE_KEYS.palette)) ??
      (prefersDark ? CHILI : LAGOON),
    art: findArt(readStorage(STORAGE_KEYS.art)) ?? HERBS,
  });
};

export const setPalette = (palette: Palette) => {
  applyTheme({ ...current, palette });
  writeStorage(STORAGE_KEYS.palette, palette.id);
};

export const setArt = (art: Art) => {
  applyTheme({ ...current, art });
  writeStorage(STORAGE_KEYS.art, art.id);
};

/** Apply the theme saved on the user's account (the parts they've picked). */
export const syncTheme = ({ palette, art }: ThemePreference) => {
  const nextPalette = findPalette(palette);
  const nextArt = findArt(art);
  if (nextPalette && nextPalette !== current.palette) setPalette(nextPalette);
  if (nextArt && nextArt !== current.art) setArt(nextArt);
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const useTheme = () => useSyncExternalStore(subscribe, () => current);
