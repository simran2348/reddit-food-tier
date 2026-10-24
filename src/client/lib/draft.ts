import type { CreateReviewRequest } from '../../shared/api';
import { isValidRating } from '../../shared/food';
import type { ReviewDraft } from '../components/ReviewFields';

export const emptyDraft = (): ReviewDraft => ({
  title: '',
  food: '',
  place: '',
  location: undefined,
  rating: 0,
  review: '',
});

/** Food category, place and rating are required; the rest is optional. */
export const isDraftComplete = (draft: ReviewDraft) =>
  Boolean(
    draft.food.trim() && draft.place.trim() && isValidRating(draft.rating)
  );

export const draftToRequest = (
  { location, ...draft }: ReviewDraft,
  importedPostId?: string
): CreateReviewRequest => ({
  ...draft,
  ...(location ? { location } : {}),
  ...(importedPostId ? { importedPostId } : {}),
});
