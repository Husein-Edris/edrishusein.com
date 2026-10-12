'use client';

// Decorative WebGL background for the hero. The wrapper paints a static CSS
// fallback immediately; three.js is fetched only after the page is idle, so it
// never competes with the LCP image or the hero text.
import { useEffect, useRef } from 'react';
import type { HeroSceneHandle } from './createHeroScene';
import './HeroScene.scss';

const IDLE_TIMEOUT_MS = 2000;
const COMPACT_QUERY = '(max-width: 768px)';
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

type IdleWindow = Window & {
  requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
  cancelIdleCallback?: (id: number) => void;
};

export default function HeroScene() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let cancelled = false;
    let handle: HeroSceneHandle | null = null;

    const start = () => {
      import('./createHeroScene')
        .then(({ createHeroScene }) => {
          if (cancelled) return;
          handle = createHeroScene(container, {
            reducedMotion: window.matchMedia(REDUCED_MOTION_QUERY).matches,
            compact: window.matchMedia(COMPACT_QUERY).matches,
          });
          if (handle) container.classList.add('hero-scene--live');
        })
        .catch(() => {
          // Chunk failed to load (offline, blocked): the CSS fallback stays.
        });
    };

    const win = window as IdleWindow;
    let idleId: number | undefined;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    if (win.requestIdleCallback) {
      idleId = win.requestIdleCallback(start, { timeout: IDLE_TIMEOUT_MS });
    } else {
      timeoutId = setTimeout(start, 200);
    }

    return () => {
      cancelled = true;
      if (idleId !== undefined) win.cancelIdleCallback?.(idleId);
      if (timeoutId !== undefined) clearTimeout(timeoutId);
      handle?.dispose();
      container.classList.remove('hero-scene--live');
    };
  }, []);

  return <div ref={containerRef} className="hero-scene" aria-hidden="true" />;
}
