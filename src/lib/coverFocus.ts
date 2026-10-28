// The notebook list crops each 16:9 cover to a square. This is where in the cover the crop
// window sits (CSS object-position), so the thumbnail shows the cover's key figure instead
// of its centre. Covers are built in docs/covers/src; add an entry when a new cover's key
// figure is not centred. See docs/blog-cover-style.md.
export const DEFAULT_COVER_FOCUS = '50% 50%';

const COVER_FOCUS: Readonly<Record<string, string>> = {
  'website-erstellen-lassen': '0% 50%',
  'wordpress-website-kosten-oesterreich': '0% 50%',
  'what-got-cheap-and-what-did-not': '64% 50%',
  'wordpress-as-tool-library': '100% 50%',
  'no-client-ever-paid-me-for-elementor': '93% 50%',
  'why-i-choose-wordpress-for-most-client-projects': '15% 50%',
  '6-years-of-wordpress-development-lessons-learned': '100% 50%',
  'from-media-specialist-to-full-stack-developer-my-career-transition': '100% 50%',
  'life-as-a-developer-and-dad': '10% 50%',
};

export function coverFocus(slug: string): string {
  return COVER_FOCUS[slug] ?? DEFAULT_COVER_FOCUS;
}
