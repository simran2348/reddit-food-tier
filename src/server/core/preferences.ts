import { redis } from '@devvit/web/server';
import type { ThemePreference } from '../../shared/api';
import {
  isArtId,
  isPaletteId,
  type ArtId,
  type PaletteId,
} from '../../shared/theme';

const keys = {
  // Kept as `theme` so palettes saved before designs existed still load.
  palette: (username: string) => `user:${username}:theme`,
  art: (username: string) => `user:${username}:art`,
};

export const getUserTheme = async (
  username: string
): Promise<ThemePreference> => {
  const [palette, art] = await Promise.all([
    redis.get(keys.palette(username)),
    redis.get(keys.art(username)),
  ]);
  return {
    palette: isPaletteId(palette) ? palette : null,
    art: isArtId(art) ? art : null,
  };
};

export const saveUserTheme = async (
  username: string,
  { palette, art }: { palette?: PaletteId; art?: ArtId }
) => {
  await Promise.all([
    palette ? redis.set(keys.palette(username), palette) : null,
    art ? redis.set(keys.art(username), art) : null,
  ]);
};
