import { describe, it, expect } from 'vitest';
import { shouldPlayShowcase } from './showcasePlayback';

describe('shouldPlayShowcase', () => {
  it('plays only when a video exists, the frame is in view and motion is allowed', () => {
    expect(shouldPlayShowcase({ hasVideo: true, inView: true, reducedMotion: false })).toBe(true);
  });

  it('stays paused when the visitor prefers reduced motion', () => {
    expect(shouldPlayShowcase({ hasVideo: true, inView: true, reducedMotion: true })).toBe(false);
  });

  it('pauses when the frame is offscreen', () => {
    expect(shouldPlayShowcase({ hasVideo: true, inView: false, reducedMotion: false })).toBe(false);
  });

  it('never plays without a video', () => {
    expect(shouldPlayShowcase({ hasVideo: false, inView: true, reducedMotion: false })).toBe(false);
  });
});
