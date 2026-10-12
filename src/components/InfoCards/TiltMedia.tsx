'use client';

// Cursor-reactive tilt for project cards. Pure enhancement: the card is fully
// visible in the server HTML; this only sets CSS variables on hover, which the
// card's screenshot reads (the card root receives the events because its
// stretched link covers the image).
// CSS ignores them under prefers-reduced-motion and on touch (no hover) devices.
import { useRef, type PointerEvent, type ReactNode } from 'react';

const MAX_TILT_DEG = 5;

interface TiltMediaProps {
  className?: string;
  children: ReactNode;
}

export default function TiltMedia({ className = '', children }: TiltMediaProps) {
  const ref = useRef<HTMLDivElement>(null);

  const handleMove = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'mouse' || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    ref.current.style.setProperty('--tilt-x', `${(-y * MAX_TILT_DEG).toFixed(2)}deg`);
    ref.current.style.setProperty('--tilt-y', `${(x * MAX_TILT_DEG).toFixed(2)}deg`);
    ref.current.style.setProperty('--glare-x', `${((x + 0.5) * 100).toFixed(1)}%`);
    ref.current.style.setProperty('--glare-y', `${((y + 0.5) * 100).toFixed(1)}%`);
  };

  const handleLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty('--tilt-x', '0deg');
    el.style.setProperty('--tilt-y', '0deg');
  };

  return (
    <div ref={ref} className={`tilt-media ${className}`.trim()} onPointerMove={handleMove} onPointerLeave={handleLeave}>
      {children}
    </div>
  );
}
