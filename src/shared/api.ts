import type { PaletteId } from './theme';

/** A spot picked from place search; drives the map. */
export type PlaceLocation = {
  /** Full address line, e.g. "12 High St, London, United Kingdom". */
  address: string;
  lat: number;
  lon: number;
};

export type FoodReview = {
  id: string;
  username: string;
  /** Short headline; for imported posts, the post's title. */
  title: string;
  food: string;
  /** Café / restaurant name. */
  place: string;
  location?: PlaceLocation;
  /** Out of {@link MAX_RATING} (10). */
  rating: number;
  review: string;
  /** Photo URLs (Reddit-hosted), from an imported post. */
  images: string[];
  /** When the review was saved in Food Tier. */
  createdAt: number;
  /** When the meal was posted; for imports, the original post's date. */
  postedAt: number;
  postId?: string;
};

export type TierEntry = {
  place: string;
  average: number;
  count: number;
  /** Which food category it's ranked in (set in the "All" tier). */
  food?: string;
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
  /** Empty for the "All" tier (every food category combined). */
  food: string;
  entries: TierEntry[];
};

export type CreateReviewRequest = {
  title: string;
  food: string;
  place: string;
  location?: PlaceLocation;
  rating: number;
  review: string;
  /** Set when the review comes from one of the user's existing posts. */
  importedPostId?: string;
};

/** An existing Reddit post, pre-filled into the add form. */
export type ImportPostResponse = {
  postId: string;
  title: string;
  body: string;
  images: string[];
  postedAt: number;
};

/** The user's own posts in this subreddit, to pick one to import. */
export type MyPostsResponse = {
  posts: {
    postId: string;
    title: string;
    image: string | null;
    postedAt: number;
    /** Already turned into a review. */
    imported: boolean;
  }[];
  /** Pass as `after` to load the next page; null when there are no more. */
  nextCursor: string | null;
};

export type PlaceSearchResponse = {
  places: (PlaceLocation & { name: string })[];
};

export type CreateReviewResponse = {
  review: FoodReview;
  postUrl: string | null;
};
