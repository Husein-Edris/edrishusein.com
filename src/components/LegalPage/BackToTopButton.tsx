'use client';

import { useLang } from '@/src/components/LangProvider/LangProvider';
import { dictionary } from '@/src/lib/i18n/dictionary';

interface BackToTopButtonProps {
  className?: string;
}

export default function BackToTopButton({ className }: BackToTopButtonProps) {
  const text = dictionary(useLang());
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <button 
      onClick={scrollToTop}
      className={className}
      aria-label={text.backToTopLabel}
    >
      {text.backToTopText}
    </button>
  );
}