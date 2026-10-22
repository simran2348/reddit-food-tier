import { useEffect, useState } from 'react';

export const ART_URL = '/art/h2.png';

/** True once the background art has downloaded (or failed to). */
export const useArtLoaded = () => {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    const img = new Image();
    const done = () => setLoaded(true);
    img.onload = done;
    img.onerror = done;
    img.src = ART_URL;
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, []);
  return loaded;
};
