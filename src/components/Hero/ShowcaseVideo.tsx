'use client';

// Optional muted screen recording over a hero frame's image. It loads nothing
// until it plays (preload="none"), plays only while in view, and never plays
// for visitors who prefer reduced motion. The image underneath stays the LCP
// element and the fallback whenever the video is paused or blocked.
import { useEffect, useRef } from 'react';
import { shouldPlayShowcase } from './showcasePlayback';

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';
const IN_VIEW_THRESHOLD = 0.35;

interface ShowcaseVideoProps {
  src: string;
  poster: string;
  className: string;
}

export default function ShowcaseVideo({ src, poster, className }: ShowcaseVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || typeof IntersectionObserver === 'undefined') return;

    // React does not always reflect `muted` as a DOM property; set it so play() is a muted autoplay.
    video.muted = true;
    const motionQuery = window.matchMedia(REDUCED_MOTION_QUERY);
    let inView = false;

    const sync = () => {
      if (shouldPlayShowcase({ hasVideo: true, inView, reducedMotion: motionQuery.matches })) {
        // A blocked autoplay rejects; the poster and the image below stay visible.
        video.play().catch(() => undefined);
      } else {
        video.pause();
      }
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        sync();
      },
      { threshold: IN_VIEW_THRESHOLD }
    );
    observer.observe(video);
    motionQuery.addEventListener('change', sync);

    return () => {
      observer.disconnect();
      motionQuery.removeEventListener('change', sync);
    };
  }, []);

  return (
    <video
      ref={videoRef}
      className={className}
      src={src}
      poster={poster}
      muted
      loop
      playsInline
      preload="none"
      aria-hidden="true"
      tabIndex={-1}
    />
  );
}
