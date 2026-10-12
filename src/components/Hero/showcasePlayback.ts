export interface ShowcasePlayState {
  hasVideo: boolean;
  inView: boolean;
  reducedMotion: boolean;
}

/** A hero showcase video plays only while visible and when motion is allowed. */
export function shouldPlayShowcase({ hasVideo, inView, reducedMotion }: ShowcasePlayState): boolean {
  return hasVideo && inView && !reducedMotion;
}
