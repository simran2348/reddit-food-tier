import './index.css';

import { requestExpandedMode } from '@devvit/web/client';
import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import type { ProfileResponse } from '../shared/api';
import { FoodBackground } from './components/FoodBackground';
import { FoodLoader } from './components/FoodLoader';
import { Avatar } from './components/ui';
import { fetchProfile } from './lib/api';
import { ART_URL, FALLBACK_AVATAR_URL, useImageLoaded } from './lib/art';
import { initTheme, syncTheme } from './lib/theme';

export const Splash = () => {
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [intro, setIntro] = useState(true);
  // Warm the cache while the intro plays so the art and avatar are ready.
  useImageLoaded(ART_URL);
  useImageLoaded(profile ? (profile.avatarUrl ?? FALLBACK_AVATAR_URL) : null);

  useEffect(() => {
    fetchProfile()
      .then((res) => {
        setProfile(res);
        syncTheme(res.theme);
      })
      .catch((err) => {
        console.error('Failed to load profile', err);
        // Carry on with the Snoo and a generic welcome.
        setProfile({ username: null, avatarUrl: null, theme: null });
      });
  }, []);

  // The veggie intro always plays in full on every visit.
  if (intro) return <FoodLoader onDone={() => setIntro(false)} />;

  return (
    <>
      <FoodBackground withArt />
      <main className="flex h-full flex-col items-center justify-center gap-5 overflow-y-auto px-6 py-8 text-center">
        <Avatar
          url={profile?.avatarUrl ?? null}
          username={profile?.username ?? null}
          className="h-36"
        />
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-extrabold text-ink">
            {profile?.username
              ? `Hey u/${profile.username}!`
              : 'Welcome to Food Tier'}
          </h1>
          <p className="max-w-sm text-base font-medium text-ink/85">
            Rate the spots you eat at, build your personal food list, and see
            which places the community ranks top tier for every dish.
          </p>
        </div>
        <button
          onClick={(e) => requestExpandedMode(e.nativeEvent, 'game')}
          className="w-full max-w-xs rounded-full bg-cta px-6 py-3 text-lg font-bold text-cta-ink shadow-lg cursor-pointer hover:brightness-95 transition"
        >
          Explore
        </button>
      </main>
    </>
  );
};

initTheme();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Splash />
  </StrictMode>
);
