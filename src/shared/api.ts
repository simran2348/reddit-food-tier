import type { ArtId, PaletteId } from './theme';

export type FoodReview = {
  id: string;
  username: string;
  food: string;
  place: string;
  rating: number;
  review: string;
  createdAt: number;
  postId?: string;
};

export type TierEntry = {
  place: string;
  average: number;
  count: number;
};

export type ErrorResponse = {
  status: 'error';
  message: string;
};

export type InitResponse = {
  username: string | null;
  avatarUrl: string | null;
  subredditName: string;
  /** The user's saved theme; null parts haven't been picked yet. */
  theme: ThemePreference;
  myList: FoodReview[];
  foods: string[];
};

export type UserReviewsResponse = {
  username: string;
  reviews: FoodReview[];
};

export type ThemePreference = {
  palette: PaletteId | null;
  art: ArtId | null;
};

export type SaveThemeRequest = {
  palette?: PaletteId;
  art?: ArtId;
};

export type TierResponse = {
  food: string;
  entries: TierEntry[];
};

export type CreateReviewRequest = {
  food: string;
  place: string;
  rating: number;
  review: string;
};

export type CreateReviewResponse = {
  review: FoodReview;
  postUrl: string | null;
};
