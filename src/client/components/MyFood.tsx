import { useState } from 'react';
import type { InitResponse } from '../../shared/api';
import { PlusIcon } from './icons';
import { FoodList, FoodTier } from './reviews';
import { EmptyState, ScreenHeader, Segmented } from './ui';

type View = 'list' | 'tier';

const VIEWS: { id: View; label: string }[] = [
  { id: 'list', label: 'My List' },
  { id: 'tier', label: 'Tier List' },
];

export const MyFood = ({
  data,
  error,
  onAdd,
}: {
  data: InitResponse | null;
  error: string | null;
  onAdd: () => void;
}) => {
  const [view, setView] = useState<View>('list');

  return (
    <div className="flex h-full flex-col">
      <ScreenHeader
        title="Food Tier"
        subtitle={
          data?.username ? `u/${data.username}` : 'Rate the spots you love'
        }
        right={
          <button
            onClick={onAdd}
            className="flex shrink-0 items-center gap-1 rounded-full bg-cta px-3.5 py-2 text-sm font-bold text-cta-ink shadow-sm cursor-pointer hover:brightness-95 transition"
          >
            <PlusIcon className="h-4 w-4" />
            Add review
          </button>
        }
      />
      <main className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-3">
        <Segmented options={VIEWS} value={view} onChange={setView} />
        {error ? (
          <EmptyState>Couldn't load: {error}</EmptyState>
        ) : !data ? (
          <EmptyState>Loading…</EmptyState>
        ) : view === 'list' ? (
          <FoodList reviews={data.myList} />
        ) : (
          <FoodTier foods={data.foods} />
        )}
      </main>
    </div>
  );
};
