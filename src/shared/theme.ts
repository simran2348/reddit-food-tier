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

export const isPaletteId = (value: unknown): value is PaletteId =>
  PALETTE_IDS.some((id) => id === value);
