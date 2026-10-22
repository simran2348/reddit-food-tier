export type PaletteId =
  | 'cream'
  | 'sage'
  | 'lagoon'
  | 'saffron'
  | 'matcha'
  | 'peach'
  | 'berry'
  | 'vanilla'
  | 'chili'
  | 'blueberry'
  | 'espresso'
  | 'olive';

export type ArtId = 'herbs' | 'leaves' | 'wreath' | 'pantry' | 'spices';

export const PALETTE_IDS: PaletteId[] = [
  'cream',
  'sage',
  'lagoon',
  'saffron',
  'matcha',
  'peach',
  'berry',
  'vanilla',
  'chili',
  'blueberry',
  'espresso',
  'olive',
];

export const ART_IDS: ArtId[] = [
  'herbs',
  'leaves',
  'wreath',
  'pantry',
  'spices',
];

export const isPaletteId = (value: unknown): value is PaletteId =>
  PALETTE_IDS.some((id) => id === value);

export const isArtId = (value: unknown): value is ArtId =>
  ART_IDS.some((id) => id === value);
