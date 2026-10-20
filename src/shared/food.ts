export const MIN_RATING = 1;
export const MAX_RATING = 5;
export const TOP_LIMIT = 10;

export type Tier = 'S' | 'A' | 'B' | 'C' | 'D';

/** Lowercase, trimmed, single-spaced key used to group foods and places. */
export const normalizeName = (value: string): string =>
  value.trim().replace(/\s+/g, ' ').toLowerCase();

export const tierFor = (average: number): Tier => {
  if (average >= 4.5) return 'S';
  if (average >= 4) return 'A';
  if (average >= 3) return 'B';
  if (average >= 2) return 'C';
  return 'D';
};

export const isValidRating = (rating: number): boolean =>
  Number.isInteger(rating) && rating >= MIN_RATING && rating <= MAX_RATING;
