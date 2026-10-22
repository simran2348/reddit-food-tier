import type { PaletteId } from './theme';

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

/** What the inline splash needs: kept small so the feed view loads fast. */
export type ProfileResponse = {
  username: string | null;
  avatarUrl: string | null;
  /** The user's saved palette, if they've picked one. */
  theme: PaletteId | null;
};

export type InitResponse = {
  username: string | null;
  subredditName: string;
  /** The user's saved palette, if they've picked one. */
  theme: PaletteId | null;
  myList: FoodReview[];
  foods: string[];
};

export type UserReviewsResponse = {
  username: string;
  reviews: FoodReview[];
};

export type SaveThemeRequest = {
  palette: PaletteId;
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
