import type {
  CreateReviewRequest,
  CreateReviewResponse,
  ErrorResponse,
  ImportPostResponse,
  InitResponse,
  PlaceSearchResponse,
  ProfileResponse,
  SaveThemeRequest,
  TierResponse,
  UserReviewsResponse,
} from '../../shared/api';

const request = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const res = await fetch(path, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  });
  if (!res.ok) {
    const error: Partial<ErrorResponse> = await res.json().catch(() => ({}));
    throw new Error(error.message ?? `Request failed (${res.status})`);
  }
  const data: T = await res.json();
  return data;
};

export const fetchProfile = () => request<ProfileResponse>('/api/profile');

export const fetchInit = () => request<InitResponse>('/api/init');

export const fetchTier = (food: string) =>
  request<TierResponse>(`/api/tier?food=${encodeURIComponent(food)}`);

export const fetchUserReviews = (username: string) =>
  request<UserReviewsResponse>(
    `/api/users/${encodeURIComponent(username)}/reviews`
  );

export const saveTheme = (body: SaveThemeRequest) =>
  request<{ status: 'ok' }>('/api/theme', {
    method: 'POST',
    body: JSON.stringify(body),
  });

export const importPost = (url: string) =>
  request<ImportPostResponse>(`/api/import?url=${encodeURIComponent(url)}`);

export const searchPlaces = (query: string) =>
  request<PlaceSearchResponse>(`/api/places?q=${encodeURIComponent(query)}`);

export const createReview = (body: CreateReviewRequest) =>
  request<CreateReviewResponse>('/api/reviews', {
    method: 'POST',
    body: JSON.stringify(body),
  });
