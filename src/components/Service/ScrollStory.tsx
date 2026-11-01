'use client';

// The service pages' one motion idea: the page tells its story as you scroll.
// Icons draw their strokes, project frames open like a window blind, and the
// "How it works" line fills step by step. Content is visible without this
// component (no JS, reduced motion): it only adds the pre-reveal state, and only
// to elements that are still below the fold when it starts.
import { useEffect } from 'react';

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';
const STORY_CLASS = 'service-story';
const REVEALED_CLASS = 'is-revealed';
const LIT_CLASS = 'is-lit';
// An element reveals once its top passes 88% of the viewport height.
const REVEAL_ROOT_MARGIN = '0px 0px -12% 0px';
// The process line starts filling when the section top reaches 80% of the
// viewport and is full once the reader has scrolled half a viewport further.
const PROGRESS_START = 0.8;
const PROGRESS_SPAN = 0.5;

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

function inView(element: Element): boolean {
  const rect = element.getBoundingClientRect();
  return rect.top < window.innerHeight * 0.88 && rect.bottom > 0;
}

function trackProgress(section: HTMLElement): () => void {
  const steps = Array.from(section.querySelectorAll<HTMLElement>('[data-step]'));
  let frame = 0;

  const update = () => {
    frame = 0;
    const { top } = section.getBoundingClientRect();
    const viewport = window.innerHeight;
    const progress = clamp01((viewport * PROGRESS_START - top) / (viewport * PROGRESS_SPAN));
    section.style.setProperty('--progress', progress.toFixed(3));
    steps.forEach((step, index) => {
      const threshold = steps.length > 1 ? index / (steps.length - 1) : 0;
      step.classList.toggle(LIT_CLASS, progress >= threshold - 0.001);
    });
  };
  const schedule = () => {
    if (!frame) frame = requestAnimationFrame(update);
  };

  update();
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  return () => {
    if (frame) cancelAnimationFrame(frame);
    window.removeEventListener('scroll', schedule);
    window.removeEventListener('resize', schedule);
  };
}

interface ScrollStoryProps {
  /** Selector of the page root that holds the [data-reveal] and [data-progress] elements. */
  root: string;
}

export default function ScrollStory({ root }: ScrollStoryProps) {
  useEffect(() => {
    const page = document.querySelector<HTMLElement>(root);
    if (!page || window.matchMedia(REDUCED_MOTION_QUERY).matches || !('IntersectionObserver' in window)) return;

    const targets = Array.from(page.querySelectorAll<HTMLElement>('[data-reveal]'));
    // Whatever is already on screen stays shown: no flash on load or on a
    // reload halfway down the page.
    targets.filter(inView).forEach((element) => element.classList.add(REVEALED_CLASS));
    page.classList.add(STORY_CLASS);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add(REVEALED_CLASS);
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: REVEAL_ROOT_MARGIN },
    );
    targets.filter((element) => !element.classList.contains(REVEALED_CLASS)).forEach((element) => observer.observe(element));

    const stopProgress = Array.from(page.querySelectorAll<HTMLElement>('[data-progress]')).map(trackProgress);

    return () => {
      observer.disconnect();
      stopProgress.forEach((stop) => stop());
      page.classList.remove(STORY_CLASS);
    };
  }, [root]);

  return null;
}
