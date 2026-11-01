import type { ReactNode } from 'react';
import type { ServiceIconKey } from '@/src/lib/service-icons';

// Line icons for service cards and "What you get" items. One 24px grid, one
// 1.5px stroke. Every shape has pathLength="1" so the scroll story can draw it
// in with stroke-dashoffset (Services.scss, [data-reveal='draw']).
const ICONS: Record<ServiceIconKey, ReactNode> = {
  code: (
    <>
      <path d="M8 7.5 3.5 12 8 16.5" pathLength={1} />
      <path d="M16 7.5 20.5 12 16 16.5" pathLength={1} />
      <path d="M13.5 5 10.5 19" pathLength={1} />
    </>
  ),
  layout: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" pathLength={1} />
      <path d="M3 9h18" pathLength={1} />
      <path d="M9 9v11" pathLength={1} />
    </>
  ),
  mobile: (
    <>
      <rect x="7" y="2.5" width="10" height="19" rx="2" pathLength={1} />
      <path d="M11 18.5h2" pathLength={1} />
    </>
  ),
  search: (
    <>
      <circle cx="10.5" cy="10.5" r="6.5" pathLength={1} />
      <path d="m15.5 15.5 5 5" pathLength={1} />
    </>
  ),
  edit: (
    <>
      <path d="M4 20h4L19 9l-4-4L4 16v4Z" pathLength={1} />
      <path d="m13 7 4 4" pathLength={1} />
    </>
  ),
  key: (
    <>
      <circle cx="8" cy="15.5" r="4" pathLength={1} />
      <path d="m11 12.5 8.5-8.5" pathLength={1} />
      <path d="m16.5 7 2.5 2.5" pathLength={1} />
      <path d="m14 9.5 2 2" pathLength={1} />
    </>
  ),
  speed: (
    <>
      <path d="M3.5 17a8.5 8.5 0 1 1 17 0" pathLength={1} />
      <path d="m12 17 4.5-5.5" pathLength={1} />
      <path d="M3.5 20h17" pathLength={1} />
    </>
  ),
  shield: (
    <>
      <path d="M12 3 19 6v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3Z" pathLength={1} />
      <path d="m9 12 2 2 4-4" pathLength={1} />
    </>
  ),
  update: (
    <>
      <path d="M19.5 12a7.5 7.5 0 0 1-13.4 4.6" pathLength={1} />
      <path d="M4.5 12a7.5 7.5 0 0 1 13.4-4.6" pathLength={1} />
      <path d="M18.5 3.5v4h-4" pathLength={1} />
      <path d="M5.5 20.5v-4h4" pathLength={1} />
    </>
  ),
  redirect: (
    <>
      <path d="M4 6.5h11a4.5 4.5 0 0 1 0 9H7.5" pathLength={1} />
      <path d="m10.5 12.5-3 3 3 3" pathLength={1} />
    </>
  ),
  wrench: (
    <path
      d="M15 3.5a5 5 0 0 0-4.6 7L3.5 17.4v3.1h3.1l6.9-6.9A5 5 0 0 0 20.5 9l-3 1-2-2 1-3-1.5-1.5Z"
      pathLength={1}
    />
  ),
  chat: (
    <>
      <path d="M4 5h16v11H9.5L4 20V5Z" pathLength={1} />
      <path d="M8 9.5h8" pathLength={1} />
      <path d="M8 12.5h5" pathLength={1} />
    </>
  ),
};

interface ServiceIconProps {
  name: ServiceIconKey;
  className?: string;
}

/** Decorative: the text next to it carries the meaning. */
export default function ServiceIcon({ name, className }: ServiceIconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {ICONS[name]}
    </svg>
  );
}
